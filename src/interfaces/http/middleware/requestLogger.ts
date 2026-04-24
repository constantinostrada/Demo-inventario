/**
 * Request Logger Middleware
 *
 * Logs incoming HTTP requests using Morgan with Winston transport.
 *
 * Layer: Interfaces → Middleware
 */

import morgan from 'morgan';
import { logger } from '../../../infrastructure/config/logger';

const stream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};

export const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream },
);
