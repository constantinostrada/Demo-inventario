/**
 * GetStockMovementsUseCase
 *
 * Retrieves paginated stock movement history for a given product.
 *
 * Layer: Application → Use Cases
 */

import { ProductId } from '../../../domain/value-objects/ProductId';
import { ProductNotFoundException } from '../../../domain/exceptions/ProductNotFoundException';
import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { IStockMovementRepository } from '../../../domain/repositories/IStockMovementRepository';
import { PaginatedStockMovementsDTO } from '../../dtos/StockMovementDTO';
import { StockMovementMapper } from '../../mappers/StockMovementMapper';

export interface GetStockMovementsDTO {
  productId: string;
  page?: number;
  limit?: number;
}

export class GetStockMovementsUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly stockMovementRepository: IStockMovementRepository,
  ) {}

  async execute(dto: GetStockMovementsDTO): Promise<PaginatedStockMovementsDTO> {
    const productId = new ProductId(dto.productId);

    const productExists = await this.productRepository.findById(productId);
    if (!productExists) {
      throw new ProductNotFoundException(dto.productId);
    }

    const page = Math.max(1, dto.page ?? 1);
    const limit = Math.min(100, Math.max(1, dto.limit ?? 20));

    const result = await this.stockMovementRepository.findByProductId(productId, { page, limit });

    return {
      data: result.data.map(StockMovementMapper.toResponseDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
