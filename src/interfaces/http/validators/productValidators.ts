/**
 * Product Request Validators
 *
 * Schema-level validation using express-validator.
 * These chains validate shape and type — business rules stay in the domain.
 *
 * Layer: Interfaces → Validators
 */

import { body, param, query } from 'express-validator';
import { PRODUCT_CATEGORIES } from '../../../domain/value-objects/ProductCategory';

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'MXN', 'GBP', 'CAD'];

export const createProductValidators = [
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('name is required')
    .isLength({ max: 200 })
    .withMessage('name cannot exceed 200 characters'),

  body('description')
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage('description cannot exceed 2000 characters'),

  body('sku')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('sku is required'),

  body('priceAmount')
    .isFloat({ min: 0 })
    .withMessage('priceAmount must be a non-negative number'),

  body('priceCurrency')
    .optional()
    .isIn(SUPPORTED_CURRENCIES)
    .withMessage(`priceCurrency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}`),

  body('category')
    .isIn(PRODUCT_CATEGORIES)
    .withMessage(`category must be one of: ${PRODUCT_CATEGORIES.join(', ')}`),

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
