export interface Customer {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  cuit_dni?: string;
  max_credit: number;      // Maximum credit limit allowed (e.g., $150,000)
  current_debt: number;    // Outstanding debt balance (e.g., $45,000)
  created_at: string;
}

export interface CreditPayment {
  id?: number;
  customer_id: number;
  box_session_id: number;
  amount: number;
  timestamp: string;
  notes?: string;
}
