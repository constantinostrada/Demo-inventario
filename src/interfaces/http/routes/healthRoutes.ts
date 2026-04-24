/**
 * Health Routes
 *
 * Layer: Interfaces → Routes
 */

import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';

export function createHealthRouter(healthController: HealthController): Router {
  const router = Router();

  router.get('/', healthController.liveness);
  router.get('/ready', healthController.readiness);

  return router;
}
