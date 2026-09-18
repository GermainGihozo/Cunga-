import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ArrowRight,
  Shield, Truck, Tag, X, Check, MapPin, CreditCard,
  Smartphone, Building2, ChevronDown, ChevronUp, Package,
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@hooks'
import {
  selectCartItems, selectCartTotal,
  removeItem, updateQuantity, clearCart,
} from '@store/slices/cartSlice'
import { checkoutService } from '@services/marketplaceService'
import { Button } from '@components/common'
import { BRAND_INFO } from '@constants/brand'

const DELIVERY_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery', sub: '3–5 business days', price: 2000 },
  { id: 'express',  label: 'Express Delivery',  sub: '1–2 business days', price: 5000 },
  { id: 'pickup',   label: 'Pickup from Store', sub: 'Ready in 2 hours',  price: 0   },
]
const PAYMENT_METHODS = [
  { id: 'mtn',    label: 'MTN Mobile Money',    icon: <Smartphone size={20} />, color: 'text-yellow-600' },
  { id: 'airtel', label: 'Airtel Money',         icon: <Smartphone size={20} />, color: 'text-red-600'    },
  { id: 'card',   label: 'Debit / Credit Card',  icon: <CreditCard size={20} />, color: 'text-primary-600'},
  { id: 'bank',   label: 'Bank Transfer',        icon: <Building2  size={20} />, color: 'text-gray-700'  },
]

const fmt = (n: number) => `RWF ${n.toLocaleString()}`

type Step = 'cart' | 'checkout' | 'confirm'

export default function Cart() {
  const navigate   = useNavigate()
  const dispatch   = useAppDispatch()
  const cartItems  = useAppSelector(selectCartItems)
  const cartTotal  = useAppSelector(selectCartTotal)

  // UI state
  const [coupon, setCoupon]             = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponError, setCouponError]   = useState('')
  const [delivery, setDelivery]         = useState('standard')
  const [payment, setPayment]           = useState('mtn')
  const [step, setStep]                 = useState<Step>('cart')
  const [addressOpen, setAddressOpen]   = useState(true)
  const [placing, setPlacing]           = useState(false)
  const [placeError, setPlaceError]     = useState('')
  const [placedRef, setPlacedRef]       = useState('')

  const [address, setAddress] = useState({
    name: '', phone: '', email: '', city: '', district: '', street: '',
  })

  // ── Financials ─────────────────────────────────────────
  const savings    = cartItems.reduce((s, i) => s + ((i.oldPrice ?? i.price) - i.price) * i.quantity, 0)
  const deliveryFee = DELIVERY_OPTIONS.find(d => d.id === delivery)?.price ?? 0
  const discount   = couponApplied ? Math.round(cartTotal * 0.1) : 0
  const total      = cartTotal + deliveryFee - discount

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'CUNGA10') {
      setCouponApplied(true); setCouponError('')
    } else {
      setCouponError('Invalid coupon code.'); setCouponApplied(false)
    }
  }

  // ── Place order (multi-item: one call per cart item) ───
  const handlePlaceOrder = async () => {
    if (!address.name.trim() || !address.phone.trim() || !address.street.trim()) {
      setPlaceError('Please fill in your name, phone number, and street address.'); return
    }
    if (!address.city.trim()) {
      setPlaceError('Please enter your city or province.'); return
    }
    setPlaceError('')
    setPlacing(true)
    try {
      const deliveryAddress = `${address.street}, ${address.district}, ${address.city}, Rwanda`

      // Place orders in sequence, one per cart item
      const refs: string[] = []
      for (const item of cartItems) {
        const result = await checkoutService.placeOrder({
          product_id:        item.id,
          quantity:          item.quantity,
          buyer_name:        address.name,
          buyer_phone:       address.phone,
          buyer_email:       address.email || undefined,
          delivery_address:  deliveryAddress,
          delivery_district: address.district || undefined,
          delivery_province: address.city    || undefined,
          delivery_method:   delivery as 'standard' | 'express' | 'pickup',
          payment_method:    payment  as 'mtn' | 'airtel' | 'card' | 'bank',
        })
        refs.push(result.order_ref)
      }

      dispatch(clearCart())
      // Navigate to tracking for the first order ref
      setPlacedRef(refs[0])
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message || 'Order failed. Please try again.'
      setPlaceError(msg)
    } finally {
      setPlacing(false)
    }
  }

  // ── Placed screen ──────────────────────────────────────
  if (placedRef) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-success-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h2>
          <p className="text-gray-500 mb-1">Your order reference is:</p>
          <p className="text-xl font-bold text-primary-600 mb-4">{placedRef}</p>
          <p className="text-gray-500 text-sm mb-8">
            We'll send a confirmation to {address.phone}. Track your delivery in real-time.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{fmt(cartTotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>{deliveryFee === 0 ? 'Free' : fmt(deliveryFee)}</span></div>
            {discount > 0 && <div className="flex justify-between text-success-600"><span>Coupon (CUNGA10)</span><span>-{fmt(discount)}</span></div>}
            <div className="flex justify-between font-bold border-t border-gray-200 pt-2"><span>Total Paid</span><span className="text-primary-600">{fmt(total)}</span></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate(`/order/${placedRef}`)}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold active:scale-95 transition-all"
            >
              Track Order
            </Button>
            <Link to="/products" className="flex-1">
              <Button variant="outline" className="w-full py-3 rounded-xl font-semibold border-2">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/logos/logo-temp.svg" alt={BRAND_INFO.name} className="w-9 h-9" />
            <span className="text-xl font-bold text-primary-700">{BRAND_INFO.name}</span>
          </Link>

          {/* Step indicator */}
          <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
            {(['cart', 'checkout', 'confirm'] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s === step ? 'bg-primary-600 text-white' :
                  (step === 'checkout' && i === 0) || (step === 'confirm' && i <= 1)
                    ? 'bg-success-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {(step === 'checkout' && i === 0) || (step === 'confirm' && i <= 1)
                    ? <Check size={12} /> : i + 1}
                </div>
                <span className={s === step ? 'text-primary-700 font-semibold' : 'text-gray-400 capitalize'}>
                  {s}
                </span>
                {i < 2 && <span className="text-gray-300">›</span>}
              </div>
            ))}
          </div>

          <Link to="/products" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-600 transition-colors">
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ══ CART ══ */}
        {step === 'cart' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart size={24} className="text-primary-600" />
                My Cart
                <span className="text-base font-normal text-gray-400">({cartItems.length} items)</span>
              </h1>

              {cartItems.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
                  <Package size={64} className="text-gray-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h3>
                  <p className="text-gray-400 mb-6">Discover amazing products from sellers across Rwanda</p>
                  <Link to="/products">
                    <Button className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold">
                      Start Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all">
                    <div className="flex gap-4">
                      <Link to={`/product/${item.id}`} className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-gray-100"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
                              {item.category}
                            </span>
                            <Link to={`/product/${item.id}`}>
                              <h3 className="font-bold text-gray-900 mt-1 text-sm sm:text-base hover:text-primary-600 line-clamp-2">
                                {item.name}
                              </h3>
                            </Link>
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <MapPin size={11} /> Sold by {item.seller_name}
                            </p>
                          </div>
                          <button
                            onClick={() => dispatch(removeItem(item.id))}
                            className="flex-shrink-0 w-8 h-8 bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <span className="text-lg font-bold text-primary-600">{fmt(item.price)}</span>
                            {item.oldPrice && (
                              <span className="text-xs text-gray-400 line-through ml-2">{fmt(item.oldPrice)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
                            <button
                              onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                              className="w-8 h-8 bg-white rounded-lg border border-gray-200 hover:border-primary-400 hover:text-primary-600 flex items-center justify-center transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                            <button
                              onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                              className="w-8 h-8 bg-white rounded-lg border border-gray-200 hover:border-primary-400 hover:text-primary-600 flex items-center justify-center transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 text-right text-sm font-semibold text-gray-700">
                          Item total: {fmt(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Coupon */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag size={18} className="text-accent-600" /> Coupon Code
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text" placeholder="e.g. CUNGA10"
                    value={coupon}
                    onChange={e => { setCoupon(e.target.value); setCouponError(''); setCouponApplied(false) }}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"
                  />
                  <Button onClick={applyCoupon} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
                    Apply
                  </Button>
                </div>
                {couponApplied && <p className="text-success-600 text-sm mt-2 flex items-center gap-1.5 font-semibold"><Check size={15} /> 10% discount applied!</p>}
                {couponError  && <p className="text-red-500 text-sm mt-2 flex items-center gap-1.5"><X size={15} /> {couponError}</p>}
              </div>

              {/* Summary */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>{fmt(cartTotal)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-success-600 font-semibold">
                      <span>You save</span><span>-{fmt(savings)}</span>
                    </div>
                  )}
                  {couponApplied && (
                    <div className="flex justify-between text-success-600 font-semibold">
                      <span>Coupon (CUNGA10)</span><span>-{fmt(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600"><span>Delivery</span><span>{deliveryFee === 0 ? 'Free' : fmt(deliveryFee)}</span></div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-primary-600 text-lg">{fmt(total)}</span>
                  </div>
                </div>

                <Button
                  onClick={() => cartItems.length > 0 && setStep('checkout')}
                  disabled={cartItems.length === 0}
                  className="w-full mt-5 py-3.5 rounded-xl font-bold text-base bg-gradient-accent hover:opacity-90 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout <ArrowRight size={18} className="ml-2" />
                </Button>

                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Shield size={12} /> Secure</span>
                  <span className="flex items-center gap-1"><Truck size={12} /> Fast delivery</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ CHECKOUT ══ */}
        {step === 'checkout' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <button onClick={() => setStep('cart')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors">
                <ArrowLeft size={16} /> Back to Cart
              </button>

              {/* Address */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button className="w-full flex items-center justify-between px-6 py-4 font-bold text-gray-900"
                  onClick={() => setAddressOpen(v => !v)}>
                  <span className="flex items-center gap-2"><MapPin size={18} className="text-primary-600" /> Delivery Address</span>
                  {addressOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {addressOpen && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: 'name',     label: 'Full Name',        placeholder: 'Jean Pierre Nkurunziza', col: 2 },
                      { key: 'phone',    label: 'Phone Number',     placeholder: '+250 7XX XXX XXX',       col: 1 },
                      { key: 'email',    label: 'Email (optional)', placeholder: 'you@example.com',        col: 1 },
                      { key: 'city',     label: 'City / Province',  placeholder: 'Kigali',                 col: 1 },
                      { key: 'district', label: 'District',         placeholder: 'Gasabo',                 col: 1 },
                      { key: 'street',   label: 'Street / Sector',  placeholder: 'KG 123 St, Remera',      col: 2 },
                    ].map(f => (
                      <div key={f.key} className={f.col === 2 ? 'sm:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                        <input
                          type="text" placeholder={f.placeholder}
                          value={address[f.key as keyof typeof address]}
                          onChange={e => setAddress(a => ({ ...a, [f.key]: e.target.value }))}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivery method */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck size={18} className="text-primary-600" /> Delivery Method
                </h3>
                <div className="space-y-3">
                  {DELIVERY_OPTIONS.map(opt => (
                    <label key={opt.id} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      delivery === opt.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          delivery === opt.id ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                        }`}>
                          {delivery === opt.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <input type="radio" className="sr-only" checked={delivery === opt.id} onChange={() => setDelivery(opt.id)} />
                        <div>
                          <span className="font-semibold text-gray-900 text-sm">{opt.label}</span>
                          <p className="text-xs text-gray-500">{opt.sub}</p>
                        </div>
                      </div>
                      <span className={`font-bold text-sm ${opt.price === 0 ? 'text-success-600' : 'text-gray-900'}`}>
                        {opt.price === 0 ? 'Free' : fmt(opt.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-primary-600" /> Payment Method
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(pm => (
                    <label key={pm.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      payment === pm.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
                    }`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        payment === pm.id ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                      }`}>
                        {payment === pm.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <input type="radio" className="sr-only" checked={payment === pm.id} onChange={() => setPayment(pm.id)} />
                      <span className={pm.color}>{pm.icon}</span>
                      <span className="font-medium text-gray-800 text-sm">{pm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Items in Order</h3>
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold flex-shrink-0">{fmt(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{fmt(cartTotal)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Delivery</span><span>{deliveryFee === 0 ? 'Free' : fmt(deliveryFee)}</span></div>
                  {couponApplied && <div className="flex justify-between text-success-600 font-semibold"><span>Coupon</span><span>-{fmt(discount)}</span></div>}
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-primary-600 text-lg">{fmt(total)}</span>
                  </div>
                </div>
                <Button onClick={() => setStep('confirm')}
                  className="w-full mt-5 py-3.5 bg-gradient-accent hover:opacity-90 text-white rounded-xl font-bold active:scale-95 transition-all shadow-lg">
                  Review Order <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ══ CONFIRM ══ */}
        {step === 'confirm' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <button onClick={() => setStep('checkout')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors">
              <ArrowLeft size={16} /> Back to Checkout
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Check size={22} className="text-success-600" /> Review Your Order
              </h2>

              <div className="space-y-3 mb-6">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.seller_name} · Qty {item.quantity}</p>
                    </div>
                    <span className="font-bold text-primary-600">{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><MapPin size={12} /> Delivery To</p>
                  {address.name ? (
                    <div className="text-sm text-gray-800 space-y-0.5">
                      <p className="font-semibold">{address.name}</p>
                      <p>{address.phone}</p>
                      <p>{address.street}, {address.district}</p>
                      <p>{address.city}, Rwanda</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No address entered</p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><CreditCard size={12} /> Payment</p>
                  <div className="flex items-center gap-2">
                    {PAYMENT_METHODS.find(p => p.id === payment)?.icon}
                    <span className="font-semibold text-sm">{PAYMENT_METHODS.find(p => p.id === payment)?.label}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{DELIVERY_OPTIONS.find(d => d.id === delivery)?.label}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm mb-6">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{fmt(cartTotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Delivery</span><span>{deliveryFee === 0 ? 'Free' : fmt(deliveryFee)}</span></div>
                {savings > 0 && <div className="flex justify-between text-success-600 font-semibold"><span>Savings</span><span>-{fmt(savings)}</span></div>}
                {couponApplied && <div className="flex justify-between text-success-600 font-semibold"><span>Coupon (CUNGA10)</span><span>-{fmt(discount)}</span></div>}
                <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-3">
                  <span>Total</span><span className="text-primary-600 text-xl">{fmt(total)}</span>
                </div>
              </div>

              {placeError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                  {placeError}
                </div>
              )}

              <Button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full py-4 bg-gradient-accent hover:opacity-90 disabled:opacity-60 text-white rounded-xl font-bold text-base shadow-xl hover:shadow-2xl active:scale-95 transition-all"
              >
                {placing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Placing Order...
                  </span>
                ) : `Place Order · ${fmt(total)}`}
              </Button>
              <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                <Shield size={12} /> Your payment is secured with bank-level encryption
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
