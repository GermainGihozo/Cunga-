import { body, query, param } from 'express-validator'

export const createProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('sku').optional().trim().isLength({ max: 50 }).withMessage('SKU must not exceed 50 characters'),
  body('categoryId').optional().isInt().withMessage('Category ID must be a valid integer'),
  body('costPrice').notEmpty().withMessage('Cost price is required').isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('sellingPrice').notEmpty().withMessage('Selling price is required').isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
  body('quantity').notEmpty().withMessage('Quantity is required').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('minStockLevel').optional().isInt({ min: 0 }).withMessage('Min stock level must be non-negative'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  body('branchId').optional().isInt().withMessage('Branch ID must be a valid integer'),
]

export const updateProduct = [
  param('id').isInt().withMessage('Product ID must be a valid integer'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('sku').optional().trim().isLength({ max: 50 }),
  body('categoryId').optional().isInt(),
  body('costPrice').optional().isFloat({ min: 0 }),
  body('sellingPrice').optional().isFloat({ min: 0 }),
  body('quantity').optional().isInt({ min: 0 }),
  body('minStockLevel').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['active', 'inactive']),
]

export const updateStock = [
  param('id').isInt().withMessage('Product ID must be a valid integer'),
  body('quantity').notEmpty().withMessage('Quantity is required').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('type').notEmpty().withMessage('Type is required').isIn(['add', 'subtract']).withMessage('Type must be add or subtract'),
]

export const getProducts = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sortBy').optional().isIn(['name', 'sku', 'quantity', 'cost_price', 'selling_price', 'created_at']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('categoryId').optional().isInt(),
  query('branchId').optional().isInt(),
  query('status').optional().isIn(['active', 'inactive']),
]

export const createCategory = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ min: 2, max: 50 }),
  body('description').optional().trim().isLength({ max: 200 }),
]
