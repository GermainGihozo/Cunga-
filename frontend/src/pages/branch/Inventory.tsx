import { useEffect, useState } from 'react'
import { Package, TrendingUp, AlertTriangle, Archive } from 'lucide-react'
import { Spinner } from '@components/common'
import { InventoryAlerts } from '@components/features'
import productService from '@services/productService'
import { Product } from '@types'

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const result = await productService.getProducts({
        page: 1,
        limit: 1000, // Get all products for alert monitoring
        status: 'active',
      })
      setProducts(result.data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await loadProducts()
  }

  const totalProducts = products.length
  const inStockProducts = products.filter(p => p.quantity > p.min_stock_level).length
  const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity <= p.min_stock_level).length
  const outOfStockProducts = products.filter(p => p.quantity === 0).length

  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.cost_price), 0)

  const formatCurrency = (amount: number) => {
    return `RWF ${Math.round(amount).toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Spinner size="lg" />
        <p className="text-gray-600 mt-4 font-medium">Loading inventory data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
          Inventory Management
        </h1>
        <p className="text-gray-600 mt-2 flex items-center gap-2">
          <Package size={16} className="text-primary-500" />
          Monitor stock levels and manage inventory alerts
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-hover bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
              <p className="text-3xl font-display font-bold text-gray-900">{totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-cunga">
              <Package className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-success-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Well Stocked</p>
              <p className="text-3xl font-display font-bold text-success-600">{inStockProducts}</p>
              <p className="text-xs text-gray-500 mt-1">
                {totalProducts > 0 ? Math.round((inStockProducts / totalProducts) * 100) : 0}% of total
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-warning-50 to-white border-2 border-warning-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Low Stock</p>
              <p className="text-3xl font-display font-bold text-warning-600">{lowStockProducts}</p>
              <p className="text-xs text-gray-500 mt-1">Needs attention</p>
            </div>
            <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-accent-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Inventory Value</p>
              <p className="text-2xl font-display font-bold text-gray-900">{formatCurrency(totalValue)}</p>
              <p className="text-xs text-gray-500 mt-1">Total cost value</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-accent">
              <Archive className="text-white" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Alerts Component */}
      <InventoryAlerts 
        products={products} 
        onRefresh={handleRefresh}
      />
    </div>
  )
}

export default Inventory
