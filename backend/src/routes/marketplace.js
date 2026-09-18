import express from 'express'
import {
  listProducts,
  getProduct,
  getCategories,
  getFeatured,
  listSellers,
  getSellerStorefront,
  submitReview,
} from '../controllers/marketplaceController.js'

const router = express.Router()

// All public — no auth required
router.get('/products',            listProducts)
router.get('/products/:id',        getProduct)
router.get('/categories',          getCategories)
router.get('/featured',            getFeatured)
router.get('/sellers',             listSellers)
router.get('/sellers/:slug',       getSellerStorefront)
router.post('/reviews',            submitReview)

export default router
