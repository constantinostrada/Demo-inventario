/**
 * ProductCategory Value Object
 *
 * Classifies products into predefined inventory categories.
 *
 * Layer: Domain → Value Objects
 */

import { DomainException } from '../exceptions/DomainException';

export const PRODUCT_CATEGORIES = [
  'ELECTRONICS',
  'CLOTHING',
  'FOOD_AND_BEVERAGE',
  'FURNITURE',
  'TOOLS',
  'OFFICE_SUPPLIES',
  'HEALTH_AND_BEAUTY',
  'TOYS',
  'AUTOMOTIVE',
  'OTHER',
] as const;

export type ProductCategoryValue = (typeof PRODUCT_CATEGORIES)[number];

export class ProductCategory {
  private readonly _value: ProductCategoryValue;

  constructor(value: string) {
    if (!PRODUCT_CATEGORIES.includes(value as ProductCategoryValue)) {
      throw new DomainException(
        `"${value}" is not a valid product category. Allowed: ${PRODUCT_CATEGORIES.join(', ')}.`,
      );
    }
    this._value = value as ProductCategoryValue;
  }

  get value(): ProductCategoryValue {
    return this._value;
  }

  equals(other: ProductCategory): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
