import { useEffect, useState } from 'react'
import { 
  AlertTriangle, 
  Package, 
  TrendingDown, 
  X, 
  RefreshCw,
  Eye,
  Bell,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { Badge, Button, Spinner } from '@components/common'
import { BRAND_COLORS } from '@constants/brand'
import { Product } from '@types'

interface InventoryAlert {
  id: number
  type: 'out_of_stock' | 'low_stock' | 'critical_low'
  product: Product
  currentStock: number
  minStock: number
  severity: 'high' | 'medium' | 'low'
  message: string
}

interface InventoryAlertsProps {
  products?: Product[]
  onRefresh?: () => void
  showDismissed?: boolean
}

const InventoryAlerts: React.FC<InventoryAlertsProps> = ({ 
  products = [], 
  onRefresh,
  showDismissed = false 
}) => {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set())
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    generateAlerts()
  }, [products])

  const generateAlerts = () => {
    const newAlerts: InventoryAlert[] = []

    products.forEach(product => {
      if (product.status !== 'active') return

      // Out of stock alert
      if (product.quantity === 0) {
        newAlerts.push({
          id: product.id,
          type: 'out_of_stock',
          product,
          currentStock: 0,
          minStock: product.min_stock_level,
          severity: 'high',
          message: `${product.name} is completely out of stock!`
        })
      }
      // Critical low stock (50% or less of minimum)
      else if (product.quantity <= product.min_stock_level * 0.5) {
        newAlerts.push({
          id: product.id,
          type: 'critical_low',
          product,
          currentStock: product.quantity,
          minStock: product.min_stock_level,
          severity: 'high',
          message: `${product.name} is critically low (${product.quantity} units remaining)`
        })
      }
      // Low stock alert
      else if (product.quantity <= product.min_stock_level) {
        newAlerts.push({
          id: product.id,
          type: 'low_stock',
          product,
          currentStock: product.quantity,
          minStock: product.min_stock_level,
          severity: 'medium',
          message: `${product.name} is running low (${product.quantity} units remaining)`
        })
      }
    })

    // Sort by severity
    newAlerts.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })

    setAlerts(newAlerts)
  }

  const handleDismiss = (alertId: number) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]))
  }

  const handleRefresh = async () => {
    setLoading(true)
    if (onRefresh) {
      await onRefresh()
    }
    setDismissedAlerts(new Set())
    setTimeout(() => setLoading(false), 500)
  }

  const getAlertIcon = (type: InventoryAlert['type']) => {
    switch (type) {
      case 'out_of_stock':
        return <XCircle className="text-error-600" size={24} />
      case 'critical_low':
        return <AlertTriangle className="text-warning-600" size={24} />
      case 'low_stock':
        return <TrendingDown className="text-warning-500" size={24} />
      default:
        return <AlertTriangle className="text-gray-600" size={24} />
    }
  }

  const getAlertBg = (severity: InventoryAlert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-gradient-to-br from-error-50 to-warning-50 border-2 border-error-200'
      case 'medium':
        return 'bg-gradient-to-br from-warning-50 to-yellow-50 border-2 border-warning-200'
      case 'low':
        return 'bg-gradient-to-br from-blue-50 to-primary-50 border border-blue-200'
      default:
        return 'bg-gray-50 border border-gray-200'
    }
  }

  const getSeverityBadge = (severity: InventoryAlert['severity']) => {
    switch (severity) {
      case 'high':
        return <Badge variant="error" className="animate-pulse">Critical</Badge>
      case 'medium':
        return <Badge variant="warning">Warning</Badge>
      case 'low':
        return <Badge variant="info">Info</Badge>
      default:
        return <Badge variant="default">Alert</Badge>
    }
  }

  const getStockPercentage = (current: number, min: number) => {
    if (min === 0) return 0
    return Math.round((current / min) * 100)
  }

  const filteredAlerts = alerts
    .filter(alert => !dismissedAlerts.has(alert.id))
    .filter(alert => filter === 'all' || alert.severity === filter)

  const alertCounts = {
    high: alerts.filter(a => a.severity === 'high' && !dismissedAlerts.has(a.id)).length,
    medium: alerts.filter(a => a.severity === 'medium' && !dismissedAlerts.has(a.id)).length,
    low: alerts.filter(a => a.severity === 'low' && !dismissedAlerts.has(a.id)).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center shadow-lg">
            <Bell className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900">Inventory Alerts</h2>
            <p className="text-sm text-gray-600 mt-0.5">
              {filteredAlerts.length} active {filteredAlerts.length === 1 ? 'alert' : 'alerts'}
            </p>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          leftIcon={loading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-hover bg-gradient-to-br from-error-50 to-white border-2 border-error-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Critical Alerts</p>
              <p className="text-3xl font-display font-bold text-error-600">{alertCounts.high}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-error-500 to-error-600 rounded-xl flex items-center justify-center shadow-lg">
              <XCircle className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-warning-50 to-white border-2 border-warning-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Warning Alerts</p>
              <p className="text-3xl font-display font-bold text-warning-600">{alertCounts.medium}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Info Alerts</p>
              <p className="text-3xl font-display font-bold text-primary-600">{alertCounts.low}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-cunga">
              <TrendingDown className="text-white" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-gradient-primary text-white' : ''}
        >
          All ({filteredAlerts.length})
        </Button>
        <Button
          size="sm"
          variant={filter === 'high' ? 'primary' : 'outline'}
          onClick={() => setFilter('high')}
          className={filter === 'high' ? 'bg-gradient-to-br from-error-500 to-error-600 text-white' : ''}
        >
          Critical ({alertCounts.high})
        </Button>
        <Button
          size="sm"
          variant={filter === 'medium' ? 'primary' : 'outline'}
          onClick={() => setFilter('medium')}
          className={filter === 'medium' ? 'bg-gradient-warning text-white' : ''}
        >
          Warning ({alertCounts.medium})
        </Button>
        <Button
          size="sm"
          variant={filter === 'low' ? 'primary' : 'outline'}
          onClick={() => setFilter('low')}
        >
          Info ({alertCounts.low})
        </Button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="text-gray-600 mt-4 font-medium">Refreshing alerts...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="card bg-gradient-to-br from-success-50 to-white border-2 border-success-200 text-center py-12">
            <CheckCircle2 className="mx-auto text-success-600 mb-4" size={64} />
            <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
              All Clear!
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No inventory alerts at this time. Your stock levels look good!'
                : `No ${filter} severity alerts at this time.`}
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`card-hover ${getAlertBg(alert.severity)} relative overflow-hidden`}
            >
              {/* Severity indicator bar */}
              <div className={`absolute top-0 left-0 w-1 h-full ${
                alert.severity === 'high' ? 'bg-gradient-to-b from-error-500 to-error-600' :
                alert.severity === 'medium' ? 'bg-gradient-warning' :
                'bg-gradient-primary'
              }`} />

              <div className="pl-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md ${
                      alert.severity === 'high' ? 'bg-gradient-to-br from-error-100 to-error-200' :
                      alert.severity === 'medium' ? 'bg-gradient-to-br from-warning-100 to-warning-200' :
                      'bg-gradient-to-br from-blue-100 to-blue-200'
                    }`}>
                      {getAlertIcon(alert.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display font-bold text-gray-900 text-lg">
                          {alert.product.name}
                        </h3>
                        {getSeverityBadge(alert.severity)}
                      </div>

                      <p className="text-sm text-gray-700 font-medium mb-3">
                        {alert.message}
                      </p>

                      {/* Stock indicator */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Current Stock:</span>
                          <span className="font-bold text-gray-900">
                            {alert.currentStock} / {alert.minStock} units
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              alert.type === 'out_of_stock' ? 'bg-gradient-to-r from-error-500 to-error-600' :
                              alert.type === 'critical_low' ? 'bg-gradient-warning' :
                              'bg-gradient-to-r from-warning-400 to-warning-500'
                            }`}
                            style={{ width: `${Math.min(getStockPercentage(alert.currentStock, alert.minStock), 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          {getStockPercentage(alert.currentStock, alert.minStock)}% of minimum stock level
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Package size={16} />}
                          className="hover:bg-white"
                        >
                          Reorder
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Eye size={16} />}
                          className="hover:bg-white"
                        >
                          View Product
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Dismiss button */}
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="p-2 rounded-lg hover:bg-white/80 transition-all hover:scale-110"
                    title="Dismiss alert"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dismissed alerts count */}
      {dismissedAlerts.size > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {dismissedAlerts.size} {dismissedAlerts.size === 1 ? 'alert' : 'alerts'} dismissed
          </p>
        </div>
      )}
    </div>
  )
}

export default InventoryAlerts
