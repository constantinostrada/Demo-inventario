/**
 * StockMovement Entity
 *
 * Records every change to a product's stock level (audit trail).
 * Immutable after creation — movements are never modified.
 *
 * Layer: Domain → Entities
 */

import { ProductId } from '../value-objects/ProductId';
import { DomainException } from '../exceptions/DomainException';

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface StockMovementProps {
  id: string;
  productId: ProductId;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  performedBy: string;
  createdAt: Date;
}

export class StockMovement {
  private readonly props: StockMovementProps;

  private constructor(props: StockMovementProps) {
    this.props = Object.freeze({ ...props });
  }

  static create(props: StockMovementProps): StockMovement {
    if (!props.id || props.id.trim().length === 0) {
      throw new DomainException('StockMovement id cannot be empty.');
    }
    if (props.quantity <= 0) {
      throw new DomainException('Movement quantity must be a positive number.');
    }
    if (!props.reason || props.reason.trim().length === 0) {
      throw new DomainException('Movement reason cannot be empty.');
    }
    if (!props.performedBy || props.performedBy.trim().length === 0) {
      throw new DomainException('performedBy cannot be empty.');
    }
    return new StockMovement(props);
  }

  get id(): string {
    return this.props.id;
  }

  get productId(): ProductId {
    return this.props.productId;
  }

  get type(): MovementType {
    return this.props.type;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get previousStock(): number {
    return this.props.previousStock;
  }

  get newStock(): number {
    return this.props.newStock;
  }

  get reason(): string {
    return this.props.reason;
  }

  get performedBy(): string {
    return this.props.performedBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
