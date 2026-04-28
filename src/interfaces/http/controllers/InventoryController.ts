/**
 * InventoryController
 *
 * Thin HTTP adapter for inventory-related use cases.
 * Responsibilities: read query params → call use case → serialize response.
 * NO business logic lives here.
 *
 * Layer: Interfaces → HTTP Controllers
 */

import { Request, Response, NextFunction } from 'express';

import { ListInventoryUseCase } from '../../../application/use-cases/inventory/ListInventoryUseCase';
import { ProductCategoryValue } from '../../../domain/value-objects/ProductCategory';

export class InventoryController {
  constructor(private readonly listInventory: ListInventoryUseCase) {}

  // GET /api/v1/inventory
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.listInventory.execute({
        name: req.query.name as string | undefined,
        sku: req.query.sku as string | undefined,
        category: req.query.category as ProductCategoryValue | undefined,
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };
}
