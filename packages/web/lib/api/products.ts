/**
 * Products API module
 *
 * Typed wrappers around the inventory API endpoints.
 */

import { apiClient } from './client';

export type CurrencyCode = 'USD' | 'EUR' | 'MXN' | 'GBP' | 'CAD';
export type ProductCategoryValue =
  | 'ELECTRONICS'
  | 'CLOTHING'
  | 'FOOD_AND_BEVERAGE'
  | 'FURNITURE'
  | 'TOOLS'
  | 'OFFICE_SUPPLIES'
  | 'HEALTH_AND_BEAUTY'
  | 'TOYS'
  | 'AUTOMOTIVE'
  | 'OTHER';

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: { amount: number; currency: CurrencyCode; formatted: string };
  category: ProductCategoryValue;
  stockQuantity: number;
  minimumStockLevel: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProducts {
  data: ProductResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  sku: string;
  priceAmount: number;
  priceCurrency?: CurrencyCode;
  category: ProductCategoryValue;
  stockQuantity: number;
  minimumStockLevel?: number;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  priceAmount?: number;
  priceCurrency?: CurrencyCode;
  category?: ProductCategoryValue;
  minimumStockLevel?: number;
}

export interface AdjustStockInput {
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  performedBy: string;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: ProductCategoryValue;
  isActive?: boolean;
  lowStock?: boolean;
  search?: string;
}

export const productsApi = {
  getAll: async (params?: GetProductsParams): Promise<PaginatedProducts> => {
    const res = await apiClient.get<{ success: true } & PaginatedProducts>('/api/v1/products', {
      params,
    });
    const { success: _success, ...rest } = res.data;
    return rest;
  },

  getById: async (id: string): Promise<ProductResponse> => {
    const res = await apiClient.get<{ success: true; data: ProductResponse }>(
      `/api/v1/products/${id}`,
    );
    return res.data.data;
  },

  create: async (input: CreateProductInput): Promise<ProductResponse> => {
    const res = await apiClient.post<{ success: true; data: ProductResponse }>(
      '/api/v1/products',
      input,
    );
    return res.data.data;
  },

  update: async (id: string, input: UpdateProductInput): Promise<ProductResponse> => {
    const res = await apiClient.patch<{ success: true; data: ProductResponse }>(
      `/api/v1/products/${id}`,
      input,
    );
    return res.data.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<{ success: true; data: { success: boolean; message: string } }>(
      `/api/v1/products/${id}`,
    );
    return res.data.data;
  },

  adjustStock: async (id: string, input: AdjustStockInput) => {
    const res = await apiClient.post(`/api/v1/products/${id}/stock`, input);
    return res.data;
  },

  getStockMovements: async (id: string, params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get(`/api/v1/products/${id}/stock/movements`, { params });
    return res.data;
  },
};
