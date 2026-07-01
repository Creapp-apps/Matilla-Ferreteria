export interface BoxSession {
  id?: number;
  opened_at: string;
  closed_at?: string;
  initial_balance: number;
  expected_balance: number; // initial_balance + cash_sales + adjustments
  actual_balance?: number; // physical cash counted
  status: 'open' | 'closed';
}
