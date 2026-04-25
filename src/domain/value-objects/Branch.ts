/**
 * Branch (Sucursal) Value Object
 *
 * Represents one of the 3 fixed retail branches where inventory is held.
 * The list of branches is part of the domain contract: every product
 * automatically gets a stock entry per branch upon creation.
 *
 * Layer: Domain → Value Objects
 */

import { DomainException } from '../exceptions/DomainException';

export const BRANCH_IDS = ['SUC-CENTRAL', 'SUC-NORTE', 'SUC-SUR'] as const;
export type BranchIdValue = (typeof BRANCH_IDS)[number];

export class Branch {
  private readonly _value: BranchIdValue;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new DomainException('Branch id cannot be empty.');
    }
    const normalized = value.trim().toUpperCase();
    if (!(BRANCH_IDS as readonly string[]).includes(normalized)) {
      throw new DomainException(
        `Branch "${value}" is not a recognized branch. Allowed: ${BRANCH_IDS.join(', ')}.`,
      );
    }
    this._value = normalized as BranchIdValue;
  }

  get value(): BranchIdValue {
    return this._value;
  }

  /** Returns one Branch instance per known branch — used to seed new products. */
  static all(): Branch[] {
    return BRANCH_IDS.map((id) => new Branch(id));
  }

  equals(other: Branch): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
