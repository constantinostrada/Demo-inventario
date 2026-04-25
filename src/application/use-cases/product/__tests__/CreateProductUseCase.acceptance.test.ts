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

import { CreateProductUseCase } from '../CreateProductUseCase';
import { IProductRepository } from '../../../../domain/repositories/IProductRepository';
import { Product } from '../../../../domain/entities/Product';
import { DuplicateSKUException } from '../../../../domain/exceptions/DuplicateSKUException';
import { DomainException } from '../../../../domain/exceptions/DomainException';
import { CreateProductDTO } from '../../../dtos/ProductDTO';
import { BRANCH_IDS } from '../../../../domain/value-objects/Branch';

const makeRepoMock = (): jest.Mocked<IProductRepository> => ({
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findBySKU: jest.fn(),
  findAll: jest.fn(),
  findLowStock: jest.fn(),
  delete: jest.fn(),
  existsBySKU: jest.fn(),
});

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
  let repository: jest.Mocked<IProductRepository>;
  let useCase: CreateProductUseCase;

  beforeEach(() => {
    repository = makeRepoMock();
    useCase = new CreateProductUseCase(repository);
  });

  describe('AC: producto creado vía API y persistido', () => {
    it('Product creates stock 0 in all 3 sucursales automatically', async () => {
      repository.existsBySKU.mockResolvedValue(false);
      repository.save.mockResolvedValue(undefined);

      const dto = await useCase.execute(validDTO);

      // 1) The use case persisted exactly one product
      expect(repository.save).toHaveBeenCalledTimes(1);

      const persisted = repository.save.mock.calls[0][0] as Product;
      expect(persisted).toBeInstanceOf(Product);

      // 2) The persisted product has 3 branch stocks, one per sucursal
      expect(persisted.branchStocks).toHaveLength(3);

      const branchIds = persisted.branchStocks.map((bs) => bs.branch.value).sort();
      expect(branchIds).toEqual([...BRANCH_IDS].sort());

      // 3) Every sucursal starts with quantity 0
      for (const bs of persisted.branchStocks) {
        expect(bs.quantity).toBe(0);
      }

      // 4) The response DTO surfaces the same 3-branch initialization
      expect(dto.branchStocks).toHaveLength(3);
      expect(dto.branchStocks.every((b) => b.quantity === 0)).toBe(true);
      expect(dto.branchStocks.map((b) => b.branchId).sort()).toEqual(
        [...BRANCH_IDS].sort(),
      );
    });

    it('SKU duplicado: el sistema avisa con DuplicateSKUException y no persiste nada', async () => {
      repository.existsBySKU.mockResolvedValue(true);

      await expect(useCase.execute(validDTO)).rejects.toBeInstanceOf(
        DuplicateSKUException,
      );
      await expect(useCase.execute(validDTO)).rejects.toThrow(/already exists/i);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('Nombre vacío: rechaza la creación con DomainException y no persiste nada', async () => {
      repository.existsBySKU.mockResolvedValue(false);

      await expect(
        useCase.execute({ ...validDTO, name: '' }),
      ).rejects.toBeInstanceOf(DomainException);

      await expect(
        useCase.execute({ ...validDTO, name: '   ' }),
      ).rejects.toThrow(/name cannot be empty/i);

      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
