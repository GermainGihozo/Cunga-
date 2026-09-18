import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Package, Truck, Check, Clock, X, ArrowLeft, Search,
  MapPin, CreditCard, Phone, Store, RefreshCw, AlertCircle,
  ShoppingBag, Star,
} from 'lucide-react'
import { Button } from '@components/common'
import { BRAND_INFO } from '@constants/brand'
import { checkoutService, TrackedOrder } from '@services/marketplaceService'

const fmt = (n: number) => `RWF ${Number(n).toLocaleString()}`

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  shipped:    'bg-purple-100 text-purple-700 border-purple-200',
  delivered:  'bg-success-100 text-success-700 border-success-200',
  cancelled:  'bg-red-100 text-red-600 border-red-200',
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending:    <Clock size={14} />,
  processing: <AlertCircle size={14} />,
  shipped:    <Truck size={14} />,
  delivered:  <Check size={14} />,
  cancelled:  <X size={14} />,
}

export default function OrderTracking() {
  const { ref: paramRef } = useParams<{ ref: string }>()
  const navigate = useNavigate()

  const [searchRef, setSearchRef]   = useState(paramRef || '')
  const [order, setOrder]           = useState<TrackedOrder | null>(null)
  const [timeline, setTimeline]     = useState<{ key: string; label: string; icon: string; done: boolean; active: boolean }[]>([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [searched, setSearched]     = useState(false)

  const fetchOrder = async (ref: string) => {
    if (!ref.trim()) { setError('Please enter an order reference'); return }
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const data = await checkoutService.trackOrder(ref.trim().toUpperCase())
      setOrder(data.order)
      setTimeline(data.timeline)
      // Update URL without reload
      window.history.replaceState(null, '', `/order/${ref.trim().toUpperCase()}`)
    } catch {
      setOrder(null)
      setTimeline([])
      setError('Order not found. Please check the reference number and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-search if ref came from URL param
  useEffect(() => {
    if (paramRef) fetchOrder(paramRef)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramRef])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/assets/logos/logo-temp.svg" alt={BRAND_INFO.name} className="w-9 h-9" />
            <span className="font-bold text-primary-700 text-lg">{BRAND_INFO.name}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/products" className="text-sm text-gray-500 hover:text-primary-600 transition-colors hidden sm:block">
              Continue Shopping
            </Link>
            <Link to="/cart">
              <Button variant="outline" className="text-sm px-4 py-2 rounded-xl border-2">
                <ShoppingBag size={15} className="mr-1.5" /> Cart
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Page title */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-4"
          >
            <ArrowLeft size={15} /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package size={24} className="text-primary-600" /> Track Your Order
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your order reference number to see real-time status and updates.
          </p>
        </div>

        {/* Search form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Order Reference Number</label>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. CNG-1724857392-483"
              value={searchRef}
              onChange={e => setSearchRef(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && fetchOrder(searchRef)}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-primary-400 transition-colors tracking-wide"
            />
            <Button
              onClick={() => fetchOrder(searchRef)}
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 active:scale-95 transition-all"
            >
              {loading
                ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Searching…</>
                : <><Search size={16} /> Track</>
              }
            </Button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600 flex items-center gap-1.5 font-medium">
              <AlertCircle size={14} /> {error}
            </p>
          )}
          {!searched && !paramRef && (
            <p className="mt-2 text-xs text-gray-400">
              Your order reference was sent to your phone after placing an order.
              It looks like <span className="font-mono bg-gray-100 px-1 rounded">CNG-1234567890-123</span>
            </p>
          )}
        </div>

        {/* Order found */}
        {order && (
          <>
            {/* Status header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Order Reference</p>
                  <p className="font-mono font-bold text-gray-900 text-lg">{order.order_ref}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Placed on {new Date(order.created_at).toLocaleDateString('en-RW', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {STATUS_ICON[order.status]}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <button
                    onClick={() => fetchOrder(order.order_ref)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <RefreshCw size={11} /> Refresh
                  </button>
                </div>
              </div>

              {/* Timeline */}
              {order.status !== 'cancelled' && timeline.length > 0 && (
                <div className="mt-4">
                  <div className="relative flex items-start justify-between">
                    {/* Progress bar */}
                    <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded-full mx-8">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-700"
                        style={{
                          width: `${(timeline.filter(t => t.done).length / timeline.length) * 100}%`
                        }}
                      />
                    </div>

                    {timeline.map((step) => (
                      <div key={step.key} className="flex flex-col items-center gap-2 flex-1 relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all ${
                          step.done
                            ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-200'
                            : step.active
                            ? 'bg-white border-primary-600 text-primary-600 shadow-md'
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}>
                          {step.done ? <Check size={14} /> : step.icon}
                        </div>
                        <span className={`text-xs font-medium text-center leading-tight ${
                          step.active ? 'text-primary-700 font-bold' :
                          step.done   ? 'text-gray-700' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {order.status === 'cancelled' && (
                <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
                  <X size={18} className="text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700 font-medium">This order has been cancelled. If you were charged, a refund will be processed within 3–5 business days.</p>
                </div>
              )}

              {order.status === 'delivered' && (
                <div className="mt-4 p-4 bg-success-50 rounded-xl border border-success-100 flex items-start gap-3">
                  <Check size={18} className="text-success-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-success-700 font-semibold">Your order has been delivered!</p>
                    <p className="text-xs text-success-600 mt-0.5">Happy with your purchase? Leave a review to help other buyers.</p>
                    <button className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-success-700 bg-success-100 hover:bg-success-200 px-3 py-1.5 rounded-lg transition-colors">
                      <Star size={12} className="fill-success-600" /> Write a Review
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1.5">
                  <Package size={12} /> Product
                </p>
                <div className="flex items-center gap-3">
                  {order.product_images?.[0] ? (
                    <img src={order.product_images[0]} alt={order.product_name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package size={24} className="text-gray-300" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm line-clamp-2">{order.product_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Qty: {order.quantity}</p>
                    <p className="text-sm font-bold text-primary-600 mt-1">{fmt(order.unit_price)}</p>
                  </div>
                </div>
              </div>

              {/* Seller */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1.5">
                  <Store size={12} /> Sold By
                </p>
                <p className="font-semibold text-gray-900">{order.shop_name}</p>
                {order.seller_phone && (
                  <a href={`tel:${order.seller_phone}`}
                    className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 mt-1 transition-colors">
                    <Phone size={13} /> {order.seller_phone}
                  </a>
                )}
                <Link
                  to={`/shop/${order.shop_slug}`}
                  className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 mt-2 transition-colors"
                >
                  Visit Shop →
                </Link>
              </div>

              {/* Delivery address */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1.5">
                  <MapPin size={12} /> Delivery Address
                </p>
                <p className="font-semibold text-gray-900 text-sm">{order.buyer_name}</p>
                <p className="text-sm text-gray-600">{order.buyer_phone}</p>
                <p className="text-sm text-gray-600 mt-1">{order.delivery_address}</p>
                {order.delivery_district && (
                  <p className="text-sm text-gray-500">{order.delivery_district}{order.delivery_province ? `, ${order.delivery_province}` : ''}</p>
                )}
                <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md capitalize">
                  {order.delivery_method} delivery
                </span>
              </div>

              {/* Payment summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1.5">
                  <CreditCard size={12} /> Payment
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{fmt(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span>{order.delivery_fee === 0 ? 'Free' : fmt(order.delivery_fee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-1">
                    <span>Total</span>
                    <span className="text-primary-600 text-base">{fmt(order.subtotal + order.delivery_fee)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      order.payment_status === 'paid' ? 'bg-success-100 text-success-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.payment_status === 'paid' ? <Check size={10} /> : <Clock size={10} />}
                      {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                    <span className="text-xs text-gray-400 uppercase">{order.payment_method}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/products" className="flex-1">
                <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold active:scale-95 transition-all">
                  Continue Shopping
                </Button>
              </Link>
              <button
                onClick={() => { setOrder(null); setSearchRef(''); setSearched(false); setError(''); window.history.replaceState(null, '', '/order') }}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-95"
              >
                Track Another Order
              </button>
            </div>
          </>
        )}

        {/* Empty state — searched but nothing found */}
        {searched && !order && !loading && !error && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <Package size={48} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No order found with that reference.</p>
          </div>
        )}
      </div>
    </div>
  )
}
