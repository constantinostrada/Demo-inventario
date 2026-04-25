/**
 * Stock Entity Tests
 *
 * Verifies the (productId, branchId) identity and per-branch quantity rules.
 *
 * Layer: Domain → Tests
 */

import { Stock } from '../Stock';
import { ProductId } from '../../value-objects/ProductId';
import { BranchId } from '../../value-objects/BranchId';
import { DomainException } from '../../exceptions/DomainException';

const productId = new ProductId('11111111-1111-4111-8111-111111111111');
const centroBranch = new BranchId('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
const norteBranch = new BranchId('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

describe('Stock entity', () => {
  describe('create()', () => {
    it('defaults a new stock row to quantity 0', () => {
      const stock = Stock.create(productId, centroBranch);
      expect(stock.quantity).toBe(0);
    });

    it('accepts an explicit non-negative starting quantity', () => {
      const stock = Stock.create(productId, centroBranch, 25);
      expect(stock.quantity).toBe(25);
    });

    it('rejects a negative starting quantity', () => {
      expect(() => Stock.create(productId, centroBranch, -1)).toThrow(DomainException);
    });

    it('keeps quantities at different branches independent', () => {
      const stockCentro = Stock.create(productId, centroBranch, 10);
      const stockNorte = Stock.create(productId, norteBranch, 3);

      expect(stockCentro.branchId.equals(stockNorte.branchId)).toBe(false);
      expect(stockCentro.productId.equals(stockNorte.productId)).toBe(true);
      expect(stockCentro.quantity).toBe(10);
      expect(stockNorte.quantity).toBe(3);
    });
  });

  describe('increase()', () => {
    it('adds units to the per-branch stock', () => {
      const stock = Stock.create(productId, centroBranch, 5);
      stock.increase(3);
      expect(stock.quantity).toBe(8);
    });

    it('rejects non-positive amounts', () => {
      const stock = Stock.create(productId, centroBranch, 5);
      expect(() => stock.increase(0)).toThrow(DomainException);
      expect(() => stock.increase(-1)).toThrow(DomainException);
    });
  });

  describe('decrease()', () => {
    it('removes units from the per-branch stock', () => {
      const stock = Stock.create(productId, centroBranch, 5);
      stock.decrease(2);
      expect(stock.quantity).toBe(3);
    });

    it('refuses to go below zero', () => {
      const stock = Stock.create(productId, centroBranch, 5);
      expect(() => stock.decrease(6)).toThrow(DomainException);
    });

    it('rejects non-positive amounts', () => {
      const stock = Stock.create(productId, centroBranch, 5);
      expect(() => stock.decrease(0)).toThrow(DomainException);
    });
  });
});
