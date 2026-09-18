import express from 'express'
import { authenticate, authorize } from '../middlewares/auth.js'
import { adminListSellers, adminUpdateSellerStatus } from '../controllers/sellerController.js'

const router = express.Router()

// All admin seller routes require SaaS admin JWT
router.use(authenticate, authorize('admin'))

router.get('/',           adminListSellers)
router.patch('/:id/status', adminUpdateSellerStatus)

export default router
