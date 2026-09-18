import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Store, Shield, TrendingUp, ArrowRight, ArrowLeft,
  User, Mail, Lock, Eye, EyeOff, Building2, Phone,
  Check, Sparkles,
} from 'lucide-react'
import { BRAND_INFO } from '@constants/brand'
import api from '@services/api'

const PLANS = [
  { id: 'starter',      label: 'Starter',      price: 'Free Trial',         desc: '1 branch · 3 users · 100 products' },
  { id: 'professional', label: 'Professional',  price: 'RWF 79,000/mo',      desc: '5 branches · 15 users · 1000 products', popular: true },
  { id: 'enterprise',   label: 'Enterprise',    price: 'RWF 199,000/mo',     desc: 'Unlimited everything · API access' },
]

type Step = 1 | 2 | 3

export default function Register() {
  const navigate   = useNavigate()
  const [step, setStep]       = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState({
    // Step 1 — Account
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    // Step 2 — Business
    business_name: '',
    phone: '',
    country: 'Rwanda',
    // Step 3 — Plan
    plan: 'starter',
    agree: false,
  })

  const set = (k: string, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }))

  const validate = (): string => {
    if (step === 1) {
      if (!form.full_name.trim()) return 'Full name is required'
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) return 'Valid email is required'
      if (form.password.length < 8) return 'Password must be at least 8 characters'
      if (form.password !== form.confirm_password) return 'Passwords do not match'
    }
    if (step === 2) {
      if (!form.business_name.trim()) return 'Business name is required'
    }
    if (step === 3) {
      if (!form.agree) return 'You must accept the Terms of Service'
    }
    return ''
  }

  const next = () => {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setStep(s => (s + 1) as Step)
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/register', {
        username:      form.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
        email:         form.email,
        password:      form.password,
        role:          'admin',
        business_name: form.business_name,
        phone:         form.phone,
        plan:          form.plan,
      })
      navigate('/login?registered=1')
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors bg-white'

  const STEP_LABELS = ['Your Account', 'Your Business', 'Choose Plan']

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-white to-accent-100 flex">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-accent-500 via-accent-600 to-primary-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-14">
            <img src="/assets/logos/logo-temp.svg" alt={BRAND_INFO.name} className="w-12 h-12" />
            <span className="text-3xl font-bold text-white">{BRAND_INFO.name}</span>
          </Link>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Start Your Free<br />
            <span className="text-yellow-300">14-Day Trial</span>
          </h2>
          <p className="text-white/80 text-lg mb-10">
            No credit card required. Set up in minutes.
          </p>

          <div className="space-y-4">
            {[
              { icon: <TrendingUp size={22} />, title: 'Real-time Analytics', desc: 'Track sales, inventory and profits instantly' },
              { icon: <Store size={22} />,      title: 'Online Storefront',   desc: 'Beautiful store for each of your businesses' },
              { icon: <Shield size={22} />,     title: 'Bank-level Security', desc: 'Your data encrypted and safe at all times' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4 text-white/90">
                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-white">{f.title}</p>
                  <p className="text-sm text-white/70">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 bg-white/10 rounded-2xl p-5 border border-white/20 backdrop-blur-sm">
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-300 text-sm">★</span>
            ))}
          </div>
          <p className="text-white/90 text-sm italic">
            "Cunga cut our inventory management time in half and our sales are up 40%."
          </p>
          <p className="text-white/60 text-xs mt-2">— Jean Baptiste M., Pro Plan · Kigali</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/assets/logos/logo-temp.svg" alt={BRAND_INFO.name} className="w-9 h-9" />
            <span className="font-bold text-primary-700 text-xl">{BRAND_INFO.name}</span>
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create Your Account</h1>
            <p className="text-gray-500 text-sm mt-1">
              Already have one?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center mb-8">
            {STEP_LABELS.map((label, i) => {
              const n = (i + 1) as Step
              const done   = step > n
              const active = step === n
              return (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      done   ? 'bg-success-500 text-white' :
                      active ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' :
                               'bg-gray-200 text-gray-400'
                    }`}>
                      {done ? <Check size={14} /> : n}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block text-center ${
                      active ? 'text-primary-600' : done ? 'text-success-600' : 'text-gray-400'
                    }`}>
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-5 mx-2 rounded-full transition-all ${done ? 'bg-success-400' : 'bg-gray-200'}`} />
                  )}
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

          {/* ── Step 1: Account ── */}
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
                    type="email" placeholder="you@business.rw"
                    value={form.email} onChange={e => set('email', e.target.value)}
                    className={`${inputCls} pl-10`}
                    autoComplete="email"
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
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Strength bar */}
                {form.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(n => (
                        <div key={n} className={`flex-1 h-1 rounded-full transition-all ${
                          form.password.length >= n * 3
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
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.confirm_password.length > 0 && form.password !== form.confirm_password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <button onClick={next}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-bold mt-2 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md">
                Continue <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* ── Step 2: Business ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Business / Organisation Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text" placeholder="e.g. Kigali Electronics Ltd"
                    value={form.business_name} onChange={e => set('business_name', e.target.value)}
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
                <select
                  value={form.country} onChange={e => set('country', e.target.value)}
                  className={inputCls}
                >
                  {['Rwanda', 'Uganda', 'Kenya', 'Tanzania', 'Burundi', 'DRC', 'Other'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => { setError(''); setStep(1) }}
                  className="flex-1 border-2 border-gray-200 py-3.5 rounded-xl font-semibold text-gray-600 hover:border-gray-300 transition-all flex items-center justify-center gap-2">
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={next}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md">
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Plan ── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Choose a plan. All include a 14-day free trial.</p>

              <div className="space-y-3">
                {PLANS.map(plan => (
                  <label
                    key={plan.id}
                    className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.plan === plan.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 right-4 bg-accent-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles size={10} /> Most Popular
                      </span>
                    )}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      form.plan === plan.id ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                    }`}>
                      {form.plan === plan.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <input type="radio" className="sr-only" checked={form.plan === plan.id}
                      onChange={() => set('plan', plan.id)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between">
                        <span className="font-bold text-gray-900">{plan.label}</span>
                        <span className="text-sm font-bold text-primary-600">{plan.price}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{plan.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* T&C */}
              <label className="flex items-start gap-3 cursor-pointer">
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

              <div className="flex gap-3 pt-2">
                <button onClick={() => { setError(''); setStep(2) }}
                  className="flex-1 border-2 border-gray-200 py-3.5 rounded-xl font-semibold text-gray-600 hover:border-gray-300 transition-all flex items-center justify-center gap-2">
                  <ArrowLeft size={16} /> Back
                </button>
                <button
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
                      Creating account…
                    </span>
                  ) : (
                    <><Sparkles size={16} /> Start Free Trial</>
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-gray-400">
                No credit card required · Cancel anytime
              </p>
            </div>
          )}

          {/* Seller CTA */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center mb-3">Want to sell products on Cunga?</p>
            <Link
              to="/seller/register"
              className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Store size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Become a Seller</p>
                  <p className="text-xs text-gray-500">List products and start earning</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
