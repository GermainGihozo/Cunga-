import { query as dbQuery } from '../config/database.js'

export const getAdminStats = async (tenantId) => {
  const [[todayRev]]    = await dbQuery(`SELECT COALESCE(SUM(total_amount),0) AS v FROM sales WHERE tenant_id=? AND DATE(created_at)=CURDATE()`, [tenantId])
  const [[monthRev]]    = await dbQuery(`SELECT COALESCE(SUM(total_amount),0) AS v FROM sales WHERE tenant_id=? AND MONTH(created_at)=MONTH(CURDATE()) AND YEAR(created_at)=YEAR(CURDATE())`, [tenantId])
  const [[monthProfit]] = await dbQuery(`SELECT COALESCE(SUM(total_profit),0) AS v FROM sales WHERE tenant_id=? AND MONTH(created_at)=MONTH(CURDATE()) AND YEAR(created_at)=YEAR(CURDATE())`, [tenantId])
  const [[products]]    = await dbQuery(`SELECT COUNT(*) AS v FROM products WHERE tenant_id=?`, [tenantId])
  const [[branches]]    = await dbQuery(`SELECT COUNT(*) AS v FROM branches WHERE tenant_id=? AND is_active=1`, [tenantId])
  const [[users]]       = await dbQuery(`SELECT COUNT(*) AS v FROM users WHERE tenant_id=?`, [tenantId])
  const [[salesCount]]  = await dbQuery(`SELECT COUNT(*) AS v FROM sales WHERE tenant_id=? AND MONTH(created_at)=MONTH(CURDATE()) AND YEAR(created_at)=YEAR(CURDATE())`, [tenantId])
  const [[lowStock]]    = await dbQuery(`SELECT COUNT(*) AS v FROM products WHERE tenant_id=? AND quantity <= min_stock_level`, [tenantId])
  const [[lastMonth]]   = await dbQuery(`SELECT COALESCE(SUM(total_amount),0) AS v FROM sales WHERE tenant_id=? AND MONTH(created_at)=MONTH(DATE_SUB(CURDATE(),INTERVAL 1 MONTH)) AND YEAR(created_at)=YEAR(DATE_SUB(CURDATE(),INTERVAL 1 MONTH))`, [tenantId])

  const growth = lastMonth.v > 0 ? +((monthRev.v - lastMonth.v) / lastMonth.v * 100).toFixed(1) : 0

  return {
    todayRevenue:   +todayRev.v,
    monthRevenue:   +monthRev.v,
    monthProfit:    +monthProfit.v,
    totalProducts:  products.v,
    totalBranches:  branches.v,
    totalUsers:     users.v,
    salesCount:     salesCount.v,
    lowStockCount:  lowStock.v,
    revenueGrowth:  growth,
  }
}

export const getBranchStats = async (tenantId, branchId) => {
  const [[today]]   = await dbQuery(`SELECT COALESCE(SUM(total_amount),0) AS rev, COUNT(*) AS cnt FROM sales WHERE tenant_id=? AND branch_id=? AND DATE(created_at)=CURDATE()`, [tenantId, branchId])
  const [[month]]   = await dbQuery(`SELECT COALESCE(SUM(total_amount),0) AS rev, COALESCE(SUM(total_profit),0) AS profit, COUNT(*) AS cnt FROM sales WHERE tenant_id=? AND branch_id=? AND MONTH(created_at)=MONTH(CURDATE()) AND YEAR(created_at)=YEAR(CURDATE())`, [tenantId, branchId])
  const [[prods]]   = await dbQuery(`SELECT COUNT(*) AS v FROM products WHERE tenant_id=? AND branch_id=?`, [tenantId, branchId])
  const [[low]]     = await dbQuery(`SELECT COUNT(*) AS v FROM products WHERE tenant_id=? AND branch_id=? AND quantity<=min_stock_level`, [tenantId, branchId])
  const [[pending]] = await dbQuery(`SELECT COUNT(*) AS v FROM online_product_requests WHERE tenant_id=? AND branch_id=? AND status='pending'`, [tenantId, branchId])

  return {
    todayRevenue:    +today.rev,
    todaySalesCount: today.cnt,
    monthRevenue:    +month.rev,
    monthProfit:     +month.profit,
    monthSalesCount: month.cnt,
    totalProducts:   prods.v,
    lowStockCount:   low.v,
    pendingRequests: pending.v,
  }
}

export const getSalesTrend = async (filters) => {
  const { tenantId, branchId, period } = filters
  const branchClause = branchId ? 'AND branch_id = ?' : ''
  const p = branchId ? [tenantId, branchId] : [tenantId]

  let sql
  if (period === '12months') {
    sql = `SELECT DATE_FORMAT(created_at,'%Y-%m') AS date,
                  COALESCE(SUM(total_amount),0) AS revenue,
                  COALESCE(SUM(total_profit),0) AS profit, COUNT(*) AS salesCount
           FROM sales WHERE tenant_id=? ${branchClause}
           AND created_at>=DATE_SUB(CURDATE(),INTERVAL 12 MONTH)
           GROUP BY DATE_FORMAT(created_at,'%Y-%m') ORDER BY date`
  } else if (period === '30days') {
    sql = `SELECT DATE(created_at) AS date,
                  COALESCE(SUM(total_amount),0) AS revenue,
                  COALESCE(SUM(total_profit),0) AS profit, COUNT(*) AS salesCount
           FROM sales WHERE tenant_id=? ${branchClause}
           AND created_at>=DATE_SUB(CURDATE(),INTERVAL 30 DAY)
           GROUP BY DATE(created_at) ORDER BY date`
  } else {
    sql = `SELECT DATE(created_at) AS date,
                  COALESCE(SUM(total_amount),0) AS revenue,
                  COALESCE(SUM(total_profit),0) AS profit, COUNT(*) AS salesCount
           FROM sales WHERE tenant_id=? ${branchClause}
           AND created_at>=DATE_SUB(CURDATE(),INTERVAL 7 DAY)
           GROUP BY DATE(created_at) ORDER BY date`
  }

  const rows = await dbQuery(sql, p)
  return rows.map(r => ({ date: r.date, revenue: +r.revenue, profit: +r.profit, salesCount: r.salesCount }))
}

export const getTopProducts = async (filters) => {
  const { tenantId, branchId, limit } = filters
  const branchClause = branchId ? 'AND p.branch_id = ?' : ''
  const params = branchId ? [tenantId, branchId, limit] : [tenantId, limit]

  const rows = await dbQuery(
    `SELECT p.id, p.name, p.sku,
            COALESCE(SUM(si.quantity),0) AS unitsSold,
            COALESCE(SUM(si.total_price),0) AS revenue,
            COALESCE(SUM(si.profit),0) AS profit
     FROM products p
     LEFT JOIN sale_items si ON p.id = si.product_id
     LEFT JOIN sales s ON si.sale_id = s.id AND s.created_at>=DATE_SUB(CURDATE(),INTERVAL 30 DAY)
     WHERE p.tenant_id=? ${branchClause}
     GROUP BY p.id, p.name, p.sku
     ORDER BY revenue DESC LIMIT ?`,
    params
  )
  return rows.map(r => ({ id: r.id, name: r.name, sku: r.sku, unitsSold: r.unitsSold, revenue: +r.revenue, profit: +r.profit }))
}

export const getBranchPerformance = async (tenantId) => {
  const rows = await dbQuery(
    `SELECT b.id, b.name, b.location,
            COALESCE(SUM(s.total_amount),0) AS revenue,
            COALESCE(SUM(s.total_profit),0) AS profit,
            COUNT(s.id) AS salesCount
     FROM branches b
     LEFT JOIN sales s ON b.id=s.branch_id AND s.created_at>=DATE_SUB(CURDATE(),INTERVAL 30 DAY)
     WHERE b.tenant_id=? AND b.is_active=1
     GROUP BY b.id, b.name, b.location
     ORDER BY revenue DESC`,
    [tenantId]
  )
  return rows.map(r => ({ id: r.id, name: r.name, location: r.location, revenue: +r.revenue, profit: +r.profit, salesCount: r.salesCount }))
}

export const getRecentActivities = async (filters) => {
  const { tenantId, branchId, limit } = filters
  const branchClause = branchId ? 'AND al.branch_id = ?' : ''
  const params = branchId ? [tenantId, branchId, limit] : [tenantId, limit]

  return dbQuery(
    `SELECT al.id, al.action, al.description, al.created_at, u.username
     FROM activity_logs al JOIN users u ON al.user_id=u.id
     WHERE al.tenant_id=? ${branchClause}
     ORDER BY al.created_at DESC LIMIT ?`,
    params
  )
}

export default { getAdminStats, getBranchStats, getSalesTrend, getTopProducts, getBranchPerformance, getRecentActivities }
