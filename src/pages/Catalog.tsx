import React, { useState, useEffect } from 'react';
import { db } from '@/services/localDb';
import { type Product } from '@/types/product';
import { getPrice } from '@/services/mockData';
import { ProductForm } from '@/components/Backoffice/ProductForm';
import { MassUpdateForm } from '@/components/Backoffice/MassUpdateForm';
import { Plus, Edit2, Trash2, Search, Package, MapPin, Settings } from 'lucide-react';

export const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Refresh catalog table
  const fetchProducts = async () => {
    const list = await db.products.toArray();
    setProducts(list);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter list by search query
  const filteredProducts = products.filter((p) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      p.name.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.sku.includes(term) ||
      p.location.toLowerCase().includes(term)
    );
  });

  // Handle Product Create/Edit Submit
  const handleProductSubmit = async (productData: Omit<Product, 'id'> & { id?: number }) => {
    try {
      if (productData.id) {
        // Edit existing product
        await db.products.update(productData.id, productData);
      } else {
        // Double check SKU uniqueness
        const existing = await db.products.where('sku').equals(productData.sku).first();
        if (existing) {
          alert('Ya existe un producto con el código de barras ingresado.');
          return;
        }
        // Add new product
        await db.products.add(productData as Product);
      }

      await fetchProducts();
      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Error al guardar el producto.');
    }
  };

  // Handle row deletion
  const handleDeleteProduct = async (id: number, name: string) => {
    if (!window.confirm(`¿Está seguro de eliminar el artículo "${name}" del catálogo?`)) return;

    try {
      await db.products.delete(id);
      await fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Error al eliminar el producto.');
    }
  };

  // Handle bulk updates
  const handleApplyAdjustment = async (params: {
    category: string;
    adjustmentType: 'price_percent' | 'markup_percent';
    value: number;
  }): Promise<number> => {
    const { category, adjustmentType, value } = params;

    try {
      // Fetch all products matching category
      let matchingProducts: Product[] = [];
      if (category === 'Todas') {
        matchingProducts = await db.products.toArray();
      } else {
        matchingProducts = await db.products.where('category').equals(category).toArray();
      }

      if (matchingProducts.length === 0) return 0;

      const updatedProducts = matchingProducts.map((p) => {
        let nextCost = p.cost;
        let nextMarkup = p.markup_percent;
        let nextPrice = p.price;

        if (adjustmentType === 'price_percent') {
          // Inflate costs by percent, which keeps margins steady and raises retail prices
          const factor = 1 + value / 100;
          nextCost = Math.round(p.cost * factor);
          nextPrice = getPrice(nextCost, nextMarkup);
        } else if (adjustmentType === 'markup_percent') {
          // Adjust profit margins directly, which changes retail prices
          nextMarkup = value;
          nextPrice = getPrice(nextCost, nextMarkup);
        }

        return {
          ...p,
          cost: nextCost,
          markup_percent: nextMarkup,
          price: nextPrice
        };
      });

      // Write changes back to Dexie local database
      await db.products.bulkPut(updatedProducts);
      await fetchProducts();

      return updatedProducts.length;
    } catch (err) {
      console.error('Error applying bulk pricing math:', err);
      throw err;
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Catalog Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={24} style={{ color: 'var(--color-primary)' }} />
            <span>Gestión del Catálogo</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Altas, bajas, modificaciones de stock e incrementos masivos de precios.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }}
          style={{ gap: '8px' }}
        >
          <Plus size={18} />
          <span>Agregar Producto</span>
        </button>
      </div>

      {/* Grid Layout: Inventory List (left) + Mass Pricing Tools (right) */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '24px',
          alignItems: 'start'
        }}
      >
        
        {/* Left Side: Product List Table */}
        <div className="glass-panel" style={{ background: 'var(--bg-surface-solid)', padding: '20px' }}>
          
          {/* Table Search Filter bar */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '2px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-app)', marginBottom: '16px' }}>
            <Search size={18} style={{ color: 'var(--text-tertiary)', marginRight: '10px' }} />
            <input
              type="text"
              className="input-field"
              style={{ border: 'none', padding: '8px 0', fontSize: '0.95rem' }}
              placeholder="Filtrar por nombre, marca, SKU o ubicación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Table container */}
          <div className="table-container custom-scrollbar" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Ubicación</th>
                  <th style={{ textAlign: 'right' }}>Costo</th>
                  <th style={{ textAlign: 'right' }}>Margen</th>
                  <th style={{ textAlign: 'right' }}>P.V.P</th>
                  <th style={{ textAlign: 'center' }}>Stock</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isLowStock = p.stock <= p.min_stock;
                  const isOutOfStock = p.stock === 0;

                  return (
                    <tr key={p.sku}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                            {p.sku} | {p.brand} | {p.category}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span 
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            fontSize: '0.78rem',
                            color: 'var(--color-primary)',
                            background: 'var(--color-primary-bg)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 500
                          }}
                        >
                          <MapPin size={10} />
                          <span>{p.location}</span>
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCurrency(p.cost)}</td>
                      <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{p.markup_percent}%</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(p.price)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div 
                          style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: isOutOfStock ? 'var(--color-danger)' : isLowStock ? 'var(--color-warning)' : 'var(--color-success)',
                            fontWeight: 700
                          }}
                        >
                          <Package size={14} />
                          <span>{p.stock}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsFormOpen(true);
                            }}
                            style={{ color: 'var(--color-primary)', cursor: 'pointer' }}
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id!, p.name)}
                            style={{ color: 'var(--color-danger)', cursor: 'pointer' }}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                      No se encontraron productos en el catálogo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Mass Pricing Actions panel */}
        <MassUpdateForm onApplyAdjustment={handleApplyAdjustment} />

      </div>

      {/* Product edit popup overlay modal */}
      {isFormOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="glass-panel"
            style={{ 
              width: '600px', 
              padding: '24px', 
              background: 'var(--bg-surface-solid)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <ProductForm
              product={editingProduct}
              onSubmit={handleProductSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingProduct(null);
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default Catalog;
