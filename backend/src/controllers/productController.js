import * as productService from '../services/productService.js'
import { successResponse, errorResponse } from '../utils/helpers.js'

export const getProducts = async (req, res) => {
  try {
    const { tenantId, role, branchId } = req.user
    const { page = 1, limit = 10, search, categoryId, status,
            sortBy = 'created_at', sortOrder = 'desc', lowStock } = req.query

    const result = await productService.getProducts({
      tenantId,
      branchId: role === 'branch' ? branchId : req.query.branchId,
      page: parseInt(page), limit: parseInt(limit),
      search, categoryId, status, sortBy, sortOrder,
      lowStock: lowStock === 'true',
    })
    return successResponse(res, result, 'Products retrieved successfully')
  } catch (error) {
    console.error('Get products error:', error)
    return errorResponse(res, 'Failed to retrieve products', 500)
  }
}

export const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id, req.user.tenantId)
    if (!product) return errorResponse(res, 'Product not found', 404)
    return successResponse(res, product, 'Product retrieved successfully')
  } catch (error) {
    console.error('Get product by ID error:', error)
    return errorResponse(res, 'Failed to retrieve product', 500)
  }
}

export const createProduct = async (req, res) => {
  try {
    const { tenantId, role, branchId } = req.user
    const productData = {
      ...req.body, tenantId,
      branchId:  role === 'branch' ? branchId : req.body.branchId,
      imageUrl:  req.file ? `/uploads/${req.file.filename}` : null,
    }
    if (!productData.branchId) return errorResponse(res, 'Branch ID is required', 400)
    const product = await productService.createProduct(productData)
    return successResponse(res, product, 'Product created successfully', 201)
  } catch (error) {
    console.error('Create product error:', error)
    return errorResponse(res, error.message || 'Failed to create product', 500)
  }
}

export const updateProduct = async (req, res) => {
  try {
    const { tenantId, role, branchId } = req.user
    const existing = await productService.getProductById(req.params.id, tenantId)
    if (!existing) return errorResponse(res, 'Product not found', 404)
    if (role === 'branch' && existing.branch_id !== branchId)
      return errorResponse(res, 'Unauthorized to update this product', 403)

    const productData = {
      ...req.body,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl,
    }
    const product = await productService.updateProduct(req.params.id, tenantId, productData)
    return successResponse(res, product, 'Product updated successfully')
  } catch (error) {
    console.error('Update product error:', error)
    return errorResponse(res, error.message || 'Failed to update product', 500)
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const { tenantId, role, branchId } = req.user
    const existing = await productService.getProductById(req.params.id, tenantId)
    if (!existing) return errorResponse(res, 'Product not found', 404)
    if (role === 'branch' && existing.branch_id !== branchId)
      return errorResponse(res, 'Unauthorized to delete this product', 403)

    await productService.deleteProduct(req.params.id, tenantId)
    return successResponse(res, null, 'Product deleted successfully')
  } catch (error) {
    console.error('Delete product error:', error)
    return errorResponse(res, error.message || 'Failed to delete product', 500)
  }
}

export const updateStock = async (req, res) => {
  try {
    const { tenantId, role, branchId } = req.user
    const { quantity, type } = req.body

    if (!quantity || !type || !['add', 'subtract'].includes(type))
      return errorResponse(res, 'Invalid stock update data', 400)

    const existing = await productService.getProductById(req.params.id, tenantId)
    if (!existing) return errorResponse(res, 'Product not found', 404)
    if (role === 'branch' && existing.branch_id !== branchId)
      return errorResponse(res, 'Unauthorized to update this product', 403)

    const product = await productService.updateStock(req.params.id, tenantId, quantity, type)
    return successResponse(res, product, 'Stock updated successfully')
  } catch (error) {
    console.error('Update stock error:', error)
    return errorResponse(res, error.message || 'Failed to update stock', 500)
  }
}

export const getCategories = async (req, res) => {
  try {
    const categories = await productService.getCategories(req.user.tenantId)
    return successResponse(res, categories, 'Categories retrieved successfully')
  } catch (error) {
    console.error('Get categories error:', error)
    return errorResponse(res, 'Failed to retrieve categories', 500)
  }
}

export const createCategory = async (req, res) => {
  try {
    const { tenantId } = req.user
    const { name, description } = req.body
    if (!name) return errorResponse(res, 'Category name is required', 400)
    const category = await productService.createCategory(tenantId, { name, description })
    return successResponse(res, category, 'Category created successfully', 201)
  } catch (error) {
    console.error('Create category error:', error)
    return errorResponse(res, error.message || 'Failed to create category', 500)
  }
}

export default {
  getProducts, getProductById, createProduct, updateProduct,
  deleteProduct, updateStock, getCategories, createCategory,
}
