/**
 * Money Value Object Tests
 *
 * Layer: Domain → Tests
 */

import { Money } from '../Money';
import { DomainException } from '../../exceptions/DomainException';

describe('Money value object', () => {
  describe('constructor', () => {
    it('creates a valid money instance', () => {
      const m = new Money(1099, 'USD');
      expect(m.amountInCents).toBe(1099);
      expect(m.currency).toBe('USD');
    });

    it('throws for negative amounts', () => {
      expect(() => new Money(-1, 'USD')).toThrow(DomainException);
    });

    it('throws for non-integer amounts', () => {
      expect(() => new Money(10.5, 'USD')).toThrow(DomainException);
    });

    it('throws for unsupported currencies', () => {
      expect(() => new Money(100, 'XYZ' as 'USD')).toThrow(DomainException);
    });
  });

  describe('fromDecimal()', () => {
    it('converts 10.99 to 1099 cents', () => {
      const m = Money.fromDecimal(10.99, 'USD');
      expect(m.amountInCents).toBe(1099);
    });

    it('rounds floating-point correctly', () => {
      const m = Money.fromDecimal(0.1 + 0.2, 'USD'); // 0.30000...
      expect(m.amountInCents).toBe(30);
    });
  });

  describe('toDecimal()', () => {
    it('converts 1099 cents to 10.99', () => {
      expect(new Money(1099, 'USD').toDecimal()).toBe(10.99);
    });
  });

  describe('equals()', () => {
    it('returns true for equal money', () => {
      expect(new Money(500, 'USD').equals(new Money(500, 'USD'))).toBe(true);
    });

    it('returns false for different amount', () => {
      expect(new Money(500, 'USD').equals(new Money(600, 'USD'))).toBe(false);
    });

    it('returns false for different currency', () => {
      expect(new Money(500, 'USD').equals(new Money(500, 'EUR'))).toBe(false);
    });
  });

  describe('add()', () => {
    it('adds two money values', () => {
      const result = new Money(500, 'USD').add(new Money(300, 'USD'));
      expect(result.amountInCents).toBe(800);
    });

    it('throws when currencies differ', () => {
      expect(() => new Money(500, 'USD').add(new Money(300, 'EUR'))).toThrow(DomainException);
    });
  });

  describe('subtract()', () => {
    it('subtracts correctly', () => {
      const result = new Money(800, 'USD').subtract(new Money(300, 'USD'));
      expect(result.amountInCents).toBe(500);
    });

    it('throws when result would be negative', () => {
      expect(() => new Money(200, 'USD').subtract(new Money(300, 'USD'))).toThrow(DomainException);
    });
  });

  describe('multiply()', () => {
    it('multiplies correctly', () => {
      const result = new Money(100, 'USD').multiply(3);
      expect(result.amountInCents).toBe(300);
    });

    it('throws for negative factor', () => {
      expect(() => new Money(100, 'USD').multiply(-1)).toThrow(DomainException);
    });
  });
});
