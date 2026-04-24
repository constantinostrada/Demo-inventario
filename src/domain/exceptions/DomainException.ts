/**
 * DomainException
 *
 * Base class for all domain-layer exceptions.
 * Signals a violation of a business rule or invariant.
 *
 * Layer: Domain → Exceptions
 */

export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
    // Maintain proper prototype chain in transpiled ES5
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
