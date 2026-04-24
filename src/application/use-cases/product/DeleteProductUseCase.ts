/**
 * DeleteProductUseCase
 *
 * Soft-deletes a product by deactivating it.
 * Prefers deactivation over hard deletion to preserve audit history.
 *
 * Layer: Application → Use Cases
 */

import { ProductId } from '../../../domain/value-objects/ProductId';
import { ProductNotFoundException } from '../../../domain/exceptions/ProductNotFoundException';
import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { GetProductDTO } from '../../dtos/ProductDTO';

export interface DeleteProductResponseDTO {
  success: boolean;
  message: string;
}

export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(dto: GetProductDTO): Promise<DeleteProductResponseDTO> {
    const productId = new ProductId(dto.id);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundException(dto.id);
    }

    product.deactivate();
    await this.productRepository.update(product);

    return {
      success: true,
      message: `Product "${product.name}" has been deactivated.`,
    };
  }
}
