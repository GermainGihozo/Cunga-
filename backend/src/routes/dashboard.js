import express from 'express'
import dashboardController from '../controllers/dashboardController.js'
import { authenticate, authorize } from '../middlewares/auth.js'

const router = express.Router()

// Admin dashboard routes
router.get('/admin/stats',              authenticate, authorize('admin'), dashboardController.getAdminStats)
router.get('/admin/branch-performance', authenticate, authorize('admin'), dashboardController.getBranchPerformance)
router.get('/admin/marketplace/stats',  authenticate, authorize('admin'), dashboardController.getMarketplaceStats)

// Branch dashboard routes
router.get('/branch/stats', authenticate, authorize('branch'), dashboardController.getBranchStats)

// Shared routes (both admin and branch)
router.get('/sales-trend',        authenticate, dashboardController.getSalesTrend)
router.get('/top-products',       authenticate, dashboardController.getTopProducts)
router.get('/recent-activities',  authenticate, dashboardController.getRecentActivities)

export default router
