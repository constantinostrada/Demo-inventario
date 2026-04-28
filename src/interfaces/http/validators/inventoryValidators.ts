/**
 * Inventory Request Validators
 *
 * Schema-level validation using express-validator for inventory endpoints.
 *
 * Layer: Interfaces → Validators
 */

import { query } from 'express-validator';
import { PRODUCT_CATEGORIES } from '../../../domain/value-objects/ProductCategory';

export const listInventoryValidators = [
  query('name')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('name must be a string up to 100 characters'),

  query('sku')
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage('sku must be a string up to 50 characters'),

  query('category')
    .optional()
    .isIn(PRODUCT_CATEGORIES)
    .withMessage(`category must be one of: ${PRODUCT_CATEGORIES.join(', ')}`),
];
