import { useEffect, useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import { Card, Badge, Spinner } from '@components/common'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Store, 
  Users, 
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { BRAND_COLORS, CHART_COLORS } from '@constants/brand'
import dashboardService, {
  AdminStats,
  MarketplaceStats,
  SalesTrendData, 
  TopProduct, 
  BranchPerformance 
} from '@services/dashboardService'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [marketplaceStats, setMarketplaceStats] = useState<MarketplaceStats | null>(null)
  const [salesTrend, setSalesTrend] = useState<SalesTrendData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [branchPerformance, setBranchPerformance] = useState<BranchPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [trendPeriod, setTrendPeriod] = useState<'7days' | '30days' | '12months'>('7days')

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    loadSalesTrend()
  }, [trendPeriod])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, productsData, branchData, mktData] = await Promise.all([
        dashboardService.getAdminStats(),
        dashboardService.getTopProducts(5),
        dashboardService.getBranchPerformance(),
        dashboardService.getMarketplaceStats().catch(() => null),
      ])

      setStats(statsData)
      setTopProducts(productsData)
      setBranchPerformance(branchData)
      if (mktData) setMarketplaceStats(mktData)

      await loadSalesTrend()
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSalesTrend = async () => {
    try {
      const trend = await dashboardService.getSalesTrend(trendPeriod)
      setSalesTrend(trend)
    } catch (error) {
      console.error('Failed to load sales trend:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return `RWF ${Math.round(amount).toLocaleString()}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <Activity size={16} className="text-primary-500" />
            Welcome back, <span className="font-semibold text-gray-900">{user?.username}</span>!
          </p>
        </div>
        <Badge variant="success" size="lg" className="hidden md:flex">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
            System Active
          </span>
        </Badge>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Revenue */}
        <div className="card hover-lift group cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Today's Revenue</p>
              <p className="text-3xl font-display font-bold text-gray-900">
                {formatCurrency(stats?.todayRevenue || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Real-time tracking</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-cunga group-hover:scale-110 transition-transform">
              <DollarSign className="text-white" size={26} />
            </div>
          </div>
        </div>

        {/* Month Revenue */}
        <div className="card hover-lift group cursor-pointer bg-gradient-to-br from-success-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Month Revenue</p>
              <p className="text-3xl font-display font-bold text-gray-900">
                {formatCurrency(stats?.monthRevenue || 0)}
              </p>
              {stats && stats.revenueGrowth !== 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  {stats.revenueGrowth > 0 ? (
                    <>
                      <div className="p-1 bg-success-100 rounded-lg">
                        <ArrowUpRight size={12} className="text-success-600" />
                      </div>
                      <span className="text-sm font-semibold text-success-600">
                        +{stats.revenueGrowth}% from last month
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="p-1 bg-error-100 rounded-lg">
                        <ArrowDownRight size={12} className="text-error-600" />
                      </div>
                      <span className="text-sm font-semibold text-error-600">
                        {stats.revenueGrowth}% from last month
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="w-14 h-14 bg-gradient-success rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <TrendingUp className="text-white" size={26} />
            </div>
          </div>
        </div>

        {/* Month Profit */}
        <div className="card hover-lift group cursor-pointer bg-gradient-to-br from-accent-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Month Profit</p>
              <p className="text-3xl font-display font-bold bg-gradient-success bg-clip-text text-transparent">
                {formatCurrency(stats?.monthProfit || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                <span className="font-semibold text-gray-700">{stats?.salesCount || 0}</span> transactions
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-accent group-hover:scale-110 transition-transform">
              <ShoppingCart className="text-white" size={26} />
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card hover-lift group cursor-pointer bg-gradient-to-br from-warning-50 to-white border-2 border-warning-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Low Stock Items</p>
              <p className="text-3xl font-display font-bold text-warning-600">
                {stats?.lowStockCount || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Out of <span className="font-semibold text-gray-700">{stats?.totalProducts || 0}</span> products
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-warning rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <AlertTriangle className="text-white" size={26} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-hover bg-gradient-to-br from-primary-50 via-white to-accent-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-cunga">
              <Store className="text-white" size={22} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Active Branches</p>
              <p className="text-2xl font-display font-bold text-gray-900">{stats?.totalBranches || 0}</p>
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-accent-50 via-white to-primary-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-accent">
              <Users className="text-white" size={22} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-display font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-warning-50 via-white to-primary-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center shadow-lg">
              <Package className="text-white" size={22} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-display font-bold text-gray-900">{stats?.totalProducts || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="card-hover">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900">Sales Trend</h2>
            <p className="text-sm text-gray-600 mt-1">Revenue and profit analysis</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTrendPeriod('7days')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                trendPeriod === '7days'
                  ? 'bg-gradient-primary text-white shadow-cunga'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTrendPeriod('30days')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                trendPeriod === '30days'
                  ? 'bg-gradient-primary text-white shadow-cunga'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTrendPeriod('12months')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                trendPeriod === '12months'
                  ? 'bg-gradient-primary text-white shadow-cunga'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              12 Months
            </button>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#6B7280"
                style={{ fontSize: '12px', fontWeight: 500 }}
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: '12px', fontWeight: 500 }}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={formatDate}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke={BRAND_COLORS.primary.main}
                strokeWidth={3}
                name="Revenue"
                dot={{ fill: BRAND_COLORS.primary.main, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke={BRAND_COLORS.success.main}
                strokeWidth={3}
                name="Profit"
                dot={{ fill: BRAND_COLORS.success.main, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="card-hover">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-900">Top Products</h2>
              <p className="text-sm text-gray-600 mt-1">Best performing items this month</p>
            </div>
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-cunga">
              <Package className="text-white" size={20} />
            </div>
          </div>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-md transition-all group border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      'bg-gradient-primary'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className="font-semibold text-gray-700">{product.unitsSold}</span> units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(product.revenue)}</p>
                    <p className="text-sm font-semibold text-success-600 mt-0.5">
                      +{formatCurrency(product.profit)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Package className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 font-medium">No product data available</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Marketplace Overview ── */}
        {marketplaceStats && (
          <div className="space-y-6">
            {/* Marketplace header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
                  <Store size={24} className="text-primary-500" />
                  Marketplace Overview
                </h2>
                <p className="text-sm text-gray-600 mt-1">Real-time seller and order metrics</p>
              </div>
              <a
                href="/admin/marketplace"
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
              >
                Full Marketplace Admin →
              </a>
            </div>

            {/* Marketplace KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Active Sellers',
                  value: String(marketplaceStats.sellers.active_sellers ?? 0),
                  sub:   `${marketplaceStats.sellers.pending_sellers ?? 0} pending approval`,
                  color: 'bg-primary-500',
                  alert: (marketplaceStats.sellers.pending_sellers ?? 0) > 0,
                },
                {
                  label: 'Month GMV',
                  value: formatCurrency(Number(marketplaceStats.monthOrders.month_gmv ?? 0)),
                  sub:   `${marketplaceStats.monthOrders.month_orders ?? 0} orders this month`,
                  color: 'bg-success-500',
                  alert: false,
                },
                {
                  label: 'Commission Earned',
                  value: formatCurrency(Number(marketplaceStats.orders.collected_commission ?? 0)),
                  sub:   `${formatCurrency(Number(marketplaceStats.monthOrders.month_commission ?? 0))} this month`,
                  color: 'bg-accent-500',
                  alert: false,
                },
                {
                  label: 'Products Listed',
                  value: String(marketplaceStats.products.active_products ?? 0),
                  sub:   `${marketplaceStats.products.pending_review ?? 0} pending review`,
                  color: 'bg-warning-500',
                  alert: (marketplaceStats.products.pending_review ?? 0) > 0,
                },
              ].map((card, i) => (
                <div key={i} className="card hover-lift cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      {i === 0 && <Users className="text-white" size={20} />}
                      {i === 1 && <TrendingUp className="text-white" size={20} />}
                      {i === 2 && <DollarSign className="text-white" size={20} />}
                      {i === 3 && <Package className="text-white" size={20} />}
                    </div>
                    {card.alert && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full animate-pulse">
                        ⚠ Action needed
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm font-medium text-gray-600 mt-0.5">{card.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Pending actions strip */}
            {((marketplaceStats.sellers.pending_sellers ?? 0) > 0 ||
              (marketplaceStats.products.pending_review ?? 0) > 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0" />
                  <span className="text-sm font-semibold">Marketplace actions required</span>
                </div>
                <div className="flex flex-wrap gap-3 ml-auto">
                  {(marketplaceStats.sellers.pending_sellers ?? 0) > 0 && (
                    <a href="/admin/marketplace"
                      className="text-xs font-bold px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                      Review {marketplaceStats.sellers.pending_sellers} pending seller{(marketplaceStats.sellers.pending_sellers ?? 0) > 1 ? 's' : ''}
                    </a>
                  )}
                  {(marketplaceStats.products.pending_review ?? 0) > 0 && (
                    <a href="/admin/marketplace"
                      className="text-xs font-bold px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                      Review {marketplaceStats.products.pending_review} product{(marketplaceStats.products.pending_review ?? 0) > 1 ? 's' : ''}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Marketplace order funnel */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-5">Order Status Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Orders',     value: marketplaceStats.orders.total_orders     ?? 0, color: 'text-gray-900',    bg: 'bg-gray-50'    },
                  { label: 'Pending',          value: marketplaceStats.orders.pending_orders   ?? 0, color: 'text-yellow-700',  bg: 'bg-yellow-50'  },
                  { label: 'Delivered',        value: marketplaceStats.orders.delivered_orders ?? 0, color: 'text-success-700', bg: 'bg-success-50' },
                  { label: 'Total Marketplace GMV', value: formatCurrency(Number(marketplaceStats.orders.total_gmv ?? 0)), color: 'text-primary-700', bg: 'bg-primary-50' },
                ].map((item, i) => (
                  <div key={i} className={`${item.bg} rounded-xl p-4 text-center`}>
                    <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Branch Performance */}
        <div className="card-hover">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-900">Branch Performance</h2>
              <p className="text-sm text-gray-600 mt-1">Revenue comparison by location</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-accent">
              <Store className="text-white" size={20} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6B7280"
                  style={{ fontSize: '12px', fontWeight: 500 }}
                />
                <YAxis 
                  stroke="#6B7280"
                  style={{ fontSize: '12px', fontWeight: 500 }}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar 
                  dataKey="revenue" 
                  fill={BRAND_COLORS.primary.main}
                  name="Revenue" 
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="profit" 
                  fill={BRAND_COLORS.success.main}
                  name="Profit" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
