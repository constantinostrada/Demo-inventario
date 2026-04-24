/**
 * StockController
 *
 * Handles HTTP requests for stock adjustments and movement history.
 *
 * Layer: Interfaces → HTTP Controllers
 */

import { Request, Response, NextFunction } from 'express';

import { AdjustStockUseCase } from '../../../application/use-cases/stock/AdjustStockUseCase';
import { GetStockMovementsUseCase } from '../../../application/use-cases/stock/GetStockMovementsUseCase';

export class StockController {
  constructor(
    private readonly adjustStock: AdjustStockUseCase,
    private readonly getStockMovements: GetStockMovementsUseCase,
  ) {}

  // POST /api/v1/products/:id/stock
  adjust = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adjustStock.execute({
        productId: req.params.id,
        type: req.body.type as 'IN' | 'OUT' | 'ADJUSTMENT',
        quantity: req.body.quantity as number,
        reason: req.body.reason as string,
        performedBy: req.body.performedBy as string,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/products/:id/stock/movements
  getMovements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getStockMovements.execute({
        productId: req.params.id,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };
}
