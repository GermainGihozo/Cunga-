import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag, Search, Phone, ArrowLeft, Package,
  Clock, Truck, Check, X, AlertCircle, ChevronRight,
} from 'lucide-react'
import { Button } from '@components/common'
import { BRAND_INFO } from '@constants/brand'
import { checkoutService, TrackedOrder } from '@services/marketplaceService'

const fmt = (n: number) => `RWF ${Number(n).toLocaleString()}`

const STATUS_COLOR: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-success-100 text-success-700',
  cancelled:  'bg-red-100 text-red-600',
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending:    <Clock size={13} />,
  processing: <AlertCircle size={13} />,
  shipped:    <Truck size={13} />,
  delivered:  <Check size={13} />,
  cancelled:  <X size={13} />,
}

export default function BuyerOrders() {
  const navigate = useNavigate()
  const [phone,   setPhone]   = useState('')
  const [orders,  setOrders]  = useState<TrackedOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [searched, setSearched] = useState(false)

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault()
    const p = phone.trim()
    if (!p) { setError('Please enter your phone number'); return }
    setError(''); setLoading(true); setSearched(true)
    try {
      const data = await checkoutService.getBuyerOrders(p)
      setOrders(data)
    } catch {
      setOrders([])
      setError('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/logos/logo-temp.svg" alt={BRAND_INFO.name} className="w-8 h-8" />
            <span className="font-bold text-primary-700 hidden sm:block">{BRAND_INFO.name}</span>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
              <ArrowLeft size={15} /> Back
            </button>
            <Link to="/order" className="text-sm text-gray-500 hover:text-primary-600 transition-colors hidden sm:block">
              Track Order
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag size={24} className="text-primary-600" /> My Orders
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your phone number to view all your orders
          </p>
        </div>

        {/* Search form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <form onSubmit={lookup} className="flex gap-3">
            <div className="relative flex-1">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                placeholder="+250 7XX XXX XXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 active:scale-95 transition-all whitespace-nowrap"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : <Search size={16} />}
              {loading ? 'Loading...' : 'Find Orders'}
            </Button>
          </form>
          {error && (
            <p className="mt-3 text-sm text-red-600 flex items-center gap-1.5 font-medium">
              <AlertCircle size={14} /> {error}
            </p>
          )}
        </div>

        {/* Results */}
        {searched && !loading && (
          orders.length === 0 ? (
            <div className="bg-white rounded-2xl py-20 text-center shadow-sm border border-gray-100">
              <Package size={48} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No orders found</p>
              <p className="text-xs text-gray-400 mt-1">
                Make sure you're using the same phone number you used when ordering.
              </p>
              <Link to="/products" className="mt-4 inline-block">
                <Button className="bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 font-medium">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
              {orders.map(o => (
                <div key={o.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all overflow-hidden">
                  <div className="p-5 flex items-start gap-4">
                    {/* Product image */}
                    {o.product_images?.[0] ? (
                      <img src={o.product_images[0]} alt={o.product_name}
                        className="w-16 h-16 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Package size={20} className="text-gray-300" />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-sm line-clamp-2">{o.product_name}</p>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${STATUS_COLOR[o.status] || 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_ICON[o.status]}
                          {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{o.shop_name} · Order {o.order_ref}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-bold text-primary-600">{fmt(o.subtotal + o.delivery_fee)}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(o.created_at).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <Link to={`/order/${o.order_ref}`}
                          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                          Track <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
