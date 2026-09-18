import jwt from 'jsonwebtoken'
import { query } from '../config/database.js'

/**
 * Authenticate seller from Bearer JWT
 */
export const authenticateSeller = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== 'seller') {
      return res.status(403).json({ success: false, message: 'This endpoint is for sellers only.' })
    }

    // Load fresh seller record
    const [seller] = await query(
      `SELECT id, full_name, email, shop_name, shop_slug, plan,
              commission_rate, status, is_verified, wallet_balance
       FROM sellers WHERE id = ?`,
      [decoded.id]
    )

    if (!seller) {
      return res.status(401).json({ success: false, message: 'Seller account not found.' })
    }
    if (seller.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended.' })
    }

    req.seller = seller
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' })
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' })
  }
}

export default { authenticateSeller }
