import Dexie, { type Table } from 'dexie';
import { type Product } from '@/types/product';
import { type BoxSession } from '@/types/boxSession';
import { type Sale, type SaleItem } from '@/types/sale';
import { type Customer, type CreditPayment } from '@/types/customer';
import { getProductsWithPrices } from './mockData';

export type { Product };
export type { BoxSession };
export type { Sale, SaleItem };
export type { Customer, CreditPayment };

export class MatillaDb extends Dexie {
  products!: Table<Product, number>;
  boxSessions!: Table<BoxSession, number>;
  sales!: Table<Sale, number>;
  saleItems!: Table<SaleItem, number>;
  customers!: Table<Customer, number>;
  creditPayments!: Table<CreditPayment, number>;

  constructor() {
    super('MatillaFerreteriaDB');
    
    // Define database schemas (declaring indexes for search operations)
    this.version(1).stores({
      products: '++id, sku, *name, brand, category, location',
      boxSessions: '++id, opened_at, closed_at, status',
      sales: '++id, box_session_id, timestamp, payment_method',
      saleItems: '++id, sale_id, product_id'
    });

    this.version(2).stores({
      products: '++id, sku, *name, brand, category, location',
      boxSessions: '++id, opened_at, closed_at, status',
      sales: '++id, box_session_id, timestamp, payment_method, customer_id',
      saleItems: '++id, sale_id, product_id',
      customers: '++id, *name, phone, cuit_dni',
      creditPayments: '++id, customer_id, box_session_id'
    });
  }
}

export const db = new MatillaDb();

const mockCustomers: Customer[] = [
  { name: 'Juan Gómez - Plomero', phone: '261-5544332', cuit_dni: '20-34556677-9', max_credit: 150000, current_debt: 34500, created_at: new Date().toISOString() },
  { name: 'Constructora del Valle SRL', phone: '261-4112233', cuit_dni: '30-71223344-5', max_credit: 500000, current_debt: 125000, created_at: new Date().toISOString() },
  { name: 'Lucas Silva - Electricista', phone: '261-6677889', cuit_dni: '23-38990011-9', max_credit: 100000, current_debt: 0, created_at: new Date().toISOString() },
  { name: 'Marta Rodríguez - Vecina Fiel', phone: '261-3322114', cuit_dni: '27-24889900-2', max_credit: 60000, current_debt: 8200, created_at: new Date().toISOString() },
];

// Seed mock products and customers into IndexedDB if empty
db.on('populate', () => {
  console.log('Seeding initial mock data into local IndexedDB...');
  const productsToSeed = getProductsWithPrices();
  db.products.bulkAdd(productsToSeed)
    .catch((error) => console.error('Failed to seed local database products:', error));

  db.customers.bulkAdd(mockCustomers)
    .catch((error) => console.error('Failed to seed local database customers:', error));
});

// Helper validation function to ensure data is present on load
export async function initializeDatabase() {
  const count = await db.products.count();
  if (count === 0) {
    console.warn('Database was empty. Seeding mock data manual trigger...');
    const productsToSeed = getProductsWithPrices();
    await db.products.bulkAdd(productsToSeed);
  }

  const customerCount = await db.customers.count();
  if (customerCount === 0) {
    console.log('Seeding mock customers manual trigger...');
    await db.customers.bulkAdd(mockCustomers);
  }
}

