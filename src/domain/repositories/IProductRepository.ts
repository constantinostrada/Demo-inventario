/**
 * IProductRepository — Repository Interface
 *
 * Defines WHAT the application can do with Product persistence.
 * Does NOT define HOW (that's infrastructure's job).
 *
 * Layer: Domain → Repositories
 * Implementations live in: src/infrastructure/repositories/
 */

import { Product } from '../entities/Product';
import { ProductId } from '../value-objects/ProductId';
import { SKU } from '../value-objects/SKU';
import { ProductCategoryValue } from '../value-objects/ProductCategory';

export interface ProductFilters {
  category?: ProductCategoryValue;
  isActive?: boolean;
  lowStock?: boolean;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IProductRepository {
  /** Persist a new product. */
  save(product: Product): Promise<void>;

  /** Persist changes to an existing product. */
  update(product: Product): Promise<void>;

  /** Find a product by its unique ID. Returns null if not found. */
  findById(id: ProductId): Promise<Product | null>;

  /** Find a product by its SKU. Returns null if not found. */
  findBySKU(sku: SKU): Promise<Product | null>;

  /** Find all products matching the given filters with pagination. */
  findAll(filters?: ProductFilters, pagination?: PaginationOptions): Promise<PaginatedResult<Product>>;

  /** Find all products whose stock is at or below their minimum level. */
  findLowStock(): Promise<Product[]>;

  /** Permanently remove a product (soft-delete via deactivate() is preferred). */
  delete(id: ProductId): Promise<void>;

  /** Check whether a product with the given SKU already exists. */
  existsBySKU(sku: SKU): Promise<boolean>;
}
