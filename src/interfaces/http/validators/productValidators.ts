/**
 * Product Request Validators
 *
 * Schema-level validation using express-validator.
 * These chains validate shape and type — business rules stay in the domain.
 *
 * Layer: Interfaces → Validators
 *
 * Defensive stance: this endpoint is public and receives untrusted input.
 * Every field is strictly type-checked, bounded in size, and rejected with
 * a precise 400 message when malformed. Uniqueness (409) and semantic
 * invariants that require state live in the domain layer, not here.
 */

import { body, param, query } from 'express-validator';
import { PRODUCT_CATEGORIES } from '../../../domain/value-objects/ProductCategory';

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'MXN', 'GBP', 'CAD'];

// SKU format: uppercase letters, digits and hyphens only. No spaces,
// no lowercase, no other symbols. Enforced at the HTTP boundary so a
// malformed SKU is rejected with 400 before it reaches the domain.
const SKU_FORMAT = /^[A-Z0-9-]+$/;

export const createProductValidators = [
  // ─── name ─────────────────────────────────────────────────────────────
  body('name')
    .exists({ values: 'falsy' })
    .withMessage('name is required')
    .bail()
    .isString()
    .withMessage('name must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('name cannot be empty')
    .isLength({ max: 200 })
    .withMessage('name cannot exceed 200 characters'),

  // ─── brand (marca) ────────────────────────────────────────────────────
  // Optional metadata field accepted by the API. Kept as a free-form
  // string with bounded size to resist abuse via oversized payloads.
  body('brand')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('brand must be a string')
    .bail()
    .trim()
    .isLength({ max: 100 })
    .withMessage('brand cannot exceed 100 characters'),

  // ─── description ──────────────────────────────────────────────────────
  body('description')
    .optional()
    .isString()
    .withMessage('description must be a string')
    .bail()
    .isLength({ max: 2000 })
    .withMessage('description cannot exceed 2000 characters'),

  // ─── sku ──────────────────────────────────────────────────────────────
  body('sku')
    .exists({ values: 'falsy' })
    .withMessage('sku is required')
    .bail()
    .isString()
    .withMessage('sku must be a string')
    .bail()
    .isLength({ min: 1, max: 50 })
    .withMessage('sku must be between 1 and 50 characters')
    .bail()
    // No trim / toUpperCase: we reject lowercase and whitespace outright
    // rather than silently coercing — the caller must send a canonical SKU.
    .matches(SKU_FORMAT)
    .withMessage(
      'sku must contain only uppercase letters, digits and hyphens (no spaces or lowercase)',
    ),

  // ─── priceAmount (precio) ─────────────────────────────────────────────
  // Strictly positive. A product with price 0 makes no sense for the
  // inventory use case, and negative values are impossible by definition.
  body('priceAmount')
    .exists({ values: 'null' })
    .withMessage('priceAmount is required')
    .bail()
    .isFloat({ gt: 0 })
    .withMessage('priceAmount must be a number greater than 0'),

  body('priceCurrency')
    .optional()
    .isIn(SUPPORTED_CURRENCIES)
    .withMessage(`priceCurrency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}`),

  // ─── category ─────────────────────────────────────────────────────────
  body('category')
    .exists({ values: 'falsy' })
    .withMessage('category is required')
    .bail()
    .isIn(PRODUCT_CATEGORIES)
    .withMessage(`category must be one of: ${PRODUCT_CATEGORIES.join(', ')}`),

  // ─── stockQuantity (stock inicial) ────────────────────────────────────
  // Non-negative integer. Defaults to 0 when omitted.
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('stockQuantity must be a non-negative integer'),

  body('minimumStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('minimumStockLevel must be a non-negative integer'),
];

export const updateProductValidators = [
  param('id').isUUID().withMessage('id must be a valid UUID'),

  body('name')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .isLength({ max: 200 }),

  body('description')
    .optional()
    .isString()
    .isLength({ max: 2000 }),

  body('priceAmount')
    .optional()
    .isFloat({ min: 0 }),

  body('priceCurrency')
    .optional()
    .isIn(SUPPORTED_CURRENCIES),

  body('category')
    .optional()
    .isIn(PRODUCT_CATEGORIES),

  body('minimumStockLevel')
    .optional()
    .isInt({ min: 0 }),
];

export const productIdValidator = [
  param('id').isUUID().withMessage('id must be a valid UUID'),
];

export const getProductsValidators = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isIn(PRODUCT_CATEGORIES),
  query('isActive').optional().isIn(['true', 'false']),
  query('lowStock').optional().isIn(['true', 'false']),
  query('search').optional().isString().isLength({ max: 100 }),
];

export const adjustStockValidators = [
  param('id').isUUID().withMessage('id must be a valid UUID'),

  body('type')
    .isIn(['IN', 'OUT', 'ADJUSTMENT'])
    .withMessage('type must be IN, OUT, or ADJUSTMENT'),

  body('quantity')
    .isInt({ min: 1 })
    .withMessage('quantity must be a positive integer'),

  body('reason')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('reason is required')
    .isLength({ max: 500 }),

  body('performedBy')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('performedBy is required')
    .isLength({ max: 200 }),
];
