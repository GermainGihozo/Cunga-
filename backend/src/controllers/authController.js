import { query } from '../config/database.js'
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  successResponse,
  errorResponse,
} from '../utils/helpers.js'

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password, role, branchId, tenantId,
            business_name, phone, plan } = req.body

    // ── If a tenantId is provided (admin creating a user) use it directly ──
    // ── Otherwise create a new tenant + owner user (self-serve signup) ──────
    let effectiveTenantId = tenantId

    if (!effectiveTenantId) {
      // Self-serve: require business_name
      if (!business_name?.trim()) {
        return errorResponse(res, 'business_name is required for new registrations', 400)
      }

      // Generate a unique slug for the tenant
      const baseSlug = business_name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
      let slug = baseSlug
      let attempt = 0
      while (true) {
        const taken = await query('SELECT id FROM tenants WHERE slug = ?', [slug])
        if (taken.length === 0) break
        attempt++
        slug = `${baseSlug}-${attempt}`
      }

      // Create the tenant
      const tenantResult = await query(
        `INSERT INTO tenants (business_name, slug, subscription_plan_id, subscription_status, is_active)
         VALUES (?, ?, 1, 'trial', TRUE)`,
        [business_name.trim(), slug]
      )
      effectiveTenantId = tenantResult.insertId
    }

    // Check if username already exists for this tenant
    const existingUser = await query(
      'SELECT id FROM users WHERE username = ? AND tenant_id = ?',
      [username, effectiveTenantId]
    )

    if (existingUser.length > 0) {
      return errorResponse(res, 'Username already exists for this organization', 409)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const result = await query(
      `INSERT INTO users (tenant_id, username, password, email, role, branch_id, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [effectiveTenantId, username, hashedPassword, email, role || 'admin', branchId || null]
    )

    // If this is an owner user, update tenant owner_user_id
    if (!tenantId) {
      await query('UPDATE tenants SET owner_user_id = ? WHERE id = ?', [result.insertId, effectiveTenantId])
    }

    // Get the created user
    const [newUser] = await query(
      `SELECT u.id, u.tenant_id, u.username, u.email, u.role, u.branch_id, u.is_active,
              b.name as branch_name, t.business_name as tenant_name
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       LEFT JOIN tenants  t ON u.tenant_id = t.id
       WHERE u.id = ?`,
      [result.insertId]
    )

    // Generate tokens
    const token = generateToken(newUser)
    const refreshToken = generateRefreshToken(newUser)

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [newUser.id, refreshToken, expiresAt]
    )

    // Log activity
    await query(
      'INSERT INTO activity_logs (tenant_id, user_id, action, description) VALUES (?, ?, ?, ?)',
      [effectiveTenantId, newUser.id, 'USER_REGISTERED', `User ${username} registered`]
    ).catch(() => {}) // non-fatal

    const { password: _, ...userWithoutPassword } = newUser

    return successResponse(
      res,
      { user: userWithoutPassword, token, refreshToken },
      'Account created successfully',
      201
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body

    // Find user by username (across all tenants - will need tenant context in production)
    const users = await query(
      `SELECT u.id, u.tenant_id, u.username, u.password, u.email, u.role, u.branch_id, 
              u.is_active, b.name as branch_name, t.business_name as tenant_name
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       LEFT JOIN tenants t ON u.tenant_id = t.id
       WHERE u.username = ?`,
      [username]
    )

    if (users.length === 0) {
      return errorResponse(res, 'Invalid username or password', 401)
    }

    const user = users[0]

    // Check if user is active
    if (!user.is_active) {
      return errorResponse(res, 'Account is inactive. Please contact support.', 403)
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return errorResponse(res, 'Invalid username or password', 401)
    }

    // Generate tokens
    const token = generateToken(user)
    const refreshToken = generateRefreshToken(user)

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshToken, expiresAt]
    )

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id])

    // Log activity
    await query(
      'INSERT INTO activity_logs (tenant_id, user_id, action, description, ip_address) VALUES (?, ?, ?, ?, ?)',
      [user.tenant_id, user.id, 'USER_LOGIN', `User ${username} logged in`, req.ip]
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return successResponse(res, {
      user: userWithoutPassword,
      token,
      refreshToken,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    const userId = req.user.id

    // Delete refresh token
    if (refreshToken) {
      await query('DELETE FROM refresh_tokens WHERE token = ? AND user_id = ?', [
        refreshToken,
        userId,
      ])
    }

    // Log activity
    await query(
      'INSERT INTO activity_logs (tenant_id, user_id, action, description) VALUES (?, ?, ?, ?)',
      [req.user.tenantId, userId, 'USER_LOGOUT', `User logged out`]
    )

    return successResponse(res, null, 'Logged out successfully')
  } catch (error) {
    next(error)
  }
}

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', 400)
    }

    // Verify refresh token exists and is not expired
    const tokens = await query(
      `SELECT rt.*, u.id, u.tenant_id, u.username, u.role, u.branch_id
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = ? AND rt.expires_at > NOW()`,
      [refreshToken]
    )

    if (tokens.length === 0) {
      return errorResponse(res, 'Invalid or expired refresh token', 401)
    }

    const tokenData = tokens[0]

    // Generate new access token
    const newAccessToken = generateToken({
      id: tokenData.id,
      username: tokenData.username,
      role: tokenData.role,
      branchId: tokenData.branch_id,
    })

    return successResponse(res, {
      token: newAccessToken,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id

    const [user] = await query(
      `SELECT u.id, u.tenant_id, u.username, u.email, u.role, u.branch_id, 
              u.is_active, u.created_at, u.last_login,
              b.name as branch_name, t.business_name as tenant_name
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       LEFT JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = ?`,
      [userId]
    )

    if (!user) {
      return errorResponse(res, 'User not found', 404)
    }

    return successResponse(res, user)
  } catch (error) {
    next(error)
  }
}

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { email, currentPassword, newPassword } = req.body

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return errorResponse(res, 'Current password is required to change password', 400)
      }

      const [user] = await query('SELECT password FROM users WHERE id = ?', [userId])

      const isValidPassword = await comparePassword(currentPassword, user.password)
      if (!isValidPassword) {
        return errorResponse(res, 'Current password is incorrect', 401)
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword)
      await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId])
    }

    // Update email if provided
    if (email) {
      await query('UPDATE users SET email = ? WHERE id = ?', [email, userId])
    }

    // Get updated user
    const [updatedUser] = await query(
      `SELECT u.id, u.username, u.email, u.role, u.branch_id, 
              b.name as branch_name
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.id = ?`,
      [userId]
    )

    return successResponse(res, updatedUser, 'Profile updated successfully')
  } catch (error) {
    next(error)
  }
}

export default {
  register,
  login,
  logout,
  refresh,
  getProfile,
  updateProfile,
}
