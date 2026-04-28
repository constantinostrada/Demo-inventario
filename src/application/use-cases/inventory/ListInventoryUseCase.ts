/**
 * ListInventoryUseCase
 *
 * Retrieves the inventory listing with optional filters on name, SKU,
 * and category. Also computes the count of items whose available stock
 * is below the critical threshold.
 *
 * Layer: Application → Use Cases
 */

import { IInventoryItemRepository } from '../../../domain/repositories/IInventoryItemRepository';
import { ListInventoryDTO, InventoryListResponseDTO } from '../../dtos/InventoryDTO';
import { InventoryItemMapper } from '../../mappers/InventoryItemMapper';

/** Items with stock strictly below this threshold are flagged as "critical". */
export const CRITICAL_STOCK_THRESHOLD = 5;

export class ListInventoryUseCase {
  constructor(private readonly inventoryRepository: IInventoryItemRepository) {}

  async execute(dto: ListInventoryDTO = {}): Promise<InventoryListResponseDTO> {
    const items = await this.inventoryRepository.findAll({
      name: dto.name,
      sku: dto.sku,
      category: dto.category,
    });

    const criticalStockCount = items.reduce(
      (count, item) => (item.isCriticalStock(CRITICAL_STOCK_THRESHOLD) ? count + 1 : count),
      0,
    );

    return {
      data: items.map(InventoryItemMapper.toResponseDTO),
      total: items.length,
      criticalStockCount,
      criticalStockThreshold: CRITICAL_STOCK_THRESHOLD,
    };
  }
}
