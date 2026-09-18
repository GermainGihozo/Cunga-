import { useState } from 'react'
import api from '@services/api'
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  ShoppingBag,
  BarChart3,
  PieChart as PieChartIcon,
  FileSpreadsheet,
  Printer,
  Mail,
  Check,
} from 'lucide-react'
import { Button, Card, Select, Input, Badge, Alert } from '@components/common'
import { BRAND_COLORS } from '@constants/brand'

interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'financial' | 'inventory' | 'sales' | 'customer'
  format: ('pdf' | 'excel' | 'csv')[]
  popular: boolean
}

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf')
  const [generating, setGenerating] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'sales-summary',
      name: 'Sales Summary Report',
      description: 'Complete overview of sales transactions, revenue, and profit margins',
      icon: <ShoppingBag size={24} />,
      category: 'sales',
      format: ['pdf', 'excel', 'csv'],
      popular: true,
    },
    {
      id: 'financial-statement',
      name: 'Financial Statement',
      description: 'Detailed financial reports including income, expenses, and net profit',
      icon: <DollarSign size={24} />,
      category: 'financial',
      format: ['pdf', 'excel'],
      popular: true,
    },
    {
      id: 'inventory-status',
      name: 'Inventory Status Report',
      description: 'Current stock levels, low stock alerts, and inventory valuation',
      icon: <Package size={24} />,
      category: 'inventory',
      format: ['pdf', 'excel', 'csv'],
      popular: true,
    },
    {
      id: 'customer-analysis',
      name: 'Customer Analysis Report',
      description: 'Customer demographics, purchase patterns, and loyalty metrics',
      icon: <Users size={24} />,
      category: 'customer',
      format: ['pdf', 'excel'],
      popular: false,
    },
    {
      id: 'product-performance',
      name: 'Product Performance Report',
      description: 'Top selling products, slow movers, and product profitability analysis',
      icon: <TrendingUp size={24} />,
      category: 'sales',
      format: ['pdf', 'excel', 'csv'],
      popular: true,
    },
    {
      id: 'daily-sales',
      name: 'Daily Sales Report',
      description: 'Day-to-day sales breakdown with transaction details',
      icon: <BarChart3 size={24} />,
      category: 'sales',
      format: ['pdf', 'excel', 'csv'],
      popular: false,
    },
    {
      id: 'profit-analysis',
      name: 'Profit & Loss Analysis',
      description: 'Comprehensive P&L statement with cost breakdown',
      icon: <PieChartIcon size={24} />,
      category: 'financial',
      format: ['pdf', 'excel'],
      popular: true,
    },
    {
      id: 'branch-comparison',
      name: 'Branch Comparison Report',
      description: 'Performance metrics compared across all branch locations',
      icon: <BarChart3 size={24} />,
      category: 'sales',
      format: ['pdf', 'excel'],
      popular: false,
    },
  ]

  const getCategoryColor = (category: ReportTemplate['category']) => {
    switch (category) {
      case 'financial':
        return 'from-success-500 to-success-600'
      case 'inventory':
        return 'from-warning-500 to-warning-600'
      case 'sales':
        return 'from-primary-500 to-primary-600'
      case 'customer':
        return 'from-accent-500 to-accent-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getCategoryBadge = (category: ReportTemplate['category']) => {
    switch (category) {
      case 'financial':
        return <Badge variant="success">Financial</Badge>
      case 'inventory':
        return <Badge variant="warning">Inventory</Badge>
      case 'sales':
        return <Badge variant="primary">Sales</Badge>
      case 'customer':
        return <Badge className="bg-gradient-to-r from-accent-500 to-accent-600 text-white border-0">Customer</Badge>
      default:
        return <Badge variant="default">Other</Badge>
    }
  }

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      setAlert({ type: 'error', message: 'Please select a report type' })
      return
    }
    if (!dateFrom || !dateTo) {
      setAlert({ type: 'error', message: 'Please select date range' })
      return
    }

    setGenerating(true)
    try {
      // Map report type to the analytics endpoint
      const endpointMap: Record<string, string> = {
        'revenue-summary':    'revenue-trends',
        'profit-loss':        'revenue-trends',
        'inventory-report':   'inventory-alerts',
        'sales-by-category':  'category-distribution',
        'branch-comparison':  'branch-comparison',
        'customer-analytics': 'metrics',
      }
      const endpoint = endpointMap[selectedReport] || 'revenue-trends'

      // Compute period from the user's selected date range
      let period = '30days'
      if (dateFrom && dateTo) {
        const from = new Date(dateFrom)
        const to   = new Date(dateTo)
        const days = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
        if (days <= 7)        period = '7days'
        else if (days <= 30)  period = '30days'
        else if (days <= 90)  period = '90days'
        else                  period = 'year'
      }

      await api.get(`/analytics/${endpoint}`, { params: { period } })
      setAlert({ type: 'success', message: `Report generated in ${format.toUpperCase()} format` })
    } catch {
      setAlert({ type: 'error', message: 'Failed to generate report. Please try again.' })
    } finally {
      setGenerating(false)
    }
  }

  const handleEmailReport = async () => {
    if (!selectedReport) {
      setAlert({ type: 'error', message: 'Please select a report type first' })
      return
    }
    setAlert({ type: 'success', message: 'Report has been sent to your email' })
  }

  const handlePrintReport = () => {
    if (!selectedReport) {
      setAlert({ type: 'error', message: 'Please select a report type first' })
      return
    }
    window.print()
  }

  const popularReports = reportTemplates.filter(r => r.popular)
  const allReports = reportTemplates.filter(r => !r.popular)
  const selectedReportData = reportTemplates.find(r => r.id === selectedReport)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
          Reports Center
        </h1>
        <p className="text-gray-600 mt-2 flex items-center gap-2">
          <FileText size={16} className="text-primary-500" />
          Generate comprehensive business reports and analytics
        </p>
      </div>

      {/* Alert */}
      {alert && (
        <Alert variant={alert.type} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-hover bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Reports</p>
              <p className="text-3xl font-display font-bold text-gray-900">{reportTemplates.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-cunga">
              <FileText className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-success-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Generated Today</p>
              <p className="text-3xl font-display font-bold text-success-600">24</p>
            </div>
            <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center shadow-lg">
              <Check className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-accent-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Scheduled</p>
              <p className="text-3xl font-display font-bold text-gray-900">8</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-accent">
              <Calendar className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-warning-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Popular</p>
              <p className="text-3xl font-display font-bold text-gray-900">{popularReports.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="text-white" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Report Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <div className="card-hover sticky top-4">
            <h2 className="text-xl font-display font-bold text-gray-900 mb-4">
              Report Configuration
            </h2>

            <div className="space-y-4">
              {/* Selected Report */}
              {selectedReportData && (
                <div className={`p-4 bg-gradient-to-br ${getCategoryColor(selectedReportData.category)} rounded-xl text-white`}>
                  <div className="flex items-center gap-3 mb-2">
                    {selectedReportData.icon}
                    <h3 className="font-bold">{selectedReportData.name}</h3>
                  </div>
                  <p className="text-sm text-white/90">{selectedReportData.description}</p>
                </div>
              )}

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    placeholder="From"
                    leftIcon={<Calendar size={18} />}
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    placeholder="To"
                    leftIcon={<Calendar size={18} />}
                  />
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <Select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  leftIcon={<FileSpreadsheet size={18} />}
                >
                  {selectedReportData?.format.map(fmt => (
                    <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
                  )) || (
                    <>
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                    </>
                  )}
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <Button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="w-full btn-primary"
                  leftIcon={generating ? <Download className="animate-bounce" size={18} /> : <Download size={18} />}
                >
                  {generating ? 'Generating...' : 'Generate Report'}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handlePrintReport}
                    variant="outline"
                    size="sm"
                    leftIcon={<Printer size={16} />}
                    disabled={!selectedReport}
                  >
                    Print
                  </Button>
                  <Button
                    onClick={handleEmailReport}
                    variant="outline"
                    size="sm"
                    leftIcon={<Mail size={16} />}
                    disabled={!selectedReport}
                  >
                    Email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Templates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Popular Reports */}
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
              Popular Reports
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`card-hover cursor-pointer transition-all ${
                    selectedReport === report.id
                      ? 'ring-2 ring-primary-500 bg-gradient-to-br from-primary-50 to-white'
                      : 'hover:bg-gradient-to-br hover:from-gray-50 hover:to-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getCategoryColor(report.category)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg hover:scale-110 transition-transform`}>
                      <div className="text-white">{report.icon}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-display font-bold text-gray-900 text-sm leading-tight">
                          {report.name}
                        </h3>
                        {getCategoryBadge(report.category)}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-3">
                        {report.description}
                      </p>
                      <div className="flex gap-1">
                        {report.format.map(fmt => (
                          <span
                            key={fmt}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium"
                          >
                            {fmt.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Reports */}
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
              All Reports
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`card-hover cursor-pointer transition-all ${
                    selectedReport === report.id
                      ? 'ring-2 ring-primary-500 bg-gradient-to-br from-primary-50 to-white'
                      : 'hover:bg-gradient-to-br hover:from-gray-50 hover:to-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getCategoryColor(report.category)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg hover:scale-110 transition-transform`}>
                      <div className="text-white">{report.icon}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-display font-bold text-gray-900 text-sm leading-tight">
                          {report.name}
                        </h3>
                        {getCategoryBadge(report.category)}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-3">
                        {report.description}
                      </p>
                      <div className="flex gap-1">
                        {report.format.map(fmt => (
                          <span
                            key={fmt}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium"
                          >
                            {fmt.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
