import api from './api'
import { User, LoginFormData } from '@types'

interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

/** Transform snake_case DB fields → camelCase User shape */
const normalizeUser = (raw: Record<string, unknown>): User => ({
  ...raw,
  id:          raw.id          as number,
  username:    raw.username    as string,
  email:       raw.email       as string | undefined,
  role:        raw.role        as string,
  // snake_case aliases → camelCase
  tenantId:    (raw.tenantId   ?? raw.tenant_id)   as number,
  branchId:    (raw.branchId   ?? raw.branch_id)   as number | null,
  branchName:  (raw.branchName ?? raw.branch_name) as string | undefined,
  tenantName:  (raw.tenantName ?? raw.tenant_name) as string | undefined,
  isActive:    (raw.isActive   ?? raw.is_active)   as boolean,
} as User)

/** Login user */
export const login = async (credentials: LoginFormData): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', credentials)
  const data = response.data.data
  return { ...data, user: normalizeUser(data.user) }
}

/** Register new user */
export const register = async (userData: unknown): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', userData)
  const data = response.data.data
  return { ...data, user: normalizeUser(data.user) }
}

/** Logout user */
export const logout = async (refreshToken: string): Promise<void> => {
  await api.post('/auth/logout', { refreshToken })
}

/** Refresh access token */
export const refreshToken = async (token: string): Promise<string> => {
  const response = await api.post('/auth/refresh', { refreshToken: token })
  return response.data.data.token
}

/** Get current user profile */
export const getProfile = async (): Promise<User> => {
  const response = await api.get('/auth/me')
  return normalizeUser(response.data.data)
}

/** Update user profile */
export const updateProfile = async (data: unknown): Promise<User> => {
  const response = await api.put('/auth/profile', data)
  return normalizeUser(response.data.data)
}

export default {
  login,
  register,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
}
