import { query } from '../config/database.js'
import { successResponse, errorResponse, paginatedResponse } from '../utils/helpers.js'

/**
 * GET /api/branches
 */
export const getBranches = async (req, res, next) => {
  try {
    const { tenantId } = req.user
    const page   = parseInt(req.query.page  || 1)
    const limit  = parseInt(req.query.limit || 50)
    const search = req.query.search || ''
    const offset = (page - 1) * limit

    let conditions = ['b.tenant_id = ?']
    const params   = [tenantId]
    if (search) { conditions.push('b.name LIKE ?'); params.push(`%${search}%`) }
    const where = conditions.join(' AND ')

    const [{ total }] = await query(`SELECT COUNT(*) AS total FROM branches b WHERE ${where}`, params)

    const branches = await query(
      `SELECT b.*,
              COUNT(DISTINCT u.id)  AS user_count,
              COUNT(DISTINCT p.id)  AS product_count
       FROM branches b
       LEFT JOIN users    u ON u.branch_id  = b.id
       LEFT JOIN products p ON p.branch_id  = b.id
       WHERE ${where}
       GROUP BY b.id
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    return paginatedResponse(res, branches, total, page, limit)
  } catch (err) { next(err) }
}

/**
 * GET /api/branches/:id
 */
export const getBranch = async (req, res, next) => {
  try {
    const [branch] = await query(
      `SELECT b.*,
              COUNT(DISTINCT u.id) AS user_count,
              COUNT(DISTINCT p.id) AS product_count
       FROM branches b
       LEFT JOIN users    u ON u.branch_id = b.id
       LEFT JOIN products p ON p.branch_id = b.id
       WHERE b.id = ? AND b.tenant_id = ?
       GROUP BY b.id`,
      [req.params.id, req.user.tenantId]
    )
    if (!branch) return errorResponse(res, 'Branch not found', 404)
    return successResponse(res, branch)
  } catch (err) { next(err) }
}

/**
 * POST /api/branches
 */
export const createBranch = async (req, res, next) => {
  try {
    const { tenantId } = req.user
    const { name, location, phone, email } = req.body
    if (!name?.trim()) return errorResponse(res, 'Branch name is required', 400)

    const result = await query(
      `INSERT INTO branches (tenant_id, name, location, phone, email, is_active)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [tenantId, name.trim(), location || null, phone || null, email || null]
    )

    const [created] = await query('SELECT * FROM branches WHERE id = ?', [result.insertId])

    await query(
      'INSERT INTO activity_logs (tenant_id, user_id, action, description) VALUES (?,?,?,?)',
      [tenantId, req.user.id, 'BRANCH_CREATED', `Created branch: ${name}`]
    )

    return successResponse(res, created, 'Branch created', 201)
  } catch (err) { next(err) }
}

/**
 * PUT /api/branches/:id
 */
export const updateBranch = async (req, res, next) => {
  try {
    const { tenantId } = req.user
    const { name, location, phone, email, is_active } = req.body

    const [existing] = await query(
      'SELECT id FROM branches WHERE id = ? AND tenant_id = ?',
      [req.params.id, tenantId]
    )
    if (!existing) return errorResponse(res, 'Branch not found', 404)

    await query(
      `UPDATE branches SET
         name      = COALESCE(?, name),
         location  = COALESCE(?, location),
         phone     = COALESCE(?, phone),
         email     = COALESCE(?, email),
         is_active = COALESCE(?, is_active)
       WHERE id = ? AND tenant_id = ?`,
      [name ?? null, location ?? null, phone ?? null, email ?? null, is_active ?? null, req.params.id, tenantId]
    )

    const [updated] = await query('SELECT * FROM branches WHERE id = ?', [req.params.id])
    return successResponse(res, updated, 'Branch updated')
  } catch (err) { next(err) }
}

/**
 * DELETE /api/branches/:id
 */
export const deleteBranch = async (req, res, next) => {
  try {
    const { tenantId } = req.user
    const [existing] = await query(
      'SELECT id FROM branches WHERE id = ? AND tenant_id = ?',
      [req.params.id, tenantId]
    )
    if (!existing) return errorResponse(res, 'Branch not found', 404)

    // Safety check — don't delete if users or products attached
    const [{ users }] = await query('SELECT COUNT(*) AS users FROM users WHERE branch_id = ?', [req.params.id])
    if (users > 0) return errorResponse(res, `Cannot delete: ${users} user(s) are assigned to this branch`, 409)

    await query('DELETE FROM branches WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId])
    return successResponse(res, null, 'Branch deleted')
  } catch (err) { next(err) }
}

/**
 * GET /api/branches/:id/stats  — quick dashboard stats for a branch
 */
export const getBranchStats = async (req, res, next) => {
  try {
    const { tenantId } = req.user
    const bid = req.params.id

    const [branch] = await query(
      'SELECT id FROM branches WHERE id = ? AND tenant_id = ?', [bid, tenantId]
    )
    if (!branch) return errorResponse(res, 'Branch not found', 404)

    const [[products]]  = await query('SELECT COUNT(*) AS total FROM products  WHERE branch_id = ?', [bid])
    const [[users]]     = await query('SELECT COUNT(*) AS total FROM users      WHERE branch_id = ?', [bid])
    const [[salesRow]]  = await query(
      `SELECT COUNT(*) AS total, COALESCE(SUM(total_price),0) AS revenue
       FROM sales WHERE branch_id = ?`, [bid]
    )

    return successResponse(res, {
      branch_id:     parseInt(bid),
      total_products: products.total,
      total_users:    users.total,
      total_sales:    salesRow.total,
      total_revenue:  salesRow.revenue,
    })
  } catch (err) { next(err) }
}
