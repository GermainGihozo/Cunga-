import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store, Mail, Lock, Eye, EyeOff, ArrowRight, Star, TrendingUp, Shield } from 'lucide-react'
import { Button } from '@components/common'
import { BRAND_INFO } from '@constants/brand'
import { sellerAuthApi } from '@services/sellerApi'

export default function SellerLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Email and password are required')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await sellerAuthApi.login({ email: form.email, password: form.password })
      const { token, refreshToken, seller, requiresOnboarding } = res.data.data
      localStorage.setItem('seller_token', token)
      localStorage.setItem('seller_refresh_token', refreshToken)
      localStorage.setItem('seller_data', JSON.stringify(seller))
      navigate(requiresOnboarding ? '/seller/onboarding' : '/seller/dashboard')
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Invalid email or password'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors bg-white'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Store size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white">{BRAND_INFO.name}</span>
          </Link>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Welcome back,<br />
            <span className="text-primary-400">Seller</span>
          </h1>
          <p className="text-gray-400 text-lg mb-10">
            Sign in to manage your shop, track orders, and grow your business.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { value: '50K+', label: 'Active Sellers' },
              { value: 'RWF 2B+', label: 'Total Sales' },
              { value: '4.9★', label: 'Avg Rating' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {[
              { icon: <TrendingUp size={16} />, text: 'Live sales & revenue analytics' },
              { icon: <Shield size={16} />, text: 'Secure seller account & payouts' },
              { icon: <Star size={16} />, text: 'Featured placement on Pro plans' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
          <p className="text-gray-300 text-sm italic mb-3">
            "My shop revenue doubled in 3 months after joining Cunga. The dashboard makes tracking everything so easy!"
          </p>
          <div className="flex items-center gap-3">
            <img
              src="https://ui-avatars.com/api/?name=Eric+Nshimiyimana&background=3b82f6&color=fff&size=36"
              alt="Seller"
              className="w-9 h-9 rounded-full"
            />
            <div>
              <p className="text-white text-xs font-semibold">Eric Nshimiyimana</p>
              <p className="text-gray-400 text-xs">Pro Seller · Musanze</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Store size={16} className="text-white" />
            </div>
            <span className="font-bold text-primary-700 text-lg">{BRAND_INFO.name}</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Seller Sign In</h2>
            <p className="text-gray-500 text-sm">
              New seller?{' '}
              <Link to="/seller/register" className="text-primary-600 font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  className={`${inputCls} pl-10`}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link to="/seller/forgot-password" className="text-xs text-primary-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  className={`${inputCls} pl-10 pr-10`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>Sign In to Seller Hub <ArrowRight size={18} /></>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Link to="/login" className="block text-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Sign in as Admin / Staff instead →
          </Link>

          <p className="text-center text-xs text-gray-400 mt-6">
            By signing in you agree to our{' '}
            <Link to="/terms" className="text-primary-600 hover:underline">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
