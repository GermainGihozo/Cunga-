import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const marketplaceApi = axios.create({
  baseURL: `${BASE}/marketplace`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// ── Types ─────────────────────────────────────────────────
export interface MarketProduct {
  id: number
  name: string
  category: string
  subcategory?: string
  description?: string
  price: number
  old_price?: number
  stock: number
  sold: number
  views: number
  images: string[]
  is_featured: boolean
  is_on_sale: boolean
  created_at: string
  seller_id: number
  shop_name: string
  shop_slug: string
  shop_logo?: string
  province?: string
  district?: string
  avg_rating?: number
  review_count?: number
}

export interface MarketSeller {
  id: number
  shop_name: string
  shop_slug: string
  shop_logo?: string
  shop_banner?: string
  shop_description?: string
  province?: string
  district?: string
  plan: string
  is_verified: boolean
  product_count: number
  total_sold: number
  avg_rating?: number
  review_count?: number
  created_at?: string
}

export interface FeaturedData {
  featured: MarketProduct[]
  flashSale: MarketProduct[]
  newArrivals: MarketProduct[]
  bestSellers: MarketProduct[]
}

export interface ProductListParams {
  search?: string
  category?: string
  min_price?: number
  max_price?: number
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular'
  seller_id?: number
  featured?: '1'
  on_sale?: '1'
  page?: number
  limit?: number
}

export interface PaginatedResult<T> {
  items: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// ── Products ─────────────────────────────────────────────
export const marketplaceService = {
  /** Paginated product listing with filters */
  listProducts: async (params: ProductListParams = {}): Promise<PaginatedResult<MarketProduct>> => {
    const res = await marketplaceApi.get('/products', { params })
    return res.data.data
  },

  /** Full product detail + reviews + related */
  getProduct: async (id: number | string): Promise<{
    product: MarketProduct & { seller_phone?: string; seller_description?: string; address?: string }
    reviews: { id: number; buyer_name: string; rating: number; comment?: string; created_at: string }[]
    related: MarketProduct[]
  }> => {
    const res = await marketplaceApi.get(`/products/${id}`)
    return res.data.data
  },

  /** Homepage featured buckets */
  getFeatured: async (): Promise<FeaturedData> => {
    const res = await marketplaceApi.get('/featured')
    return res.data.data
  },

  /** Category list with product counts */
  getCategories: async (): Promise<{ category: string; product_count: number }[]> => {
    const res = await marketplaceApi.get('/categories')
    return res.data.data
  },

  /** Browse seller shops */
  listSellers: async (params: { search?: string; province?: string; page?: number; limit?: number } = {}): Promise<PaginatedResult<MarketSeller>> => {
    const res = await marketplaceApi.get('/sellers', { params })
    return res.data.data
  },

  /** Seller storefront by slug */
  getSellerStorefront: async (slug: string): Promise<{
    seller: MarketSeller
    products: MarketProduct[]
    reviews: { buyer_name: string; rating: number; comment?: string; created_at: string }[]
  }> => {
    const res = await marketplaceApi.get(`/sellers/${slug}`)
    return res.data.data
  },

  /** Submit a review for a delivered order */
  submitReview: async (data: {
    order_id: number
    seller_id: number
    buyer_name?: string
    rating: number
    comment?: string
  }): Promise<{ id: number }> => {
    const res = await marketplaceApi.post('/reviews', data)
    return res.data.data
  },
}

// ── Checkout ─────────────────────────────────────────────
const checkoutApi = axios.create({
  baseURL: `${BASE}/checkout`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

export interface PlaceOrderPayload {
  product_id: number
  quantity: number
  buyer_name: string
  buyer_phone: string
  buyer_email?: string
  delivery_address: string
  delivery_district?: string
  delivery_province?: string
  delivery_method?: 'standard' | 'express' | 'pickup'
  payment_method?: 'mtn' | 'airtel' | 'card' | 'bank'
}

export interface OrderResult {
  order_id: number
  order_ref: string
  order: {
    id: number
    order_ref: string
    status: string
    payment_status: string
    buyer_name: string
    buyer_phone: string
    delivery_address: string
    delivery_method: string
    delivery_fee: number
    quantity: number
    unit_price: number
    subtotal: number
    product_name: string
    shop_name: string
    created_at: string
  }
  summary: {
    subtotal: number
    delivery_fee: number
    commission_amount: number
    seller_earnings: number
    total: number
  }
}

export interface TrackedOrder {
  id: number
  order_ref: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status: string
  payment_method: string
  buyer_name: string
  buyer_phone: string
  delivery_address: string
  delivery_district?: string
  delivery_province?: string
  delivery_method: string
  delivery_fee: number
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
  updated_at: string
  product_name: string
  product_images: string[]
  shop_name: string
  shop_slug: string
  shop_logo?: string
  seller_phone?: string
}

export const checkoutService = {
  placeOrder: async (payload: PlaceOrderPayload): Promise<OrderResult> => {
    const res = await checkoutApi.post('/place-order', payload)
    return res.data.data
  },

  trackOrder: async (ref: string): Promise<{
    order: TrackedOrder
    timeline: { key: string; label: string; icon: string; done: boolean; active: boolean }[]
  }> => {
    const res = await checkoutApi.get(`/order/${ref}`)
    return res.data.data
  },

  confirmPayment: async (order_ref: string, transaction_id?: string) => {
    const res = await checkoutApi.post('/confirm-payment', { order_ref, transaction_id })
    return res.data.data
  },

  getBuyerOrders: async (phone: string): Promise<TrackedOrder[]> => {
    const res = await checkoutApi.get('/buyer-orders', { params: { phone } })
    return res.data.data
  },
}

export default marketplaceService
