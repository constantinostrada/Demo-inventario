/**
 * Branch Entity Tests
 *
 * Layer: Domain → Tests
 */

import { Branch } from '../Branch';
import { BranchId } from '../../value-objects/BranchId';
import { BranchCode } from '../../value-objects/BranchCode';
import { DomainException } from '../../exceptions/DomainException';

const makeBranch = (overrides: Partial<{ name: string; code: string }> = {}) =>
  Branch.create({
    id: new BranchId('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
    code: new BranchCode(overrides.code ?? 'CENTRO'),
    name: overrides.name ?? 'Centro',
    createdAt: new Date('2026-01-01T00:00:00Z'),
  });

describe('Branch entity', () => {
  it('creates a branch with a name, code and id', () => {
    const branch = makeBranch();
    expect(branch.name).toBe('Centro');
    expect(branch.code.value).toBe('CENTRO');
    expect(branch.id).toBeInstanceOf(BranchId);
  });

  it('rejects an empty name', () => {
    expect(() => makeBranch({ name: '' })).toThrow(DomainException);
    expect(() => makeBranch({ name: '   ' })).toThrow(DomainException);
  });

  it('rejects names longer than 100 characters', () => {
    expect(() => makeBranch({ name: 'x'.repeat(101) })).toThrow(DomainException);
  });

  it('only accepts the three fixed branch codes', () => {
    expect(() => makeBranch({ code: 'CENTRO' })).not.toThrow();
    expect(() => makeBranch({ code: 'NORTE' })).not.toThrow();
    expect(() => makeBranch({ code: 'SUR' })).not.toThrow();
    expect(() => makeBranch({ code: 'OESTE' })).toThrow(DomainException);
  });
});
