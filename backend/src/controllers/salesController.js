import * as salesService from '../services/salesService.js'
import { successResponse, errorResponse } from '../utils/helpers.js'

export const getSales = async (req, res) => {
  try {
    const { tenantId, role, branchId } = req.user
    const { page = 1, limit = 10, startDate, endDate, paymentMethod,
            sortBy = 'created_at', sortOrder = 'desc' } = req.query

    const result = await salesService.getSales({
      tenantId,
      branchId: role === 'branch' ? branchId : req.query.branchId,
      page: parseInt(page), limit: parseInt(limit),
      startDate, endDate, paymentMethod, sortBy, sortOrder,
    })
    return successResponse(res, result, 'Sales retrieved successfully')
  } catch (error) {
    console.error('Get sales error:', error)
    return errorResponse(res, 'Failed to retrieve sales', 500)
  }
}

export const getSaleById = async (req, res) => {
  try {
    const sale = await salesService.getSaleById(req.params.id, req.user.tenantId)
    if (!sale) return errorResponse(res, 'Sale not found', 404)
    return successResponse(res, sale, 'Sale retrieved successfully')
  } catch (error) {
    console.error('Get sale by ID error:', error)
    return errorResponse(res, 'Failed to retrieve sale', 500)
  }
}

export const createSale = async (req, res) => {
  try {
    const { tenantId, role, branchId, id: userId } = req.user
    const { items, paymentMethod, customerName, customerPhone } = req.body

    if (!items || !Array.isArray(items) || items.length === 0)
      return errorResponse(res, 'Sale items are required', 400)
    if (!paymentMethod || !['cash', 'card', 'mobile_money'].includes(paymentMethod))
      return errorResponse(res, 'Valid payment method is required', 400)

    const effectiveBranchId = role === 'branch' ? branchId : req.body.branchId
    if (!effectiveBranchId) return errorResponse(res, 'Branch ID is required', 400)

    const sale = await salesService.createSale({
      tenantId, branchId: effectiveBranchId, userId,
      items, paymentMethod, customerName, customerPhone,
    })
    return successResponse(res, sale, 'Sale created successfully', 201)
  } catch (error) {
    console.error('Create sale error:', error)
    return errorResponse(res, error.message || 'Failed to create sale', 500)
  }
}

export const getReceipt = async (req, res) => {
  try {
    const receipt = await salesService.getReceipt(req.params.id, req.user.tenantId)
    if (!receipt) return errorResponse(res, 'Sale not found', 404)
    return successResponse(res, receipt, 'Receipt retrieved successfully')
  } catch (error) {
    console.error('Get receipt error:', error)
    return errorResponse(res, 'Failed to retrieve receipt', 500)
  }
}

export const getSalesSummary = async (req, res) => {
  try {
    const { tenantId, role, branchId } = req.user
    const { startDate, endDate } = req.query
    const summary = await salesService.getSalesSummary({
      tenantId,
      branchId: role === 'branch' ? branchId : req.query.branchId,
      startDate, endDate,
    })
    return successResponse(res, summary, 'Sales summary retrieved successfully')
  } catch (error) {
    console.error('Get sales summary error:', error)
    return errorResponse(res, 'Failed to retrieve sales summary', 500)
  }
}

export default { getSales, getSaleById, createSale, getReceipt, getSalesSummary }
