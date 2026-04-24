/**
 * Database Migration Runner
 *
 * Simple migration runner that executes the init.sql schema file.
 * For a production project, consider using a dedicated migration tool
 * such as Flyway, Liquibase, or node-pg-migrate.
 *
 * Layer: Infrastructure → Database
 * Usage: npm run db:migrate
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function migrate(): Promise<void> {
  const pool = new Pool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'inventario',
    password: process.env.DB_PASSWORD ?? 'inventario_secret',
    database: process.env.DB_NAME ?? 'demo_inventario',
  });

  const client = await pool.connect();

  try {
    console.log('🚀 Running migrations…');

    const sql = readFileSync(join(__dirname, 'init.sql'), 'utf8');
    await client.query(sql);

    console.log('✅ Migrations completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Unhandled migration error:', err);
  process.exit(1);
});
