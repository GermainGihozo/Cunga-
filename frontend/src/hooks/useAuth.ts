import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './index'
import { setCredentials, logout as logoutAction } from '@store/slices/authSlice'
import authService from '@services/authService'
import { UserRole } from '@types'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, token, isAuthenticated } = useAppSelector(state => state.auth)

  /**
   * Login user
   */
  const login = useCallback(
    async (credentials: { username: string; password: string }) => {
      try {
        const data = await authService.login(credentials)
        dispatch(setCredentials({ 
          user: data.user, 
          token: data.token,
          refreshToken: data.refreshToken 
        }))
        
        // Redirect based on role
        if (data.user.role === UserRole.ADMIN) {
          navigate('/admin/dashboard')
        } else {
          navigate('/branch/dashboard')
        }
        
        return data
      } catch (error: any) {
        throw error
      }
    },
    [dispatch, navigate]
  )

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      dispatch(logoutAction())
      navigate('/login')
    }
  }, [dispatch, navigate])

  /**
   * Register new user
   */
  const register = useCallback(
    async (userData: any) => {
      try {
        const data = await authService.register(userData)
        dispatch(setCredentials({ 
          user: data.user, 
          token: data.token,
          refreshToken: data.refreshToken 
        }))
        navigate('/branch/dashboard')
        return data
      } catch (error: any) {
        throw error
      }
    },
    [dispatch, navigate]
  )

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback(
    (role: UserRole) => {
      return user?.role === role
    },
    [user]
  )

  /**
   * Check if user is admin
   */
  const isAdmin = useCallback(() => {
    return user?.role === UserRole.ADMIN
  }, [user])

  /**
   * Check if user is branch user
   */
  const isBranch = useCallback(() => {
    return user?.role === UserRole.BRANCH
  }, [user])

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    register,
    hasRole,
    isAdmin,
    isBranch,
  }
}
