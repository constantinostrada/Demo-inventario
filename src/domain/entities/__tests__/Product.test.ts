/**
 * Product Entity Tests
 *
 * Layer: Domain → Tests
 */

import { Product } from '../Product';
import { ProductId } from '../../value-objects/ProductId';
import { SKU } from '../../value-objects/SKU';
import { Money } from '../../value-objects/Money';
import { ProductCategory } from '../../value-objects/ProductCategory';
import { DomainException } from '../../exceptions/DomainException';

const makeProduct = (overrides: Partial<Parameters<typeof Product.create>[0]> = {}) =>
  Product.create({
    id: new ProductId('00000000-0000-4000-8000-000000000001'),
    name: 'Test Product',
    description: 'A test product',
    sku: new SKU('TEST-001'),
    price: Money.fromDecimal(29.99, 'USD'),
    category: new ProductCategory('ELECTRONICS'),
    stockQuantity: 10,
    minimumStockLevel: 3,
    ...overrides,
  });

describe('Product entity', () => {
  describe('create()', () => {
    it('creates a product with correct defaults', () => {
      const p = makeProduct();
      expect(p.name).toBe('Test Product');
      expect(p.isActive).toBe(true);
      expect(p.stockQuantity).toBe(10);
    });

    it('throws when name is empty', () => {
      expect(() => makeProduct({ name: '' })).toThrow(DomainException);
    });

    it('throws when name exceeds 200 characters', () => {
      expect(() => makeProduct({ name: 'x'.repeat(201) })).toThrow(DomainException);
    });

    it('throws when stockQuantity is negative', () => {
      expect(() => makeProduct({ stockQuantity: -1 })).toThrow(DomainException);
    });

    it('throws when stockQuantity is not an integer', () => {
      expect(() => makeProduct({ stockQuantity: 1.5 })).toThrow(DomainException);
    });
  });

  describe('isLowStock()', () => {
    it('returns true when stock equals minimum', () => {
      const p = makeProduct({ stockQuantity: 3, minimumStockLevel: 3 });
      expect(p.isLowStock()).toBe(true);
    });

    it('returns true when stock is below minimum', () => {
      const p = makeProduct({ stockQuantity: 2, minimumStockLevel: 3 });
      expect(p.isLowStock()).toBe(true);
    });

    it('returns false when stock is above minimum', () => {
      const p = makeProduct({ stockQuantity: 10, minimumStockLevel: 3 });
      expect(p.isLowStock()).toBe(false);
    });
  });

  describe('isOutOfStock()', () => {
    it('returns true when stock is 0', () => {
      const p = makeProduct({ stockQuantity: 0 });
      expect(p.isOutOfStock()).toBe(true);
    });

    it('returns false when stock > 0', () => {
      const p = makeProduct({ stockQuantity: 1 });
      expect(p.isOutOfStock()).toBe(false);
    });
  });

  describe('addStock()', () => {
    it('adds units correctly', () => {
      const p = makeProduct({ stockQuantity: 10 });
      p.addStock(5);
      expect(p.stockQuantity).toBe(15);
    });

    it('throws when quantity is zero or negative', () => {
      const p = makeProduct();
      expect(() => p.addStock(0)).toThrow(DomainException);
      expect(() => p.addStock(-1)).toThrow(DomainException);
    });
  });

  describe('removeStock()', () => {
    it('removes units correctly', () => {
      const p = makeProduct({ stockQuantity: 10 });
      p.removeStock(4);
      expect(p.stockQuantity).toBe(6);
    });

    it('throws when removing more than available', () => {
      const p = makeProduct({ stockQuantity: 5 });
      expect(() => p.removeStock(6)).toThrow(DomainException);
    });

    it('throws when quantity is zero or negative', () => {
      const p = makeProduct();
      expect(() => p.removeStock(0)).toThrow(DomainException);
    });
  });

  describe('deactivate() / activate()', () => {
    it('deactivates an active product', () => {
      const p = makeProduct();
      p.deactivate();
      expect(p.isActive).toBe(false);
    });

    it('throws when deactivating an already inactive product', () => {
      const p = makeProduct();
      p.deactivate();
      expect(() => p.deactivate()).toThrow(DomainException);
    });

    it('activates an inactive product', () => {
      const p = makeProduct();
      p.deactivate();
      p.activate();
      expect(p.isActive).toBe(true);
    });
  });
});
