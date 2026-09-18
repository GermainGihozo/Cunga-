import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Store, MapPin, CreditCard, Check, ArrowRight, ArrowLeft,
  Upload, Camera, Phone, Building2, FileText, Smartphone,
  AlertCircle, Zap,
} from 'lucide-react'
import { Button } from '@components/common'
import { BRAND_INFO } from '@constants/brand'
import { sellerAuthApi } from '@services/sellerApi'

const PROVINCES = ['Kigali', 'Eastern Province', 'Western Province', 'Northern Province', 'Southern Province']
const DISTRICTS: Record<string, string[]> = {
  'Kigali': ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  'Eastern Province': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
  'Western Province': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'],
  'Northern Province': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
  'Southern Province': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
}

type Step = 1 | 2 | 3 | 4

interface OnboardingForm {
  // Step 1 – Shop profile
  shop_logo: string
  shop_banner: string
  shop_description: string
  category: string
  // Step 2 – Location
  province: string
  district: string
  address: string
  phone: string
  // Step 3 – Payout
  payout_method: 'mtn' | 'airtel' | 'bank'
  account_number: string
  account_name: string
  bank_name: string
  // Step 4 – review (no fields)
}

const STEP_LABELS = ['Shop Profile', 'Location', 'Payout', 'Review']

const CATEGORIES = [
  'Electronics', 'Fashion & Clothing', 'Home & Living',
  'Beauty & Health', 'Sports & Fitness', 'Food & Groceries',
  'Automotive', 'Books & Media', 'Other',
]

export default function SellerOnboarding() {
  const navigate = useNavigate()
  const sellerRaw = localStorage.getItem('seller_data')
  const seller = sellerRaw ? JSON.parse(sellerRaw) : null

  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<OnboardingForm>({
    shop_logo: '',
    shop_banner: '',
    shop_description: '',
    category: '',
    province: 'Kigali',
    district: 'Gasabo',
    address: '',
    phone: seller?.phone || '',
    payout_method: 'mtn',
    account_number: '',
    account_name: seller?.full_name || '',
    bank_name: '',
  })

  const set = <K extends keyof OnboardingForm>(k: K, v: OnboardingForm[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const validate = (): string => {
    if (step === 1) {
      if (!form.shop_description.trim()) return 'Please add a short shop description'
      if (!form.category) return 'Please select your main category'
    }
    if (step === 2) {
      if (!form.address.trim()) return 'Street address is required'
      if (!form.phone.trim()) return 'Phone number is required'
    }
    if (step === 3) {
      if (!form.account_number.trim()) return 'Account number is required'
      if (!form.account_name.trim()) return 'Account name is required'
      if (form.payout_method === 'bank' && !form.bank_name.trim()) return 'Bank name is required'
    }
    return ''
  }

  const next = () => {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setStep(s => (s + 1) as Step)
  }

  const finish = async () => {
    setLoading(true)
    setError('')
    try {
      const payload = {
        shop_description: form.shop_description,
        province:         form.province,
        district:         form.district,
        address:          form.address,
        phone:            form.phone,
        shop_logo:        form.shop_logo   || undefined,
        shop_banner:      form.shop_banner || undefined,
        // payout info from step 3
        payout_method:    form.payout_method,
        payout_account:   form.account_number,
        payout_name:      form.account_name,
        bank_name:        form.bank_name   || undefined,
      }
      const res = await sellerAuthApi.updateProfile(payload)
      // Update stored seller data
      localStorage.setItem('seller_data', JSON.stringify(res.data.data))
      navigate('/seller/dashboard')
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors bg-white'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Store size={16} className="text-white" />
            </div>
            <span className="font-bold text-primary-700">{BRAND_INFO.name} Seller Hub</span>
          </Link>
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip for now →
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Welcome */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-2xl mb-4">
            <Zap size={28} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome, {seller?.full_name?.split(' ')[0] || 'Seller'}! 🎉
          </h1>
          <p className="text-gray-500">
            Let's set up your shop in 4 quick steps — takes less than 3 minutes.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-10">
          {STEP_LABELS.map((label, i) => {
            const n = (i + 1) as Step
            const done = step > n
            const active = step === n
            return (
              <div key={label} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    done ? 'bg-success-500 text-white' : active ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {done ? <Check size={16} /> : n}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? 'text-primary-600' : done ? 'text-success-600' : 'text-gray-400'}`}>
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

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* ── Step 1: Shop Profile ── */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Store size={20} className="text-primary-600" /> Shop Profile
              </h2>
              <p className="text-sm text-gray-500 mb-6">This is what buyers see when they visit your shop.</p>

              <div className="space-y-5">
                {/* Logo + Banner upload */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Logo</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-300 cursor-pointer transition-colors bg-gray-50 aspect-square flex flex-col items-center justify-center gap-2">
                      {form.shop_logo ? (
                        <img src={form.shop_logo} alt="logo" className="w-16 h-16 object-cover rounded-xl" />
                      ) : (
                        <>
                          <Camera size={24} className="text-gray-300" />
                          <span className="text-xs text-gray-400 font-medium">Upload Logo</span>
                          <span className="text-xs text-gray-300">Square, min 200×200</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Banner</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-300 cursor-pointer transition-colors bg-gray-50 aspect-square flex flex-col items-center justify-center gap-2">
                      {form.shop_banner ? (
                        <img src={form.shop_banner} alt="banner" className="w-full h-16 object-cover rounded-xl" />
                      ) : (
                        <>
                          <Upload size={24} className="text-gray-300" />
                          <span className="text-xs text-gray-400 font-medium">Upload Banner</span>
                          <span className="text-xs text-gray-300">1200×400 recommended</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Main Category <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => set('category', cat)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all text-left ${
                          form.category === cat
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Shop Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell customers what you sell and why they should buy from you..."
                    value={form.shop_description}
                    onChange={e => set('shop_description', e.target.value)}
                    className={`${inputCls} resize-none`}
                    maxLength={300}
                  />
                  <p className="text-xs text-right text-gray-400 mt-1">{form.shop_description.length}/300</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Location ── */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <MapPin size={20} className="text-primary-600" /> Shop Location & Contact
              </h2>
              <p className="text-sm text-gray-500 mb-6">Used for delivery calculation and buyer trust.</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Province</label>
                    <select
                      value={form.province}
                      onChange={e => { set('province', e.target.value); set('district', DISTRICTS[e.target.value][0]) }}
                      className={inputCls}
                    >
                      {PROVINCES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">District</label>
                    <select
                      value={form.district}
                      onChange={e => set('district', e.target.value)}
                      className={inputCls}
                    >
                      {(DISTRICTS[form.province] || []).map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Street Address / Sector <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. KG 123 St, Remera"
                      value={form.address}
                      onChange={e => set('address', e.target.value)}
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Business Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="+250 7XX XXX XXX"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                </div>

                {/* Map placeholder */}
                <div className="bg-gray-100 rounded-xl h-32 flex items-center justify-center border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <MapPin size={24} className="text-gray-300 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Interactive map coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Payout ── */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <CreditCard size={20} className="text-primary-600" /> Payout Method
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Where should we send your earnings? You can change this anytime.
              </p>

              <div className="space-y-4">
                {/* Method selector */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'mtn' as const, label: 'MTN MoMo', icon: <Smartphone size={20} />, color: 'text-yellow-600' },
                    { id: 'airtel' as const, label: 'Airtel Money', icon: <Smartphone size={20} />, color: 'text-red-600' },
                    { id: 'bank' as const, label: 'Bank Transfer', icon: <Building2 size={20} />, color: 'text-gray-700' },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => set('payout_method', m.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        form.payout_method === m.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={m.color}>{m.icon}</span>
                      <span className="text-xs font-semibold text-gray-700 text-center">{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Fields */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {form.payout_method === 'bank' ? 'Account Number' : 'Mobile Money Number'}
                    <span className="text-red-500"> *</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={form.payout_method === 'bank' ? '000123456789' : '+250 7XX XXX XXX'}
                      value={form.account_number}
                      onChange={e => set('account_number', e.target.value)}
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Account Holder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Full name as registered"
                    value={form.account_name}
                    onChange={e => set('account_name', e.target.value)}
                    className={inputCls}
                  />
                </div>

                {form.payout_method === 'bank' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        value={form.bank_name}
                        onChange={e => set('bank_name', e.target.value)}
                        className={`${inputCls} pl-10`}
                      >
                        <option value="">Select bank</option>
                        {['Bank of Kigali', 'Equity Bank', 'Cogebanque', 'GT Bank', 'I&M Bank', 'KCB Rwanda', 'Ecobank', 'NCBA', 'BPR Atlas Mara', 'Other'].map(b => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <FileText size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Payouts are processed every Monday for delivered orders. A {'{commission}'}% platform fee is deducted before payout. Minimum payout is <strong>RWF 5,000</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Review ── */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Check size={20} className="text-success-600" /> Review & Launch
              </h2>
              <p className="text-sm text-gray-500 mb-6">Everything looks good? Let's launch your shop!</p>

              <div className="space-y-4">
                {/* Shop preview card */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl overflow-hidden">
                  <div className="h-20 bg-black/20 flex items-center justify-center">
                    <span className="text-white/50 text-xs">Shop Banner</span>
                  </div>
                  <div className="px-5 pb-5 -mt-6">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-3 shadow-lg">
                      <Store size={24} className="text-primary-600" />
                    </div>
                    <p className="font-bold text-white text-lg">{seller?.shop_name}</p>
                    <p className="text-blue-200 text-sm">{form.category || 'General'} · {form.district}, {form.province}</p>
                    <p className="text-blue-100 text-xs mt-1.5 line-clamp-2">{form.shop_description || 'No description yet'}</p>
                  </div>
                </div>

                {/* Summary rows */}
                {[
                  { label: 'Owner', value: seller?.full_name },
                  { label: 'Email', value: seller?.email },
                  { label: 'Phone', value: form.phone || '—' },
                  { label: 'Location', value: `${form.district}, ${form.province}` },
                  { label: 'Payout', value: `${form.payout_method.toUpperCase()} · ${form.account_number || '—'}` },
                  { label: 'Plan', value: `${(seller?.plan || 'free').charAt(0).toUpperCase() + (seller?.plan || 'free').slice(1)} · ${seller?.commission_rate || 8}% commission` },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px] truncate">{row.value}</span>
                  </div>
                ))}

                <div className="bg-success-50 border border-success-200 rounded-xl p-4 flex items-start gap-3">
                  <Check size={16} className="text-success-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-success-700 font-medium">
                    Your shop will go <strong>live immediately</strong> after completing setup. Buyers can discover your products right away.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button
                onClick={() => { setError(''); setStep(s => (s - 1) as Step) }}
                variant="outline"
                className="flex-1 py-3.5 rounded-xl font-semibold border-2 flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} /> Back
              </Button>
            )}

            {step < 4 ? (
              <Button
                onClick={next}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                Continue <ArrowRight size={18} />
              </Button>
            ) : (
              <Button
                onClick={finish}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-success-500 to-success-600 hover:opacity-90 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Launching...
                  </span>
                ) : (
                  <><Zap size={18} /> Launch My Shop!</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
