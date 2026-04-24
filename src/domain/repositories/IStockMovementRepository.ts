/**
 * IStockMovementRepository — Repository Interface
 *
 * Defines persistence operations for StockMovement audit records.
 *
 * Layer: Domain → Repositories
 */

import { StockMovement } from '../entities/StockMovement';
import { ProductId } from '../value-objects/ProductId';
import { PaginatedResult, PaginationOptions } from './IProductRepository';

export interface IStockMovementRepository {
  /** Persist a new stock movement record. */
  save(movement: StockMovement): Promise<void>;

  /** Retrieve all movements for a given product. */
  findByProductId(
    productId: ProductId,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<StockMovement>>;

  /** Retrieve a single movement by its ID. */
  findById(id: string): Promise<StockMovement | null>;
}
