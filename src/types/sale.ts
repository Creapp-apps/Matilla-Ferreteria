
export interface Sale {
  id?: number;
  box_session_id: number;
  customer_id?: number; // Linked debtor client if payment_method is 'credit'
  timestamp: string;
  payment_method: 'cash' | 'card' | 'transfer' | 'credit';
  total_amount: number;
  discount_amount: number;
  surcharge_amount: number;
}

export interface SaleItem {
  id?: number;
  sale_id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}
