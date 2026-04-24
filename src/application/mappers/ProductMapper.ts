/**
 * ProductMapper
 *
 * Converts domain entities to response DTOs.
 * The reverse mapping (DTO → entity) happens inside use cases, not here.
 *
 * Layer: Application → Mappers
 */

import { Product } from '../../domain/entities/Product';
import { ProductResponseDTO } from '../dtos/ProductDTO';

export class ProductMapper {
  static toResponseDTO(product: Product): ProductResponseDTO {
    return {
      id: product.id.value,
      name: product.name,
      description: product.description,
      sku: product.sku.value,
      price: {
        amount: product.price.toDecimal(),
        currency: product.price.currency,
        formatted: product.price.toString(),
      },
      category: product.category.value,
      stockQuantity: product.stockQuantity,
      minimumStockLevel: product.minimumStockLevel,
      isLowStock: product.isLowStock(),
      isOutOfStock: product.isOutOfStock(),
      isActive: product.isActive,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
