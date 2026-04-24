/**
 * SKU Value Object Tests
 */

import { SKU } from '../SKU';
import { DomainException } from '../../exceptions/DomainException';

describe('SKU value object', () => {
  it('accepts valid SKUs', () => {
    expect(new SKU('ELEC-001').value).toBe('ELEC-001');
    expect(new SKU('ABC').value).toBe('ABC');
    expect(new SKU('abc').value).toBe('ABC'); // normalises to uppercase
    expect(new SKU('A1B').value).toBe('A1B');
  });

  it('throws for empty SKU', () => {
    expect(() => new SKU('')).toThrow(DomainException);
  });

  it('throws for SKU starting with hyphen', () => {
    expect(() => new SKU('-ABC')).toThrow(DomainException);
  });

  it('throws for SKU ending with hyphen', () => {
    expect(() => new SKU('ABC-')).toThrow(DomainException);
  });

  it('throws for single-character SKU (less than 3 chars)', () => {
    expect(() => new SKU('A')).toThrow(DomainException);
  });

  it('equals() returns true for same SKU', () => {
    expect(new SKU('TEST-001').equals(new SKU('test-001'))).toBe(true);
  });

  it('equals() returns false for different SKU', () => {
    expect(new SKU('TEST-001').equals(new SKU('TEST-002'))).toBe(false);
  });
});
