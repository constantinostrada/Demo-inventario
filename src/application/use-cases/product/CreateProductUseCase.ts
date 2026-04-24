/**
 * CreateProductUseCase
 *
 * Orchestrates the creation of a new inventory product.
 * Validates uniqueness of SKU, builds the domain entity, persists it.
 *
 * Layer: Application → Use Cases
 * Dependencies injected: IProductRepository (domain interface)
 */

import { v4 as uuidv4 } from 'uuid';

import { Product } from '../../../domain/entities/Product';
import { ProductId } from '../../../domain/value-objects/ProductId';
import { SKU } from '../../../domain/value-objects/SKU';
import { Money } from '../../../domain/value-objects/Money';
import { ProductCategory } from '../../../domain/value-objects/ProductCategory';
import { DuplicateSKUException } from '../../../domain/exceptions/DuplicateSKUException';
import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { CreateProductDTO, ProductResponseDTO } from '../../dtos/ProductDTO';
import { ProductMapper } from '../../mappers/ProductMapper';

export class CreateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(dto: CreateProductDTO): Promise<ProductResponseDTO> {
    const sku = new SKU(dto.sku);

    const skuExists = await this.productRepository.existsBySKU(sku);
    if (skuExists) {
      throw new DuplicateSKUException(sku.value);
    }

    const product = Product.create({
      id: new ProductId(uuidv4()),
      name: dto.name,
      description: dto.description,
      sku,
      price: Money.fromDecimal(dto.priceAmount, dto.priceCurrency),
      category: new ProductCategory(dto.category),
      stockQuantity: dto.stockQuantity,
      minimumStockLevel: dto.minimumStockLevel,
    });

    await this.productRepository.save(product);

    return ProductMapper.toResponseDTO(product);
  }
}
