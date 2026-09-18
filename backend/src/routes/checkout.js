import express from 'express'
import {
  placeOrder,
  getOrderByRef,
  confirmPayment,
  getBuyerOrders,
} from '../controllers/checkoutController.js'

const router = express.Router()

// All public — no buyer auth yet (phone-based lookup)
router.post('/place-order',       placeOrder)
router.get('/order/:ref',         getOrderByRef)
router.post('/confirm-payment',   confirmPayment)
router.get('/buyer-orders',       getBuyerOrders)

export default router
