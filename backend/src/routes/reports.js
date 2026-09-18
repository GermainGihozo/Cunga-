import express from 'express';
import {
  generateSalesSummary,
  generateInventoryStatus,
  generateFinancialStatement,
  generateCustomerAnalysis,
  generateProductPerformance,
} from '../controllers/reportsController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Generate sales summary report
router.get('/sales-summary', generateSalesSummary);

// Generate inventory status report
router.get('/inventory-status', generateInventoryStatus);

// Generate financial statement
router.get('/financial-statement', generateFinancialStatement);

// Generate customer analysis report
router.get('/customer-analysis', generateCustomerAnalysis);

// Generate product performance report
router.get('/product-performance', generateProductPerformance);

export default router;
