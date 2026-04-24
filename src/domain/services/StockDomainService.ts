/**
 * StockDomainService — Domain Service
 *
 * Encapsulates business logic that spans multiple entities or
 * that doesn't naturally belong to a single entity.
 *
 * Specifically handles the logic of applying a stock adjustment
 * and constructing the corresponding StockMovement record.
 *
 * Layer: Domain → Services
 * Imports: domain only
 */

import { Product } from '../entities/Product';
import { StockMovement, MovementType } from '../entities/StockMovement';
import { ProductId } from '../value-objects/ProductId';
import { DomainException } from '../exceptions/DomainException';

export interface StockAdjustmentResult {
  updatedProduct: Product;
  movement: StockMovement;
}

export class StockDomainService {
  /**
   * Applies a stock movement to a product and produces a StockMovement record.
   * Throws if the operation would violate domain invariants.
   */
  applyMovement(
    product: Product,
    type: MovementType,
    quantity: number,
    reason: string,
    performedBy: string,
    movementId: string,
  ): StockAdjustmentResult {
    if (!product.isActive) {
      throw new DomainException(
        `Cannot adjust stock for inactive product "${product.name}" (${product.sku.value}).`,
      );
    }

    const previousStock = product.stockQuantity;

    if (type === 'IN') {
      product.addStock(quantity);
    } else if (type === 'OUT') {
      product.removeStock(quantity);
    } else if (type === 'ADJUSTMENT') {
      this.applyAbsoluteAdjustment(product, quantity);
    } else {
      throw new DomainException(`Unknown movement type: "${String(type)}".`);
    }

    const movement = StockMovement.create({
      id: movementId,
      productId: new ProductId(product.id.value),
      type,
      quantity,
      previousStock,
      newStock: product.stockQuantity,
      reason,
      performedBy,
      createdAt: new Date(),
    });

    return { updatedProduct: product, movement };
  }

  /** Sets stock to an absolute value, computing the delta quantity automatically. */
  private applyAbsoluteAdjustment(product: Product, targetQuantity: number): void {
    if (!Number.isInteger(targetQuantity) || targetQuantity < 0) {
      throw new DomainException('Target quantity for adjustment must be a non-negative integer.');
    }

    const current = product.stockQuantity;
    const delta = targetQuantity - current;

    if (delta > 0) {
      product.addStock(delta);
    } else if (delta < 0) {
      product.removeStock(Math.abs(delta));
    }
    // delta === 0 → no-op, which is valid (idempotent adjustment)
  }
}
