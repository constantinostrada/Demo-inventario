/**
 * CreateProductUseCase — Acceptance Tests
 *
 * Verifies the full acceptance criterion of the "CRUD de productos" task:
 *   1. SKU duplicado: el sistema avisa (DuplicateSKUException)
 *   2. Nombre vacío: no se permite (DomainException)
 *   3. Al crear un producto, su stock se inicializa a 0 en las 3 sucursales
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
import { DomainException } from '../../../../domain/exceptions/DomainException';
import { CreateProductDTO } from '../../../dtos/ProductDTO';

const FIXED_BRANCHES: ReadonlyArray<{ id: string; code: 'CENTRO' | 'NORTE' | 'SUR' }> = [
  { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', code: 'CENTRO' },
  { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', code: 'NORTE' },
  { id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', code: 'SUR' },
];

const buildBranches = (): Branch[] =>
  FIXED_BRANCHES.map((b) =>
    Branch.create({
      id: new BranchId(b.id),
      code: new BranchCode(b.code),
      name: b.code.charAt(0) + b.code.slice(1).toLowerCase(),
      createdAt: new Date('2026-01-01T00:00:00Z'),
    }),
  );

const validDTO: CreateProductDTO = {
  name: 'Acceptance Laptop',
  description: 'Laptop used for AC testing',
  sku: 'ELEC-AC-001',
  priceAmount: 1299.99,
  priceCurrency: 'USD',
  category: 'ELECTRONICS',
  stockQuantity: 0,
  minimumStockLevel: 1,
};

describe('CreateProductUseCase — acceptance criteria', () => {
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

  describe('AC: SKU es único — el sistema avisa cuando se repite', () => {
    it('rejects creation with DuplicateSKUException when SKU already exists', async () => {
      productRepo.existsBySKU.mockResolvedValue(true);

      await expect(useCase.execute(validDTO)).rejects.toBeInstanceOf(
        DuplicateSKUException,
      );
      await expect(useCase.execute(validDTO)).rejects.toThrow(/already exists/i);
      expect(productRepo.save).not.toHaveBeenCalled();
      expect(stockRepo.saveMany).not.toHaveBeenCalled();
    });
  });

  describe('AC: nombre vacío — el sistema rechaza la creación', () => {
    it('rejects an empty name with DomainException', async () => {
      productRepo.existsBySKU.mockResolvedValue(false);
      branchRepo.findAll.mockResolvedValue(buildBranches());

      await expect(useCase.execute({ ...validDTO, name: '' })).rejects.toBeInstanceOf(
        DomainException,
      );
      await expect(useCase.execute({ ...validDTO, name: '   ' })).rejects.toThrow(
        /name cannot be empty/i,
      );

      expect(productRepo.save).not.toHaveBeenCalled();
      expect(stockRepo.saveMany).not.toHaveBeenCalled();
    });
  });

  describe('AC: al crear un producto, su stock se inicializa a 0 en las 3 sucursales', () => {
    it('persists exactly one stock-0 row per branch (CENTRO, NORTE, SUR)', async () => {
      productRepo.existsBySKU.mockResolvedValue(false);
      branchRepo.findAll.mockResolvedValue(buildBranches());

      const result = await useCase.execute(validDTO);

      // 1) Product is persisted exactly once
      expect(productRepo.save).toHaveBeenCalledTimes(1);

      // 2) Stock rows are persisted in a single call, one per branch
      expect(stockRepo.saveMany).toHaveBeenCalledTimes(1);
      const savedRows = stockRepo.saveMany.mock.calls[0][0] as Stock[];
      expect(savedRows).toHaveLength(3);

      // 3) Every saved row has quantity 0
      for (const row of savedRows) {
        expect(row.quantity).toBe(0);
      }

      // 4) The three branch ids are exactly the closed CENTRO/NORTE/SUR set
      const savedBranchIds = savedRows.map((r) => r.branchId.value).sort();
      expect(savedBranchIds).toEqual(FIXED_BRANCHES.map((b) => b.id).sort());

      // 5) The response surfaces the same three-branch initialization
      expect(result.branchStock).toHaveLength(3);
      expect(result.branchStock.every((bs) => bs.quantity === 0)).toBe(true);
      expect(result.branchStock.map((bs) => bs.branchId).sort()).toEqual(
        FIXED_BRANCHES.map((b) => b.id).sort(),
      );

      // 6) The product DTO reflects an initial stockQuantity of 0
      expect(result.product.stockQuantity).toBe(0);
      expect(result.product.isActive).toBe(true);
    });
  });
});
