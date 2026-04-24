/**
 * StockMovement DTOs
 *
 * Input/output contracts for stock movement use cases.
 *
 * Layer: Application → DTOs
 */

import { MovementType } from '../../domain/entities/StockMovement';

export interface StockMovementResponseDTO {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  performedBy: string;
  createdAt: string;
}

export interface PaginatedStockMovementsDTO {
  data: StockMovementResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
