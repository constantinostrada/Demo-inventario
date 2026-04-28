/**
 * ListInventoryUseCase Tests
 *
 * Layer: Application → Tests
 */

import { ListInventoryUseCase, CRITICAL_STOCK_THRESHOLD } from '../ListInventoryUseCase';
import { InventoryItem } from '../../../../domain/entities/InventoryItem';
import { IInventoryItemRepository } from '../../../../domain/repositories/IInventoryItemRepository';
import { ProductId } from '../../../../domain/value-objects/ProductId';
import { SKU } from '../../../../domain/value-objects/SKU';
import { Money } from '../../../../domain/value-objects/Money';
import { ProductCategory } from '../../../../domain/value-objects/ProductCategory';

function buildItem(overrides: Partial<{
  id: string;
  sku: string;
  name: string;
  brand: string;
  priceCents: number;
  stockQuantity: number;
  category: 'ELECTRONICS' | 'FURNITURE' | 'OFFICE_SUPPLIES';
}> = {}): InventoryItem {
  return InventoryItem.create({
    id: new ProductId(overrides.id ?? '11111111-1111-4111-8111-111111111111'),
    sku: new SKU(overrides.sku ?? 'ELEC-LAP-001'),
    name: overrides.name ?? 'Laptop Pro 15"',
    brand: overrides.brand ?? 'Acme',
    price: new Money(overrides.priceCents ?? 149999, 'USD'),
    stockQuantity: overrides.stockQuantity ?? 25,
    category: new ProductCategory(overrides.category ?? 'ELECTRONICS'),
  });
}

describe('ListInventoryUseCase', () => {
  let repository: jest.Mocked<IInventoryItemRepository>;
  let useCase: ListInventoryUseCase;

  beforeEach(() => {
    repository = {
      findAll: jest.fn(),
    };
    useCase = new ListInventoryUseCase(repository);
  });

  it('returns all items mapped to DTOs with total count', async () => {
    repository.findAll.mockResolvedValue([
      buildItem({ id: '11111111-1111-4111-8111-111111111111', stockQuantity: 10 }),
      buildItem({
        id: '22222222-2222-4222-8222-222222222222',
        sku: 'ELEC-MOU-001',
        name: 'Mouse',
        stockQuantity: 30,
      }),
    ]);

    const result = await useCase.execute();

    expect(result.total).toBe(2);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].brand).toBe('Acme');
    expect(result.data[0].price.formatted).toBe('USD 1499.99');
    expect(result.criticalStockThreshold).toBe(CRITICAL_STOCK_THRESHOLD);
  });

  it('counts items below the critical stock threshold (< 5)', async () => {
    repository.findAll.mockResolvedValue([
      buildItem({ id: '11111111-1111-4111-8111-111111111111', stockQuantity: 0 }),
      buildItem({ id: '22222222-2222-4222-8222-222222222222', sku: 'SKU-002', stockQuantity: 4 }),
      buildItem({ id: '33333333-3333-4333-8333-333333333333', sku: 'SKU-003', stockQuantity: 5 }),
      buildItem({ id: '44444444-4444-4444-8444-444444444444', sku: 'SKU-004', stockQuantity: 100 }),
    ]);

    const result = await useCase.execute();

    expect(result.total).toBe(4);
    // stock 0 and 4 are < 5 → 2 critical; 5 and 100 are not.
    expect(result.criticalStockCount).toBe(2);
  });

  it('forwards name, sku, and category filters to the repository', async () => {
    repository.findAll.mockResolvedValue([]);

    await useCase.execute({ name: 'laptop', sku: 'ELEC', category: 'ELECTRONICS' });

    expect(repository.findAll).toHaveBeenCalledWith({
      name: 'laptop',
      sku: 'ELEC',
      category: 'ELECTRONICS',
    });
  });

  it('handles an empty inventory gracefully', async () => {
    repository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual({
      data: [],
      total: 0,
      criticalStockCount: 0,
      criticalStockThreshold: CRITICAL_STOCK_THRESHOLD,
    });
  });
});
