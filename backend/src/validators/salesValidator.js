import { body, query, param } from 'express-validator'

export const createSale = [
  body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  body('items.*.productId').isInt().withMessage('Product ID must be a valid integer'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['cash', 'card', 'mobile_money']).withMessage('Payment method must be cash, card, or mobile_money'),
  body('customerName').optional().trim().isLength({ max: 100 }).withMessage('Customer name must not exceed 100 characters'),
  body('customerPhone').optional().trim().isLength({ max: 20 }).withMessage('Customer phone must not exceed 20 characters'),
  body('branchId').optional().isInt().withMessage('Branch ID must be a valid integer'),
]

export const getSales = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['total_amount', 'total_profit', 'created_at', 'receipt_number']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('paymentMethod').optional().isIn(['cash', 'card', 'mobile_money']).withMessage('Invalid payment method'),
  query('branchId').optional().isInt().withMessage('Branch ID must be a valid integer'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
]

export const getSaleById = [
  param('id').isInt().withMessage('Sale ID must be a valid integer'),
]
