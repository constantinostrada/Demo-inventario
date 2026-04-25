/**
 * StockMovementMapper
 *
 * Converts StockMovement domain entities to response DTOs.
 *
 * Layer: Application → Mappers
 */

import { StockMovement } from '../../domain/entities/StockMovement';
import { StockMovementResponseDTO } from '../dtos/StockMovementDTO';

export class StockMovementMapper {
  static toResponseDTO(movement: StockMovement): StockMovementResponseDTO {
    return {
      id: movement.id,
      productId: movement.productId.value,
      type: movement.type,
      quantity: movement.quantity,
      previousStock: movement.previousStock,
      newStock: movement.newStock,
      reason: movement.reason,
      performedBy: movement.performedBy,
      createdAt: movement.createdAt.toISOString(),
      sourceBranchId: movement.sourceBranchId?.value ?? null,
      destinationBranchId: movement.destinationBranchId?.value ?? null,
    };
  }
}
