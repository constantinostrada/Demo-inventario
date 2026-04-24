/**
 * Product Routes
 *
 * Wires HTTP verbs + paths to controller methods and validation chains.
 *
 * Layer: Interfaces → Routes
 */

import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { StockController } from '../controllers/StockController';
import { validateRequest } from '../middleware/validateRequest';
import {
  createProductValidators,
  updateProductValidators,
  productIdValidator,
  getProductsValidators,
  adjustStockValidators,
} from '../validators/productValidators';

export function createProductRouter(
  productController: ProductController,
  stockController: StockController,
): Router {
  const router = Router();

  // ─── Product CRUD ─────────────────────────────────────────────────────────
  router.get('/', getProductsValidators, validateRequest, productController.getAll);
  router.post('/', createProductValidators, validateRequest, productController.create);
  router.get('/:id', productIdValidator, validateRequest, productController.getById);
  router.patch('/:id', updateProductValidators, validateRequest, productController.update);
  router.delete('/:id', productIdValidator, validateRequest, productController.delete);

  // ─── Stock Operations ─────────────────────────────────────────────────────
  router.post('/:id/stock', adjustStockValidators, validateRequest, stockController.adjust);
  router.get(
    '/:id/stock/movements',
    productIdValidator,
    validateRequest,
    stockController.getMovements,
  );

  return router;
}
