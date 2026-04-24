/**
 * Request Validation Middleware
 *
 * Checks express-validator results and returns 400 if there are errors.
 * Schema validation only — business rules belong in the domain.
 *
 * Layer: Interfaces → Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Validation failed.',
        details: errors.array(),
      },
    });
    return;
  }
  next();
}
