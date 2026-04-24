/**
 * CreateProductUseCase Tests
 *
 * Layer: Application → Tests
 */

import { CreateProductUseCase } from '../CreateProductUseCase';
import { IProductRepository } from '../../../../domain/repositories/IProductRepository';
import { DuplicateSKUException } from '../../../../domain/exceptions/DuplicateSKUException';
import { CreateProductDTO } from '../../../dtos/ProductDTO';

// ─── Mock Repository ──────────────────────────────────────────────────────────
const mockRepository: jest.Mocked<IProductRepository> = {
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findBySKU: jest.fn(),
  findAll: jest.fn(),
  findLowStock: jest.fn(),
  delete: jest.fn(),
  existsBySKU: jest.fn(),
};

const validDTO: CreateProductDTO = {
  name: 'Test Laptop',
  description: 'A great laptop',
  sku: 'ELEC-LAP-001',
  priceAmount: 999.99,
  priceCurrency: 'USD',
  category: 'ELECTRONICS',
  stockQuantity: 10,
  minimumStockLevel: 2,
};

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateProductUseCase(mockRepository);
  });

  it('creates a product and returns a DTO with an id', async () => {
    mockRepository.existsBySKU.mockResolvedValue(false);
    mockRepository.save.mockResolvedValue(undefined);

    const result = await useCase.execute(validDTO);

    expect(result.id).toBeDefined();
    expect(result.name).toBe(validDTO.name);
    expect(result.sku).toBe(validDTO.sku.toUpperCase());
    expect(result.price.amount).toBe(validDTO.priceAmount);
    expect(result.isActive).toBe(true);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('throws DuplicateSKUException when SKU already exists', async () => {
    mockRepository.existsBySKU.mockResolvedValue(true);

    await expect(useCase.execute(validDTO)).rejects.toThrow(DuplicateSKUException);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('does not call save when SKU is duplicate', async () => {
    mockRepository.existsBySKU.mockResolvedValue(true);
    await useCase.execute(validDTO).catch(() => {});
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
