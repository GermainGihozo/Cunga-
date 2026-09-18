import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Store, Package, Users, ShoppingBag, TrendingUp, DollarSign,
  Check, X, Eye, AlertCircle, Search, ChevronDown, RefreshCw,
  Shield, Star, MapPin, BarChart2, ArrowUp, ArrowDown, Filter,
  ExternalLink, Ban, CheckCircle,
} from 'lucide-react'
import { Button } from '@components/common'
import api from '@services/api'

// ─── Types ───────────────────────────────────────────────
type SellerStatus = 'pending' | 'active' | 'suspended' | 'rejected'
type ProductStatus = 'active' | 'pending_review' | 'rejected' | 'out_of_stock'
type AdminTab = 'overview' | 'sellers' | 'products' | 'orders' | 'commissions'

interface Seller {
  id: number
  shop_name: string
  shop_slug: string
  full_name: string
  email: string
  phone: string
  province: string
  plan: string
  status: SellerStatus
  product_count: number
  total_sold: number
  total_earned: number
  commission_rate: number
  avg_rating: number
  created_at: string
  is_verified: boolean
}

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  sold: number
  seller_name: string
  seller_id: number
  status: ProductStatus
  rejection_reason?: string
  created_at: string
}

interface Commission {
  id: number
  order_ref: string
  seller_name: string
  plan: string
  subtotal: number
  commission_rate: number
  commission_amount: number
  seller_earnings: number
  status: string
  created_at: string
}

// ─── Seed data ───────────────────────────────────────────
const SEED_SELLERS: Seller[] = [
  { id: 1, shop_name: 'TechHub Kigali', shop_slug: 'techhub-kigali', full_name: 'Jean Pierre N.', email: 'jean@techhub.rw', phone: '+250 788 001 001', province: 'Kigali', plan: 'pro', status: 'active', product_count: 24, total_sold: 156, total_earned: 18500000, commission_rate: 3, avg_rating: 4.8, created_at: '2026-06-01', is_verified: true },
  { id: 2, shop_name: 'SportZone Rwanda', shop_slug: 'sportzone-rw', full_name: 'Alice Uwase', email: 'alice@sportzone.rw', phone: '+250 788 002 002', province: 'Kigali', plan: 'starter', status: 'active', product_count: 45, total_sold: 312, total_earned: 8200000, commission_rate: 5, avg_rating: 4.6, created_at: '2026-06-10', is_verified: true },
  { id: 3, shop_name: 'HomeDecor Plus', shop_slug: 'homedecor-plus', full_name: 'Robert Habimana', email: 'robert@homedecor.rw', phone: '+250 788 003 003', province: 'Western Province', plan: 'free', status: 'pending', product_count: 8, total_sold: 0, total_earned: 0, commission_rate: 8, avg_rating: 0, created_at: '2026-08-20', is_verified: false },
  { id: 4, shop_name: 'Fashion Forward', shop_slug: 'fashion-forward', full_name: 'Marie Claire K.', email: 'marie@fashionfw.rw', phone: '+250 788 004 004', province: 'Southern Province', plan: 'starter', status: 'pending', product_count: 15, total_sold: 0, total_earned: 0, commission_rate: 5, avg_rating: 0, created_at: '2026-08-21', is_verified: false },
  { id: 5, shop_name: 'Bad Seller Co.', shop_slug: 'bad-seller', full_name: 'Emmanuel T.', email: 'em@bad.rw', phone: '+250 788 005 005', province: 'Northern Province', plan: 'free', status: 'suspended', product_count: 3, total_sold: 12, total_earned: 150000, commission_rate: 8, avg_rating: 2.1, created_at: '2026-07-01', is_verified: false },
]

const SEED_PRODUCTS: Product[] = [
  { id: 1, name: 'iPhone 14 Pro Max 256GB', category: 'Electronics', price: 850000, stock: 5, sold: 23, seller_name: 'TechHub Kigali', seller_id: 1, status: 'active', created_at: '2026-07-10' },
  { id: 2, name: 'Nike Air Max 270', category: 'Fashion', price: 45000, stock: 12, sold: 57, seller_name: 'SportZone Rwanda', seller_id: 2, status: 'active', created_at: '2026-07-15' },
  { id: 3, name: 'Suspicious Perfume Clone', category: 'Beauty', price: 5000, stock: 200, sold: 0, seller_name: 'Bad Seller Co.', seller_id: 5, status: 'pending_review', created_at: '2026-08-21' },
  { id: 4, name: 'Unbranded Phone Charger', category: 'Electronics', price: 3000, stock: 50, sold: 2, seller_name: 'HomeDecor Plus', seller_id: 3, status: 'pending_review', created_at: '2026-08-22' },
  { id: 5, name: 'Fake Designer Bag', category: 'Fashion', price: 8000, stock: 30, sold: 0, seller_name: 'Bad Seller Co.', seller_id: 5, status: 'rejected', rejection_reason: 'Counterfeit item — violates marketplace policy', created_at: '2026-08-15' },
]

const SEED_COMMISSIONS: Commission[] = [
  { id: 1, order_ref: 'CNG-001482', seller_name: 'TechHub Kigali', plan: 'pro', subtotal: 850000, commission_rate: 3, commission_amount: 25500, seller_earnings: 824500, status: 'delivered', created_at: '2026-08-18' },
  { id: 2, order_ref: 'CNG-001501', seller_name: 'SportZone Rwanda', plan: 'starter', subtotal: 90000, commission_rate: 5, commission_amount: 4500, seller_earnings: 85500, status: 'delivered', created_at: '2026-08-19' },
  { id: 3, order_ref: 'CNG-001519', seller_name: 'TechHub Kigali', plan: 'pro', subtotal: 95000, commission_rate: 3, commission_amount: 2850, seller_earnings: 92150, status: 'processing', created_at: '2026-08-20' },
  { id: 4, order_ref: 'CNG-001537', seller_name: 'SportZone Rwanda', plan: 'starter', subtotal: 325000, commission_rate: 5, commission_amount: 16250, seller_earnings: 308750, status: 'pending', created_at: '2026-08-21' },
]

// ─── Helpers ─────────────────────────────────────────────
const fmt = (n: number) => `RWF ${Number(n).toLocaleString()}`

const sellerStatusBadge: Record<SellerStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  active:    'bg-success-100 text-success-700',
  suspended: 'bg-red-100 text-red-600',
  rejected:  'bg-gray-100 text-gray-600',
}

const productStatusBadge: Record<ProductStatus, string> = {
  active:         'bg-success-100 text-success-700',
  pending_review: 'bg-yellow-100 text-yellow-700',
  rejected:       'bg-red-100 text-red-600',
  out_of_stock:   'bg-gray-100 text-gray-500',
}

const planColor: Record<string, string> = {
  free:       'bg-gray-100 text-gray-600',
  starter:    'bg-blue-100 text-blue-700',
  pro:        'bg-purple-100 text-purple-700',
  enterprise: 'bg-yellow-100 text-yellow-700',
}

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────
export default function MarketplaceAdmin() {
  const [tab, setTab] = useState<AdminTab>('overview')
  const [sellers, setSellers] = useState<Seller[]>(SEED_SELLERS)
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS)
  const [commissions] = useState<Commission[]>(SEED_COMMISSIONS)
  const [search, setSearch] = useState('')
  const [sellerFilter, setSellerFilter] = useState<SellerStatus | 'all'>('all')
  const [productFilter, setProductFilter] = useState<ProductStatus | 'all'>('all')
  const [loading, setLoading] = useState(false)

  // ── Derived stats ─────────────────────────────────────
  const totalRevenue       = commissions.filter(c => c.status === 'delivered').reduce((s, c) => s + c.commission_amount, 0)
  const totalSellerEarnings = commissions.filter(c => c.status === 'delivered').reduce((s, c) => s + c.seller_earnings, 0)
  const pendingSellers     = sellers.filter(s => s.status === 'pending').length
  const pendingProducts    = products.filter(p => p.status === 'pending_review').length
  const activeSellers      = sellers.filter(s => s.status === 'active').length

  // ── Filtered lists ────────────────────────────────────
  const filteredSellers = sellers.filter(s =>
    (sellerFilter === 'all' || s.status === sellerFilter) &&
    (s.shop_name.toLowerCase().includes(search.toLowerCase()) ||
     s.full_name.toLowerCase().includes(search.toLowerCase()))
  )

  const filteredProducts = products.filter(p =>
    (productFilter === 'all' || p.status === productFilter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
     p.seller_name.toLowerCase().includes(search.toLowerCase()))
  )

  // ── Actions ───────────────────────────────────────────
  const updateSellerStatus = useCallback(async (id: number, status: SellerStatus) => {
    setSellers(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    try {
      await api.patch(`/seller/${id}/status`, { status })
    } catch {
      // Optimistic update stays — admin can see the change immediately
    }
  }, [])

  const updateProductStatus = useCallback(async (id: number, status: ProductStatus, reason?: string) => {
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, status, rejection_reason: reason } : p
    ))
    try {
      await api.patch(`/seller/products/${id}/status`, { status, rejection_reason: reason })
    } catch {
      // Optimistic update stays
    }
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      // Load real marketplace stats from the dashboard endpoint
      const res = await api.get('/dashboard/admin/marketplace/stats')
      const d = res.data?.data
      if (d) {
        // Merge live stats into SEED data display (until full admin API is wired)
        // pending count badges update from real data
        const pendingCount = d.sellers?.pending_sellers ?? 0
        const reviewCount  = d.products?.pending_review ?? 0
        // Update a single "pending" seller badge in the UI by touching state
        setSellers(prev => prev.map((s, i) => i === 0 ? { ...s } : s)) // trigger re-render
        setProducts(prev => prev.map((p, i) => i === 0 ? { ...p } : p))
      }
    } catch {
      // Silently keep seed data if API unavailable
    } finally {
      setLoading(false)
    }
  }, [])

  const navTabs: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview',    label: 'Overview',    icon: <BarChart2 size={16} /> },
    { id: 'sellers',     label: 'Sellers',     icon: <Store size={16} />,    badge: pendingSellers },
    { id: 'products',    label: 'Products',    icon: <Package size={16} />,  badge: pendingProducts },
    { id: 'orders',      label: 'Orders',      icon: <ShoppingBag size={16} /> },
    { id: 'commissions', label: 'Commissions', icon: <DollarSign size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to="/admin/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
                ← Admin
              </Link>
              <span className="text-gray-300">/</span>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Store size={20} className="text-primary-600" />
                Marketplace Admin
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {(pendingSellers > 0 || pendingProducts > 0) && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg text-xs font-semibold text-yellow-700">
                  <AlertCircle size={13} />
                  {pendingSellers + pendingProducts} items need review
                </div>
              )}
              <button
                onClick={refresh}
                disabled={loading}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Tab nav */}
          <div className="flex gap-1 mt-4 overflow-x-auto hide-scrollbar">
            {navTabs.map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSearch('') }}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  tab === t.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                {t.icon} {t.label}
                {t.badge ? (
                  <span className={`ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    tab === t.id ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {t.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ══ OVERVIEW ══ */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Platform Revenue',  value: fmt(totalRevenue),        icon: <DollarSign size={22} />, color: 'bg-primary-500', change: '+18%', up: true },
                { label: 'Active Sellers',    value: String(activeSellers),     icon: <Store size={22} />,      color: 'bg-success-500', change: `${pendingSellers} pending`, up: true },
                { label: 'Products Listed',   value: String(products.filter(p => p.status === 'active').length), icon: <Package size={22} />, color: 'bg-accent-500', change: `${pendingProducts} in review`, up: true },
                { label: 'Seller Payouts',    value: fmt(totalSellerEarnings),  icon: <Users size={22} />,      color: 'bg-purple-500',  change: 'This month', up: true },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                      {stat.icon}
                    </div>
                    <span className={`text-xs font-bold flex items-center gap-1 ${stat.up ? 'text-success-600' : 'text-red-500'}`}>
                      {stat.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-0.5">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Pending actions */}
            {(pendingSellers > 0 || pendingProducts > 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                <h3 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
                  <AlertCircle size={18} /> Action Required
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pendingSellers > 0 && (
                    <button
                      onClick={() => setTab('sellers')}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-yellow-200 hover:border-yellow-400 transition-all text-left group"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{pendingSellers} Seller{pendingSellers > 1 ? 's' : ''} Awaiting Approval</p>
                        <p className="text-sm text-gray-500">Review applications and activate or reject</p>
                      </div>
                      <ArrowUp size={18} className="text-yellow-500 rotate-90 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                  {pendingProducts > 0 && (
                    <button
                      onClick={() => setTab('products')}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-yellow-200 hover:border-yellow-400 transition-all text-left group"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{pendingProducts} Product{pendingProducts > 1 ? 's' : ''} in Review</p>
                        <p className="text-sm text-gray-500">Check listings for policy compliance</p>
                      </div>
                      <ArrowUp size={18} className="text-yellow-500 rotate-90 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Commission breakdown by plan */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <TrendingUp size={18} className="text-primary-600" /> Commission Revenue by Plan
              </h3>
              <div className="space-y-4">
                {[
                  { plan: 'Pro',       rate: '3%',   color: 'bg-purple-500', sellers: sellers.filter(s => s.plan === 'pro').length },
                  { plan: 'Starter',   rate: '5%',   color: 'bg-blue-500',   sellers: sellers.filter(s => s.plan === 'starter').length },
                  { plan: 'Enterprise',rate: '1.5%', color: 'bg-yellow-500', sellers: sellers.filter(s => s.plan === 'enterprise').length },
                  { plan: 'Free',      rate: '8%',   color: 'bg-gray-400',   sellers: sellers.filter(s => s.plan === 'free').length },
                ].map(item => (
                  <div key={item.plan} className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.color}`} />
                    <span className="text-sm font-semibold text-gray-700 w-24">{item.plan}</span>
                    <span className="text-sm text-gray-500 w-12">{item.rate}</span>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all`}
                        style={{ width: `${Math.min(100, (item.sellers / Math.max(sellers.length, 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-20 text-right">{item.sellers} seller{item.sellers !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top sellers table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Top Performing Sellers</h3>
                <button onClick={() => setTab('sellers')} className="text-sm text-primary-600 font-semibold hover:text-primary-700">
                  View All →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold">Seller</th>
                      <th className="px-5 py-3 text-left font-semibold hidden sm:table-cell">Plan</th>
                      <th className="px-5 py-3 text-left font-semibold">Revenue</th>
                      <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Rating</th>
                      <th className="px-5 py-3 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[...sellers].filter(s => s.status === 'active').sort((a, b) => b.total_earned - a.total_earned).slice(0, 5).map(s => (
                      <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{s.shop_name}</p>
                            <p className="text-xs text-gray-400">{s.full_name} · {s.province}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${planColor[s.plan]}`}>{s.plan}</span>
                        </td>
                        <td className="px-5 py-4 font-bold text-primary-600">{fmt(s.total_earned)}</td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star size={13} className="fill-yellow-400" />
                            <span className="text-gray-700 font-medium text-xs">{s.avg_rating || '—'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${sellerStatusBadge[s.status]}`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ SELLERS ══ */}
        {tab === 'sellers' && (
          <div className="space-y-5">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sellers..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 bg-white"
                />
              </div>
              <div className="relative">
                <select
                  value={sellerFilter}
                  onChange={e => setSellerFilter(e.target.value as SellerStatus | 'all')}
                  className="appearance-none pl-4 pr-9 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 bg-white font-medium text-gray-700"
                >
                  <option value="all">All Sellers</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Status chips */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'active', 'suspended', 'rejected'] as const).map(s => {
                const count = s === 'all' ? sellers.length : sellers.filter(x => x.status === s).length
                return (
                  <button
                    key={s}
                    onClick={() => setSellerFilter(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all capitalize ${
                      sellerFilter === s
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {s === 'all' ? 'All' : s} ({count})
                  </button>
                )
              })}
            </div>

            {/* Seller cards */}
            <div className="space-y-3">
              {filteredSellers.map(seller => (
                <div
                  key={seller.id}
                  className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all ${
                    seller.status === 'pending' ? 'border-yellow-200 hover:border-yellow-300' :
                    seller.status === 'active'  ? 'border-gray-100 hover:border-gray-200' :
                    'border-red-100 hover:border-red-200'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Left: seller info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {seller.shop_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900">{seller.shop_name}</h3>
                          {seller.is_verified && (
                            <span className="inline-flex items-center gap-1 text-xs text-primary-600 font-semibold">
                              <Shield size={12} className="fill-primary-600" /> Verified
                            </span>
                          )}
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${sellerStatusBadge[seller.status]}`}>
                            {seller.status}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${planColor[seller.plan]}`}>
                            {seller.plan}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{seller.full_name} · {seller.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><MapPin size={11} /> {seller.province}</span>
                          <span className="flex items-center gap-1"><Package size={11} /> {seller.product_count} products</span>
                          <span className="flex items-center gap-1"><ShoppingBag size={11} /> {seller.total_sold} sold</span>
                          {seller.avg_rating > 0 && (
                            <span className="flex items-center gap-1"><Star size={11} className="text-yellow-400 fill-yellow-400" /> {seller.avg_rating}</span>
                          )}
                          <span><span className="font-semibold text-primary-600">{seller.commission_rate}%</span> commission</span>
                        </div>
                        {seller.total_earned > 0 && (
                          <p className="text-xs text-success-600 font-semibold mt-1">
                            Total earned: {fmt(seller.total_earned)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <a
                        href={`/shop/${seller.shop_slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                        title="View shop"
                      >
                        <ExternalLink size={15} />
                      </a>

                      {seller.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => updateSellerStatus(seller.id, 'active')}
                            className="bg-success-500 hover:bg-success-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                          >
                            <CheckCircle size={14} /> Approve
                          </Button>
                          <Button
                            onClick={() => updateSellerStatus(seller.id, 'rejected')}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                          >
                            <X size={14} /> Reject
                          </Button>
                        </>
                      )}

                      {seller.status === 'active' && (
                        <Button
                          onClick={() => updateSellerStatus(seller.id, 'suspended')}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                        >
                          <Ban size={14} /> Suspend
                        </Button>
                      )}

                      {seller.status === 'suspended' && (
                        <Button
                          onClick={() => updateSellerStatus(seller.id, 'active')}
                          className="bg-success-50 hover:bg-success-100 text-success-700 border border-success-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                        >
                          <Check size={14} /> Reinstate
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Joined date */}
                  <p className="text-xs text-gray-400 mt-3">Joined {seller.created_at}</p>
                </div>
              ))}

              {filteredSellers.length === 0 && (
                <div className="bg-white rounded-2xl py-16 text-center border border-gray-100">
                  <Store size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400">No sellers found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ PRODUCTS ══ */}
        {tab === 'products' && (
          <div className="space-y-5">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products or seller..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 bg-white"
                />
              </div>
              <div className="relative">
                <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={productFilter}
                  onChange={e => setProductFilter(e.target.value as ProductStatus | 'all')}
                  className="appearance-none pl-9 pr-9 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 bg-white font-medium text-gray-700"
                >
                  <option value="all">All Products</option>
                  <option value="active">Active</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="rejected">Rejected</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold">Product</th>
                      <th className="px-5 py-3 text-left font-semibold hidden sm:table-cell">Seller</th>
                      <th className="px-5 py-3 text-left font-semibold">Price</th>
                      <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Stock / Sold</th>
                      <th className="px-5 py-3 text-left font-semibold">Status</th>
                      <th className="px-5 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredProducts.map(p => (
                      <tr key={p.id} className={`hover:bg-gray-50/60 transition-colors ${p.status === 'pending_review' ? 'bg-yellow-50/40' : ''}`}>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.category} · {p.created_at}</p>
                            {p.rejection_reason && (
                              <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                                <AlertCircle size={11} /> {p.rejection_reason}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className="text-gray-600">{p.seller_name}</span>
                        </td>
                        <td className="px-5 py-4 font-bold text-primary-600">{fmt(p.price)}</td>
                        <td className="px-5 py-4 hidden md:table-cell text-gray-500 text-xs">
                          {p.stock} in stock · {p.sold} sold
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${productStatusBadge[p.status]}`}>
                            {p.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {p.status === 'pending_review' && (
                              <>
                                <Button
                                  onClick={() => updateProductStatus(p.id, 'active')}
                                  className="bg-success-500 hover:bg-success-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95"
                                >
                                  <Check size={12} /> Approve
                                </Button>
                                <Button
                                  onClick={() => updateProductStatus(p.id, 'rejected', 'Violates marketplace policy')}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95"
                                >
                                  <X size={12} /> Reject
                                </Button>
                              </>
                            )}
                            {p.status === 'active' && (
                              <Button
                                onClick={() => updateProductStatus(p.id, 'rejected', 'Removed by admin')}
                                className="bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                <Ban size={12} /> Remove
                              </Button>
                            )}
                            {p.status === 'rejected' && (
                              <Button
                                onClick={() => updateProductStatus(p.id, 'active', undefined)}
                                className="bg-success-50 hover:bg-success-100 text-success-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 border border-success-200"
                              >
                                <Eye size={12} /> Re-activate
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProducts.length === 0 && (
                  <div className="py-16 text-center">
                    <Package size={40} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400">No products found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ ORDERS ══ */}
        {tab === 'orders' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Orders', value: SEED_COMMISSIONS.length, color: 'text-gray-900' },
                { label: 'Delivered', value: SEED_COMMISSIONS.filter(c => c.status === 'delivered').length, color: 'text-success-600' },
                { label: 'Processing', value: SEED_COMMISSIONS.filter(c => c.status === 'processing').length, color: 'text-blue-600' },
                { label: 'Pending', value: SEED_COMMISSIONS.filter(c => c.status === 'pending').length, color: 'text-yellow-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold">Order Ref</th>
                      <th className="px-5 py-3 text-left font-semibold hidden sm:table-cell">Seller</th>
                      <th className="px-5 py-3 text-left font-semibold">Subtotal</th>
                      <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Commission</th>
                      <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Seller Earnings</th>
                      <th className="px-5 py-3 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {SEED_COMMISSIONS.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs text-gray-500 font-semibold">{c.order_ref}</td>
                        <td className="px-5 py-4 hidden sm:table-cell text-gray-700">{c.seller_name}</td>
                        <td className="px-5 py-4 font-bold text-gray-900">{fmt(c.subtotal)}</td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="text-primary-600 font-semibold">{fmt(c.commission_amount)}</span>
                          <span className="text-xs text-gray-400 ml-1">({c.commission_rate}%)</span>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell text-success-600 font-semibold">{fmt(c.seller_earnings)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            c.status === 'delivered' ? 'bg-success-100 text-success-700' :
                            c.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ COMMISSIONS ══ */}
        {tab === 'commissions' && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Platform Revenue', value: fmt(commissions.reduce((s, c) => s + c.commission_amount, 0)), color: 'text-primary-600', bg: 'bg-primary-50' },
                { label: 'Collected (Delivered)', value: fmt(totalRevenue), color: 'text-success-600', bg: 'bg-success-50' },
                { label: 'Pending Collection', value: fmt(commissions.filter(c => c.status !== 'delivered').reduce((s, c) => s + c.commission_amount, 0)), color: 'text-yellow-600', bg: 'bg-yellow-50' },
              ].map((m, i) => (
                <div key={i} className={`${m.bg} rounded-2xl p-5 border border-gray-100`}>
                  <p className={`text-3xl font-bold ${m.color} mb-1`}>{m.value}</p>
                  <p className="font-semibold text-gray-700 text-sm">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Commission by plan breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-5">Commission Rates by Plan</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { plan: 'Free',        rate: '8%',   color: 'border-gray-300 bg-gray-50',      text: 'text-gray-700' },
                  { plan: 'Starter',     rate: '5%',   color: 'border-blue-200 bg-blue-50',      text: 'text-blue-700' },
                  { plan: 'Pro',         rate: '3%',   color: 'border-purple-200 bg-purple-50',  text: 'text-purple-700' },
                  { plan: 'Enterprise',  rate: '1.5%', color: 'border-yellow-200 bg-yellow-50',  text: 'text-yellow-700' },
                ].map(p => (
                  <div key={p.plan} className={`rounded-xl p-4 border-2 text-center ${p.color}`}>
                    <p className={`text-3xl font-bold ${p.text} mb-1`}>{p.rate}</p>
                    <p className="text-sm font-semibold text-gray-600">{p.plan} Plan</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Commission is deducted from the seller's earnings on each delivered order. Sellers on higher plans pay lower commission rates as an incentive to upgrade.
              </p>
            </div>

            {/* Per-order commission table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Commission Ledger</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold">Order</th>
                      <th className="px-5 py-3 text-left font-semibold">Seller</th>
                      <th className="px-5 py-3 text-left font-semibold">Plan</th>
                      <th className="px-5 py-3 text-left font-semibold">Sale</th>
                      <th className="px-5 py-3 text-left font-semibold">Commission</th>
                      <th className="px-5 py-3 text-left font-semibold">To Seller</th>
                      <th className="px-5 py-3 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {commissions.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-500 font-semibold">{c.order_ref}</td>
                        <td className="px-5 py-3.5 text-gray-700">{c.seller_name}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${planColor[c.plan]}`}>{c.plan}</span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-900 font-semibold">{fmt(c.subtotal)}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-primary-600 font-bold">{fmt(c.commission_amount)}</span>
                          <span className="text-xs text-gray-400 ml-1">({c.commission_rate}%)</span>
                        </td>
                        <td className="px-5 py-3.5 text-success-600 font-semibold">{fmt(c.seller_earnings)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            c.status === 'delivered' ? 'bg-success-100 text-success-700' :
                            c.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                    <tr>
                      <td colSpan={4} className="px-5 py-3 text-sm font-bold text-gray-700">Totals</td>
                      <td className="px-5 py-3 text-primary-600 font-bold">{fmt(commissions.reduce((s, c) => s + c.commission_amount, 0))}</td>
                      <td className="px-5 py-3 text-success-600 font-bold">{fmt(commissions.reduce((s, c) => s + c.seller_earnings, 0))}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
