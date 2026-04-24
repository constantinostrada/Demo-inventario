/**
 * ProductNotFoundException
 *
 * Thrown when a requested product does not exist in the repository.
 *
 * Layer: Domain → Exceptions
 */

import { DomainException } from './DomainException';

export class ProductNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`Product not found: "${identifier}".`);
    this.name = 'ProductNotFoundException';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
