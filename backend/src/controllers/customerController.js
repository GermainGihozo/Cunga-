import { query } from '../config/database.js';

// Get all customers with pagination and search
export const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'active' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        c.*,
        COUNT(DISTINCT s.id) as total_purchases,
        COALESCE(SUM(s.total_amount), 0) as total_spent,
        MAX(s.created_at) as last_purchase_date
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (status) {
      query += ` AND c.status = ?`;
      params.push(status);
    }

    query += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const customers = await query(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(DISTINCT c.id) as total FROM customers c WHERE 1=1`;
    const countParams = [];

    if (search) {
      countQuery += ` AND (c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (status) {
      countQuery += ` AND c.status = ?`;
      countParams.push(status);
    }

    const countResult = await query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: error.message,
    });
  }
};

// Get customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        c.*,
        COUNT(DISTINCT s.id) as total_purchases,
        COALESCE(SUM(s.total_amount), 0) as total_spent,
        MAX(s.created_at) as last_purchase_date
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id
      WHERE c.id = ?
      GROUP BY c.id
    `;

    const customers = await query(query, [id]);

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.json({
      success: true,
      data: customers[0],
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer',
      error: error.message,
    });
  }
};

// Create new customer
export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required',
      });
    }

    // Check if customer with same phone already exists
    const existing = await query(
      'SELECT id FROM customers WHERE phone = ?',
      [phone]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Customer with this phone number already exists',
      });
    }

    const query = `
      INSERT INTO customers (name, email, phone, address, loyalty_points, tier, status)
      VALUES (?, ?, ?, ?, 0, 'bronze', 'active')
    `;

    const result = await query(query, [name, email || null, phone, address || null]);

    // Fetch the created customer
    const newCustomer = await query(
      'SELECT * FROM customers WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: newCustomer[0],
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error.message,
    });
  }
};

// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, status } = req.body;

    // Check if customer exists
    const existing = await query('SELECT id FROM customers WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Check if phone is being changed to an existing phone
    if (phone) {
      const phoneCheck = await query(
        'SELECT id FROM customers WHERE phone = ? AND id != ?',
        [phone, id]
      );

      if (phoneCheck.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Customer with this phone number already exists',
        });
      }
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email || null);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address || null);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    values.push(id);
    const query = `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`;

    await query(query, values);

    // Fetch updated customer
    const updated = await query('SELECT * FROM customers WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: updated[0],
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: error.message,
    });
  }
};

// Delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const existing = await query('SELECT id FROM customers WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Check if customer has sales
    const sales = await query(
      'SELECT COUNT(*) as count FROM sales WHERE customer_id = ?',
      [id]
    );

    if (sales[0].count > 0) {
      // Soft delete - just mark as inactive
      await query('UPDATE customers SET status = ? WHERE id = ?', ['inactive', id]);
      return res.json({
        success: true,
        message: 'Customer deactivated (has purchase history)',
      });
    }

    // Hard delete if no sales
    await query('DELETE FROM customers WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message,
    });
  }
};

// Update customer loyalty points
export const updateLoyaltyPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { points, operation = 'add' } = req.body; // operation: 'add' or 'subtract'

    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid points amount required',
      });
    }

    const customer = await query(
      'SELECT loyalty_points FROM customers WHERE id = ?',
      [id]
    );

    if (customer.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const currentPoints = customer[0].loyalty_points;
    const newPoints = operation === 'add' 
      ? currentPoints + points 
      : Math.max(0, currentPoints - points);

    // Determine tier based on points
    let tier = 'bronze';
    if (newPoints >= 5000) tier = 'platinum';
    else if (newPoints >= 2000) tier = 'gold';
    else if (newPoints >= 500) tier = 'silver';

    await query(
      'UPDATE customers SET loyalty_points = ?, tier = ? WHERE id = ?',
      [newPoints, tier, id]
    );

    res.json({
      success: true,
      message: 'Loyalty points updated successfully',
      data: { points: newPoints, tier },
    });
  } catch (error) {
    console.error('Update loyalty points error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update loyalty points',
      error: error.message,
    });
  }
};

// Get customer statistics
export const getCustomerStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_customers,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_customers,
        SUM(CASE WHEN tier = 'bronze' THEN 1 ELSE 0 END) as bronze_tier,
        SUM(CASE WHEN tier = 'silver' THEN 1 ELSE 0 END) as silver_tier,
        SUM(CASE WHEN tier = 'gold' THEN 1 ELSE 0 END) as gold_tier,
        SUM(CASE WHEN tier = 'platinum' THEN 1 ELSE 0 END) as platinum_tier,
        AVG(loyalty_points) as avg_loyalty_points
      FROM customers
    `;

    const stats = await query(query);

    // Get revenue from customers
    const revenue = await query(`
      SELECT COALESCE(SUM(total_amount), 0) as total_revenue
      FROM sales
    `);

    res.json({
      success: true,
      data: {
        ...stats[0],
        total_revenue: revenue[0].total_revenue,
      },
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer statistics',
      error: error.message,
    });
  }
};

export default {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateLoyaltyPoints,
  getCustomerStats,
};
