/**
 * IStockRepository — Repository Interface
 *
 * Defines persistence operations for per-branch product stock.
 * Identity is the (productId, branchId) pair.
 *
 * Layer: Domain → Repositories
 */

import { Stock } from '../entities/Stock';
import { ProductId } from '../value-objects/ProductId';
import { BranchId } from '../value-objects/BranchId';

export interface IStockRepository {
  /** Persist a new stock row (productId+branchId is unique). */
  save(stock: Stock): Promise<void>;

  /** Persist many stock rows in a single call (used when creating a product). */
  saveMany(rows: Stock[]): Promise<void>;

  /** Fetch the stock row for a given product at a given branch. */
  find(productId: ProductId, branchId: BranchId): Promise<Stock | null>;

  /** Fetch every per-branch stock row for a given product. */
  findByProduct(productId: ProductId): Promise<Stock[]>;

  /** Persist updates to an existing stock row. */
  update(stock: Stock): Promise<void>;
}
