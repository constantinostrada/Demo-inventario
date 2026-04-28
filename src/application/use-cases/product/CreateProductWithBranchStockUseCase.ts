/**
 * CreateProductWithBranchStockUseCase
 *
 * Creates a new product and seeds it with a stock row of quantity 0 at
 * every existing branch (CENTRO, NORTE, SUR). Persisting the product and
 * the per-branch stock rows together is what makes the new product
 * "automatically appear with stock 0 in the three branches".
 *
 * Layer: Application → Use Cases
 * Dependencies: IProductRepository, IBranchRepository, IStockRepository
 */

import { v4 as uuidv4 } from 'uuid';

import { Product } from '../../../domain/entities/Product';
import { Stock } from '../../../domain/entities/Stock';
import { ProductId } from '../../../domain/value-objects/ProductId';
import { SKU } from '../../../domain/value-objects/SKU';
import { Money } from '../../../domain/value-objects/Money';
import { ProductCategory } from '../../../domain/value-objects/ProductCategory';
import { DuplicateSKUException } from '../../../domain/exceptions/DuplicateSKUException';
import { DomainException } from '../../../domain/exceptions/DomainException';
import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { IBranchRepository } from '../../../domain/repositories/IBranchRepository';
import { IStockRepository } from '../../../domain/repositories/IStockRepository';
import { CreateProductDTO, ProductResponseDTO } from '../../dtos/ProductDTO';
import { ProductMapper } from '../../mappers/ProductMapper';

export interface CreateProductWithBranchStockResponseDTO {
  product: ProductResponseDTO;
  branchStock: Array<{
    branchId: string;
    quantity: number;
  }>;
}

export class CreateProductWithBranchStockUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly branchRepository: IBranchRepository,
    private readonly stockRepository: IStockRepository,
  ) {}

  async execute(dto: CreateProductDTO): Promise<CreateProductWithBranchStockResponseDTO> {
    const sku = new SKU(dto.sku);

    if (await this.productRepository.existsBySKU(sku)) {
      throw new DuplicateSKUException(sku.value);
    }

    const branches = await this.branchRepository.findAll();
    if (branches.length === 0) {
      throw new DomainException(
        'Cannot create a product: no branches exist. Initialise the database first.',
      );
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

    // Per-branch rows are always seeded at 0: a freshly created product
    // has not yet been physically delivered to any branch. Stock is then
    // grown through explicit IN / TRANSFER movements.
    const stockRows = branches.map((branch) => Stock.create(product.id, branch.id, 0));

    await this.productRepository.save(product);
    await this.stockRepository.saveMany(stockRows);

    return {
      product: ProductMapper.toResponseDTO(product),
      branchStock: stockRows.map((row) => ({
        branchId: row.branchId.value,
        quantity: row.quantity,
      })),
    };
  }
}
