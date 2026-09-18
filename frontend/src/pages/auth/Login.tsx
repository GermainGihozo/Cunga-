import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Store, Lock, User as UserIcon, ArrowRight, Sparkles, Shield, TrendingUp } from 'lucide-react'
import { useAuth } from '@hooks/useAuth'
import { LoginFormData } from '@types'
import { BRAND_INFO } from '@constants/brand'

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const Login = () => {
  const { login, loading } = useAuth()
  const [searchParams] = useSearchParams()
  const justRegistered = searchParams.get('registered') === '1'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
    } catch (error) {
      // Error handling is done in useAuth hook
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-white to-accent-100 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <img 
              src="/assets/logos/logo-temp.svg" 
              alt={BRAND_INFO.name}
              className="w-12 h-12"
            />
            <span className="text-3xl font-display font-bold text-white">
              {BRAND_INFO.name}
            </span>
          </div>

          {/* Hero Content */}
          <div className="max-w-md">
            <h2 className="text-5xl font-display font-bold text-white mb-6 leading-tight">
              Manage Your Business with{' '}
              <span className="bg-gradient-to-r from-accent-300 to-accent-100 bg-clip-text text-transparent">
                Confidence
              </span>
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              {BRAND_INFO.tagline}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4 text-white/90">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-white">Real-time Analytics</h3>
              <p className="text-sm text-white/80">Track sales and inventory instantly</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white/90">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-white">Secure & Reliable</h3>
              <p className="text-sm text-white/80">Your data is safe with us</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white/90">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-white">Easy to Use</h3>
              <p className="text-sm text-white/80">Intuitive interface for everyone</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-4">
              <img 
                src="/assets/logos/logo-temp.svg" 
                alt={BRAND_INFO.name}
                className="w-12 h-12"
              />
              <span className="text-3xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
                {BRAND_INFO.name}
              </span>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>

          {/* Registration success banner */}
          {justRegistered && (
            <div className="mb-5 px-4 py-3 bg-success-50 border border-success-200 rounded-xl text-sm text-success-700 font-medium flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Account created! Sign in with your new credentials.
            </div>
          )}

          {/* Login Form */}
          <div className="card-hover bg-white shadow-xl animate-slide-in">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500">
                    <UserIcon size={20} />
                  </div>
                  <input
                    {...register('username')}
                    type="text"
                    id="username"
                    className="input-field pl-11 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your username"
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
                {errors.username && (
                  <p className="text-error-500 text-sm mt-1 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-error-500 rounded-full" />
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500">
                    <Lock size={20} />
                  </div>
                  <input
                    {...register('password')}
                    type="password"
                    id="password"
                    className="input-field pl-11 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                </div>
                {errors.password && (
                  <p className="text-error-500 text-sm mt-1 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-error-500 rounded-full" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer" 
                  />
                  <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    Remember me
                  </span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-medium bg-gradient-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 text-lg font-semibold shadow-cunga hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                        fill="none"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl border-2 border-primary-200">
              <p className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Sparkles size={16} className="text-primary-600" />
                Demo Credentials
              </p>
              <div className="text-xs text-gray-700 space-y-1.5">
                <p className="flex items-center gap-2">
                  <span className="text-gray-600">Admin:</span>
                  <code className="font-mono bg-white px-2 py-1 rounded border border-primary-200 font-semibold">admin_demo</code>
                  <span className="text-gray-400">/</span>
                  <code className="font-mono bg-white px-2 py-1 rounded border border-primary-200 font-semibold">password123</code>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-gray-600">Branch:</span>
                  <code className="font-mono bg-white px-2 py-1 rounded border border-primary-200 font-semibold">branch_demo</code>
                  <span className="text-gray-400">/</span>
                  <code className="font-mono bg-white px-2 py-1 rounded border border-primary-200 font-semibold">password123</code>
                </p>
              </div>
            </div>

            {/* Sign Up / Seller Links */}
            <div className="mt-6 space-y-3">
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-semibold bg-gradient-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                  >
                    Sign up for free →
                  </Link>
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Seller login CTA */}
              <Link
                to="/seller/login"
                className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-accent-50 to-primary-50 border-2 border-primary-200 rounded-xl hover:border-primary-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Store size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Seller Hub</p>
                    <p className="text-xs text-gray-500">Sign in to your seller dashboard</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-primary-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-2 font-medium group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
