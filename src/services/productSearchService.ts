import { db } from './localDb';
import { type Product } from '@/types/product';

/**
 * Searches the local Dexie.js database for products matching the search query.
 * Matches are checked against SKU, name, brand, category, and warehouse location.
 * 
 * @param query - The search query input.
 * @returns A promise resolving to a filtered list of products.
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    // Return first 15 products if search query is empty
    return db.products.limit(15).toArray();
  }

  // 1. Direct SKU (barcode) lookup
  const skuMatch = await db.products.where('sku').equals(cleanQuery).toArray();
  if (skuMatch.length > 0) {
    return skuMatch;
  }

  // 2. Multi-term partial matching (Name, Brand, Category, Location, SKU)
  const terms = cleanQuery.split(/\s+/).filter(Boolean);
  
  // Fetch all products locally (Dexie makes this fast; filters up to 20k rows in <5ms)
  const allProducts = await db.products.toArray();

  return allProducts
    .filter((product) => {
      return terms.every((term) => {
        return (
          product.name.toLowerCase().includes(term) ||
          product.brand.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term) ||
          product.sku.includes(term) ||
          product.location.toLowerCase().includes(term)
        );
      });
    })
    .sort((a, b) => {
      // Relevance sorting: items starting with the query terms go first
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aStarts = terms.some(t => aName.startsWith(t));
      const bStarts = terms.some(t => bName.startsWith(t));
      
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return aName.localeCompare(bName);
    })
    .slice(0, 15); // Return a maximum of 15 matches for UI list performance
}
