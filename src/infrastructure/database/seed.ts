/**
 * Database Seeder
 *
 * Populates the database with realistic sample data for development/testing.
 *
 * Layer: Infrastructure → Database
 * Usage: npm run db:seed
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const SAMPLE_PRODUCTS = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Laptop Pro 15"',
    description: 'High-performance laptop with 16GB RAM and 512GB SSD',
    sku: 'ELEC-LAP-001',
    price_amount_cents: 149999,
    price_currency: 'USD',
    category: 'ELECTRONICS',
    stock_quantity: 25,
    minimum_stock_level: 5,
    is_active: true,
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with 12-month battery life',
    sku: 'ELEC-MOU-001',
    price_amount_cents: 2999,
    price_currency: 'USD',
    category: 'ELECTRONICS',
    stock_quantity: 3,
    minimum_stock_level: 10,
    is_active: true,
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Office Chair Deluxe',
    description: 'Ergonomic office chair with lumbar support and adjustable height',
    sku: 'FURN-CHR-001',
    price_amount_cents: 39999,
    price_currency: 'USD',
    category: 'FURNITURE',
    stock_quantity: 12,
    minimum_stock_level: 3,
    is_active: true,
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Standing Desk 160cm',
    description: 'Electric height-adjustable standing desk with memory presets',
    sku: 'FURN-DSK-001',
    price_amount_cents: 59999,
    price_currency: 'USD',
    category: 'FURNITURE',
    stock_quantity: 0,
    minimum_stock_level: 2,
    is_active: true,
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    name: 'A4 Copy Paper (500 sheets)',
    description: 'Premium A4 80gsm copy paper, ream of 500 sheets',
    sku: 'OFF-PAP-A4',
    price_amount_cents: 799,
    price_currency: 'USD',
    category: 'OFFICE_SUPPLIES',
    stock_quantity: 200,
    minimum_stock_level: 50,
    is_active: true,
  },
];

async function seed(): Promise<void> {
  const pool = new Pool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'inventario',
    password: process.env.DB_PASSWORD ?? 'inventario_secret',
    database: process.env.DB_NAME ?? 'demo_inventario',
  });

  const client = await pool.connect();

  try {
    console.log('🌱 Seeding database…');

    for (const product of SAMPLE_PRODUCTS) {
      await client.query(
        `INSERT INTO products (
          id, name, description, sku, price_amount_cents, price_currency,
          category, stock_quantity, minimum_stock_level, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING`,
        [
          product.id,
          product.name,
          product.description,
          product.sku,
          product.price_amount_cents,
          product.price_currency,
          product.category,
          product.stock_quantity,
          product.minimum_stock_level,
          product.is_active,
        ],
      );
      console.log(`  ✓ Seeded: ${product.name} (${product.sku})`);
    }

    console.log('✅ Database seeded successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Unhandled seed error:', err);
  process.exit(1);
});
