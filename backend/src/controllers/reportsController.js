import pool from '../config/database.js';

// Generate sales summary report
export const generateSalesSummary = async (req, res) => {
  try {
    const { dateFrom, dateTo, branchId, format = 'json' } = req.query;

    if (!dateFrom || !dateTo) {
      return res.status(400).json({
        success: false,
        message: 'Date range required (dateFrom and dateTo)',
      });
    }

    let query = `
      SELECT 
        s.*,
        b.name as branch_name,
        c.name as customer_name,
        u.username as cashier_name
      FROM sales s
      LEFT JOIN branches b ON s.branch_id = b.id
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.created_at BETWEEN ? AND ?
    `;

    const params = [dateFrom, dateTo];

    if (branchId) {
      query += ` AND s.branch_id = ?`;
      params.push(branchId);
    }

    query += ` ORDER BY s.created_at DESC`;

    const [sales] = await pool.execute(query, params);

    // Calculate summary statistics
    const summary = {
      total_sales: sales.length,
      total_revenue: sales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0),
      total_profit: sales.reduce((sum, s) => sum + parseFloat(s.profit_amount || 0), 0),
      total_tax: sales.reduce((sum, s) => sum + parseFloat(s.tax_amount || 0), 0),
      avg_transaction: sales.length > 0 ? 
        sales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0) / sales.length : 0,
      payment_methods: {},
    };

    // Group by payment method
    sales.forEach(sale => {
      if (!summary.payment_methods[sale.payment_method]) {
        summary.payment_methods[sale.payment_method] = {
          count: 0,
          total: 0,
        };
      }
      summary.payment_methods[sale.payment_method].count++;
      summary.payment_methods[sale.payment_method].total += parseFloat(sale.total_amount);
    });

    res.json({
      success: true,
      data: {
        summary,
        transactions: sales,
        period: { from: dateFrom, to: dateTo },
      },
    });
  } catch (error) {
    console.error('Generate sales summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales summary report',
      error: error.message,
    });
  }
};

// Generate inventory status report
export const generateInventoryStatus = async (req, res) => {
  try {
    const { branchId, status, category } = req.query;

    let query = `
      SELECT 
        p.*,
        p.quantity * p.cost_price as inventory_value,
        CASE 
          WHEN p.quantity = 0 THEN 'out_of_stock'
          WHEN p.quantity <= p.min_stock_level THEN 'low_stock'
          ELSE 'in_stock'
        END as stock_status
      FROM products p
      WHERE 1=1
    `;

    const params = [];

    if (branchId) {
      query += ` AND p.branch_id = ?`;
      params.push(branchId);
    }

    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }

    if (category) {
      query += ` AND p.category = ?`;
      params.push(category);
    }

    query += ` ORDER BY p.name ASC`;

    const [products] = await pool.execute(query, params);

    // Calculate summary
    const summary = {
      total_products: products.length,
      total_value: products.reduce((sum, p) => sum + parseFloat(p.inventory_value), 0),
      in_stock: products.filter(p => p.stock_status === 'in_stock').length,
      low_stock: products.filter(p => p.stock_status === 'low_stock').length,
      out_of_stock: products.filter(p => p.stock_status === 'out_of_stock').length,
      by_category: {},
    };

    // Group by category
    products.forEach(product => {
      if (!summary.by_category[product.category]) {
        summary.by_category[product.category] = {
          count: 0,
          value: 0,
        };
      }
      summary.by_category[product.category].count++;
      summary.by_category[product.category].value += parseFloat(product.inventory_value);
    });

    res.json({
      success: true,
      data: {
        summary,
        products,
      },
    });
  } catch (error) {
    console.error('Generate inventory status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate inventory status report',
      error: error.message,
    });
  }
};

// Generate financial statement
export const generateFinancialStatement = async (req, res) => {
  try {
    const { dateFrom, dateTo, branchId } = req.query;

    if (!dateFrom || !dateTo) {
      return res.status(400).json({
        success: false,
        message: 'Date range required (dateFrom and dateTo)',
      });
    }

    // Get sales data
    let salesQuery = `
      SELECT 
        SUM(total_amount) as total_revenue,
        SUM(profit_amount) as gross_profit,
        SUM(tax_amount) as total_tax,
        COUNT(*) as transaction_count
      FROM sales
      WHERE status = 'completed'
      AND created_at BETWEEN ? AND ?
    `;

    const params = [dateFrom, dateTo];

    if (branchId) {
      salesQuery += ` AND branch_id = ?`;
      params.push(branchId);
    }

    const [salesData] = await pool.execute(salesQuery, params);

    // Calculate costs (from products sold)
    let costsQuery = `
      SELECT 
        SUM(p.cost_price * si.quantity) as cost_of_goods_sold
      FROM sale_items si
      INNER JOIN products p ON si.product_id = p.id
      INNER JOIN sales s ON si.sale_id = s.id
      WHERE s.status = 'completed'
      AND s.created_at BETWEEN ? AND ?
    `;

    const costParams = [dateFrom, dateTo];

    if (branchId) {
      costsQuery += ` AND s.branch_id = ?`;
      costParams.push(branchId);
    }

    const [costsData] = await pool.execute(costsQuery, costParams);

    const revenue = parseFloat(salesData[0].total_revenue || 0);
    const cogs = parseFloat(costsData[0].cost_of_goods_sold || 0);
    const grossProfit = revenue - cogs;
    const tax = parseFloat(salesData[0].total_tax || 0);
    const netProfit = grossProfit - tax;

    res.json({
      success: true,
      data: {
        period: { from: dateFrom, to: dateTo },
        revenue: {
          total_revenue: revenue,
          transaction_count: salesData[0].transaction_count,
        },
        costs: {
          cost_of_goods_sold: cogs,
          taxes: tax,
          total_costs: cogs + tax,
        },
        profit: {
          gross_profit: grossProfit,
          gross_margin: revenue > 0 ? (grossProfit / revenue * 100).toFixed(2) : 0,
          net_profit: netProfit,
          net_margin: revenue > 0 ? (netProfit / revenue * 100).toFixed(2) : 0,
        },
      },
    });
  } catch (error) {
    console.error('Generate financial statement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate financial statement',
      error: error.message,
    });
  }
};

// Generate customer analysis report
export const generateCustomerAnalysis = async (req, res) => {
  try {
    const { dateFrom, dateTo, tier } = req.query;

    let query = `
      SELECT 
        c.*,
        COUNT(DISTINCT s.id) as purchase_count,
        SUM(s.total_amount) as total_spent,
        AVG(s.total_amount) as avg_purchase,
        MAX(s.created_at) as last_purchase_date,
        MIN(s.created_at) as first_purchase_date
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id AND s.status = 'completed'
    `;

    const params = [];
    const conditions = [];

    if (dateFrom && dateTo) {
      conditions.push('s.created_at BETWEEN ? AND ?');
      params.push(dateFrom, dateTo);
    }

    if (tier) {
      conditions.push('c.tier = ?');
      params.push(tier);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` GROUP BY c.id ORDER BY total_spent DESC`;

    const [customers] = await pool.execute(query, params);

    // Calculate summary
    const summary = {
      total_customers: customers.length,
      active_customers: customers.filter(c => c.status === 'active').length,
      total_revenue: customers.reduce((sum, c) => sum + parseFloat(c.total_spent || 0), 0),
      avg_customer_value: customers.length > 0 ?
        customers.reduce((sum, c) => sum + parseFloat(c.total_spent || 0), 0) / customers.length : 0,
      by_tier: {
        bronze: customers.filter(c => c.tier === 'bronze').length,
        silver: customers.filter(c => c.tier === 'silver').length,
        gold: customers.filter(c => c.tier === 'gold').length,
        platinum: customers.filter(c => c.tier === 'platinum').length,
      },
    };

    res.json({
      success: true,
      data: {
        summary,
        customers,
      },
    });
  } catch (error) {
    console.error('Generate customer analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate customer analysis report',
      error: error.message,
    });
  }
};

// Generate product performance report
export const generateProductPerformance = async (req, res) => {
  try {
    const { dateFrom, dateTo, branchId, category } = req.query;

    if (!dateFrom || !dateTo) {
      return res.status(400).json({
        success: false,
        message: 'Date range required (dateFrom and dateTo)',
      });
    }

    let query = `
      SELECT 
        p.id,
        p.name,
        p.category,
        p.selling_price,
        p.cost_price,
        p.quantity as current_stock,
        COUNT(si.id) as times_sold,
        SUM(si.quantity) as units_sold,
        SUM(si.subtotal) as total_revenue,
        SUM(si.subtotal - (p.cost_price * si.quantity)) as total_profit,
        AVG(si.unit_price) as avg_selling_price
      FROM products p
      LEFT JOIN sale_items si ON p.id = si.product_id
      LEFT JOIN sales s ON si.sale_id = s.id
      WHERE s.status = 'completed'
      AND s.created_at BETWEEN ? AND ?
    `;

    const params = [dateFrom, dateTo];

    if (branchId) {
      query += ` AND s.branch_id = ?`;
      params.push(branchId);
    }

    if (category) {
      query += ` AND p.category = ?`;
      params.push(category);
    }

    query += ` GROUP BY p.id ORDER BY total_revenue DESC`;

    const [products] = await pool.execute(query, params);

    // Calculate summary
    const summary = {
      total_products: products.length,
      total_revenue: products.reduce((sum, p) => sum + parseFloat(p.total_revenue || 0), 0),
      total_profit: products.reduce((sum, p) => sum + parseFloat(p.total_profit || 0), 0),
      units_sold: products.reduce((sum, p) => sum + parseInt(p.units_sold || 0), 0),
      top_performer: products[0] || null,
    };

    res.json({
      success: true,
      data: {
        summary,
        products,
        period: { from: dateFrom, to: dateTo },
      },
    });
  } catch (error) {
    console.error('Generate product performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate product performance report',
      error: error.message,
    });
  }
};

export default {
  generateSalesSummary,
  generateInventoryStatus,
  generateFinancialStatement,
  generateCustomerAnalysis,
  generateProductPerformance,
};
