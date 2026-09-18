import api from './api'
import { ApiResponse } from '@types'

export interface AdminStats {
  todayRevenue: number
  monthRevenue: number
  monthProfit: number
  totalProducts: number
  totalBranches: number
  totalUsers: number
  salesCount: number
  lowStockCount: number
  revenueGrowth: number
}

export interface MarketplaceStats {
  sellers: {
    total_sellers: number
    active_sellers: number
    pending_sellers: number
    suspended_sellers: number
  }
  orders: {
    total_orders: number
    pending_orders: number
    delivered_orders: number
    total_commission: number
    collected_commission: number
    total_gmv: number
    settled_gmv: number
  }
  products: {
    total_products: number
    active_products: number
    pending_review: number
  }
  monthOrders: {
    month_commission: number
    month_gmv: number
    month_orders: number
  }
}

export interface BranchStats {
  todayRevenue: number
  todaySalesCount: number
  monthRevenue: number
  monthProfit: number
  monthSalesCount: number
  totalProducts: number
  lowStockCount: number
  pendingRequests: number
}

export interface SalesTrendData {
  date: string
  revenue: number
  profit: number
  salesCount: number
}

export interface TopProduct {
  id: number
  name: string
  sku: string
  unitsSold: number
  revenue: number
  profit: number
}

export interface BranchPerformance {
  id: number
  name: string
  location: string
  revenue: number
  profit: number
  salesCount: number
}

export interface Activity {
  id: number
  action: string
  description: string
  created_at: string
  username: string
}

const dashboardService = {
  // Admin endpoints
  getAdminStats: async (): Promise<AdminStats> => {
    const response = await api.get<ApiResponse<AdminStats>>('/dashboard/admin/stats')
    return response.data.data!
  },

  getBranchPerformance: async (): Promise<BranchPerformance[]> => {
    const response = await api.get<ApiResponse<BranchPerformance[]>>('/dashboard/admin/branch-performance')
    return response.data.data!
  },

  getMarketplaceStats: async (): Promise<MarketplaceStats> => {
    const response = await api.get<ApiResponse<MarketplaceStats>>('/dashboard/admin/marketplace/stats')
    return response.data.data!
  },

  // Branch endpoints
  getBranchStats: async (): Promise<BranchStats> => {
    const response = await api.get<ApiResponse<BranchStats>>('/dashboard/branch/stats')
    return response.data.data!
  },

  // Shared endpoints
  getSalesTrend: async (period: '7days' | '30days' | '12months' = '7days'): Promise<SalesTrendData[]> => {
    const response = await api.get<ApiResponse<SalesTrendData[]>>(`/dashboard/sales-trend?period=${period}`)
    return response.data.data!
  },

  getTopProducts: async (limit: number = 5): Promise<TopProduct[]> => {
    const response = await api.get<ApiResponse<TopProduct[]>>(`/dashboard/top-products?limit=${limit}`)
    return response.data.data!
  },

  getRecentActivities: async (limit: number = 10): Promise<Activity[]> => {
    const response = await api.get<ApiResponse<Activity[]>>(`/dashboard/recent-activities?limit=${limit}`)
    return response.data.data!
  },
}

export default dashboardService
