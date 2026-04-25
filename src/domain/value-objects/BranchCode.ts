/**
 * BranchCode Value Object
 *
 * Identifies the three fixed branches of the system by stable code.
 * The set is closed: only CENTRO, NORTE and SUR are valid.
 *
 * Layer: Domain → Value Objects
 */

import { DomainException } from '../exceptions/DomainException';

export const BRANCH_CODES = ['CENTRO', 'NORTE', 'SUR'] as const;

export type BranchCodeValue = (typeof BRANCH_CODES)[number];

export class BranchCode {
  private readonly _value: BranchCodeValue;

  constructor(value: string) {
    const normalized = value?.trim().toUpperCase();
    if (!normalized || !BRANCH_CODES.includes(normalized as BranchCodeValue)) {
      throw new DomainException(
        `"${value}" is not a valid branch code. Allowed: ${BRANCH_CODES.join(', ')}.`,
      );
    }
    this._value = normalized as BranchCodeValue;
  }

  get value(): BranchCodeValue {
    return this._value;
  }

  equals(other: BranchCode): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
