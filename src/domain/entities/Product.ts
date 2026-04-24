/**
 * Product Entity
 *
 * Represents a physical or digital product tracked by the inventory system.
 * Protects its own invariants — all validation lives here.
 *
 * Layer: Domain → Entities
 * Imports: domain only (ProductId, SKU, Money, ProductCategory)
 */

import { ProductId } from '../value-objects/ProductId';
import { SKU } from '../value-objects/SKU';
import { Money } from '../value-objects/Money';
import { ProductCategory } from '../value-objects/ProductCategory';
import { DomainException } from '../exceptions/DomainException';

export interface ProductProps {
  id: ProductId;
  name: string;
  description: string;
  sku: SKU;
  price: Money;
  category: ProductCategory;
  stockQuantity: number;
  minimumStockLevel: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductProps {
  id: ProductId;
  name: string;
  description: string;
  sku: SKU;
  price: Money;
  category: ProductCategory;
  stockQuantity: number;
  minimumStockLevel: number;
}

export class Product {
  private readonly props: ProductProps;

  private constructor(props: ProductProps) {
    this.props = props;
  }

  // ─── Factory ──────────────────────────────────────────────────────────────

  static create(createProps: CreateProductProps): Product {
    Product.validateName(createProps.name);
    Product.validateDescription(createProps.description);
    Product.validateStockQuantity(createProps.stockQuantity);
    Product.validateMinimumStockLevel(createProps.minimumStockLevel);

    const now = new Date();
    return new Product({
      ...createProps,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ProductProps): Product {
    return new Product(props);
  }

  // ─── Getters ──────────────────────────────────────────────────────────────

  get id(): ProductId {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get sku(): SKU {
    return this.props.sku;
  }

  get price(): Money {
    return this.props.price;
  }

  get category(): ProductCategory {
    return this.props.category;
  }

  get stockQuantity(): number {
    return this.props.stockQuantity;
  }

  get minimumStockLevel(): number {
    return this.props.minimumStockLevel;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // ─── Business Logic ───────────────────────────────────────────────────────

  /** Returns true when stock is at or below the minimum threshold. */
  isLowStock(): boolean {
    return this.props.stockQuantity <= this.props.minimumStockLevel;
  }

  /** Returns true when there is no stock available. */
  isOutOfStock(): boolean {
    return this.props.stockQuantity === 0;
  }

  /** Adds units to the current stock level. */
  addStock(quantity: number): void {
    if (quantity <= 0) {
      throw new DomainException('Quantity to add must be a positive number.');
    }
    this.props.stockQuantity += quantity;
    this.props.updatedAt = new Date();
  }

  /** Removes units from the current stock level. */
  removeStock(quantity: number): void {
    if (quantity <= 0) {
      throw new DomainException('Quantity to remove must be a positive number.');
    }
    if (quantity > this.props.stockQuantity) {
      throw new DomainException(
        `Cannot remove ${quantity} units. Only ${this.props.stockQuantity} units available.`,
      );
    }
    this.props.stockQuantity -= quantity;
    this.props.updatedAt = new Date();
  }

  /** Updates the product's mutable fields. */
  update(fields: {
    name?: string;
    description?: string;
    price?: Money;
    category?: ProductCategory;
    minimumStockLevel?: number;
  }): void {
    if (fields.name !== undefined) {
      Product.validateName(fields.name);
      this.props.name = fields.name;
    }
    if (fields.description !== undefined) {
      Product.validateDescription(fields.description);
      this.props.description = fields.description;
    }
    if (fields.price !== undefined) {
      this.props.price = fields.price;
    }
    if (fields.category !== undefined) {
      this.props.category = fields.category;
    }
    if (fields.minimumStockLevel !== undefined) {
      Product.validateMinimumStockLevel(fields.minimumStockLevel);
      this.props.minimumStockLevel = fields.minimumStockLevel;
    }
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    if (!this.props.isActive) {
      throw new DomainException('Product is already inactive.');
    }
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    if (this.props.isActive) {
      throw new DomainException('Product is already active.');
    }
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  // ─── Private Validators ───────────────────────────────────────────────────

  private static validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new DomainException('Product name cannot be empty.');
    }
    if (name.trim().length > 200) {
      throw new DomainException('Product name cannot exceed 200 characters.');
    }
  }

  private static validateDescription(description: string): void {
    if (description.length > 2000) {
      throw new DomainException('Product description cannot exceed 2000 characters.');
    }
  }

  private static validateStockQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new DomainException('Stock quantity must be a non-negative integer.');
    }
  }

  private static validateMinimumStockLevel(level: number): void {
    if (!Number.isInteger(level) || level < 0) {
      throw new DomainException('Minimum stock level must be a non-negative integer.');
    }
  }
}
