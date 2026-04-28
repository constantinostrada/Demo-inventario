/**
 * InventoryItem Entity
 *
 * Lightweight read-model for inventory listings. Represents a product row
 * as exposed to inventory consumers — includes the commercial brand and
 * the currently-available stock quantity.
 *
 * This entity is intentionally thin: it powers listing/reporting use cases
 * and is decoupled from the richer Product aggregate used for CRUD.
 *
 * Layer: Domain → Entities
 * Imports: domain only (ProductId, SKU, Money, ProductCategory)
 */

import { ProductId } from '../value-objects/ProductId';
import { SKU } from '../value-objects/SKU';
import { Money } from '../value-objects/Money';
import { ProductCategory } from '../value-objects/ProductCategory';
import { DomainException } from '../exceptions/DomainException';

export interface InventoryItemProps {
  id: ProductId;
  sku: SKU;
  name: string;
  brand: string;
  price: Money;
  stockQuantity: number;
  category: ProductCategory;
}

export class InventoryItem {
  private readonly props: InventoryItemProps;

  private constructor(props: InventoryItemProps) {
    this.props = props;
  }

  // ─── Factory ──────────────────────────────────────────────────────────────

  static create(props: InventoryItemProps): InventoryItem {
    InventoryItem.validateName(props.name);
    InventoryItem.validateBrand(props.brand);
    InventoryItem.validateStockQuantity(props.stockQuantity);
    return new InventoryItem(props);
  }

  // ─── Getters ──────────────────────────────────────────────────────────────

  get id(): ProductId {
    return this.props.id;
  }

  get sku(): SKU {
    return this.props.sku;
  }

  get name(): string {
    return this.props.name;
  }

  get brand(): string {
    return this.props.brand;
  }

  get price(): Money {
    return this.props.price;
  }

  get stockQuantity(): number {
    return this.props.stockQuantity;
  }

  get category(): ProductCategory {
    return this.props.category;
  }

  // ─── Business Logic ───────────────────────────────────────────────────────

  /** Returns true when available stock is below the given critical threshold. */
  isCriticalStock(threshold: number): boolean {
    if (!Number.isInteger(threshold) || threshold < 0) {
      throw new DomainException('Critical stock threshold must be a non-negative integer.');
    }
    return this.props.stockQuantity < threshold;
  }

  // ─── Private Validators ───────────────────────────────────────────────────

  private static validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new DomainException('Inventory item name cannot be empty.');
    }
    if (name.trim().length > 200) {
      throw new DomainException('Inventory item name cannot exceed 200 characters.');
    }
  }

  private static validateBrand(brand: string): void {
    if (!brand || brand.trim().length === 0) {
      throw new DomainException('Inventory item brand cannot be empty.');
    }
    if (brand.trim().length > 100) {
      throw new DomainException('Inventory item brand cannot exceed 100 characters.');
    }
  }

  private static validateStockQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new DomainException('Stock quantity must be a non-negative integer.');
    }
  }
}
