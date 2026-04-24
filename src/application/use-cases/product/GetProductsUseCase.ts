/**
 * GetProductsUseCase
 *
 * Retrieves a paginated, filtered list of products.
 *
 * Layer: Application → Use Cases
 */

import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { GetProductsDTO, PaginatedProductsResponseDTO } from '../../dtos/ProductDTO';
import { ProductMapper } from '../../mappers/ProductMapper';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export class GetProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(dto: GetProductsDTO): Promise<PaginatedProductsResponseDTO> {
    const page = Math.max(1, dto.page ?? DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, dto.limit ?? DEFAULT_LIMIT));

    const result = await this.productRepository.findAll(
      {
        category: dto.category,
        isActive: dto.isActive,
        lowStock: dto.lowStock,
        search: dto.search,
      },
      { page, limit },
    );

    return {
      data: result.data.map(ProductMapper.toResponseDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
