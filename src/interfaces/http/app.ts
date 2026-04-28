/**
 * Express Application Factory
 *
 * Assembles the Express app: middleware, dependency injection, routes.
 * This is where all the wires are connected — the Composition Root
 * for the HTTP interface.
 *
 * Layer: Interfaces → HTTP
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';

import { env } from '../../infrastructure/config/env';
import { logger } from '../../infrastructure/config/logger';
import { PostgresClient } from '../../infrastructure/database/PostgresClient';
import { PostgresProductRepository } from '../../infrastructure/repositories/PostgresProductRepository';
import { PostgresStockMovementRepository } from '../../infrastructure/repositories/PostgresStockMovementRepository';
import { PostgresBranchRepository } from '../../infrastructure/repositories/PostgresBranchRepository';
import { PostgresStockRepository } from '../../infrastructure/repositories/PostgresStockRepository';
import { InMemoryInventoryItemRepository } from '../../infrastructure/repositories/InMemoryInventoryItemRepository';

import { StockDomainService } from '../../domain/services/StockDomainService';

import { CreateProductWithBranchStockUseCase } from '../../application/use-cases/product/CreateProductWithBranchStockUseCase';
import { GetProductUseCase } from '../../application/use-cases/product/GetProductUseCase';
import { GetProductsUseCase } from '../../application/use-cases/product/GetProductsUseCase';
import { UpdateProductUseCase } from '../../application/use-cases/product/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../application/use-cases/product/DeleteProductUseCase';
import { AdjustStockUseCase } from '../../application/use-cases/stock/AdjustStockUseCase';
import { GetStockMovementsUseCase } from '../../application/use-cases/stock/GetStockMovementsUseCase';
import { ListInventoryUseCase } from '../../application/use-cases/inventory/ListInventoryUseCase';

import { ProductController } from './controllers/ProductController';
import { StockController } from './controllers/StockController';
import { HealthController } from './controllers/HealthController';
import { InventoryController } from './controllers/InventoryController';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { createProductRouter } from './routes/productRoutes';
import { createHealthRouter } from './routes/healthRoutes';
import { createInventoryRouter } from './routes/inventoryRoutes';

export function createApp(): { app: Application; db: PostgresClient } {
  // ─── Infrastructure ─────────────────────────────────────────────────────
  const db = new PostgresClient({
    host: env.database.host,
    port: env.database.port,
    user: env.database.user,
    password: env.database.password,
    database: env.database.name,
    maxConnections: env.database.maxConnections,
  });

  // ─── Repositories ────────────────────────────────────────────────────────
  const productRepository = new PostgresProductRepository(db);
  const stockMovementRepository = new PostgresStockMovementRepository(db);
  const branchRepository = new PostgresBranchRepository(db);
  const stockRepository = new PostgresStockRepository(db);
  // In-memory repository — no DB dependency, seeded with demo data.
  const inventoryItemRepository = new InMemoryInventoryItemRepository();

  // ─── Domain Services ─────────────────────────────────────────────────────
  const stockDomainService = new StockDomainService();

  // ─── Use Cases ───────────────────────────────────────────────────────────
  const createProductUseCase = new CreateProductWithBranchStockUseCase(
    productRepository,
    branchRepository,
    stockRepository,
  );
  const getProductUseCase = new GetProductUseCase(productRepository);
  const getProductsUseCase = new GetProductsUseCase(productRepository);
  const updateProductUseCase = new UpdateProductUseCase(productRepository);
  const deleteProductUseCase = new DeleteProductUseCase(productRepository);
  const adjustStockUseCase = new AdjustStockUseCase(
    productRepository,
    stockMovementRepository,
    stockDomainService,
  );
  const getStockMovementsUseCase = new GetStockMovementsUseCase(
    productRepository,
    stockMovementRepository,
  );
  const listInventoryUseCase = new ListInventoryUseCase(inventoryItemRepository);

  // ─── Controllers ─────────────────────────────────────────────────────────
  const productController = new ProductController(
    createProductUseCase,
    getProductUseCase,
    getProductsUseCase,
    updateProductUseCase,
    deleteProductUseCase,
  );
  const stockController = new StockController(adjustStockUseCase, getStockMovementsUseCase);
  const healthController = new HealthController(db);
  const inventoryController = new InventoryController(listInventoryUseCase);

  // ─── Express App ─────────────────────────────────────────────────────────
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: env.server.corsOrigin,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use(requestLogger);

  // ─── Routes ──────────────────────────────────────────────────────────────
  app.use('/health', createHealthRouter(healthController));
  app.use('/api/v1/products', createProductRouter(productController, stockController));
  app.use('/api/v1/inventory', createInventoryRouter(inventoryController));

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found.' },
    });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  logger.info(`[App] Express application configured in "${env.nodeEnv}" mode.`);

  return { app, db };
}
