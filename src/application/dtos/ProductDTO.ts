/**
 * Product DTOs
 *
 * Input/output contracts for Product-related use cases.
 * These are plain data objects — no domain types leak out.
 *
 * Layer: Application → DTOs
 */

import { ProductCategoryValue } from '../../domain/value-objects/ProductCategory';
import { CurrencyCode } from '../../domain/value-objects/Money';

// ─── Input DTOs ───────────────────────────────────────────────────────────────

export interface CreateProductDTO {
  name: string;
  description: string;
  sku: string;
  priceAmount: number;
  priceCurrency: CurrencyCode;
  category: ProductCategoryValue;
  stockQuantity: number;
  minimumStockLevel: number;
}

export interface UpdateProductDTO {
  id: string;
  name?: string;
  description?: string;
  priceAmount?: number;
  priceCurrency?: CurrencyCode;
  category?: ProductCategoryValue;
  minimumStockLevel?: number;
}

export interface GetProductDTO {
  id: string;
}

export interface GetProductsDTO {
  category?: ProductCategoryValue;
  isActive?: boolean;
  lowStock?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdjustStockDTO {
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  performedBy: string;
}

// ─── Output DTOs ──────────────────────────────────────────────────────────────

export interface BranchStockDTO {
  branchId: string;
  quantity: number;
}

export interface ProductResponseDTO {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: {
    amount: number;
    currency: CurrencyCode;
    formatted: string;
  };
  category: ProductCategoryValue;
  stockQuantity: number;
  minimumStockLevel: number;
  branchStocks: BranchStockDTO[];
  isLowStock: boolean;
  isOutOfStock: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProductsResponseDTO {
  data: ProductResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
