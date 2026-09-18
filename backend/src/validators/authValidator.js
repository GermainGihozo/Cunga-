import { body } from 'express-validator'

/**
 * Validation rules for user registration
 */
export const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('role')
    .isIn(['admin', 'branch'])
    .withMessage('Role must be either admin or branch'),

  body('tenantId')
    .isInt({ min: 1 })
    .withMessage('Tenant ID must be a positive integer'),

  body('branchId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Branch ID must be a positive integer'),
]

/**
 * Validation rules for user login
 */
export const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
]

/**
 * Validation rules for token refresh
 */
export const refreshValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
]

/**
 * Validation rules for profile update
 */
export const updateProfileValidation = [
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('currentPassword')
    .optional()
    .notEmpty()
    .withMessage('Current password is required when changing password'),

  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
]

export default {
  registerValidation,
  loginValidation,
  refreshValidation,
  updateProfileValidation,
}
