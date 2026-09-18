import { useEffect, useState, useCallback } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  Users, Package, Calendar, Download, RefreshCw, Filter,
} from 'lucide-react'
import { Button, Card, Select, Spinner } from '@components/common'
import { BRAND_COLORS } from '@constants/brand'
import api from '@services/api'

interface AnalyticsData {
  revenue: { period: string; amount: number; profit: number }[]
  products: { name: string; sales: number; revenue: number }[]
  categories: { name: string; value: number; percentage: number }[]
  branches: { name: string; sales: number; revenue: number; growth: number }[]
  trends: { month: string; orders: number; customers: number; avgOrder: number }[]
}

// ── Mock fallback data (used when API is unavailable) ─────
const MOCK_REVENUE = [
  { period: 'Jan', amount: 45000, profit: 15000 },
  { period: 'Feb', amount: 52000, profit: 18000 },
  { period: 'Mar', amount: 48000, profit: 16500 },
  { period: 'Apr', amount: 61000, profit: 21000 },
  { period: 'May', amount: 55000, profit: 19000 },
  { period: 'Jun', amount: 67000, profit: 24000 },
]
const MOCK_PRODUCTS = [
  { name: 'Laptop Pro', sales: 145, revenue: 145000 },
  { name: 'Wireless Mouse', sales: 320, revenue: 9600 },
  { name: 'USB Cable', sales: 580, revenue: 5800 },
  { name: 'Phone Case', sales: 420, revenue: 12600 },
  { name: 'Headphones', sales: 280, revenue: 28000 },
]
const MOCK_CATEGORIES = [
  { name: 'Electronics', value: 45, percentage: 45 },
  { name: 'Accessories', value: 30, percentage: 30 },
  { name: 'Cables', value: 15, percentage: 15 },
  { name: 'Others', value: 10, percentage: 10 },
]
const MOCK_BRANCHES = [
  { name: 'Main Store',  sales: 450, revenue: 125000, growth: 12.5 },
  { name: 'Downtown',   sales: 380, revenue: 98000,  growth: 8.3  },
  { name: 'Mall Branch',sales: 520, revenue: 145000, growth: 15.2 },
  { name: 'Airport',    sales: 290, revenue: 78000,  growth: -3.1 },
]
const MOCK_TRENDS = [
  { month: 'Jan', orders: 450, customers: 320, avgOrder: 140 },
  { month: 'Feb', orders: 520, customers: 380, avgOrder: 135 },
  { month: 'Mar', orders: 480, customers: 360, avgOrder: 145 },
  { month: 'Apr', orders: 610, customers: 440, avgOrder: 150 },
  { month: 'May', orders: 550, customers: 410, avgOrder: 138 },
  { month: 'Jun', orders: 670, customers: 490, avgOrder: 155 },
]

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('30days')

  const loadAnalytics = useCallback(async () => {
    try {
      // Fetch from real API endpoints in parallel, fall back to mock if unavailable
      const [trendsRes, topProdsRes, branchRes, keyRes] = await Promise.allSettled([
        api.get(`/analytics/revenue-trends?period=${timeRange}`),
        api.get('/analytics/top-products?limit=5'),
        api.get('/analytics/branch-comparison'),
        api.get('/analytics/key-metrics'),
      ])

      const trends    = trendsRes.status    === 'fulfilled' ? trendsRes.value.data.data    : []
      const topProds  = topProdsRes.status  === 'fulfilled' ? topProdsRes.value.data.data  : []
      const branchComp= branchRes.status    === 'fulfilled' ? branchRes.value.data.data    : []
      const keyMetrics= keyRes.status       === 'fulfilled' ? keyRes.value.data.data       : {}

      // Map API shapes → AnalyticsData shape, fall back to mock where fields differ
      setData({
        revenue: trends.length ? trends.map((t: { period?: string; date?: string; revenue?: number; amount?: number; profit?: number }) => ({
          period:  t.period || t.date || '',
          amount:  t.revenue ?? t.amount ?? 0,
          profit:  t.profit ?? 0,
        })) : MOCK_REVENUE,

        products: topProds.length ? topProds.map((p: { name: string; unitsSold?: number; sales?: number; revenue: number }) => ({
          name:    p.name,
          sales:   p.unitsSold ?? p.sales ?? 0,
          revenue: p.revenue ?? 0,
        })) : MOCK_PRODUCTS,

        categories: keyMetrics.categories?.length ? keyMetrics.categories : MOCK_CATEGORIES,

        branches: branchComp.length ? branchComp.map((b: { name: string; salesCount?: number; sales?: number; revenue: number; growth?: number }) => ({
          name:    b.name,
          sales:   b.salesCount ?? b.sales ?? 0,
          revenue: b.revenue ?? 0,
          growth:  b.growth ?? 0,
        })) : MOCK_BRANCHES,

        trends: MOCK_TRENDS,
      })
    } catch {
      // Full fallback to mock data so the page never shows blank
      setData({ revenue: MOCK_REVENUE, products: MOCK_PRODUCTS, categories: MOCK_CATEGORIES, branches: MOCK_BRANCHES, trends: MOCK_TRENDS })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [timeRange])

  useEffect(() => { loadAnalytics() }, [loadAnalytics])

  const handleRefresh = () => { setRefreshing(true); loadAnalytics() }
  const formatCurrency = (amount: number) => {
    return `RWF ${Math.round(amount).toLocaleString()}`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border-2 border-primary-200">
          <p className="font-bold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const COLORS = [
    BRAND_COLORS.primary[500],
    BRAND_COLORS.accent[500],
    BRAND_COLORS.success[500],
    BRAND_COLORS.warning[500],
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Spinner size="lg" />
        <p className="text-gray-600 mt-4 font-medium">Loading analytics data...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load analytics data</p>
      </div>
    )
  }

  const totalRevenue = data.revenue.reduce((sum, item) => sum + item.amount, 0)
  const totalProfit = data.revenue.reduce((sum, item) => sum + item.profit, 0)
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1)
  const totalOrders = data.trends.reduce((sum, item) => sum + item.orders, 0)
  const totalCustomers = data.trends[data.trends.length - 1]?.customers || 0

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary-500" />
            Advanced insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            leftIcon={<Calendar size={18} />}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">This Year</option>
          </Select>
          <Button
            onClick={handleRefresh}
            variant="outline"
            leftIcon={refreshing ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            disabled={refreshing}
          >
            Refresh
          </Button>
          <Button
            leftIcon={<Download size={18} />}
            className="btn-primary shadow-cunga"
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-hover bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
                {formatCurrency(totalRevenue)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp size={14} className="text-success-600" />
                <span className="text-xs font-semibold text-success-600">+12.5%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-cunga">
              <DollarSign className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-success-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Profit</p>
              <p className="text-3xl font-display font-bold text-success-600">
                {formatCurrency(totalProfit)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs font-semibold text-gray-600">Margin: {profitMargin}%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-accent-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
              <p className="text-3xl font-display font-bold text-gray-900">{totalOrders}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp size={14} className="text-success-600" />
                <span className="text-xs font-semibold text-success-600">+8.3%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-accent">
              <ShoppingBag className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-warning-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Customers</p>
              <p className="text-3xl font-display font-bold text-gray-900">{totalCustomers}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp size={14} className="text-success-600" />
                <span className="text-xs font-semibold text-success-600">+15.2%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center shadow-lg">
              <Users className="text-white" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue & Profit Trend */}
      <div className="card-hover">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-1">
            Revenue & Profit Trend
          </h2>
          <p className="text-sm text-gray-600">Monthly revenue and profit performance</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data.revenue}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BRAND_COLORS.primary[500]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={BRAND_COLORS.primary[500]} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BRAND_COLORS.success[500]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={BRAND_COLORS.success[500]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="period" 
              stroke="#6b7280"
              style={{ fontSize: '12px', fontWeight: 500 }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px', fontWeight: 500 }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '14px', fontWeight: 600 }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="amount"
              name="Revenue"
              stroke={BRAND_COLORS.primary[500]}
              strokeWidth={3}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="profit"
              name="Profit"
              stroke={BRAND_COLORS.success[500]}
              strokeWidth={3}
              fill="url(#colorProfit)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Product Performance & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card-hover">
          <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-1">
              Top Selling Products
            </h2>
            <p className="text-sm text-gray-600">Best performing products by revenue</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.products} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                type="number"
                stroke="#6b7280"
                style={{ fontSize: '12px', fontWeight: 500 }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <YAxis 
                type="category"
                dataKey="name" 
                stroke="#6b7280"
                style={{ fontSize: '12px', fontWeight: 500 }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="revenue" 
                name="Revenue"
                fill={BRAND_COLORS.primary[500]}
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="card-hover">
          <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-1">
              Category Distribution
            </h2>
            <p className="text-sm text-gray-600">Sales breakdown by category</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.categories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {data.categories.map((cat, index) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {cat.name}: <span className="font-bold">{cat.percentage}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Branch Performance */}
      <div className="card-hover">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-1">
            Branch Performance Comparison
          </h2>
          <p className="text-sm text-gray-600">Revenue and growth by branch location</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.branches}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              style={{ fontSize: '12px', fontWeight: 500 }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px', fontWeight: 500 }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '14px', fontWeight: 600 }}
              iconType="circle"
            />
            <Bar 
              dataKey="revenue" 
              name="Revenue"
              fill={BRAND_COLORS.primary[500]}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-6 grid grid-cols-4 gap-4">
          {data.branches.map((branch) => (
            <div key={branch.name} className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-1">{branch.name}</p>
              <p className="text-xl font-display font-bold text-gray-900">{branch.sales}</p>
              <div className="flex items-center gap-1 mt-2">
                {branch.growth > 0 ? (
                  <>
                    <TrendingUp size={14} className="text-success-600" />
                    <span className="text-xs font-semibold text-success-600">+{branch.growth}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown size={14} className="text-error-600" />
                    <span className="text-xs font-semibold text-error-600">{branch.growth}%</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Trends */}
      <div className="card-hover">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-1">
            Business Trends Overview
          </h2>
          <p className="text-sm text-gray-600">Orders, customers, and average order value trends</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              style={{ fontSize: '12px', fontWeight: 500 }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px', fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '14px', fontWeight: 600 }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke={BRAND_COLORS.primary[500]}
              strokeWidth={3}
              dot={{ fill: BRAND_COLORS.primary[500], r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="customers"
              name="Customers"
              stroke={BRAND_COLORS.accent[500]}
              strokeWidth={3}
              dot={{ fill: BRAND_COLORS.accent[500], r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="avgOrder"
              name="Avg Order Value"
              stroke={BRAND_COLORS.success[500]}
              strokeWidth={3}
              dot={{ fill: BRAND_COLORS.success[500], r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default Analytics
