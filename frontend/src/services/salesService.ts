import api from './api'
import { ApiResponse, PaginatedResponse, Sale, SaleItem } from '@types'

export interface SaleFilters {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  paymentMethod?: 'cash' | 'card' | 'mobile_money'
  branchId?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CartItem {
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface SaleFormData {
  items: { productId: number; quantity: number }[]
  paymentMethod: 'cash' | 'card' | 'mobile_money'
  customerName?: string
  customerPhone?: string
  branchId?: number
}

export interface SaleWithItems extends Sale {
  items: SaleItem[]
  branch_name?: string
  user_name?: string
}

export interface Receipt {
  sale: SaleWithItems
  business: {
    business_name: string
    contact_email: string
    contact_phone: string
  }
  branch: {
    name: string
    location?: string
    phone?: string
  }
}

export interface SalesSummary {
  total_sales: number
  total_revenue: number
  total_profit: number
  average_sale: number
  unique_customers: number
  paymentBreakdown: {
    payment_method: string
    count: number
    amount: number
  }[]
}

const salesService = {
  // Get all sales with filters
  getSales: async (filters: SaleFilters = {}): Promise<PaginatedResponse<Sale>> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    const response = await api.get<ApiResponse<PaginatedResponse<Sale>>>(
      `/sales?${params.toString()}`
    )
    return response.data.data!
  },

  // Get sale by ID
  getSaleById: async (id: number): Promise<SaleWithItems> => {
    const response = await api.get<ApiResponse<SaleWithItems>>(`/sales/${id}`)
    return response.data.data!
  },

  // Create sale
  createSale: async (saleData: SaleFormData): Promise<SaleWithItems> => {
    const response = await api.post<ApiResponse<SaleWithItems>>('/sales', saleData)
    return response.data.data!
  },

  // Get receipt
  getReceipt: async (id: number): Promise<Receipt> => {
    const response = await api.get<ApiResponse<Receipt>>(`/sales/${id}/receipt`)
    return response.data.data!
  },

  // Get sales summary
  getSalesSummary: async (filters: {
    startDate?: string
    endDate?: string
    branchId?: number
  } = {}): Promise<SalesSummary> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    const response = await api.get<ApiResponse<SalesSummary>>(
      `/sales/summary?${params.toString()}`
    )
    return response.data.data!
  },
}

export default salesService
