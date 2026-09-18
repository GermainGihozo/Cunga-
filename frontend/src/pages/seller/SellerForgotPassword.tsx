import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Check, Store } from 'lucide-react'
import { Button } from '@components/common'
import { BRAND_INFO } from '@constants/brand'
import sellerApiDefault from '@services/sellerApi'

export default function SellerForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    setError('')
    setLoading(true)
    try {
      // Backend endpoint — gracefully handles unknown emails (doesn't leak user existence)
      await sellerApiDefault.post('/auth/forgot-password', { email })
    } catch {
      // Silently succeed even on errors to prevent email enumeration
    } finally {
      setLoading(false)
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <img src="/assets/logos/logo-temp.svg" alt={BRAND_INFO.name} className="w-10 h-10" />
            <span className="text-xl font-bold text-primary-700">{BRAND_INFO.name}</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {sent ? (
            /* Success state */
            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <Check size={32} className="text-success-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                If an account exists for <span className="font-semibold text-gray-700">{email}</span>,
                you'll receive a password reset link within a few minutes.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Didn't get it? Check your spam folder or try again.
              </p>
              <div className="flex flex-col gap-3">
                <Link to="/seller/login">
                  <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold">
                    Back to Sign In
                  </Button>
                </Link>
                <button
                  onClick={() => setSent(false)}
                  className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
                >
                  Try a different email
                </button>
              </div>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Store size={20} className="text-primary-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Reset your password</h1>
                  <p className="text-xs text-gray-500">Seller Hub account recovery</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                Enter the email address associated with your seller account and we'll send you a reset link.
              </p>

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
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Sending...
                    </span>
                  ) : 'Send Reset Link'}
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Footer links */}
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-400">
          <Link to="/seller/login" className="flex items-center gap-1.5 hover:text-primary-600 transition-colors">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
          <span>·</span>
          <Link to="/seller/register" className="hover:text-primary-600 transition-colors">
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}
