/**
 * Global Error Handler Middleware
 *
 * Translates domain/application exceptions into appropriate HTTP responses.
 * Keeps error-to-status-code mapping in the interfaces layer, where it belongs.
 *
 * Layer: Interfaces → Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { DomainException } from '../../../domain/exceptions/DomainException';
import { ProductNotFoundException } from '../../../domain/exceptions/ProductNotFoundException';
import { DuplicateSKUException } from '../../../domain/exceptions/DuplicateSKUException';
import { logger } from '../../../infrastructure/config/logger';

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // ─── Known Domain Exceptions ───────────────────────────────────────────────
  if (err instanceof ProductNotFoundException) {
    res.status(404).json(buildError('NOT_FOUND', err.message));
    return;
  }

  if (err instanceof DuplicateSKUException) {
    res.status(409).json(buildError('CONFLICT', err.message));
    return;
  }

  if (err instanceof DomainException) {
    res.status(422).json(buildError('VALIDATION_ERROR', err.message));
    return;
  }

  // ─── Unexpected Errors ────────────────────────────────────────────────────
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error('Unhandled error', {
    message: error.message,
    stack: error.stack,
  });

  res.status(500).json(buildError('INTERNAL_SERVER_ERROR', 'An unexpected error occurred.'));
}

function buildError(code: string, message: string): ApiError {
  return {
    success: false,
    error: { code, message },
  };
}
