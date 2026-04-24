/**
 * Server Entry Point
 *
 * Starts the HTTP server and handles graceful shutdown.
 * This is the only place that knows about process signals.
 *
 * Layer: Interfaces (entry point)
 */

import { createApp } from '../../../src/interfaces/http/app';
import { env } from '../../../src/infrastructure/config/env';
import { logger } from '../../../src/infrastructure/config/logger';

async function bootstrap(): Promise<void> {
  const { app, db } = createApp();

  const server = app.listen(env.server.port, () => {
    logger.info(`🚀 Demo Inventario API running on http://localhost:${env.server.port}`);
    logger.info(`📋 Environment: ${env.nodeEnv}`);
    logger.info(`❤️  Health check: http://localhost:${env.server.port}/health`);
    logger.info(`📦 API base: http://localhost:${env.server.port}/api/v1`);
  });

  // ─── Graceful Shutdown ──────────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`[Server] Received ${signal}. Shutting down gracefully…`);

    server.close(async () => {
      logger.info('[Server] HTTP server closed.');
      try {
        await db.close();
        logger.info('[Server] Database connections closed.');
        process.exit(0);
      } catch (err) {
        logger.error('[Server] Error during shutdown:', err);
        process.exit(1);
      }
    });

    // Force shutdown after 10 seconds if graceful shutdown fails
    setTimeout(() => {
      logger.error('[Server] Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
  process.on('SIGINT', () => { void shutdown('SIGINT'); });

  process.on('uncaughtException', (err) => {
    logger.error('[Server] Uncaught exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('[Server] Unhandled promise rejection:', reason);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
