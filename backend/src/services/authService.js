import { query } from '../config/database.js'
import { hashPassword } from '../utils/helpers.js'

/**
 * Create a new user
 */
export const createUser = async (userData) => {
  const { tenantId, username, password, email, role, branchId } = userData

  const hashedPassword = await hashPassword(password)

  const result = await query(
    `INSERT INTO users (tenant_id, username, password, email, role, branch_id, is_active) 
     VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
    [tenantId, username, hashedPassword, email, role, branchId || null]
  )

  return result.insertId
}

/**
 * Find user by username
 */
export const findUserByUsername = async (username) => {
  const users = await query(
    `SELECT u.id, u.tenant_id, u.username, u.password, u.email, u.role, u.branch_id, 
            u.is_active, b.name as branch_name, t.business_name as tenant_name
     FROM users u
     LEFT JOIN branches b ON u.branch_id = b.id
     LEFT JOIN tenants t ON u.tenant_id = t.id
     WHERE u.username = ?`,
    [username]
  )

  return users[0] || null
}

/**
 * Find user by ID
 */
export const findUserById = async (userId) => {
  const users = await query(
    `SELECT u.id, u.tenant_id, u.username, u.email, u.role, u.branch_id, 
            u.is_active, u.created_at, u.last_login,
            b.name as branch_name, t.business_name as tenant_name
     FROM users u
     LEFT JOIN branches b ON u.branch_id = b.id
     LEFT JOIN tenants t ON u.tenant_id = t.id
     WHERE u.id = ?`,
    [userId]
  )

  return users[0] || null
}

/**
 * Check if username exists for tenant
 */
export const usernameExists = async (username, tenantId) => {
  const users = await query(
    'SELECT id FROM users WHERE username = ? AND tenant_id = ?',
    [username, tenantId]
  )

  return users.length > 0
}

/**
 * Update last login timestamp
 */
export const updateLastLogin = async (userId) => {
  await query('UPDATE users SET last_login = NOW() WHERE id = ?', [userId])
}

/**
 * Store refresh token
 */
export const storeRefreshToken = async (userId, token, expiresAt) => {
  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt]
  )
}

/**
 * Validate refresh token
 */
export const validateRefreshToken = async (token) => {
  const tokens = await query(
    `SELECT rt.*, u.id, u.tenant_id, u.username, u.role, u.branch_id
     FROM refresh_tokens rt
     JOIN users u ON rt.user_id = u.id
     WHERE rt.token = ? AND rt.expires_at > NOW()`,
    [token]
  )

  return tokens[0] || null
}

/**
 * Delete refresh token
 */
export const deleteRefreshToken = async (token, userId) => {
  await query('DELETE FROM refresh_tokens WHERE token = ? AND user_id = ?', [token, userId])
}

/**
 * Clean expired refresh tokens
 */
export const cleanExpiredTokens = async () => {
  await query('DELETE FROM refresh_tokens WHERE expires_at < NOW()')
}

export default {
  createUser,
  findUserByUsername,
  findUserById,
  usernameExists,
  updateLastLogin,
  storeRefreshToken,
  validateRefreshToken,
  deleteRefreshToken,
  cleanExpiredTokens,
}
