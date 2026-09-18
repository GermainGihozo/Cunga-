import { query } from '../config/database.js'
import { successResponse, errorResponse } from '../utils/helpers.js'

// Commission rates per plan
const COMMISSION = { free: 8, starter: 5, pro: 3, enterprise: 1.5 }

const DELIVERY_FEES = { standard: 2000, express: 5000, pickup: 0 }

/**
 * Generate unique order reference  e.g. CNG-1724857392-483
 */
const makeRef = () =>
  `CNG-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

// ─────────────────────────────────────────────────────────
// POST /api/checkout/place-order
// ─────────────────────────────────────────────────────────
export const placeOrder = async (req, res, next) => {
  try {
    const {
      product_id,
      quantity = 1,
      // Buyer info
      buyer_name,
      buyer_phone,
      buyer_email,
      // Delivery
      delivery_address,
      delivery_district,
      delivery_province,
      delivery_method = 'standard',
      // Payment
      payment_method = 'mtn',
    } = req.body

    // ── Validate required fields ──────────────────────────
    if (!product_id || !buyer_name || !buyer_phone || !delivery_address) {
      return errorResponse(
        res,
        'product_id, buyer_name, buyer_phone, and delivery_address are required',
        400
      )
    }

    // ── Load product ──────────────────────────────────────
    const [product] = await query(
      `SELECT sp.*, s.plan AS seller_plan, s.id AS sid, s.status AS seller_status
       FROM seller_products sp
       JOIN sellers s ON s.id = sp.seller_id
       WHERE sp.id = ? AND sp.status = 'active'`,
      [product_id]
    )

    if (!product) return errorResponse(res, 'Product not found or unavailable', 404)
    if (product.seller_status !== 'active') return errorResponse(res, 'Seller is not available', 400)
    if (product.stock < parseInt(quantity)) {
      return errorResponse(res, `Only ${product.stock} units available`, 400)
    }

    // ── Calculate financials ──────────────────────────────
    const qty          = parseInt(quantity)
    const unit_price   = parseFloat(product.price)
    const subtotal     = unit_price * qty
    const delivery_fee = DELIVERY_FEES[delivery_method] ?? 2000
    const commission_rate =
      COMMISSION[product.seller_plan] ?? COMMISSION.free
    const commission_amount = Math.round((subtotal * commission_rate) / 100)
    const seller_earnings   = subtotal - commission_amount

    // ── Insert order ──────────────────────────────────────
    const order_ref = makeRef()

    const result = await query(
      `INSERT INTO seller_orders (
         order_ref, seller_id, product_id,
         buyer_name, buyer_phone, buyer_email,
         delivery_address, delivery_district, delivery_province,
         delivery_method, delivery_fee,
         quantity, unit_price, subtotal,
         commission_amount, seller_earnings,
         payment_method, payment_status, status
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending','pending','pending')`,
      [
        order_ref,
        product.sid,
        product_id,
        buyer_name,
        buyer_phone,
        buyer_email || null,
        delivery_address,
        delivery_district || null,
        delivery_province || null,
        delivery_method,
        delivery_fee,
        qty,
        unit_price,
        subtotal,
        commission_amount,
        seller_earnings,
        payment_method,
      ]
    )

    // ── Decrement stock ───────────────────────────────────
    await query(
      'UPDATE seller_products SET stock = stock - ?, sold = sold + ? WHERE id = ?',
      [qty, qty, product_id]
    )

    // ── Fetch created order ───────────────────────────────
    const [order] = await query(
      `SELECT o.*,
              p.name   AS product_name,
              p.images AS product_images,
              s.shop_name, s.shop_slug, s.shop_logo
       FROM seller_orders o
       JOIN seller_products p ON p.id = o.product_id
       JOIN sellers         s ON s.id = o.seller_id
       WHERE o.id = ?`,
      [result.insertId]
    )

    order.product_images = safeJson(order.product_images)

    return successResponse(
      res,
      {
        order_id:    order.id,
        order_ref:   order.order_ref,
        order,
        summary: {
          subtotal,
          delivery_fee,
          commission_amount,
          seller_earnings,
          total: subtotal + delivery_fee,
        },
      },
      'Order placed successfully',
      201
    )
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// GET /api/checkout/order/:ref
// Public order lookup by ref (buyer uses this to track)
// ─────────────────────────────────────────────────────────
export const getOrderByRef = async (req, res, next) => {
  try {
    const { ref } = req.params

    const [order] = await query(
      `SELECT
         o.id, o.order_ref, o.status, o.payment_status, o.payment_method,
         o.buyer_name, o.buyer_phone,
         o.delivery_address, o.delivery_district, o.delivery_province,
         o.delivery_method, o.delivery_fee,
         o.quantity, o.unit_price, o.subtotal,
         o.created_at, o.updated_at,
         p.name   AS product_name,
         p.images AS product_images,
         s.shop_name, s.shop_slug, s.shop_logo, s.phone AS seller_phone
       FROM seller_orders o
       JOIN seller_products p ON p.id = o.product_id
       JOIN sellers         s ON s.id = o.seller_id
       WHERE o.order_ref = ?`,
      [ref]
    )

    if (!order) return errorResponse(res, 'Order not found', 404)

    order.product_images = safeJson(order.product_images)

    // Timeline events derived from status
    const timeline = buildTimeline(order.status, order.created_at)

    return successResponse(res, { order, timeline })
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// POST /api/checkout/confirm-payment
// Simulate payment confirmation (MTN/Airtel push)
// ─────────────────────────────────────────────────────────
export const confirmPayment = async (req, res, next) => {
  try {
    const { order_ref, transaction_id } = req.body
    if (!order_ref) return errorResponse(res, 'order_ref is required', 400)

    const [order] = await query(
      'SELECT id, payment_status FROM seller_orders WHERE order_ref = ?',
      [order_ref]
    )
    if (!order) return errorResponse(res, 'Order not found', 404)
    if (order.payment_status === 'paid') {
      return successResponse(res, { order_ref, payment_status: 'paid' }, 'Already paid')
    }

    await query(
      `UPDATE seller_orders
       SET payment_status = 'paid', status = 'processing', updated_at = NOW()
       WHERE order_ref = ?`,
      [order_ref]
    )

    return successResponse(res, {
      order_ref,
      transaction_id: transaction_id || `TXN-${Date.now()}`,
      payment_status: 'paid',
      order_status:   'processing',
    }, 'Payment confirmed')
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// GET /api/checkout/buyer-orders?phone=
// Buyer looks up all their orders by phone
// ─────────────────────────────────────────────────────────
export const getBuyerOrders = async (req, res, next) => {
  try {
    const { phone } = req.query
    if (!phone) return errorResponse(res, 'phone query param is required', 400)

    const orders = await query(
      `SELECT
         o.id, o.order_ref, o.status, o.payment_status,
         o.subtotal, o.delivery_fee, o.created_at,
         p.name   AS product_name,
         p.images AS product_images,
         s.shop_name, s.shop_slug
       FROM seller_orders o
       JOIN seller_products p ON p.id = o.product_id
       JOIN sellers         s ON s.id = o.seller_id
       WHERE o.buyer_phone = ?
       ORDER BY o.created_at DESC`,
      [phone]
    )

    const parsed = orders.map(o => ({
      ...o,
      product_images: safeJson(o.product_images),
    }))

    return successResponse(res, parsed)
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
const safeJson = (val) => {
  try { return val ? JSON.parse(val) : [] } catch { return [] }
}

const buildTimeline = (status, createdAt) => {
  const steps = [
    { key: 'pending',    label: 'Order Placed',   icon: '📦' },
    { key: 'processing', label: 'Processing',     icon: '⚙️' },
    { key: 'shipped',    label: 'Shipped',         icon: '🚚' },
    { key: 'delivered',  label: 'Delivered',       icon: '✅' },
  ]
  const order = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  const current = order.indexOf(status)
  return steps.map((s, i) => ({
    ...s,
    done:   i <= current && status !== 'cancelled',
    active: order[i] === status,
  }))
}
