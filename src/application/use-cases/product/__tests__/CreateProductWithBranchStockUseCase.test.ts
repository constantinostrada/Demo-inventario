/**
 * CreateProductWithBranchStockUseCase Tests
 *
 * Validates the orchestration that creates a new product and seeds it
 * with stock = 0 at every branch.
 *
 * Layer: Application → Tests
 */

import { CreateProductWithBranchStockUseCase } from '../CreateProductWithBranchStockUseCase';
import { Branch } from '../../../../domain/entities/Branch';
import { Stock } from '../../../../domain/entities/Stock';
import { BranchId } from '../../../../domain/value-objects/BranchId';
import { BranchCode } from '../../../../domain/value-objects/BranchCode';
import { IProductRepository } from '../../../../domain/repositories/IProductRepository';
import { IBranchRepository } from '../../../../domain/repositories/IBranchRepository';
import { IStockRepository } from '../../../../domain/repositories/IStockRepository';
import { DuplicateSKUException } from '../../../../domain/exceptions/DuplicateSKUException';
import { CreateProductDTO } from '../../../dtos/ProductDTO';

const validDTO: CreateProductDTO = {
  name: 'Demo Product',
  description: 'A demo product',
  sku: 'DEMO-001',
  priceAmount: 49.99,
  priceCurrency: 'USD',
  category: 'ELECTRONICS',
  stockQuantity: 0,
  minimumStockLevel: 1,
};

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

describe('CreateProductWithBranchStockUseCase', () => {
  let productRepo: jest.Mocked<IProductRepository>;
  let branchRepo: jest.Mocked<IBranchRepository>;
  let stockRepo: jest.Mocked<IStockRepository>;
  let useCase: CreateProductWithBranchStockUseCase;

  beforeEach(() => {
    productRepo = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findBySKU: jest.fn(),
      findAll: jest.fn(),
      findLowStock: jest.fn(),
      delete: jest.fn(),
      existsBySKU: jest.fn(),
    };
    branchRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
    };
    stockRepo = {
      save: jest.fn(),
      saveMany: jest.fn(),
      find: jest.fn(),
      findByProduct: jest.fn(),
      update: jest.fn(),
    };
    useCase = new CreateProductWithBranchStockUseCase(productRepo, branchRepo, stockRepo);
  });

  it('creates the product and a stock-0 row for every branch', async () => {
    productRepo.existsBySKU.mockResolvedValue(false);
    branchRepo.findAll.mockResolvedValue(fixedBranches());

    const result = await useCase.execute(validDTO);

    expect(productRepo.save).toHaveBeenCalledTimes(1);
    expect(stockRepo.saveMany).toHaveBeenCalledTimes(1);

    const savedRows = stockRepo.saveMany.mock.calls[0][0] as Stock[];
    expect(savedRows).toHaveLength(3);
    for (const row of savedRows) {
      expect(row.quantity).toBe(0);
    }

    const savedBranchIds = savedRows.map((r) => r.branchId.value).sort();
    expect(savedBranchIds).toEqual(
      fixedBranches()
        .map((b) => b.id.value)
        .sort(),
    );

    expect(result.branchStock).toHaveLength(3);
    expect(result.branchStock.every((row) => row.quantity === 0)).toBe(true);
  });

  it('rejects creation when SKU already exists', async () => {
    productRepo.existsBySKU.mockResolvedValue(true);

    await expect(useCase.execute(validDTO)).rejects.toThrow(DuplicateSKUException);
    expect(productRepo.save).not.toHaveBeenCalled();
    expect(stockRepo.saveMany).not.toHaveBeenCalled();
  });

  it('refuses to create a product when no branches are present', async () => {
    productRepo.existsBySKU.mockResolvedValue(false);
    branchRepo.findAll.mockResolvedValue([]);

    await expect(useCase.execute(validDTO)).rejects.toThrow();
    expect(productRepo.save).not.toHaveBeenCalled();
    expect(stockRepo.saveMany).not.toHaveBeenCalled();
  });
});
