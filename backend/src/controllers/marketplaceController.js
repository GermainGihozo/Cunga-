import { query } from '../config/database.js'
import { successResponse, errorResponse, paginatedResponse } from '../utils/helpers.js'

// ─────────────────────────────────────────────────────────
// PUBLIC: Products
// ─────────────────────────────────────────────────────────

/**
 * GET /api/marketplace/products
 * Public product listing with search, category, price range, sort, pagination
 */
export const listProducts = async (req, res, next) => {
  try {
    const {
      search = '',
      category = '',
      min_price,
      max_price,
      sort = 'newest',      // newest | price_asc | price_desc | popular
      seller_id,
      featured,
      on_sale,
      page  = 1,
      limit = 24,
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)

    let conditions = ["sp.status = 'active'", 'sp.stock > 0']
    const params   = []

    if (search) {
      conditions.push('(sp.name LIKE ? OR sp.description LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }
    if (category)  { conditions.push('sp.category = ?');     params.push(category) }
    if (min_price) { conditions.push('sp.price >= ?');        params.push(Number(min_price)) }
    if (max_price) { conditions.push('sp.price <= ?');        params.push(Number(max_price)) }
    if (seller_id) { conditions.push('sp.seller_id = ?');     params.push(Number(seller_id)) }
    if (featured === '1') { conditions.push('sp.is_featured = TRUE') }
    if (on_sale   === '1') { conditions.push('sp.is_on_sale = TRUE') }

    // Only products from active sellers
    conditions.push("s.status = 'active'")

    const where = conditions.join(' AND ')

    const orderMap = {
      newest:     'sp.created_at DESC',
      price_asc:  'sp.price ASC',
      price_desc: 'sp.price DESC',
      popular:    'sp.sold DESC, sp.views DESC',
    }
    const orderBy = orderMap[sort] || orderMap.newest

    const [{ total }] = await query(
      `SELECT COUNT(*) AS total
       FROM seller_products sp
       JOIN sellers s ON s.id = sp.seller_id
       WHERE ${where}`,
      params
    )

    const products = await query(
      `SELECT
         sp.id, sp.name, sp.category, sp.subcategory, sp.description,
         sp.price, sp.old_price, sp.stock, sp.sold, sp.views,
         sp.images, sp.is_featured, sp.is_on_sale, sp.created_at,
         s.id   AS seller_id,
         s.shop_name, s.shop_slug, s.shop_logo,
         s.province, s.district, s.plan,
         ROUND(AVG(sr.rating), 1) AS avg_rating,
         COUNT(sr.id)             AS review_count
       FROM seller_products sp
       JOIN sellers s ON s.id = sp.seller_id
       LEFT JOIN seller_reviews sr ON sr.seller_id = s.id
       WHERE ${where}
       GROUP BY sp.id
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )

    // Parse images JSON + increment views asynchronously (fire-and-forget)
    const parsed = products.map(p => ({
      ...p,
      images: safeParseJson(p.images),
    }))

    // Non-blocking view count increment
    if (parsed.length) {
      const ids = parsed.map(p => p.id)
      query(
        `UPDATE seller_products SET views = views + 1 WHERE id IN (${ids.map(() => '?').join(',')})`,
        ids
      ).catch(() => {})
    }

    return paginatedResponse(res, parsed, total, page, limit)
  } catch (err) { next(err) }
}

/**
 * GET /api/marketplace/products/:id
 * Single product detail with seller info + reviews
 */
export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params

    const [product] = await query(
      `SELECT
         sp.*,
         s.id          AS seller_id,
         s.shop_name, s.shop_slug, s.shop_logo, s.shop_description,
         s.province, s.district, s.address, s.phone AS seller_phone,
         s.plan, s.commission_rate,
         s.is_verified,
         ROUND(AVG(sr.rating), 1) AS avg_rating,
         COUNT(sr.id)             AS review_count
       FROM seller_products sp
       JOIN sellers s ON s.id = sp.seller_id
       LEFT JOIN seller_reviews sr ON sr.seller_id = s.id
       WHERE sp.id = ? AND sp.status = 'active' AND s.status = 'active'
       GROUP BY sp.id`,
      [id]
    )

    if (!product) return errorResponse(res, 'Product not found', 404)

    // Parse images
    product.images = safeParseJson(product.images)

    // Fetch reviews
    const reviews = await query(
      `SELECT id, buyer_name, rating, comment, created_at
       FROM seller_reviews
       WHERE seller_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [product.seller_id]
    )

    // Related products in same category
    const related = await query(
      `SELECT sp.id, sp.name, sp.price, sp.old_price, sp.images, sp.sold,
              s.shop_name, s.shop_slug
       FROM seller_products sp
       JOIN sellers s ON s.id = sp.seller_id
       WHERE sp.category = ? AND sp.id != ? AND sp.status = 'active' AND s.status = 'active'
       ORDER BY sp.sold DESC LIMIT 6`,
      [product.category, id]
    )

    // Increment view count
    query('UPDATE seller_products SET views = views + 1 WHERE id = ?', [id]).catch(() => {})

    return successResponse(res, {
      product,
      reviews,
      related: related.map(p => ({ ...p, images: safeParseJson(p.images) })),
    })
  } catch (err) { next(err) }
}

/**
 * GET /api/marketplace/categories
 * All categories with product count
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await query(
      `SELECT category, COUNT(*) AS product_count
       FROM seller_products sp
       JOIN sellers s ON s.id = sp.seller_id
       WHERE sp.status = 'active' AND s.status = 'active' AND sp.stock > 0
       GROUP BY category
       ORDER BY product_count DESC`
    )
    return successResponse(res, categories)
  } catch (err) { next(err) }
}

/**
 * GET /api/marketplace/featured
 * Featured + flash sale products for homepage
 */
export const getFeatured = async (req, res, next) => {
  try {
    const [featured, flashSale, newArrivals, bestSellers] = await Promise.all([
      // Featured
      query(
        `SELECT sp.id, sp.name, sp.price, sp.old_price, sp.images, sp.category, sp.sold,
                s.shop_name, s.shop_slug
         FROM seller_products sp JOIN sellers s ON s.id = sp.seller_id
         WHERE sp.is_featured = TRUE AND sp.status = 'active' AND s.status = 'active'
         ORDER BY sp.created_at DESC LIMIT 8`
      ),
      // Flash sale (has old_price)
      query(
        `SELECT sp.id, sp.name, sp.price, sp.old_price, sp.images, sp.category,
                ROUND((sp.old_price - sp.price) / sp.old_price * 100) AS discount_pct,
                s.shop_name
         FROM seller_products sp JOIN sellers s ON s.id = sp.seller_id
         WHERE sp.old_price IS NOT NULL AND sp.old_price > sp.price
           AND sp.status = 'active' AND s.status = 'active'
         ORDER BY discount_pct DESC LIMIT 10`
      ),
      // New arrivals
      query(
        `SELECT sp.id, sp.name, sp.price, sp.images, sp.category, sp.created_at,
                s.shop_name
         FROM seller_products sp JOIN sellers s ON s.id = sp.seller_id
         WHERE sp.status = 'active' AND s.status = 'active'
         ORDER BY sp.created_at DESC LIMIT 8`
      ),
      // Best sellers
      query(
        `SELECT sp.id, sp.name, sp.price, sp.images, sp.category, sp.sold,
                ROUND(AVG(sr.rating), 1) AS avg_rating,
                s.shop_name
         FROM seller_products sp
         JOIN sellers s ON s.id = sp.seller_id
         LEFT JOIN seller_reviews sr ON sr.seller_id = s.id
         WHERE sp.status = 'active' AND s.status = 'active'
         GROUP BY sp.id
         ORDER BY sp.sold DESC LIMIT 8`
      ),
    ])

    return successResponse(res, {
      featured:    featured.map(parseImages),
      flashSale:   flashSale.map(parseImages),
      newArrivals: newArrivals.map(parseImages),
      bestSellers: bestSellers.map(parseImages),
    })
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// PUBLIC: Sellers
// ─────────────────────────────────────────────────────────

/**
 * GET /api/marketplace/sellers
 * Browse active seller shops
 */
export const listSellers = async (req, res, next) => {
  try {
    const { search = '', category = '', province = '', page = 1, limit = 20 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    let conditions = ["s.status = 'active'"]
    const params   = []

    if (search)   { conditions.push('s.shop_name LIKE ?'); params.push(`%${search}%`) }
    if (province) { conditions.push('s.province = ?');     params.push(province) }

    const where = conditions.join(' AND ')

    const [{ total }] = await query(
      `SELECT COUNT(*) AS total FROM sellers s WHERE ${where}`, params
    )

    const sellers = await query(
      `SELECT
         s.id, s.shop_name, s.shop_slug, s.shop_logo, s.shop_description,
         s.province, s.district, s.plan, s.is_verified,
         COUNT(sp.id)             AS product_count,
         COALESCE(SUM(sp.sold),0) AS total_sold,
         ROUND(AVG(sr.rating),1)  AS avg_rating,
         COUNT(DISTINCT sr.id)    AS review_count
       FROM sellers s
       LEFT JOIN seller_products sp ON sp.seller_id = s.id AND sp.status = 'active'
       LEFT JOIN seller_reviews  sr ON sr.seller_id = s.id
       WHERE ${where}
       GROUP BY s.id
       ORDER BY total_sold DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )

    return paginatedResponse(res, sellers, total, page, limit)
  } catch (err) { next(err) }
}

/**
 * GET /api/marketplace/sellers/:slug
 * Seller storefront by slug — their profile + active products
 */
export const getSellerStorefront = async (req, res, next) => {
  try {
    const { slug } = req.params

    const [seller] = await query(
      `SELECT
         s.id, s.shop_name, s.shop_slug, s.shop_logo, s.shop_banner, s.shop_description,
         s.province, s.district, s.address, s.phone,
         s.plan, s.is_verified, s.created_at,
         COUNT(DISTINCT sp.id)    AS product_count,
         COALESCE(SUM(sp.sold),0) AS total_sold,
         ROUND(AVG(sr.rating),1)  AS avg_rating,
         COUNT(DISTINCT sr.id)    AS review_count
       FROM sellers s
       LEFT JOIN seller_products sp ON sp.seller_id = s.id AND sp.status = 'active'
       LEFT JOIN seller_reviews  sr ON sr.seller_id = s.id
       WHERE s.shop_slug = ? AND s.status = 'active'
       GROUP BY s.id`,
      [slug]
    )

    if (!seller) return errorResponse(res, 'Shop not found', 404)

    // Get all active products for this seller
    const products = await query(
      `SELECT id, name, category, price, old_price, images, sold, stock,
              is_featured, is_on_sale, created_at
       FROM seller_products
       WHERE seller_id = ? AND status = 'active'
       ORDER BY is_featured DESC, sold DESC`,
      [seller.id]
    )

    // Get reviews
    const reviews = await query(
      `SELECT buyer_name, rating, comment, created_at
       FROM seller_reviews
       WHERE seller_id = ?
       ORDER BY created_at DESC LIMIT 5`,
      [seller.id]
    )

    return successResponse(res, {
      seller,
      products: products.map(parseImages),
      reviews,
    })
  } catch (err) { next(err) }
}

/**
 * POST /api/marketplace/reviews
 * Buyer submits a review for a seller (after a delivered order)
 */
export const submitReview = async (req, res, next) => {
  try {
    const { order_id, seller_id, buyer_name, rating, comment } = req.body

    if (!order_id || !seller_id || !rating) {
      return errorResponse(res, 'order_id, seller_id, and rating are required', 400)
    }
    if (rating < 1 || rating > 5) return errorResponse(res, 'Rating must be 1–5', 400)

    // Verify order exists + delivered
    const [order] = await query(
      `SELECT id FROM seller_orders WHERE id = ? AND seller_id = ? AND status = 'delivered'`,
      [order_id, seller_id]
    )
    if (!order) return errorResponse(res, 'Order not found or not yet delivered', 400)

    // Prevent duplicate reviews
    const existing = await query(
      'SELECT id FROM seller_reviews WHERE order_id = ?', [order_id]
    )
    if (existing.length) return errorResponse(res, 'Review already submitted for this order', 409)

    const result = await query(
      `INSERT INTO seller_reviews (seller_id, order_id, buyer_name, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [seller_id, order_id, buyer_name || 'Anonymous', rating, comment || null]
    )

    return successResponse(res, { id: result.insertId }, 'Review submitted', 201)
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
const safeParseJson = (val) => {
  try { return val ? JSON.parse(val) : [] } catch { return [] }
}
const parseImages = (row) => ({ ...row, images: safeParseJson(row.images) })
