/**
 * BranchCode Value Object Tests
 *
 * Layer: Domain → Tests
 */

import { BranchCode, BRANCH_CODES } from '../BranchCode';
import { DomainException } from '../../exceptions/DomainException';

describe('BranchCode value object', () => {
  it('exposes exactly the three fixed branch codes', () => {
    expect(BRANCH_CODES).toEqual(['CENTRO', 'NORTE', 'SUR']);
  });

  it.each(['CENTRO', 'NORTE', 'SUR'])('accepts %s as a valid code', (code) => {
    expect(() => new BranchCode(code)).not.toThrow();
    expect(new BranchCode(code).value).toBe(code);
  });

  it('normalises lowercase input to uppercase', () => {
    expect(new BranchCode('centro').value).toBe('CENTRO');
    expect(new BranchCode(' norte ').value).toBe('NORTE');
  });

  it('rejects unknown codes', () => {
    expect(() => new BranchCode('ESTE')).toThrow(DomainException);
    expect(() => new BranchCode('OESTE')).toThrow(DomainException);
  });

  it('rejects empty input', () => {
    expect(() => new BranchCode('')).toThrow(DomainException);
  });

  it('compares equal codes by value', () => {
    expect(new BranchCode('CENTRO').equals(new BranchCode('centro'))).toBe(true);
    expect(new BranchCode('CENTRO').equals(new BranchCode('NORTE'))).toBe(false);
  });
});
