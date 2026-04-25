/**
 * StockMovement Entity Tests
 *
 * Validates the audit-trail invariants and branch references for every
 * movement type (IN, OUT, TRANSFER, ADJUSTMENT).
 *
 * Layer: Domain → Tests
 */

import { StockMovement, MovementType } from '../StockMovement';
import { ProductId } from '../../value-objects/ProductId';
import { BranchId } from '../../value-objects/BranchId';
import { DomainException } from '../../exceptions/DomainException';

const movementId = '99999999-9999-4999-8999-999999999999';
const productId = new ProductId('11111111-1111-4111-8111-111111111111');
const centroBranch = new BranchId('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
const norteBranch = new BranchId('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

const baseProps = {
  id: movementId,
  productId,
  quantity: 5,
  previousStock: 10,
  newStock: 15,
  reason: 'Test',
  performedBy: 'tester',
  createdAt: new Date('2026-04-24T10:00:00Z'),
};

describe('StockMovement entity', () => {
  it('records type, quantity, date and product on every movement', () => {
    const movement = StockMovement.create({
      ...baseProps,
      type: 'IN',
      destinationBranchId: centroBranch,
    });

    expect(movement.type).toBe<MovementType>('IN');
    expect(movement.quantity).toBe(5);
    expect(movement.createdAt.toISOString()).toBe('2026-04-24T10:00:00.000Z');
    expect(movement.productId.equals(productId)).toBe(true);
  });

  describe('IN movements', () => {
    it('captures the destination branch (where stock arrived)', () => {
      const movement = StockMovement.create({
        ...baseProps,
        type: 'IN',
        destinationBranchId: centroBranch,
      });
      expect(movement.destinationBranchId?.equals(centroBranch)).toBe(true);
      expect(movement.sourceBranchId).toBeUndefined();
    });
  });

  describe('OUT movements', () => {
    it('captures the source branch (where stock left from)', () => {
      const movement = StockMovement.create({
        ...baseProps,
        type: 'OUT',
        previousStock: 10,
        newStock: 5,
        sourceBranchId: centroBranch,
      });
      expect(movement.sourceBranchId?.equals(centroBranch)).toBe(true);
      expect(movement.destinationBranchId).toBeUndefined();
    });
  });

  describe('TRANSFER movements', () => {
    it('captures both source and destination branches', () => {
      const movement = StockMovement.create({
        ...baseProps,
        type: 'TRANSFER',
        sourceBranchId: centroBranch,
        destinationBranchId: norteBranch,
      });
      expect(movement.sourceBranchId?.equals(centroBranch)).toBe(true);
      expect(movement.destinationBranchId?.equals(norteBranch)).toBe(true);
    });

    it('rejects a TRANSFER missing the destination branch', () => {
      expect(() =>
        StockMovement.create({
          ...baseProps,
          type: 'TRANSFER',
          sourceBranchId: centroBranch,
        }),
      ).toThrow(DomainException);
    });

    it('rejects a TRANSFER missing the source branch', () => {
      expect(() =>
        StockMovement.create({
          ...baseProps,
          type: 'TRANSFER',
          destinationBranchId: norteBranch,
        }),
      ).toThrow(DomainException);
    });

    it('rejects a TRANSFER where source and destination are the same branch', () => {
      expect(() =>
        StockMovement.create({
          ...baseProps,
          type: 'TRANSFER',
          sourceBranchId: centroBranch,
          destinationBranchId: centroBranch,
        }),
      ).toThrow(DomainException);
    });
  });

  describe('invariants', () => {
    it('rejects empty id', () => {
      expect(() =>
        StockMovement.create({
          ...baseProps,
          id: '',
          type: 'IN',
          destinationBranchId: centroBranch,
        }),
      ).toThrow(DomainException);
    });

    it('rejects non-positive quantity', () => {
      expect(() =>
        StockMovement.create({
          ...baseProps,
          quantity: 0,
          type: 'IN',
          destinationBranchId: centroBranch,
        }),
      ).toThrow(DomainException);
    });
  });
});
