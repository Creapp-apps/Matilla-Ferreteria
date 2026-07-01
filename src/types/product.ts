export interface Product {
  id?: number;
  sku: string;
  name: string;
  brand: string;
  category: string;
  cost: number;
  markup_percent: number; // percentage value, e.g. 50 for 50% markup
  price: number; // calculated: cost * (1 + markup_percent / 100)
  stock: number;
  min_stock: number;
  location: string;
}
