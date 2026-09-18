import express from 'express';
import {
  getRevenueTrends,
  getTopProducts,
  getCategoryDistribution,
  getBranchComparison,
  getBusinessTrends,
  getInventoryAlerts,
  getKeyMetrics,
} from '../controllers/analyticsController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get key metrics summary
router.get('/metrics', getKeyMetrics);

// Get revenue and profit trends
router.get('/revenue-trends', getRevenueTrends);

// Get top selling products
router.get('/top-products', getTopProducts);

// Get category distribution
router.get('/category-distribution', getCategoryDistribution);

// Get branch comparison
router.get('/branch-comparison', getBranchComparison);

// Get business trends
router.get('/business-trends', getBusinessTrends);

// Get inventory alerts
router.get('/inventory-alerts', getInventoryAlerts);

export default router;
