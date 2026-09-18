import { query } from '../config/database.js'
import { hashPassword, successResponse, errorResponse, paginatedResponse } from '../utils/helpers.js'

/**
 * GET /api/users  — list all users in a tenant
 */
export const getUsers = async (req, res, next) => {
  try {
    const { tenantId } = req.user
    const page  = parseInt(req.query.page  || 1)
    const limit = parseInt(req.query.limit || 20)
    const search = req.query.search || ''
    const role   = req.query.role   || ''
    const offset = (page - 1) * limit

    let conditions = ['u.tenant_id = ?']
    const params   = [tenantId]

    if (search) { conditions.push('(u.username LIKE ? OR u.email LIKE ?)'); params.push(`%${search}%`, `%${search}%`) }
    if (role)   { conditions.push('u.role = ?'); params.push(role) }

    const where = conditions.join(' AND ')

    const [{ total }] = await query(`SELECT COUNT(*) AS total FROM users u WHERE ${where}`, params)

    const users = await query(
      `SELECT u.id, u.username, u.email, u.role, u.is_active, u.created_at, u.last_login,
              b.id AS branch_id, b.name AS branch_name
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE ${where}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    return paginatedResponse(res, users, total, page, limit)
  } catch (err) { next(err) }
}

/**
 * GET /api/users/:id
 */
export const getUser = async (req, res, next) => {
  try {
    const [user] = await query(
      `SELECT u.id, u.username, u.email, u.role, u.is_active, u.created_at, u.last_login,
              b.id AS branch_id, b.name AS branch_name
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.id = ? AND u.tenant_id = ?`,
      [req.params.id, req.user.tenantId]
    )
    if (!user) return errorResponse(res, 'User not found', 404)
    return successResponse(res, user)
  } catch (err) { next(err) }
}

/**
 * POST /api/users  — admin creates a user
 */
export const createUser = async (req, res, next) => {
  try {
    const { tenantId } = req.user
    const { username, email, password, role, branch_id } = req.body

    if (!username || !password || !role) return errorResponse(res, 'username, password and role are required', 400)
    if (!['admin', 'branch'].includes(role)) return errorResponse(res, 'role must be admin or branch', 400)

    const existing = await query('SELECT id FROM users WHERE username = ? AND tenant_id = ?', [username, tenantId])
    if (existing.length) return errorResponse(res, 'Username already exists in this organisation', 409)

    const hashed = await hashPassword(password)
    const result = await query(
      `INSERT INTO users (tenant_id, username, email, password, role, branch_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [tenantId, username, email || null, hashed, role, branch_id || null]
    )

    const [created] = await query(
      `SELECT u.id, u.username, u.email, u.role, u.is_active, b.name AS branch_name
       FROM users u LEFT JOIN branches b ON u.branch_id = b.id WHERE u.id = ?`,
      [result.insertId]
    )

    await query(
      'INSERT INTO activity_logs (tenant_id, user_id, action, description) VALUES (?,?,?,?)',
      [tenantId, req.user.id, 'USER_CREATED', `Created user ${username}`]
    )

    return successResponse(res, created, 'User created', 201)
  } catch (err) { next(err) }
}

/**
 * PUT /api/users/:id
 */
export const updateUser = async (req, res, next) => {
  try {
    const { tenantId } = req.user
    const { email, role, branch_id, is_active } = req.body

    const [existing] = await query('SELECT id FROM users WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId])
    if (!existing) return errorResponse(res, 'User not found', 404)

    await query(
      `UPDATE users SET
         email     = COALESCE(?, email),
         role      = COALESCE(?, role),
         branch_id = COALESCE(?, branch_id),
         is_active = COALESCE(?, is_active)
       WHERE id = ? AND tenant_id = ?`,
      [email ?? null, role ?? null, branch_id ?? null, is_active ?? null, req.params.id, tenantId]
    )

    const [updated] = await query(
      `SELECT u.id, u.username, u.email, u.role, u.is_active, b.name AS branch_name
       FROM users u LEFT JOIN branches b ON u.branch_id = b.id WHERE u.id = ?`,
      [req.params.id]
    )
    return successResponse(res, updated, 'User updated')
  } catch (err) { next(err) }
}

/**
 * DELETE /api/users/:id
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { tenantId, id: requesterId } = req.user
    if (parseInt(req.params.id) === requesterId) return errorResponse(res, 'You cannot delete your own account', 400)

    const [existing] = await query('SELECT id FROM users WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId])
    if (!existing) return errorResponse(res, 'User not found', 404)

    await query('DELETE FROM users WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId])
    return successResponse(res, null, 'User deleted')
  } catch (err) { next(err) }
}

/**
 * PATCH /api/users/:id/toggle  — activate / deactivate
 */
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { tenantId } = req.user
    const [user] = await query('SELECT id, is_active FROM users WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId])
    if (!user) return errorResponse(res, 'User not found', 404)

    const newStatus = !user.is_active
    await query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, req.params.id])
    return successResponse(res, { id: user.id, is_active: newStatus }, `User ${newStatus ? 'activated' : 'deactivated'}`)
  } catch (err) { next(err) }
}

/**
 * PATCH /api/users/:id/reset-password  — admin resets a user's password
 */
export const resetUserPassword = async (req, res, next) => {
  try {
    const { tenantId } = req.user
    const { new_password } = req.body
    if (!new_password || new_password.length < 6) return errorResponse(res, 'new_password must be at least 6 characters', 400)

    const [user] = await query('SELECT id FROM users WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId])
    if (!user) return errorResponse(res, 'User not found', 404)

    const hashed = await hashPassword(new_password)
    await query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.params.id])
    return successResponse(res, null, 'Password reset successfully')
  } catch (err) { next(err) }
}
