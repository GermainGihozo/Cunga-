import { query } from '../config/database.js'
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  successResponse,
  errorResponse,
} from '../utils/helpers.js'

// Commission rates per plan
const COMMISSION_RATES = {
  free: 8.0,
  starter: 5.0,
  pro: 3.0,
  enterprise: 1.5,
}

// ─────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────

/**
 * Register new seller
 * POST /api/seller/auth/register
 */
export const registerSeller = async (req, res, next) => {
  try {
    const { full_name, email, phone, password, shop_name, plan = 'free' } = req.body

    if (!full_name || !email || !password || !shop_name) {
      return errorResponse(res, 'full_name, email, password and shop_name are required', 400)
    }

    // Check duplicate email
    const existing = await query('SELECT id FROM sellers WHERE email = ?', [email])
    if (existing.length > 0) {
      return errorResponse(res, 'An account with this email already exists', 409)
    }

    // Generate unique shop slug
    const baseSlug = shop_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)
    let slug = baseSlug
    let attempt = 0
    while (true) {
      const taken = await query('SELECT id FROM sellers WHERE shop_slug = ?', [slug])
      if (taken.length === 0) break
      attempt++
      slug = `${baseSlug}-${attempt}`
    }

    const hashedPassword = await hashPassword(password)
    const commission = COMMISSION_RATES[plan] ?? 8.0

    const result = await query(
      `INSERT INTO sellers
         (full_name, email, phone, password, shop_name, shop_slug, plan, commission_rate, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [full_name, email, phone || null, hashedPassword, shop_name, slug, plan, commission]
    )

    const [seller] = await query(
      `SELECT id, full_name, email, phone, shop_name, shop_slug, plan, status, created_at
       FROM sellers WHERE id = ?`,
      [result.insertId]
    )

    const token = generateSellerToken(seller)
    const refreshToken = generateSellerRefreshToken(seller)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await query(
      'INSERT INTO seller_refresh_tokens (seller_id, token, expires_at) VALUES (?, ?, ?)',
      [seller.id, refreshToken, expiresAt]
    )

    return successResponse(
      res,
      { seller, token, refreshToken, requiresOnboarding: true },
      'Seller account created successfully',
      201
    )
  } catch (err) {
    next(err)
  }
}

/**
 * Login seller
 * POST /api/seller/auth/login
 */
export const loginSeller = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400)
    }

    const [seller] = await query(
      `SELECT id, full_name, email, phone, shop_name, shop_slug, shop_logo,
              plan, commission_rate, status, is_verified, password, wallet_balance
       FROM sellers WHERE email = ?`,
      [email]
    )

    if (!seller) {
      return errorResponse(res, 'Invalid email or password', 401)
    }

    if (seller.status === 'suspended') {
      return errorResponse(res, 'Your account has been suspended. Contact support.', 403)
    }

    const match = await comparePassword(password, seller.password)
    if (!match) {
      return errorResponse(res, 'Invalid email or password', 401)
    }

    // Update last login
    await query('UPDATE sellers SET last_login = NOW() WHERE id = ?', [seller.id])

    const { password: _pw, ...safeSellerData } = seller
    const token = generateSellerToken(safeSellerData)
    const refreshToken = generateSellerRefreshToken(safeSellerData)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await query(
      'INSERT INTO seller_refresh_tokens (seller_id, token, expires_at) VALUES (?, ?, ?)',
      [seller.id, refreshToken, expiresAt]
    )

    const requiresOnboarding =
      !seller.shop_description && !seller.province

    return successResponse(res, {
      seller: safeSellerData,
      token,
      refreshToken,
      requiresOnboarding,
    }, 'Login successful')
  } catch (err) {
    next(err)
  }
}

/**
 * Logout seller
 * POST /api/seller/auth/logout
 */
export const logoutSeller = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (refreshToken) {
      await query('DELETE FROM seller_refresh_tokens WHERE token = ?', [refreshToken])
    }
    return successResponse(res, null, 'Logged out successfully')
  } catch (err) {
    next(err)
  }
}

/**
 * Get current seller profile
 * GET /api/seller/auth/me
 */
export const getSellerProfile = async (req, res, next) => {
  try {
    const [seller] = await query(
      `SELECT id, full_name, email, phone, national_id,
              shop_name, shop_slug, shop_description, shop_logo, shop_banner,
              province, district, address,
              plan, commission_rate, status, is_verified,
              wallet_balance, total_earned, last_login, created_at
       FROM sellers WHERE id = ?`,
      [req.seller.id]
    )
    if (!seller) return errorResponse(res, 'Seller not found', 404)
    return successResponse(res, seller)
  } catch (err) {
    next(err)
  }
}

/**
 * Update seller profile / complete onboarding
 * PUT /api/seller/auth/profile
 */
export const updateSellerProfile = async (req, res, next) => {
  try {
    const {
      full_name, phone, national_id,
      shop_name, shop_description, shop_logo, shop_banner,
      province, district, address,
    } = req.body

    await query(
      `UPDATE sellers SET
         full_name = COALESCE(?, full_name),
         phone = COALESCE(?, phone),
         national_id = COALESCE(?, national_id),
         shop_name = COALESCE(?, shop_name),
         shop_description = COALESCE(?, shop_description),
         shop_logo = COALESCE(?, shop_logo),
         shop_banner = COALESCE(?, shop_banner),
         province = COALESCE(?, province),
         district = COALESCE(?, district),
         address = COALESCE(?, address),
         updated_at = NOW()
       WHERE id = ?`,
      [
        full_name, phone, national_id,
        shop_name, shop_description, shop_logo, shop_banner,
        province, district, address,
        req.seller.id,
      ]
    )

    const [updated] = await query(
      `SELECT id, full_name, email, phone, shop_name, shop_slug, shop_description,
              shop_logo, shop_banner, province, district, address,
              plan, commission_rate, status, is_verified, wallet_balance
       FROM sellers WHERE id = ?`,
      [req.seller.id]
    )

    return successResponse(res, updated, 'Profile updated successfully')
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────────────────

/**
 * Get seller's products
 * GET /api/seller/products
 */
export const getSellerProducts = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    let conditions = ['seller_id = ?']
    let params = [req.seller.id]

    if (status && status !== 'all') {
      conditions.push('status = ?')
      params.push(status)
    }
    if (search) {
      conditions.push('name LIKE ?')
      params.push(`%${search}%`)
    }

    const where = conditions.join(' AND ')

    const [{ total }] = await query(
      `SELECT COUNT(*) as total FROM seller_products WHERE ${where}`,
      params
    )

    const products = await query(
      `SELECT id, name, category, price, old_price, stock, sold, images, status,
              is_featured, is_on_sale, views, created_at
       FROM seller_products WHERE ${where}
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )

    // Parse images JSON
    const parsed = products.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
    }))

    return res.json({
      success: true,
      data: { items: parsed, total, page: parseInt(page), limit: parseInt(limit) },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Create a product
 * POST /api/seller/products
 */
export const createSellerProduct = async (req, res, next) => {
  try {
    const {
      name, description, category, subcategory,
      price, old_price, cost_price, stock = 0,
      sku, images = [], status = 'draft',
    } = req.body

    if (!name || !category || !price) {
      return errorResponse(res, 'name, category, and price are required', 400)
    }

    const result = await query(
      `INSERT INTO seller_products
         (seller_id, name, description, category, subcategory,
          price, old_price, cost_price, stock, sku, images, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.seller.id, name, description || null, category, subcategory || null,
        price, old_price || null, cost_price || null, stock,
        sku || null, JSON.stringify(images), status,
      ]
    )

    const [product] = await query(
      'SELECT * FROM seller_products WHERE id = ?',
      [result.insertId]
    )

    return successResponse(
      res,
      { ...product, images: JSON.parse(product.images || '[]') },
      'Product created',
      201
    )
  } catch (err) {
    next(err)
  }
}

/**
 * Update a product
 * PUT /api/seller/products/:id
 */
export const updateSellerProduct = async (req, res, next) => {
  try {
    const { id } = req.params
    const {
      name, description, category, subcategory,
      price, old_price, cost_price, stock,
      sku, images, status,
    } = req.body

    // Verify ownership
    const [existing] = await query(
      'SELECT id FROM seller_products WHERE id = ? AND seller_id = ?',
      [id, req.seller.id]
    )
    if (!existing) return errorResponse(res, 'Product not found', 404)

    await query(
      `UPDATE seller_products SET
         name = COALESCE(?, name),
         description = COALESCE(?, description),
         category = COALESCE(?, category),
         subcategory = COALESCE(?, subcategory),
         price = COALESCE(?, price),
         old_price = COALESCE(?, old_price),
         cost_price = COALESCE(?, cost_price),
         stock = COALESCE(?, stock),
         sku = COALESCE(?, sku),
         images = COALESCE(?, images),
         status = COALESCE(?, status),
         updated_at = NOW()
       WHERE id = ? AND seller_id = ?`,
      [
        name, description, category, subcategory,
        price, old_price, cost_price, stock,
        sku, images ? JSON.stringify(images) : null, status,
        id, req.seller.id,
      ]
    )

    const [updated] = await query('SELECT * FROM seller_products WHERE id = ?', [id])
    return successResponse(res, { ...updated, images: JSON.parse(updated.images || '[]') })
  } catch (err) {
    next(err)
  }
}

/**
 * Delete a product
 * DELETE /api/seller/products/:id
 */
export const deleteSellerProduct = async (req, res, next) => {
  try {
    const { id } = req.params
    const [existing] = await query(
      'SELECT id FROM seller_products WHERE id = ? AND seller_id = ?',
      [id, req.seller.id]
    )
    if (!existing) return errorResponse(res, 'Product not found', 404)

    await query('DELETE FROM seller_products WHERE id = ? AND seller_id = ?', [id, req.seller.id])
    return successResponse(res, null, 'Product deleted')
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────

/**
 * Get seller orders
 * GET /api/seller/orders
 */
export const getSellerOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    let conditions = ['o.seller_id = ?']
    let params = [req.seller.id]

    if (status && status !== 'all') {
      conditions.push('o.status = ?')
      params.push(status)
    }

    const where = conditions.join(' AND ')

    const [{ total }] = await query(
      `SELECT COUNT(*) as total FROM seller_orders o WHERE ${where}`,
      params
    )

    const orders = await query(
      `SELECT o.*, p.name as product_name, p.images as product_images
       FROM seller_orders o
       JOIN seller_products p ON o.product_id = p.id
       WHERE ${where}
       ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )

    const parsed = orders.map(o => ({
      ...o,
      product_images: o.product_images ? JSON.parse(o.product_images) : [],
    }))

    return res.json({ success: true, data: { items: parsed, total } })
  } catch (err) {
    next(err)
  }
}

/**
 * Update order status
 * PATCH /api/seller/orders/:id/status
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const allowed = ['processing', 'shipped', 'delivered', 'cancelled']
    if (!allowed.includes(status)) {
      return errorResponse(res, `Status must be one of: ${allowed.join(', ')}`, 400)
    }

    const [order] = await query(
      'SELECT id, status, seller_earnings, seller_id FROM seller_orders WHERE id = ? AND seller_id = ?',
      [id, req.seller.id]
    )
    if (!order) return errorResponse(res, 'Order not found', 404)

    await query(
      'UPDATE seller_orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    )

    // Credit wallet when delivered
    if (status === 'delivered' && order.status !== 'delivered') {
      await query(
        'UPDATE sellers SET wallet_balance = wallet_balance + ?, total_earned = total_earned + ? WHERE id = ?',
        [order.seller_earnings, order.seller_earnings, req.seller.id]
      )
    }

    return successResponse(res, { id, status }, 'Order status updated')
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────

/**
 * Get seller analytics summary
 * GET /api/seller/analytics
 */
export const getSellerAnalytics = async (req, res, next) => {
  try {
    const sid = req.seller.id

    const [[revenue]] = await query(
      `SELECT COALESCE(SUM(seller_earnings), 0) as total_revenue,
              COALESCE(SUM(subtotal), 0) as total_sales
       FROM seller_orders WHERE seller_id = ? AND status = 'delivered'`,
      [sid]
    )

    const [[orderCounts]] = await query(
      `SELECT
         COUNT(*) as total,
         SUM(status = 'pending') as pending,
         SUM(status = 'processing') as processing,
         SUM(status = 'shipped') as shipped,
         SUM(status = 'delivered') as delivered,
         SUM(status = 'cancelled') as cancelled
       FROM seller_orders WHERE seller_id = ?`,
      [sid]
    )

    const [[productCounts]] = await query(
      `SELECT
         COUNT(*) as total,
         SUM(status = 'active') as active,
         SUM(status = 'draft') as draft,
         SUM(status = 'out_of_stock') as out_of_stock
       FROM seller_products WHERE seller_id = ?`,
      [sid]
    )

    const topProducts = await query(
      `SELECT p.id, p.name, p.price, p.sold, p.images,
              COALESCE(SUM(o.seller_earnings), 0) as revenue
       FROM seller_products p
       LEFT JOIN seller_orders o ON o.product_id = p.id AND o.status = 'delivered'
       WHERE p.seller_id = ?
       GROUP BY p.id ORDER BY revenue DESC LIMIT 5`,
      [sid]
    )

    const [[rating]] = await query(
      `SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total_reviews
       FROM seller_reviews WHERE seller_id = ?`,
      [sid]
    )

    return successResponse(res, {
      revenue,
      orders: orderCounts,
      products: productCounts,
      topProducts: topProducts.map(p => ({
        ...p,
        images: p.images ? JSON.parse(p.images) : [],
      })),
      rating,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Refresh seller token
 * POST /api/seller/auth/refresh
 */
export const refreshSellerToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return errorResponse(res, 'refreshToken is required', 400)

    // Look up the refresh token
    const tokens = await query(
      `SELECT srt.seller_id, s.email, s.shop_name, s.shop_slug, s.plan,
              s.commission_rate, s.status
       FROM seller_refresh_tokens srt
       JOIN sellers s ON s.id = srt.seller_id
       WHERE srt.token = ? AND srt.expires_at > NOW()`,
      [refreshToken]
    )

    if (tokens.length === 0) {
      return errorResponse(res, 'Invalid or expired refresh token', 401)
    }

    const seller = tokens[0]

    if (seller.status === 'suspended') {
      return errorResponse(res, 'Your account has been suspended.', 403)
    }

    const newToken = generateSellerToken({ id: seller.seller_id, email: seller.email })

    return successResponse(res, { token: newToken }, 'Token refreshed')
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// JWT helpers (seller-scoped)
// ─────────────────────────────────────────────────────────
const generateSellerToken = (seller) =>
  generateToken({ id: seller.id, username: seller.email, role: 'seller', branchId: null })

const generateSellerRefreshToken = (seller) =>
  generateRefreshToken({ id: seller.id })

// ─────────────────────────────────────────────────────────
// PAYOUTS
// ─────────────────────────────────────────────────────────

/**
 * GET /api/seller/payouts
 * List seller's payout history
 */
export const getSellerPayouts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const [{ total }] = await query(
      'SELECT COUNT(*) AS total FROM seller_payouts WHERE seller_id = ?',
      [req.seller.id]
    )

    const payouts = await query(
      `SELECT id, amount, method, account_number, status, note, reference, created_at
       FROM seller_payouts WHERE seller_id = ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [req.seller.id, parseInt(limit), offset]
    )

    return res.json({
      success: true,
      data: { items: payouts, total, page: parseInt(page), limit: parseInt(limit) },
    })
  } catch (err) { next(err) }
}

/**
 * POST /api/seller/payouts
 * Request a new payout
 */
export const requestPayout = async (req, res, next) => {
  try {
    const { method, account_number, amount, note } = req.body

    if (!method || !account_number || !amount) {
      return errorResponse(res, 'method, account_number, and amount are required', 400)
    }

    const amt = parseFloat(amount)
    if (isNaN(amt) || amt < 5000) {
      return errorResponse(res, 'Minimum payout amount is RWF 5,000', 400)
    }

    // Verify wallet has enough balance
    const [seller] = await query(
      'SELECT wallet_balance FROM sellers WHERE id = ?',
      [req.seller.id]
    )

    if (!seller) return errorResponse(res, 'Seller not found', 404)
    if (parseFloat(seller.wallet_balance) < amt) {
      return errorResponse(res, `Insufficient balance. Available: RWF ${Math.round(seller.wallet_balance).toLocaleString()}`, 400)
    }

    // Check no pending payout already exists
    const pending = await query(
      "SELECT id FROM seller_payouts WHERE seller_id = ? AND status = 'pending'",
      [req.seller.id]
    )
    if (pending.length > 0) {
      return errorResponse(res, 'You already have a pending payout. Please wait for it to be processed.', 409)
    }

    // Deduct from wallet and create payout record
    await query(
      'UPDATE sellers SET wallet_balance = wallet_balance - ? WHERE id = ?',
      [amt, req.seller.id]
    )

    const result = await query(
      `INSERT INTO seller_payouts (seller_id, amount, method, account_number, status, note)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [req.seller.id, amt, method, account_number, note || null]
    )

    const [payout] = await query(
      'SELECT * FROM seller_payouts WHERE id = ?',
      [result.insertId]
    )

    return successResponse(res, payout, 'Payout request submitted. Processing within 1–3 business days.', 201)
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// ADMIN: Seller management (no auth guard here — handled at route level)
// ─────────────────────────────────────────────────────────

/**
 * PATCH /api/admin/sellers/:id/status
 * Admin approves, rejects, or suspends a seller
 */
export const adminUpdateSellerStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status, reason } = req.body

    const allowed = ['active', 'rejected', 'suspended', 'pending']
    if (!allowed.includes(status)) {
      return errorResponse(res, `status must be one of: ${allowed.join(', ')}`, 400)
    }

    const [existing] = await query('SELECT id, shop_name FROM sellers WHERE id = ?', [id])
    if (!existing) return errorResponse(res, 'Seller not found', 404)

    await query(
      'UPDATE sellers SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    )

    // If activated, mark as verified
    if (status === 'active') {
      await query('UPDATE sellers SET is_verified = TRUE WHERE id = ?', [id])
    }

    return successResponse(res, { id: parseInt(id), status, shop_name: existing.shop_name },
      `Seller ${status === 'active' ? 'approved' : status}`)
  } catch (err) { next(err) }
}

/**
 * GET /api/admin/sellers
 * List all sellers for admin review
 */
export const adminListSellers = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50, search } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    let conditions = []
    const params = []
    if (status && status !== 'all') { conditions.push('s.status = ?'); params.push(status) }
    if (search) { conditions.push('(s.shop_name LIKE ? OR s.full_name LIKE ? OR s.email LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`) }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const [{ total }] = await query(`SELECT COUNT(*) AS total FROM sellers s ${where}`, params)
    const sellers = await query(
      `SELECT s.id, s.full_name, s.email, s.phone, s.shop_name, s.shop_slug,
              s.province, s.district, s.plan, s.commission_rate, s.status,
              s.is_verified, s.wallet_balance, s.total_earned, s.created_at,
              COUNT(DISTINCT sp.id) AS product_count,
              COALESCE(SUM(sp.sold), 0) AS total_sold,
              ROUND(AVG(sr.rating), 1) AS avg_rating
       FROM sellers s
       LEFT JOIN seller_products sp ON sp.seller_id = s.id
       LEFT JOIN seller_reviews  sr ON sr.seller_id = s.id
       ${where}
       GROUP BY s.id
       ORDER BY s.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )

    return res.json({ success: true, data: { items: sellers, total } })
  } catch (err) { next(err) }
}

/**
 * POST /api/seller/auth/forgot-password
 * Request a password reset link (doesn't leak whether email exists)
 */
export const forgotSellerPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return errorResponse(res, 'Email is required', 400)

    // Look up seller — but don't reveal if they exist
    const [seller] = await query('SELECT id, full_name FROM sellers WHERE email = ?', [email])

    if (seller) {
      // Generate a reset token (in production: send an email with a link)
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await query(
        'UPDATE sellers SET verification_token = ?, updated_at = NOW() WHERE id = ?',
        [`reset_${token}`, seller.id]
      )

      // TODO: Send email with reset link: /seller/reset-password?token=${token}&email=${email}
      console.log(`[Password Reset] Seller ${seller.full_name} (${email}) — token: ${token}`)
    }

    // Always return success (prevents email enumeration)
    return successResponse(res, null, 'If an account exists, a reset link has been sent.')
  } catch (err) { next(err) }
}
