/**
 * GetProductUseCase
 *
 * Retrieves a single product by its ID.
 *
 * Layer: Application → Use Cases
 */

import { ProductId } from '../../../domain/value-objects/ProductId';
import { ProductNotFoundException } from '../../../domain/exceptions/ProductNotFoundException';
import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { GetProductDTO, ProductResponseDTO } from '../../dtos/ProductDTO';
import { ProductMapper } from '../../mappers/ProductMapper';

export class GetProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(dto: GetProductDTO): Promise<ProductResponseDTO> {
    const productId = new ProductId(dto.id);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundException(dto.id);
    }

    return ProductMapper.toResponseDTO(product);
  }
}
