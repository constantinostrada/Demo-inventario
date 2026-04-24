/**
 * SKU (Stock Keeping Unit) Value Object
 *
 * Unique human-readable product identifier used in inventory operations.
 * Format: uppercase alphanumeric + hyphens, 3–50 chars (e.g. "ELEC-001-BLK").
 *
 * Layer: Domain → Value Objects
 */

import { DomainException } from '../exceptions/DomainException';

const SKU_REGEX = /^[A-Z0-9][A-Z0-9-]{1,48}[A-Z0-9]$/;

export class SKU {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new DomainException('SKU cannot be empty.');
    }
    const normalized = value.trim().toUpperCase();
    if (!SKU_REGEX.test(normalized)) {
      throw new DomainException(
        `SKU "${value}" is invalid. Must be 3–50 uppercase alphanumeric characters (hyphens allowed, not at start or end).`,
      );
    }
    this._value = normalized;
  }

  get value(): string {
    return this._value;
  }

  equals(other: SKU): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
