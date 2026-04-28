/**
 * IInventoryItemRepository — Repository Interface
 *
 * Defines WHAT the application can do with InventoryItem persistence.
 * Does NOT define HOW (that's infrastructure's job).
 *
 * Layer: Domain → Repositories
 * Implementations live in: src/infrastructure/repositories/
 */

import { InventoryItem } from '../entities/InventoryItem';
import { ProductCategoryValue } from '../value-objects/ProductCategory';

export interface InventoryItemFilters {
  /** Case-insensitive substring match against the item name. */
  name?: string;
  /** Case-insensitive exact match against the SKU value. */
  sku?: string;
  /** Exact match on category. */
  category?: ProductCategoryValue;
}

export interface IInventoryItemRepository {
  /** Return every inventory item matching the given filters. */
  findAll(filters?: InventoryItemFilters): Promise<InventoryItem[]>;
}
