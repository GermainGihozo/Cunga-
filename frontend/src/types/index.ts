// User types
export enum UserRole {
  ADMIN = 'admin',
  BRANCH = 'branch',
}

export interface User {
  id: number
  username: string
  email?: string
  role: UserRole
  tenantId: number
  branchId?: number
  branchName?: string
}

export interface LoginFormData {
  username: string
  password: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  refreshToken: string | null
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Product types
export interface Product {
  id: number
  tenantId: number
  branchId: number
  branch_id: number
  name: string
  description?: string
  sku?: string
  categoryId?: number
  category_id?: number
  category_name?: string
  costPrice: number
  cost_price: number
  sellingPrice: number
  selling_price: number
  quantity: number
  minStockLevel: number
  min_stock_level: number
  imageUrl?: string
  image_url?: string
  status: 'active' | 'inactive'
  createdAt: string
  created_at: string
  updatedAt: string
  updated_at: string
}

// Sale types
export interface Sale {
  id: number
  tenantId: number
  tenant_id: number
  branchId: number
  branch_id: number
  userId: number
  user_id: number
  totalAmount: number
  total_amount: number
  totalProfit: number
  total_profit: number
  paymentMethod: 'cash' | 'card' | 'mobile_money'
  payment_method: 'cash' | 'card' | 'mobile_money'
  customerName?: string
  customer_name?: string
  customerPhone?: string
  customer_phone?: string
  receiptNumber: string
  receipt_number: string
  createdAt: string
  created_at: string
}

export interface SaleItem {
  id: number
  saleId: number
  sale_id: number
  productId: number
  product_id: number
  productName: string
  product_name: string
  quantity: number
  unitCost: number
  unit_cost: number
  unitPrice: number
  unit_price: number
  totalCost: number
  total_cost: number
  totalPrice: number
  total_price: number
  profit: number
}

// Branch types
export interface Branch {
  id: number
  tenantId: number
  name: string
  location?: string
  contactPerson?: string
  phone?: string
  status: 'active' | 'inactive'
  createdAt: string
}

// Tenant types
export interface Tenant {
  id: number
  businessName: string
  contactEmail: string
  contactPhone: string
  subscriptionPlanId: number
  subscriptionStatus: 'active' | 'inactive' | 'suspended'
  subscriptionExpiry: string
  createdAt: string
}
