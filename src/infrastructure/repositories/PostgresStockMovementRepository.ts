/**
 * PostgresStockMovementRepository
 *
 * Implements IStockMovementRepository using PostgreSQL.
 *
 * Layer: Infrastructure → Repositories
 */

import { StockMovement, MovementType } from '../../domain/entities/StockMovement';
import { ProductId } from '../../domain/value-objects/ProductId';
import { BranchId } from '../../domain/value-objects/BranchId';
import {
  IStockMovementRepository,
} from '../../domain/repositories/IStockMovementRepository';
import { PaginatedResult, PaginationOptions } from '../../domain/repositories/IProductRepository';
import { PostgresClient } from '../database/PostgresClient';

interface StockMovementRow {
  id: string;
  product_id: string;
  type: string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  performed_by: string;
  created_at: Date;
  source_branch_id: string | null;
  destination_branch_id: string | null;
}

export class PostgresStockMovementRepository implements IStockMovementRepository {
  constructor(private readonly db: PostgresClient) {}

  async save(movement: StockMovement): Promise<void> {
    await this.db.query(
      `INSERT INTO stock_movements (
        id, product_id, type, quantity,
        previous_stock, new_stock, reason, performed_by, created_at,
        source_branch_id, destination_branch_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        movement.id,
        movement.productId.value,
        movement.type,
        movement.quantity,
        movement.previousStock,
        movement.newStock,
        movement.reason,
        movement.performedBy,
        movement.createdAt,
        movement.sourceBranchId?.value ?? null,
        movement.destinationBranchId?.value ?? null,
      ],
    );
  }

  async findByProductId(
    productId: ProductId,
    pagination: PaginationOptions = { page: 1, limit: 20 },
  ): Promise<PaginatedResult<StockMovement>> {
    const countResult = await this.db.query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM stock_movements WHERE product_id = $1',
      [productId.value],
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const offset = (pagination.page - 1) * pagination.limit;
    const result = await this.db.query<StockMovementRow>(
      `SELECT * FROM stock_movements
       WHERE product_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [productId.value, pagination.limit, offset],
    );

    return {
      data: result.rows.map((row) => this.rowToEntity(row)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findByBranchId(
    branchId: BranchId,
    pagination: PaginationOptions = { page: 1, limit: 20 },
  ): Promise<PaginatedResult<StockMovement>> {
    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM stock_movements
       WHERE source_branch_id = $1 OR destination_branch_id = $1`,
      [branchId.value],
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const offset = (pagination.page - 1) * pagination.limit;
    const result = await this.db.query<StockMovementRow>(
      `SELECT * FROM stock_movements
       WHERE source_branch_id = $1 OR destination_branch_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [branchId.value, pagination.limit, offset],
    );

    return {
      data: result.rows.map((row) => this.rowToEntity(row)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findById(id: string): Promise<StockMovement | null> {
    const result = await this.db.query<StockMovementRow>(
      'SELECT * FROM stock_movements WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) {
      return null;
    }
    return this.rowToEntity(result.rows[0]);
  }

  // ─── Private Mapper ───────────────────────────────────────────────────────

  private rowToEntity(row: StockMovementRow): StockMovement {
    return StockMovement.create({
      id: row.id,
      productId: new ProductId(row.product_id),
      type: row.type as MovementType,
      quantity: row.quantity,
      previousStock: row.previous_stock,
      newStock: row.new_stock,
      reason: row.reason,
      performedBy: row.performed_by,
      createdAt: new Date(row.created_at),
      sourceBranchId: row.source_branch_id ? new BranchId(row.source_branch_id) : undefined,
      destinationBranchId: row.destination_branch_id
        ? new BranchId(row.destination_branch_id)
        : undefined,
    });
  }
}
