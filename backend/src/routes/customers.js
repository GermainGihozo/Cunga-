import express from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateLoyaltyPoints,
  getCustomerStats,
} from '../controllers/customerController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get customer statistics
router.get('/stats', getCustomerStats);

// Get all customers (with pagination and search)
router.get('/', getCustomers);

// Get customer by ID
router.get('/:id', getCustomerById);

// Create new customer
router.post('/', createCustomer);

// Update customer
router.put('/:id', updateCustomer);

// Delete customer
router.delete('/:id', deleteCustomer);

// Update loyalty points
router.post('/:id/loyalty', updateLoyaltyPoints);

export default router;
