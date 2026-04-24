/**
 * ProductController
 *
 * Thin HTTP adapter for product-related use cases.
 * Responsibilities: validate input → call use case → serialize response.
 * NO business logic lives here.
 *
 * Layer: Interfaces → HTTP Controllers
 */

import { Request, Response, NextFunction } from 'express';

import { CreateProductUseCase } from '../../../application/use-cases/product/CreateProductUseCase';
import { GetProductUseCase } from '../../../application/use-cases/product/GetProductUseCase';
import { GetProductsUseCase } from '../../../application/use-cases/product/GetProductsUseCase';
import { UpdateProductUseCase } from '../../../application/use-cases/product/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../../application/use-cases/product/DeleteProductUseCase';
import { ProductCategoryValue } from '../../../domain/value-objects/ProductCategory';
import { CurrencyCode } from '../../../domain/value-objects/Money';

export class ProductController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly getProduct: GetProductUseCase,
    private readonly getProducts: GetProductsUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly deleteProduct: DeleteProductUseCase,
  ) {}

  // POST /api/v1/products
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.createProduct.execute({
        name: req.body.name as string,
        description: (req.body.description as string) ?? '',
        sku: req.body.sku as string,
        priceAmount: req.body.priceAmount as number,
        priceCurrency: (req.body.priceCurrency as CurrencyCode) ?? 'USD',
        category: req.body.category as ProductCategoryValue,
        stockQuantity: req.body.stockQuantity as number,
        minimumStockLevel: (req.body.minimumStockLevel as number) ?? 0,
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/products/:id
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getProduct.execute({ id: req.params.id });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/products
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getProducts.execute({
        category: req.query.category as ProductCategoryValue | undefined,
        isActive:
          req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        lowStock: req.query.lowStock === 'true',
        search: req.query.search as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/v1/products/:id
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.updateProduct.execute({
        id: req.params.id,
        name: req.body.name as string | undefined,
        description: req.body.description as string | undefined,
        priceAmount: req.body.priceAmount as number | undefined,
        priceCurrency: req.body.priceCurrency as CurrencyCode | undefined,
        category: req.body.category as ProductCategoryValue | undefined,
        minimumStockLevel: req.body.minimumStockLevel as number | undefined,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/v1/products/:id
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.deleteProduct.execute({ id: req.params.id });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
