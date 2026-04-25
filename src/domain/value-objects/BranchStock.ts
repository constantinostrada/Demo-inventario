/**
 * BranchStock Value Object
 *
 * Pairs a Branch with its current stock quantity for a single product.
 * Immutable — operations that change the quantity return a new instance.
 *
 * Layer: Domain → Value Objects
 */

import { DomainException } from '../exceptions/DomainException';
import { Branch } from './Branch';

export class BranchStock {
  private readonly _branch: Branch;
  private readonly _quantity: number;

  constructor(branch: Branch, quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new DomainException('Branch stock quantity must be a non-negative integer.');
    }
    this._branch = branch;
    this._quantity = quantity;
  }

  get branch(): Branch {
    return this._branch;
  }

  get quantity(): number {
    return this._quantity;
  }

  withQuantity(newQuantity: number): BranchStock {
    return new BranchStock(this._branch, newQuantity);
  }

  equals(other: BranchStock): boolean {
    return this._branch.equals(other._branch) && this._quantity === other._quantity;
  }
}
