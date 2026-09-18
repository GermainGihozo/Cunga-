import express from 'express'

const router = express.Router()

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Cunga API is running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1',
  })
})

// API info route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Cunga API',
    version: process.env.API_VERSION || 'v1',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      seller: '/api/seller',
      products: '/api/products',
      sales: '/api/sales',
      customers: '/api/customers',
      reports: '/api/reports',
      analytics: '/api/analytics',
    },
  })
})

// Import route modules
import authRoutes from './auth.js'
import dashboardRoutes from './dashboard.js'
import productRoutes from './products.js'
import salesRoutes from './sales.js'
import customerRoutes from './customers.js'
import analyticsRoutes from './analytics.js'
import reportRoutes from './reports.js'
import sellerRoutes from './seller.js'
import userRoutes from './users.js'
import branchRoutes from './branches.js'
import marketplaceRoutes from './marketplace.js'
import checkoutRoutes from './checkout.js'
import adminSellerRoutes from './adminSellers.js'

// Mount routes
router.use('/auth', authRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/products', productRoutes)
router.use('/sales', salesRoutes)
router.use('/customers', customerRoutes)
router.use('/analytics', analyticsRoutes)
router.use('/reports', reportRoutes)
router.use('/seller', sellerRoutes)
router.use('/users', userRoutes)
router.use('/branches', branchRoutes)
router.use('/marketplace', marketplaceRoutes)
router.use('/checkout', checkoutRoutes)
router.use('/admin/sellers', adminSellerRoutes)

export default router
