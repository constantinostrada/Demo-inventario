/**
 * Data Model — End-to-End Domain Test
 *
 * Validates the full data model required by the task:
 *   • Products with name, unique SKU and category
 *   • The three fixed branches: CENTRO, NORTE, SUR
 *   • Per-branch stock (each product carries an independent quantity per branch)
 *   • Stock movements (IN, OUT, TRANSFER) recording type, quantity, date,
 *     product and the branch(es) involved
 *   • Creating a new product seeds it with stock 0 in the three branches
 *
 * Layer: Domain / Application — in-memory tests with fake repositories.
 */

import { Branch } from '../entities/Branch';
import { Stock } from '../entities/Stock';
import { StockMovement } from '../entities/StockMovement';
import { BranchId } from '../value-objects/BranchId';
import { BranchCode, BRANCH_CODES } from '../value-objects/BranchCode';
import { ProductId } from '../value-objects/ProductId';
import { SKU } from '../value-objects/SKU';

import { IProductRepository } from '../repositories/IProductRepository';
import { IBranchRepository } from '../repositories/IBranchRepository';
import { IStockRepository } from '../repositories/IStockRepository';

import { CreateProductWithBranchStockUseCase } from '../../application/use-cases/product/CreateProductWithBranchStockUseCase';
import { CreateProductDTO } from '../../application/dtos/ProductDTO';
import { DuplicateSKUException } from '../exceptions/DuplicateSKUException';

// ─── In-memory fakes ─────────────────────────────────────────────────────────

class InMemoryBranchRepository implements IBranchRepository {
  private readonly branches: Branch[];
  constructor(branches: Branch[]) {
    this.branches = branches;
  }
  async findAll(): Promise<Branch[]> {
    return [...this.branches];
  }
  async findById(id: BranchId): Promise<Branch | null> {
    return this.branches.find((b) => b.id.equals(id)) ?? null;
  }
  async findByCode(code: BranchCode): Promise<Branch | null> {
    return this.branches.find((b) => b.code.equals(code)) ?? null;
  }
}

class InMemoryStockRepository implements IStockRepository {
  readonly rows: Stock[] = [];
  async save(stock: Stock): Promise<void> {
    this.rows.push(stock);
  }
  async saveMany(rows: Stock[]): Promise<void> {
    this.rows.push(...rows);
  }
  async find(productId: ProductId, branchId: BranchId): Promise<Stock | null> {
    return (
      this.rows.find(
        (r) => r.productId.equals(productId) && r.branchId.equals(branchId),
      ) ?? null
    );
  }
  async findByProduct(productId: ProductId): Promise<Stock[]> {
    return this.rows.filter((r) => r.productId.equals(productId));
  }
  async update(stock: Stock): Promise<void> {
    const idx = this.rows.findIndex(
      (r) => r.productId.equals(stock.productId) && r.branchId.equals(stock.branchId),
    );
    if (idx === -1) {
      this.rows.push(stock);
    } else {
      this.rows[idx] = stock;
    }
  }
}

class InMemoryProductRepository implements IProductRepository {
  private readonly products: Map<string, import('../entities/Product').Product> = new Map();
  private readonly skus: Set<string> = new Set();

  async save(product: import('../entities/Product').Product): Promise<void> {
    if (this.skus.has(product.sku.value)) {
      throw new Error('duplicate sku enforcement at infrastructure layer');
    }
    this.products.set(product.id.value, product);
    this.skus.add(product.sku.value);
  }
  async update(product: import('../entities/Product').Product): Promise<void> {
    this.products.set(product.id.value, product);
  }
  async findById(id: ProductId) {
    return this.products.get(id.value) ?? null;
  }
  async findBySKU(sku: SKU) {
    for (const product of this.products.values()) {
      if (product.sku.equals(sku)) return product;
    }
    return null;
  }
  async findAll() {
    const data = [...this.products.values()];
    return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
  }
  async findLowStock() {
    return [...this.products.values()].filter((p) => p.isLowStock());
  }
  async delete(id: ProductId): Promise<void> {
    const product = this.products.get(id.value);
    if (!product) return;
    this.skus.delete(product.sku.value);
    this.products.delete(id.value);
  }
  async existsBySKU(sku: SKU): Promise<boolean> {
    return this.skus.has(sku.value);
  }
}

// ─── Test data ───────────────────────────────────────────────────────────────

const fixedBranches = (): Branch[] => [
  Branch.create({
    id: new BranchId('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
    code: new BranchCode('CENTRO'),
    name: 'Centro',
    createdAt: new Date('2026-01-01T00:00:00Z'),
  }),
  Branch.create({
    id: new BranchId('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
    code: new BranchCode('NORTE'),
    name: 'Norte',
    createdAt: new Date('2026-01-01T00:00:00Z'),
  }),
  Branch.create({
    id: new BranchId('cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
    code: new BranchCode('SUR'),
    name: 'Sur',
    createdAt: new Date('2026-01-01T00:00:00Z'),
  }),
];

const dto = (overrides: Partial<CreateProductDTO> = {}): CreateProductDTO => ({
  name: 'Demo Product',
  description: 'A demo product',
  sku: 'DEMO-001',
  priceAmount: 49.99,
  priceCurrency: 'USD',
  category: 'ELECTRONICS',
  stockQuantity: 0,
  minimumStockLevel: 1,
  ...overrides,
});

// ─── The umbrella AC test ────────────────────────────────────────────────────

describe('Inventory data model', () => {
  it('satisfies the full base data model AC', async () => {
    // ─── Branches: closed set of three (CENTRO, NORTE, SUR) ──────────────
    expect(BRANCH_CODES).toEqual(['CENTRO', 'NORTE', 'SUR']);
    const branches = fixedBranches();
    expect(branches.map((b) => b.code.value).sort()).toEqual(['CENTRO', 'NORTE', 'SUR']);
    expect(branches.map((b) => b.name).sort()).toEqual(['Centro', 'Norte', 'Sur']);

    // ─── Wiring ──────────────────────────────────────────────────────────
    const branchRepo = new InMemoryBranchRepository(branches);
    const stockRepo = new InMemoryStockRepository();
    const productRepo = new InMemoryProductRepository();
    const createProduct = new CreateProductWithBranchStockUseCase(
      productRepo,
      branchRepo,
      stockRepo,
    );

    // ─── Products with name, unique SKU and category ─────────────────────
    const result = await createProduct.execute(dto({ sku: 'WIDGET-001', name: 'Widget' }));
    expect(result.product.name).toBe('Widget');
    expect(result.product.sku).toBe('WIDGET-001');
    expect(result.product.category).toBe('ELECTRONICS');

    // SKU must be unique
    await expect(
      createProduct.execute(dto({ sku: 'WIDGET-001', name: 'Another Widget' })),
    ).rejects.toThrow(DuplicateSKUException);

    // ─── Creating a product seeds stock 0 in the three branches ──────────
    expect(result.branchStock).toHaveLength(3);
    expect(result.branchStock.every((row) => row.quantity === 0)).toBe(true);

    const productId = new ProductId(result.product.id);
    const stocks = await stockRepo.findByProduct(productId);
    expect(stocks).toHaveLength(3);

    // every branch is represented exactly once for this product
    const branchIdsForProduct = stocks.map((s) => s.branchId.value).sort();
    expect(branchIdsForProduct).toEqual(branches.map((b) => b.id.value).sort());

    // ─── Stock per branch is independent ─────────────────────────────────
    const stockCentro = (await stockRepo.find(productId, branches[0].id))!;
    const stockNorte = (await stockRepo.find(productId, branches[1].id))!;
    stockCentro.increase(10);
    stockNorte.increase(3);
    expect(stockCentro.quantity).toBe(10);
    expect(stockNorte.quantity).toBe(3);
    // Sur stays untouched at 0
    const stockSur = (await stockRepo.find(productId, branches[2].id))!;
    expect(stockSur.quantity).toBe(0);

    // ─── Movements record type, quantity, date, product, branch(es) ──────
    const inMovement = StockMovement.create({
      id: '11111111-1111-4111-8111-111111111111',
      productId,
      type: 'IN',
      quantity: 10,
      previousStock: 0,
      newStock: 10,
      reason: 'Initial restock',
      performedBy: 'tester',
      destinationBranchId: branches[0].id,
      createdAt: new Date('2026-04-24T09:00:00Z'),
    });
    expect(inMovement.type).toBe('IN');
    expect(inMovement.quantity).toBe(10);
    expect(inMovement.productId.equals(productId)).toBe(true);
    expect(inMovement.destinationBranchId?.equals(branches[0].id)).toBe(true);
    expect(inMovement.createdAt.toISOString()).toBe('2026-04-24T09:00:00.000Z');

    const outMovement = StockMovement.create({
      id: '22222222-2222-4222-8222-222222222222',
      productId,
      type: 'OUT',
      quantity: 4,
      previousStock: 10,
      newStock: 6,
      reason: 'Sale',
      performedBy: 'tester',
      sourceBranchId: branches[0].id,
      createdAt: new Date('2026-04-24T10:00:00Z'),
    });
    expect(outMovement.type).toBe('OUT');
    expect(outMovement.sourceBranchId?.equals(branches[0].id)).toBe(true);

    const transfer = StockMovement.create({
      id: '33333333-3333-4333-8333-333333333333',
      productId,
      type: 'TRANSFER',
      quantity: 2,
      previousStock: 6,
      newStock: 4,
      reason: 'Rebalance Centro → Norte',
      performedBy: 'tester',
      sourceBranchId: branches[0].id,
      destinationBranchId: branches[1].id,
      createdAt: new Date('2026-04-24T11:00:00Z'),
    });
    expect(transfer.type).toBe('TRANSFER');
    expect(transfer.sourceBranchId?.equals(branches[0].id)).toBe(true);
    expect(transfer.destinationBranchId?.equals(branches[1].id)).toBe(true);
  });
});
