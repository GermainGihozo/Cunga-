import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Store, User, Mail, Phone, Lock, Eye, EyeOff,
  ArrowRight, ArrowLeft, Check, Zap, Star, Shield,
  TrendingUp, Package, ChevronDown,
} from 'lucide-react'
import { Button } from '@components/common'
import { BRAND_INFO } from '@constants/brand'
import { sellerAuthApi } from '@services/sellerApi'

const PLANS = [
  {
    id: 'free',
    name: 'Basic',
    price: 'Free',
    commission: '8%',
    color: 'border-gray-300',
    activeColor: 'border-primary-500 bg-primary-50',
    icon: <Package size={20} />,
    features: ['Up to 10 products', '8% commission', 'Basic profile'],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 'RWF 15,000/mo',
    commission: '5%',
    color: 'border-gray-300',
    activeColor: 'border-primary-500 bg-primary-50',
    icon: <TrendingUp size={20} />,
    features: ['Up to 100 products', '5% commission', 'Priority support'],
    badge: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'RWF 45,000/mo',
    commission: '3%',
    color: 'border-gray-300',
    activeColor: 'border-accent-500 bg-accent-50',
    icon: <Star size={20} />,
    features: ['Unlimited products', '3% commission', 'Featured listings'],
    badge: 'Most Popular',
  },
]

type Step = 1 | 2 | 3

export default function SellerRegister() {
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>(1)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    shop_name: '',
    shop_category: '',
    shop_description: '',
    plan: 'free',
    agree: false,
  })

  const set = (k: string, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }))

  // ── Step validators ──────────────────────────────────
  const validateStep1 = () => {
    if (!form.full_name.trim()) return 'Full name is required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      return 'Valid email is required'
    if (form.phone && !/^[+0-9\s]{7,15}$/.test(form.phone))
      return 'Enter a valid phone number'
    if (form.password.length < 8)
      return 'Password must be at least 8 characters'
    if (form.password !== form.confirm_password)
      return 'Passwords do not match'
    return ''
  }

  const validateStep2 = () => {
    if (!form.shop_name.trim()) return 'Shop name is required'
    return ''
  }

  const validateStep3 = () => {
    if (!form.agree) return 'You must accept the Terms of Service'
    return ''
  }

  const nextStep = () => {
    const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : ''
    if (err) { setError(err); return }
    setError('')
    setStep((step + 1) as Step)
  }

  const handleSubmit = async () => {
    const err = validateStep3()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    try {
      const res = await sellerAuthApi.register({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        shop_name: form.shop_name,
        plan: form.plan,
      })
      const { token, refreshToken, seller } = res.data.data
      localStorage.setItem('seller_token', token)
      localStorage.setItem('seller_refresh_token', refreshToken)
      localStorage.setItem('seller_data', JSON.stringify(seller))
      navigate('/seller/onboarding')
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Shared input class ───────────────────────────────
  const inputCls =
    'w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors bg-white'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Store size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white">{BRAND_INFO.name}</span>
          </Link>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Start Selling on<br />
            <span className="text-accent-300">{BRAND_INFO.name} Today</span>
          </h1>
          <p className="text-blue-100 text-lg mb-10">
            Join thousands of sellers already growing their business across Rwanda.
          </p>

          <div className="space-y-4">
            {[
              { icon: <Package size={18} />, text: 'List unlimited products (Pro & Enterprise)' },
              { icon: <TrendingUp size={18} />, text: 'Real-time sales analytics dashboard' },
              { icon: <Shield size={18} />, text: 'Secure payments & buyer protection' },
              { icon: <Zap size={18} />, text: 'Start free — no credit card required' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-blue-100">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <img
              src="https://ui-avatars.com/api/?name=Amina+Uwase&background=f97316&color=fff&size=40"
              alt="Seller"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="text-white font-semibold text-sm">Amina Uwase</p>
              <p className="text-blue-200 text-xs">Pro Seller · Kigali</p>
            </div>
            <div className="ml-auto flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className="text-yellow-300 fill-yellow-300" />
              ))}
            </div>
          </div>
          <p className="text-blue-100 text-sm italic">
            "I went from selling at the market to having 300+ online orders per month. Cunga changed everything!"
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Store size={16} className="text-white" />
            </div>
            <span className="font-bold text-primary-700 text-lg">{BRAND_INFO.name}</span>
          </Link>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Seller Account</h2>
          <p className="text-gray-500 text-sm mb-6">
            Already have one?{' '}
            <Link to="/seller/login" className="text-primary-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {(['Your Info', 'Shop Details', 'Choose Plan'] as const).map((label, i) => {
              const n = i + 1
              const done = step > n
              const active = step === n
              return (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                    done ? 'bg-success-500 text-white' : active ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {done ? <Check size={14} /> : n}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? 'text-primary-600' : 'text-gray-400'}`}>
                    {label}
                  </span>
                  {i < 2 && <div className={`flex-1 h-0.5 rounded-full ${step > n ? 'bg-success-400' : 'bg-gray-200'}`} />}
                </div>
              )
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* ── Step 1: Personal Info ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text" placeholder="Jean Pierre Nkurunziza"
                    value={form.full_name} onChange={e => set('full_name', e.target.value)}
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email" placeholder="you@example.com"
                    value={form.email} onChange={e => set('email', e.target.value)}
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel" placeholder="+250 7XX XXX XXX"
                    value={form.phone} onChange={e => set('phone', e.target.value)}
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={form.password} onChange={e => set('password', e.target.value)}
                    className={`${inputCls} pl-10 pr-10`}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Password strength bar */}
                {form.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(n => (
                        <div key={n} className={`flex-1 h-1 rounded-full transition-all ${
                          form.password.length >= n * 2 + 4
                            ? n <= 2 ? 'bg-red-400' : n === 3 ? 'bg-yellow-400' : 'bg-success-400'
                            : 'bg-gray-200'
                        }`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {form.password.length < 6 ? 'Weak' : form.password.length < 10 ? 'Fair' : form.password.length < 14 ? 'Good' : 'Strong'}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)}
                    className={`${inputCls} pl-10 pr-10`}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button onClick={nextStep} className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-bold mt-2 flex items-center justify-center gap-2 active:scale-95 transition-all">
                Continue <ArrowRight size={18} />
              </Button>
            </div>
          )}

          {/* ── Step 2: Shop Details ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Shop / Business Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text" placeholder="e.g. TechHub Kigali"
                    value={form.shop_name} onChange={e => set('shop_name', e.target.value)}
                    className={`${inputCls} pl-10`}
                  />
                </div>
                {form.shop_name && (
                  <p className="text-xs text-gray-400 mt-1">
                    Shop URL: <span className="text-primary-600 font-mono">
                      cunga.rw/shop/{form.shop_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  What do you sell? <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <select
                    value={form.shop_category}
                    onChange={e => set('shop_category', e.target.value)}
                    className={`${inputCls} appearance-none`}
                  >
                    <option value="" disabled>Select your main category</option>
                    {['Electronics', 'Fashion & Clothing', 'Home & Living', 'Beauty & Health',
                      'Sports & Fitness', 'Food & Groceries', 'Automotive', 'Books & Media', 'Other'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Shop Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  rows={3}
                  placeholder="Tell customers what makes your shop special..."
                  value={form.shop_description}
                  onChange={e => set('shop_description', e.target.value)}
                  className={`${inputCls} resize-none`}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.shop_description.length}/300</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => { setError(''); setStep(1) }} variant="outline" className="flex-1 py-3.5 rounded-xl font-semibold border-2 flex items-center justify-center gap-2">
                  <ArrowLeft size={16} /> Back
                </Button>
                <Button onClick={nextStep} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
                  Continue <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Plan ── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-2">Choose a plan to get started. You can upgrade anytime.</p>

              <div className="space-y-3">
                {PLANS.map(plan => (
                  <label
                    key={plan.id}
                    className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.plan === plan.id ? plan.activeColor : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input type="radio" className="sr-only" checked={form.plan === plan.id} onChange={() => set('plan', plan.id)} />

                    {plan.badge && (
                      <span className="absolute -top-2.5 right-4 bg-accent-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {plan.badge}
                      </span>
                    )}

                    {/* Radio dot */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      form.plan === plan.id ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                    }`}>
                      {form.plan === plan.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between">
                        <span className="font-bold text-gray-900">{plan.name}</span>
                        <span className="text-sm font-bold text-primary-600">{plan.price}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {plan.commission} commission per sale · {plan.features[0]}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {/* T&C */}
              <label className="flex items-start gap-3 cursor-pointer mt-2">
                <div
                  onClick={() => set('agree', !form.agree)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    form.agree ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                  }`}
                >
                  {form.agree && <Check size={12} className="text-white" />}
                </div>
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 hover:underline font-semibold">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:underline font-semibold">Privacy Policy</Link>
                </span>
              </label>

              <div className="flex gap-3">
                <Button onClick={() => { setError(''); setStep(2) }} variant="outline" className="flex-1 py-3.5 rounded-xl font-semibold border-2 flex items-center justify-center gap-2">
                  <ArrowLeft size={16} /> Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:opacity-90 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    <><Zap size={16} /> Create Seller Account</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
