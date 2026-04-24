/**
 * StockDomainService Tests
 *
 * Layer: Domain → Tests
 */

import { StockDomainService } from '../StockDomainService';
import { Product } from '../../entities/Product';
import { ProductId } from '../../value-objects/ProductId';
import { SKU } from '../../value-objects/SKU';
import { Money } from '../../value-objects/Money';
import { ProductCategory } from '../../value-objects/ProductCategory';
import { DomainException } from '../../exceptions/DomainException';

const makeProduct = (stock = 10) =>
  Product.create({
    id: new ProductId('00000000-0000-4000-8000-000000000001'),
    name: 'Test',
    description: '',
    sku: new SKU('TEST-001'),
    price: Money.fromDecimal(10, 'USD'),
    category: new ProductCategory('ELECTRONICS'),
    stockQuantity: stock,
    minimumStockLevel: 2,
  });

describe('StockDomainService', () => {
  const service = new StockDomainService();
  const movId = '00000000-0000-4000-8000-000000000002';

  it('applies IN movement correctly', () => {
    const product = makeProduct(10);
    const { updatedProduct, movement } = service.applyMovement(
      product, 'IN', 5, 'Restock', 'admin', movId,
    );
    expect(updatedProduct.stockQuantity).toBe(15);
    expect(movement.type).toBe('IN');
    expect(movement.previousStock).toBe(10);
    expect(movement.newStock).toBe(15);
  });

  it('applies OUT movement correctly', () => {
    const product = makeProduct(10);
    const { updatedProduct, movement } = service.applyMovement(
      product, 'OUT', 3, 'Sale', 'admin', movId,
    );
    expect(updatedProduct.stockQuantity).toBe(7);
    expect(movement.type).toBe('OUT');
  });

  it('applies ADJUSTMENT movement to absolute value', () => {
    const product = makeProduct(10);
    const { updatedProduct } = service.applyMovement(
      product, 'ADJUSTMENT', 20, 'Inventory count', 'admin', movId,
    );
    expect(updatedProduct.stockQuantity).toBe(20);
  });

  it('throws when adjusting stock of inactive product', () => {
    const product = makeProduct(10);
    product.deactivate();
    expect(() =>
      service.applyMovement(product, 'IN', 5, 'Restock', 'admin', movId),
    ).toThrow(DomainException);
  });

  it('throws when OUT exceeds available stock', () => {
    const product = makeProduct(5);
    expect(() =>
      service.applyMovement(product, 'OUT', 10, 'Sale', 'admin', movId),
    ).toThrow(DomainException);
  });
});
