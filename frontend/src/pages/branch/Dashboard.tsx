import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { Card, Badge, Spinner } from '@components/common'
import {
  DollarSign,
  Package,
  AlertTriangle,
  ShoppingCart,
  FileText,
  Globe,
  TrendingUp,
  Plus,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import dashboardService, { 
  BranchStats, 
  SalesTrendData, 
  TopProduct 
} from '@services/dashboardService'

const BranchDashboard = () => {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [stats, setStats] = useState<BranchStats | null>(null)
  const [salesTrend, setSalesTrend] = useState<SalesTrendData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [trendPeriod, setTrendPeriod] = useState<'7days' | '30days'>('7days')

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    loadSalesTrend()
  }, [trendPeriod])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, productsData] = await Promise.all([
        dashboardService.getBranchStats(),
        dashboardService.getTopProducts(5),
      ])
      
      setStats(statsData)
      setTopProducts(productsData)
      
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
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Branch Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome, {user?.username}!</p>
        {user?.branchName && (
          <Badge variant="info" className="mt-2">{user.branchName}</Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Today's Sales */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Today's Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.todayRevenue || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{stats?.todaySalesCount || 0} transactions</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        {/* Month Revenue */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Month Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.monthRevenue || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{stats?.monthSalesCount || 0} sales</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        {/* Month Profit */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Month Profit</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats?.monthProfit || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Net earnings</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>

        {/* Low Stock */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600">{stats?.lowStockCount || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{stats?.totalProducts || 0} total products</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-yellow-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/branch/sales')}
            className="flex flex-col items-center gap-3 p-4 border-2 border-primary-200 rounded-lg hover:bg-primary-50 hover:border-primary-400 transition-all group active:scale-95"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <Plus className="text-primary-600" size={24} />
            </div>
            <span className="text-sm font-medium text-gray-700">New Sale</span>
          </button>

          <button
            onClick={() => navigate('/branch/products')}
            className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all group active:scale-95"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <Package className="text-gray-600" size={24} />
            </div>
            <span className="text-sm font-medium text-gray-700">Add Product</span>
          </button>

          <button
            onClick={() => navigate('/branch/reports')}
            className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all group active:scale-95"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <FileText className="text-gray-600" size={24} />
            </div>
            <span className="text-sm font-medium text-gray-700">View Reports</span>
          </button>

          <button
            onClick={() => navigate('/branch/inventory')}
            className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all group active:scale-95 relative"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <Globe className="text-gray-600" size={24} />
            </div>
            <span className="text-sm font-medium text-gray-700">Inventory</span>
            {stats && stats.pendingRequests > 0 && (
              <Badge variant="error" size="sm" className="absolute top-2 right-2">
                {stats.pendingRequests}
              </Badge>
            )}
          </button>
        </div>
      </Card>

      {/* Sales Trend Chart */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Sales Trend</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTrendPeriod('7days')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                trendPeriod === '7days'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTrendPeriod('30days')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                trendPeriod === '30days'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={formatDate}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#6366F1" 
              strokeWidth={2}
              name="Revenue"
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Profit"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Products */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Selling Products</h2>
        <div className="space-y-3">
          {topProducts.length > 0 ? (
            topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.unitsSold} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                  <p className="text-xs text-green-600">+{formatCurrency(product.profit)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No product data available</p>
          )}
        </div>
      </Card>
    </div>
  )
}

export default BranchDashboard
