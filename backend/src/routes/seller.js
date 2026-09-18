import express from 'express'
import {
  registerSeller,
  loginSeller,
  logoutSeller,
  refreshSellerToken,
  getSellerProfile,
  updateSellerProfile,
  getSellerProducts,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  getSellerOrders,
  updateOrderStatus,
  getSellerAnalytics,
  getSellerPayouts,
  requestPayout,
  forgotSellerPassword,
} from '../controllers/sellerController.js'
import { authenticateSeller } from '../middlewares/sellerAuth.js'
import { uploadProduct } from '../middlewares/upload.js'

const router = express.Router()

// ── Auth (public) ────────────────────────────────────────
router.post('/auth/register',         registerSeller)
router.post('/auth/login',            loginSeller)
router.post('/auth/logout',           logoutSeller)
router.post('/auth/refresh',          refreshSellerToken)
router.post('/auth/forgot-password',  forgotSellerPassword)

// ── Profile (protected) ──────────────────────────────────
router.get('/auth/me',        authenticateSeller, getSellerProfile)
router.put('/auth/profile',   authenticateSeller, updateSellerProfile)

// ── Products (protected) ─────────────────────────────────
router.get('/products',       authenticateSeller, getSellerProducts)
router.post('/products',      authenticateSeller, createSellerProduct)
router.put('/products/:id',   authenticateSeller, updateSellerProduct)
router.delete('/products/:id',authenticateSeller, deleteSellerProduct)

// ── Product image upload ──────────────────────────────────
router.post('/products/upload', authenticateSeller, uploadProduct, (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' })
  const url = `/uploads/products/${req.file.filename}`
  res.json({ success: true, data: { url, filename: req.file.filename } })
})

// ── Orders (protected) ───────────────────────────────────
router.get('/orders',                     authenticateSeller, getSellerOrders)
router.patch('/orders/:id/status',        authenticateSeller, updateOrderStatus)

// ── Analytics (protected) ────────────────────────────────
router.get('/analytics',      authenticateSeller, getSellerAnalytics)

// ── Payouts (protected) ──────────────────────────────────
router.get('/payouts',        authenticateSeller, getSellerPayouts)
router.post('/payouts',       authenticateSeller, requestPayout)

export default router
