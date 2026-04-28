/**
 * InMemoryInventoryItemRepository Tests
 *
 * Layer: Infrastructure → Tests
 */

import { InMemoryInventoryItemRepository } from '../InMemoryInventoryItemRepository';

describe('InMemoryInventoryItemRepository', () => {
  let repo: InMemoryInventoryItemRepository;

  beforeEach(() => {
    repo = new InMemoryInventoryItemRepository();
  });

  it('returns all seeded items when no filters are provided', async () => {
    const items = await repo.findAll();
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.brand.length).toBeGreaterThan(0);
      expect(item.stockQuantity).toBeGreaterThanOrEqual(0);
    }
  });

  it('filters by name using a case-insensitive substring match', async () => {
    const items = await repo.findAll({ name: 'laptop' });
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.name.toLowerCase()).toContain('laptop');
    }
  });

  it('filters by sku using a case-insensitive substring match', async () => {
    const items = await repo.findAll({ sku: 'elec' });
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.sku.value).toContain('ELEC');
    }
  });

  it('filters by category (exact match)', async () => {
    const items = await repo.findAll({ category: 'FURNITURE' });
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.category.value).toBe('FURNITURE');
    }
  });

  it('combines filters with AND semantics', async () => {
    const items = await repo.findAll({ name: 'mouse', category: 'ELECTRONICS' });
    for (const item of items) {
      expect(item.name.toLowerCase()).toContain('mouse');
      expect(item.category.value).toBe('ELECTRONICS');
    }
  });

  it('returns an empty array when no items match', async () => {
    const items = await repo.findAll({ name: 'nonexistent-xyz-9999' });
    expect(items).toEqual([]);
  });
});
