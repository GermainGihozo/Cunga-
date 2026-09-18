import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Compare password with hash
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash)
}

/**
 * Generate JWT access token
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id:       user.id,
      username: user.username,
      role:     user.role,
      branchId: user.branchId || user.branch_id || null,
      tenantId: user.tenantId || user.tenant_id || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  )
}

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  )
}

/**
 * Format success response
 */
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

/**
 * Format error response
 */
export const errorResponse = (res, message = 'Error', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  })
}

/**
 * Format paginated response
 */
export const paginatedResponse = (res, items, total, page, limit) => {
  return res.status(200).json({
    success: true,
    data: {
      items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    },
  })
}

/**
 * Generate random string
 */
export const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Calculate profit
 */
export const calculateProfit = (costPrice, sellingPrice, quantity) => {
  return (sellingPrice - costPrice) * quantity
}

/**
 * Calculate profit margin percentage
 */
export const calculateProfitMargin = (costPrice, sellingPrice) => {
  if (sellingPrice === 0) return 0
  return ((sellingPrice - costPrice) / sellingPrice) * 100
}

export default {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  successResponse,
  errorResponse,
  paginatedResponse,
  generateRandomString,
  calculateProfit,
  calculateProfitMargin,
}

/**
 * Generate unique receipt number
 */
export const generateReceiptNumber = () => {
  const timestamp = Date.now().toString()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `RCP-${timestamp}-${random}`
}
