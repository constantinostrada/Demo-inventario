/**
 * Money Value Object
 *
 * Represents a monetary amount with a currency code.
 * Uses integer cents internally to avoid floating-point precision issues.
 *
 * Layer: Domain → Value Objects
 */

import { DomainException } from '../exceptions/DomainException';

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'MXN', 'GBP', 'CAD'] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export class Money {
  /** Amount stored in the smallest currency unit (e.g. cents for USD). */
  private readonly _amountInCents: number;
  private readonly _currency: CurrencyCode;

  constructor(amountInCents: number, currency: CurrencyCode) {
    if (!Number.isInteger(amountInCents)) {
      throw new DomainException('Money amount must be an integer (cents).');
    }
    if (amountInCents < 0) {
      throw new DomainException('Money amount cannot be negative.');
    }
    if (!SUPPORTED_CURRENCIES.includes(currency)) {
      throw new DomainException(
        `Currency "${currency}" is not supported. Supported: ${SUPPORTED_CURRENCIES.join(', ')}.`,
      );
    }
    this._amountInCents = amountInCents;
    this._currency = currency;
  }

  /** Convenience factory — converts a decimal amount to cents automatically. */
  static fromDecimal(amount: number, currency: CurrencyCode): Money {
    if (amount < 0) {
      throw new DomainException('Money amount cannot be negative.');
    }
    return new Money(Math.round(amount * 100), currency);
  }

  get amountInCents(): number {
    return this._amountInCents;
  }

  get currency(): CurrencyCode {
    return this._currency;
  }

  /** Returns the decimal representation (e.g. 1099 → 10.99). */
  toDecimal(): number {
    return this._amountInCents / 100;
  }

  equals(other: Money): boolean {
    return this._amountInCents === other._amountInCents && this._currency === other._currency;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this._amountInCents + other._amountInCents, this._currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this._amountInCents - other._amountInCents;
    if (result < 0) {
      throw new DomainException('Money subtraction would result in a negative amount.');
    }
    return new Money(result, this._currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new DomainException('Money multiplier cannot be negative.');
    }
    return new Money(Math.round(this._amountInCents * factor), this._currency);
  }

  toString(): string {
    return `${this._currency} ${this.toDecimal().toFixed(2)}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new DomainException(
        `Cannot operate on different currencies: ${this._currency} vs ${other._currency}.`,
      );
    }
  }
}
