/**
 * PostgresProductRepository
 *
 * Implements IProductRepository using PostgreSQL.
 * Maps raw DB rows ↔ Product domain entities.
 * All SQL lives here — never in the domain or application layers.
 *
 * Layer: Infrastructure → Repositories
 */

import { Product } from '../../domain/entities/Product';
import { ProductId } from '../../domain/value-objects/ProductId';
import { SKU } from '../../domain/value-objects/SKU';
import { Money } from '../../domain/value-objects/Money';
import { ProductCategory } from '../../domain/value-objects/ProductCategory';
import { Branch } from '../../domain/value-objects/Branch';
import { BranchStock } from '../../domain/value-objects/BranchStock';
import {
  IProductRepository,
  ProductFilters,
  PaginationOptions,
  PaginatedResult,
} from '../../domain/repositories/IProductRepository';
import { PostgresClient } from '../database/PostgresClient';

interface ProductRow {
  id: string;
  name: string;
  description: string;
  sku: string;
  price_amount_cents: number;
  price_currency: string;
  category: string;
  stock_quantity: number;
  minimum_stock_level: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface BranchStockRow {
  product_id: string;
  branch_id: string;
  quantity: number;
}

export class PostgresProductRepository implements IProductRepository {
  constructor(private readonly db: PostgresClient) {}

  async save(product: Product): Promise<void> {
    await this.db.query(
      `INSERT INTO products (
        id, name, description, sku,
        price_amount_cents, price_currency,
        category, stock_quantity, minimum_stock_level, is_active,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        product.id.value,
        product.name,
        product.description,
        product.sku.value,
        product.price.amountInCents,
        product.price.currency,
        product.category.value,
        product.stockQuantity,
        product.minimumStockLevel,
        product.isActive,
        product.createdAt,
        product.updatedAt,
      ],
    );

    for (const branchStock of product.branchStocks) {
      await this.db.query(
        `INSERT INTO product_branch_stocks (product_id, branch_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (product_id, branch_id) DO UPDATE SET quantity = EXCLUDED.quantity`,
        [product.id.value, branchStock.branch.value, branchStock.quantity],
      );
    }
  }

  async update(product: Product): Promise<void> {
    await this.db.query(
      `UPDATE products SET
        name                = $2,
        description         = $3,
        price_amount_cents  = $4,
        price_currency      = $5,
        category            = $6,
        stock_quantity      = $7,
        minimum_stock_level = $8,
        is_active           = $9,
        updated_at          = $10
      WHERE id = $1`,
      [
        product.id.value,
        product.name,
        product.description,
        product.price.amountInCents,
        product.price.currency,
        product.category.value,
        product.stockQuantity,
        product.minimumStockLevel,
        product.isActive,
        product.updatedAt,
      ],
    );
  }

  async findById(id: ProductId): Promise<Product | null> {
    const result = await this.db.query<ProductRow>(
      'SELECT * FROM products WHERE id = $1',
      [id.value],
    );
    if (result.rows.length === 0) {
      return null;
    }
    const branchStocks = await this.loadBranchStocks([result.rows[0].id]);
    return this.rowToEntity(result.rows[0], branchStocks.get(result.rows[0].id) ?? []);
  }

  async findBySKU(sku: SKU): Promise<Product | null> {
    const result = await this.db.query<ProductRow>(
      'SELECT * FROM products WHERE sku = $1',
      [sku.value],
    );
    if (result.rows.length === 0) {
      return null;
    }
    const branchStocks = await this.loadBranchStocks([result.rows[0].id]);
    return this.rowToEntity(result.rows[0], branchStocks.get(result.rows[0].id) ?? []);
  }

  async findAll(
    filters: ProductFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 20 },
  ): Promise<PaginatedResult<Product>> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters.isActive !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`);
      params.push(filters.isActive);
    }
    if (filters.category !== undefined) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(filters.category);
    }
    if (filters.lowStock === true) {
      conditions.push(`stock_quantity <= minimum_stock_level`);
    }
    if (filters.search) {
      conditions.push(`name ILIKE $${paramIndex++}`);
      params.push(`%${filters.search}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM products ${where}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const offset = (pagination.page - 1) * pagination.limit;
    const dataResult = await this.db.query<ProductRow>(
      `SELECT * FROM products ${where}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, pagination.limit, offset],
    );

    const branchStocks = await this.loadBranchStocks(dataResult.rows.map((r) => r.id));

    return {
      data: dataResult.rows.map((row) =>
        this.rowToEntity(row, branchStocks.get(row.id) ?? []),
      ),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findLowStock(): Promise<Product[]> {
    const result = await this.db.query<ProductRow>(
      `SELECT * FROM products
       WHERE stock_quantity <= minimum_stock_level AND is_active = TRUE
       ORDER BY stock_quantity ASC`,
    );
    const branchStocks = await this.loadBranchStocks(result.rows.map((r) => r.id));
    return result.rows.map((row) => this.rowToEntity(row, branchStocks.get(row.id) ?? []));
  }

  async delete(id: ProductId): Promise<void> {
    await this.db.query('DELETE FROM products WHERE id = $1', [id.value]);
  }

  async existsBySKU(sku: SKU): Promise<boolean> {
    const result = await this.db.query<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM products WHERE sku = $1) AS exists',
      [sku.value],
    );
    return result.rows[0].exists;
  }

  // ─── Private Mapper ───────────────────────────────────────────────────────

  private async loadBranchStocks(productIds: string[]): Promise<Map<string, BranchStock[]>> {
    const grouped = new Map<string, BranchStock[]>();
    if (productIds.length === 0) {
      return grouped;
    }
    const result = await this.db.query<BranchStockRow>(
      `SELECT product_id, branch_id, quantity
       FROM product_branch_stocks
       WHERE product_id = ANY($1::uuid[])`,
      [productIds],
    );
    for (const row of result.rows) {
      const list = grouped.get(row.product_id) ?? [];
      list.push(new BranchStock(new Branch(row.branch_id), row.quantity));
      grouped.set(row.product_id, list);
    }
    return grouped;
  }

  private rowToEntity(row: ProductRow, branchStocks: BranchStock[]): Product {
    return Product.reconstitute({
      id: new ProductId(row.id),
      name: row.name,
      description: row.description,
      sku: new SKU(row.sku),
      price: new Money(row.price_amount_cents, row.price_currency as 'USD'),
      category: new ProductCategory(row.category),
      stockQuantity: row.stock_quantity,
      minimumStockLevel: row.minimum_stock_level,
      branchStocks,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
