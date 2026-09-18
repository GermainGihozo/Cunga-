import * as dashboardService from '../services/dashboardService.js'
import { query } from '../config/database.js'
import { successResponse, errorResponse } from '../utils/helpers.js'

export const getAdminStats = async (req, res) => {
  try {
    const { tenantId } = req.user
    const stats = await dashboardService.getAdminStats(tenantId)
    return successResponse(res, stats, 'Admin stats retrieved successfully')
  } catch (error) {
    console.error('Get admin stats error:', error)
    return errorResponse(res, 'Failed to retrieve admin stats', 500)
  }
}

export const getBranchStats = async (req, res) => {
  try {
    const { tenantId, branchId } = req.user
    if (!branchId) return errorResponse(res, 'Branch ID is required', 400)
    const stats = await dashboardService.getBranchStats(tenantId, branchId)
    return successResponse(res, stats, 'Branch stats retrieved successfully')
  } catch (error) {
    console.error('Get branch stats error:', error)
    return errorResponse(res, 'Failed to retrieve branch stats', 500)
  }
}

export const getSalesTrend = async (req, res) => {
  try {
    const { tenantId, role, branchId } = req.user
    const { period = '7days' } = req.query
    const filters = { tenantId, period }
    if (role === 'branch' && branchId) filters.branchId = branchId
    const trend = await dashboardService.getSalesTrend(filters)
    return successResponse(res, trend, 'Sales trend retrieved successfully')
  } catch (error) {
    console.error('Get sales trend error:', error)
    return errorResponse(res, 'Failed to retrieve sales trend', 500)
  }
}

export const getTopProducts = async (req, res) => {
  try {
    const { tenantId, role, branchId } = req.user
    const { limit = 5 } = req.query
    const filters = { tenantId, limit: parseInt(limit) }
    if (role === 'branch' && branchId) filters.branchId = branchId
    const products = await dashboardService.getTopProducts(filters)
    return successResponse(res, products, 'Top products retrieved successfully')
  } catch (error) {
    console.error('Get top products error:', error)
    return errorResponse(res, 'Failed to retrieve top products', 500)
  }
}

export const getBranchPerformance = async (req, res) => {
  try {
    const { tenantId } = req.user
    const performance = await dashboardService.getBranchPerformance(tenantId)
    return successResponse(res, performance, 'Branch performance retrieved successfully')
  } catch (error) {
    console.error('Get branch performance error:', error)
    return errorResponse(res, 'Failed to retrieve branch performance', 500)
  }
}

export const getRecentActivities = async (req, res) => {
  try {
    const { tenantId, role, branchId } = req.user
    const { limit = 10 } = req.query
    const filters = { tenantId, limit: parseInt(limit) }
    if (role === 'branch' && branchId) filters.branchId = branchId
    const activities = await dashboardService.getRecentActivities(filters)
    return successResponse(res, activities, 'Recent activities retrieved successfully')
  } catch (error) {
    console.error('Get recent activities error:', error)
    return errorResponse(res, 'Failed to retrieve recent activities', 500)
  }
}

export const getMarketplaceStats = async (req, res) => {
  try {
    const [[sellers]] = await query(`
      SELECT COUNT(*) AS total_sellers,
             SUM(status='active')    AS active_sellers,
             SUM(status='pending')   AS pending_sellers,
             SUM(status='suspended') AS suspended_sellers
      FROM sellers`)

    const [[orders]] = await query(`
      SELECT COUNT(*)                                                          AS total_orders,
             SUM(status='pending')                                             AS pending_orders,
             SUM(status='delivered')                                           AS delivered_orders,
             COALESCE(SUM(commission_amount),0)                               AS total_commission,
             COALESCE(SUM(CASE WHEN status='delivered' THEN commission_amount END),0) AS collected_commission,
             COALESCE(SUM(subtotal),0)                                        AS total_gmv,
             COALESCE(SUM(CASE WHEN status='delivered' THEN subtotal END),0)  AS settled_gmv
      FROM seller_orders`)

    const [[products]] = await query(`
      SELECT COUNT(*)                       AS total_products,
             SUM(status='active')           AS active_products,
             SUM(status='pending_review')   AS pending_review
      FROM seller_products`)

    const [[monthOrders]] = await query(`
      SELECT COALESCE(SUM(commission_amount),0) AS month_commission,
             COALESCE(SUM(subtotal),0)           AS month_gmv,
             COUNT(*)                            AS month_orders
      FROM seller_orders
      WHERE MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW())`)

    return successResponse(res, { sellers, orders, products, monthOrders })
  } catch (error) {
    console.error('Get marketplace stats error:', error)
    return errorResponse(res, 'Failed to retrieve marketplace stats', 500)
  }
}

export default {
  getAdminStats, getBranchStats, getSalesTrend, getTopProducts,
  getBranchPerformance, getRecentActivities, getMarketplaceStats,
}
