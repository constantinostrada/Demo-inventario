/**
 * DuplicateSKUException
 *
 * Thrown when attempting to create a product with an SKU that already exists.
 *
 * Layer: Domain → Exceptions
 */

import { DomainException } from './DomainException';

export class DuplicateSKUException extends DomainException {
  constructor(sku: string) {
    super(`A product with SKU "${sku}" already exists.`);
    this.name = 'DuplicateSKUException';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
