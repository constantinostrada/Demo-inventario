/**
 * AdjustStockUseCase
 *
 * Applies a stock movement (IN / OUT / ADJUSTMENT) to a product.
 * Uses StockDomainService to enforce business rules and produce
 * an immutable StockMovement audit record.
 *
 * Layer: Application → Use Cases
 */

import { v4 as uuidv4 } from 'uuid';

import { ProductId } from '../../../domain/value-objects/ProductId';
import { ProductNotFoundException } from '../../../domain/exceptions/ProductNotFoundException';
import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { IStockMovementRepository } from '../../../domain/repositories/IStockMovementRepository';
import { StockDomainService } from '../../../domain/services/StockDomainService';
import { AdjustStockDTO, ProductResponseDTO } from '../../dtos/ProductDTO';
import { StockMovementResponseDTO } from '../../dtos/StockMovementDTO';
import { ProductMapper } from '../../mappers/ProductMapper';
import { StockMovementMapper } from '../../mappers/StockMovementMapper';

export interface AdjustStockResponseDTO {
  product: ProductResponseDTO;
  movement: StockMovementResponseDTO;
}

export class AdjustStockUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly stockMovementRepository: IStockMovementRepository,
    private readonly stockDomainService: StockDomainService,
  ) {}

  async execute(dto: AdjustStockDTO): Promise<AdjustStockResponseDTO> {
    const productId = new ProductId(dto.productId);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundException(dto.productId);
    }

    const { updatedProduct, movement } = this.stockDomainService.applyMovement(
      product,
      dto.type,
      dto.quantity,
      dto.reason,
      dto.performedBy,
      uuidv4(),
    );

    await this.productRepository.update(updatedProduct);
    await this.stockMovementRepository.save(movement);

    return {
      product: ProductMapper.toResponseDTO(updatedProduct),
      movement: StockMovementMapper.toResponseDTO(movement),
    };
  }
}
