/**
 * ProductId Value Object
 *
 * Strongly-typed identity for Product entities.
 * Equality is by value (UUID string), not by reference.
 *
 * Layer: Domain → Value Objects
 */

import { DomainException } from '../exceptions/DomainException';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ProductId {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new DomainException('ProductId cannot be empty.');
    }
    if (!UUID_REGEX.test(value)) {
      throw new DomainException(`ProductId must be a valid UUID. Received: "${value}"`);
    }
    this._value = value.toLowerCase();
  }

  get value(): string {
    return this._value;
  }

  equals(other: ProductId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
