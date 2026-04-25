/**
 * PostgresStockRepository
 *
 * Implements IStockRepository using PostgreSQL.
 * Identity is the (product_id, branch_id) pair.
 *
 * Layer: Infrastructure → Repositories
 */

import { Stock } from '../../domain/entities/Stock';
import { ProductId } from '../../domain/value-objects/ProductId';
import { BranchId } from '../../domain/value-objects/BranchId';
import { IStockRepository } from '../../domain/repositories/IStockRepository';
import { PostgresClient } from '../database/PostgresClient';

interface StockRow {
  product_id: string;
  branch_id: string;
  quantity: number;
  updated_at: Date;
}

export class PostgresStockRepository implements IStockRepository {
  constructor(private readonly db: PostgresClient) {}

  async save(stock: Stock): Promise<void> {
    await this.db.query(
      `INSERT INTO stock (product_id, branch_id, quantity, updated_at)
       VALUES ($1, $2, $3, $4)`,
      [stock.productId.value, stock.branchId.value, stock.quantity, stock.updatedAt],
    );
  }

  async saveMany(rows: Stock[]): Promise<void> {
    if (rows.length === 0) {
      return;
    }
    await this.db.transaction(async (client) => {
      for (const row of rows) {
        await client.query(
          `INSERT INTO stock (product_id, branch_id, quantity, updated_at)
           VALUES ($1, $2, $3, $4)`,
          [row.productId.value, row.branchId.value, row.quantity, row.updatedAt],
        );
      }
    });
  }

  async find(productId: ProductId, branchId: BranchId): Promise<Stock | null> {
    const result = await this.db.query<StockRow>(
      `SELECT product_id, branch_id, quantity, updated_at
       FROM stock
       WHERE product_id = $1 AND branch_id = $2`,
      [productId.value, branchId.value],
    );
    if (result.rows.length === 0) {
      return null;
    }
    return this.rowToEntity(result.rows[0]);
  }

  async findByProduct(productId: ProductId): Promise<Stock[]> {
    const result = await this.db.query<StockRow>(
      `SELECT product_id, branch_id, quantity, updated_at
       FROM stock
       WHERE product_id = $1`,
      [productId.value],
    );
    return result.rows.map((row) => this.rowToEntity(row));
  }

  async update(stock: Stock): Promise<void> {
    await this.db.query(
      `UPDATE stock
         SET quantity = $3,
             updated_at = $4
       WHERE product_id = $1 AND branch_id = $2`,
      [stock.productId.value, stock.branchId.value, stock.quantity, stock.updatedAt],
    );
  }

  private rowToEntity(row: StockRow): Stock {
    return Stock.reconstitute({
      productId: new ProductId(row.product_id),
      branchId: new BranchId(row.branch_id),
      quantity: row.quantity,
      updatedAt: new Date(row.updated_at),
    });
  }
}
