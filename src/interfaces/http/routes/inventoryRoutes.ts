/**
 * Inventory Routes
 *
 * Wires HTTP verbs + paths to the InventoryController.
 *
 * Layer: Interfaces → Routes
 */

import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController';
import { validateRequest } from '../middleware/validateRequest';
import { listInventoryValidators } from '../validators/inventoryValidators';

export function createInventoryRouter(inventoryController: InventoryController): Router {
  const router = Router();

  router.get('/', listInventoryValidators, validateRequest, inventoryController.list);

  return router;
}
