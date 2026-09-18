import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const sellerApi = axios.create({
  baseURL: `${BASE}/seller`,
  headers: { 'Content-Type': 'application/json' },
})

// ── Helpers ───────────────────────────────────────────────
const clearSellerSession = () => {
  localStorage.removeItem('seller_token')
  localStorage.removeItem('seller_refresh_token')
  localStorage.removeItem('seller_data')
}

const redirectToLogin = () => {
  clearSellerSession()
  window.location.href = '/seller/login'
}

// ── Request: attach token ─────────────────────────────────
sellerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('seller_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response: refresh on 401, clear on failure ────────────
let isRefreshing = false
let failedQueue: { resolve: (t: string) => void; reject: (e: unknown) => void }[] = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(p => (token ? p.resolve(token) : p.reject(error)))
  failedQueue = []
}

sellerApi.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config

    // Only attempt refresh on 401, and only once per request
    if (err.response?.status !== 401 || original._sellerRetry) {
      return Promise.reject(err)
    }

    const refreshToken = localStorage.getItem('seller_refresh_token')
    if (!refreshToken) {
      redirectToLogin()
      return Promise.reject(err)
    }

    if (isRefreshing) {
      // Queue this request until the refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(sellerApi(original))
          },
          reject,
        })
      })
    }

    original._sellerRetry = true
    isRefreshing = true

    try {
      // Call the seller refresh endpoint
      const res = await axios.post(
        `${BASE}/seller/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      )

      const newToken: string = res.data?.data?.token
      if (!newToken) throw new Error('No token in refresh response')

      // Persist new token
      localStorage.setItem('seller_token', newToken)

      // Update Authorization header for queued + current requests
      sellerApi.defaults.headers.common.Authorization = `Bearer ${newToken}`
      original.headers.Authorization = `Bearer ${newToken}`

      processQueue(null, newToken)
      return sellerApi(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      redirectToLogin()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

// ── Auth ──────────────────────────────────────────────────
export const sellerAuthApi = {
  register: (data: {
    full_name: string
    email: string
    phone?: string
    password: string
    shop_name: string
    plan: string
  }) => sellerApi.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    sellerApi.post('/auth/login', data),

  logout: (refreshToken: string) =>
    sellerApi.post('/auth/logout', { refreshToken }),

  me: () => sellerApi.get('/auth/me'),

  updateProfile: (data: Record<string, unknown>) =>
    sellerApi.put('/auth/profile', data),
}

// ── Products ─────────────────────────────────────────────
export const sellerProductsApi = {
  list: (params?: { status?: string; search?: string; page?: number }) =>
    sellerApi.get('/products', { params }),

  create: (data: Record<string, unknown>) =>
    sellerApi.post('/products', data),

  update: (id: number, data: Record<string, unknown>) =>
    sellerApi.put(`/products/${id}`, data),

  remove: (id: number) =>
    sellerApi.delete(`/products/${id}`),
}

// ── Orders ───────────────────────────────────────────────
export const sellerOrdersApi = {
  list: (params?: { status?: string; page?: number }) =>
    sellerApi.get('/orders', { params }),

  updateStatus: (id: string | number, status: string) =>
    sellerApi.patch(`/orders/${id}/status`, { status }),
}

// ── Analytics ────────────────────────────────────────────
export const sellerAnalyticsApi = {
  summary: () => sellerApi.get('/analytics'),
}

export default sellerApi
