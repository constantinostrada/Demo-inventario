/**
 * Stock Entity
 *
 * Represents the quantity of a specific product available at a specific
 * branch. Identity is the (productId, branchId) pair.
 *
 * Layer: Domain → Entities
 */

import { ProductId } from '../value-objects/ProductId';
import { BranchId } from '../value-objects/BranchId';
import { DomainException } from '../exceptions/DomainException';

export interface StockProps {
  productId: ProductId;
  branchId: BranchId;
  quantity: number;
  updatedAt: Date;
}

export class Stock {
  private readonly props: StockProps;

  private constructor(props: StockProps) {
    this.props = { ...props };
  }

  static create(productId: ProductId, branchId: BranchId, quantity = 0): Stock {
    Stock.validateQuantity(quantity);
    return new Stock({
      productId,
      branchId,
      quantity,
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: StockProps): Stock {
    return new Stock(props);
  }

  get productId(): ProductId {
    return this.props.productId;
  }

  get branchId(): BranchId {
    return this.props.branchId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  increase(amount: number): void {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new DomainException('Increase amount must be a positive integer.');
    }
    this.props.quantity += amount;
    this.props.updatedAt = new Date();
  }

  decrease(amount: number): void {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new DomainException('Decrease amount must be a positive integer.');
    }
    if (amount > this.props.quantity) {
      throw new DomainException(
        `Cannot decrease ${amount} units. Only ${this.props.quantity} available at this branch.`,
      );
    }
    this.props.quantity -= amount;
    this.props.updatedAt = new Date();
  }

  private static validateQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new DomainException('Stock quantity must be a non-negative integer.');
    }
  }
}
