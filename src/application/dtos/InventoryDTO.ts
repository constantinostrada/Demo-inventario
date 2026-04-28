/**
 * Inventory DTOs
 *
 * Input/output contracts for Inventory-related use cases.
 * These are plain data objects — no domain types leak out.
 *
 * Layer: Application → DTOs
 */

import { ProductCategoryValue } from '../../domain/value-objects/ProductCategory';
import { CurrencyCode } from '../../domain/value-objects/Money';

// ─── Input DTOs ───────────────────────────────────────────────────────────────

export interface ListInventoryDTO {
  name?: string;
  sku?: string;
  category?: ProductCategoryValue;
}

// ─── Output DTOs ──────────────────────────────────────────────────────────────

export interface InventoryItemResponseDTO {
  id: string;
  sku: string;
  name: string;
  brand: string;
  price: {
    amount: number;
    currency: CurrencyCode;
    formatted: string;
  };
  stockQuantity: number;
  category: ProductCategoryValue;
}

export interface InventoryListResponseDTO {
  data: InventoryItemResponseDTO[];
  total: number;
  criticalStockCount: number;
  criticalStockThreshold: number;
}
