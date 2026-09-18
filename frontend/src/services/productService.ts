import api from './api'
import { ApiResponse, PaginatedResponse, Product } from '@types'

export interface ProductFilters {
  page?: number
  limit?: number
  search?: string
  categoryId?: number
  branchId?: number
  status?: 'active' | 'inactive'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  lowStock?: boolean
}

export interface ProductFormData {
  name: string
  description?: string
  sku?: string
  categoryId?: number
  costPrice: number
  sellingPrice: number
  quantity: number
  minStockLevel?: number
  status?: 'active' | 'inactive'
  branchId?: number
  image?: File
}

export interface Category {
  id: number
  tenant_id: number
  name: string
  description?: string
  created_at: string
}

const productService = {
  // Get all products with filters
  getProducts: async (filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    const response = await api.get<ApiResponse<PaginatedResponse<Product>>>(
      `/products?${params.toString()}`
    )
    return response.data.data!
  },

  // Get product by ID
  getProductById: async (id: number): Promise<Product> => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`)
    return response.data.data!
  },

  // Create product
  createProduct: async (productData: ProductFormData): Promise<Product> => {
    const formData = new FormData()
    
    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'image' && value instanceof File) {
          formData.append('image', value)
        } else {
          formData.append(key, value.toString())
        }
      }
    })

    const response = await api.post<ApiResponse<Product>>('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data!
  },

  // Update product
  updateProduct: async (id: number, productData: Partial<ProductFormData>): Promise<Product> => {
    const formData = new FormData()
    
    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'image' && value instanceof File) {
          formData.append('image', value)
        } else {
          formData.append(key, value.toString())
        }
      }
    })

    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data!
  },

  // Delete product
  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`)
  },

  // Update stock
  updateStock: async (id: number, quantity: number, type: 'add' | 'subtract'): Promise<Product> => {
    const response = await api.patch<ApiResponse<Product>>(`/products/${id}/stock`, {
      quantity,
      type,
    })
    return response.data.data!
  },

  // Get categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/products/categories/list')
    return response.data.data!
  },

  // Create category
  createCategory: async (name: string, description?: string): Promise<Category> => {
    const response = await api.post<ApiResponse<Category>>('/products/categories', {
      name,
      description,
    })
    return response.data.data!
  },
}

export default productService
