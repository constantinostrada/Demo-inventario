/**
 * UpdateProductUseCase
 *
 * Updates mutable fields on an existing product.
 *
 * Layer: Application → Use Cases
 */

import { ProductId } from '../../../domain/value-objects/ProductId';
import { Money } from '../../../domain/value-objects/Money';
import { ProductCategory } from '../../../domain/value-objects/ProductCategory';
import { ProductNotFoundException } from '../../../domain/exceptions/ProductNotFoundException';
import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { UpdateProductDTO, ProductResponseDTO } from '../../dtos/ProductDTO';
import { ProductMapper } from '../../mappers/ProductMapper';

export class UpdateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(dto: UpdateProductDTO): Promise<ProductResponseDTO> {
    const productId = new ProductId(dto.id);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundException(dto.id);
    }

    product.update({
      name: dto.name,
      description: dto.description,
      price:
        dto.priceAmount !== undefined && dto.priceCurrency !== undefined
          ? Money.fromDecimal(dto.priceAmount, dto.priceCurrency)
          : undefined,
      category: dto.category !== undefined ? new ProductCategory(dto.category) : undefined,
      minimumStockLevel: dto.minimumStockLevel,
    });

    await this.productRepository.update(product);

    return ProductMapper.toResponseDTO(product);
  }
}
