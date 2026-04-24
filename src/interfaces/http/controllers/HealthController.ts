/**
 * HealthController
 *
 * Provides liveness and readiness probes for container orchestration.
 *
 * Layer: Interfaces → HTTP Controllers
 */

import { Request, Response } from 'express';
import { PostgresClient } from '../../../infrastructure/database/PostgresClient';

export class HealthController {
  constructor(private readonly db: PostgresClient) {}

  // GET /health
  liveness = (_req: Request, res: Response): void => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  };

  // GET /health/ready
  readiness = async (_req: Request, res: Response): Promise<void> => {
    const dbHealthy = await this.db.isHealthy();
    if (dbHealthy) {
      res.status(200).json({
        status: 'ready',
        checks: { database: 'ok' },
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        checks: { database: 'error' },
        timestamp: new Date().toISOString(),
      });
    }
  };
}
