/**
 * InventoryItemMapper
 *
 * Converts InventoryItem domain entities to response DTOs.
 *
 * Layer: Application → Mappers
 */

import { InventoryItem } from '../../domain/entities/InventoryItem';
import { InventoryItemResponseDTO } from '../dtos/InventoryDTO';

export class InventoryItemMapper {
  static toResponseDTO(item: InventoryItem): InventoryItemResponseDTO {
    return {
      id: item.id.value,
      sku: item.sku.value,
      name: item.name,
      brand: item.brand,
      price: {
        amount: item.price.toDecimal(),
        currency: item.price.currency,
        formatted: item.price.toString(),
      },
      stockQuantity: item.stockQuantity,
      category: item.category.value,
    };
  }
}
