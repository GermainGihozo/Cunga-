import { useEffect, useState, useCallback } from 'react'
import api from '@services/api'
import {
  Card,
  Button,
  Input,
  Modal,
  Badge,
  Spinner,
  Pagination,
  EmptyState,
  Alert,
} from '@components/common'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Users,
  Award,
  Eye
} from 'lucide-react'
import { BRAND_COLORS } from '@constants/brand'

interface Customer {
  id: number
  name: string
  email?: string
  phone: string
  address?: string
  // The API returns snake_case â€” map both for compatibility
  totalPurchases: number
  total_purchases?: number
  totalSpent: number
  total_spent?: number
  lastPurchaseDate?: string
  last_purchase_date?: string
  loyaltyPoints: number
  loyalty_points?: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  status: 'active' | 'inactive'
  createdAt: string
  created_at?: string
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/customers', {
        params: { page: currentPage, limit: 10, search: searchTerm || undefined },
      })
      const d = res.data.data
      setCustomers(d?.items || d?.data || [])
      setTotalPages(d?.pagination?.totalPages || 1)
    } catch {
      // Fallback: keep empty state, show nothing rather than crash
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm])

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  const openCreateModal = () => {
    setEditingCustomer(null)
    setFormData({ name: '', email: '', phone: '', address: '' })
    setShowCustomerModal(true)
  }

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone,
      address: customer.address || '',
    })
    setShowCustomerModal(true)
  }

  const openDeleteModal = (customer: Customer) => {
    setDeletingCustomer(customer)
    setShowDeleteModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, formData)
        showAlert('success', 'Customer updated successfully')
      } else {
        await api.post('/customers', formData)
        showAlert('success', 'Customer added successfully')
      }
      setShowCustomerModal(false)
      loadCustomers()
    } catch {
      showAlert('error', editingCustomer ? 'Failed to update customer' : 'Failed to add customer')
    }
  }

  const handleDelete = async () => {
    if (!deletingCustomer) return
    try {
      await api.delete(`/customers/${deletingCustomer.id}`)
      showAlert('success', 'Customer deleted successfully')
    } catch {
      showAlert('error', 'Failed to delete customer')
    }
    setShowDeleteModal(false)
    loadCustomers()
  }

  const formatCurrency = (amount: number) => {
    return `RWF ${Math.round(amount).toLocaleString()}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getTierColor = (tier: Customer['tier']) => {
    switch (tier) {
      case 'platinum':
        return 'bg-gradient-to-r from-gray-700 to-gray-900 text-white'
      case 'gold':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 'silver':
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
      case 'bronze':
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
      default:
        return 'bg-gray-200 text-gray-700'
    }
  }

  const getTierIcon = (tier: Customer['tier']) => {
    return <Award size={14} />
  }

  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.status === 'active').length
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent ?? c.total_spent ?? 0), 0)
  const avgSpendPerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
            Customer Management
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <Users size={16} className="text-primary-500" />
            Manage customer relationships and track purchase history
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          leftIcon={<Plus size={20} />}
          className="btn-primary shadow-cunga"
        >
          Add Customer
        </Button>
      </div>

      {/* Alert */}
      {alert && (
        <Alert variant={alert.type} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-hover bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Customers</p>
              <p className="text-3xl font-display font-bold text-gray-900">{totalCustomers}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-cunga">
              <Users className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-success-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Customers</p>
              <p className="text-3xl font-display font-bold text-success-600">{activeCustomers}</p>
              <p className="text-xs text-gray-500 mt-1">
                {totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0}% active
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-accent-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-display font-bold bg-gradient-success bg-clip-text text-transparent">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-accent">
              <DollarSign className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-warning-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Spend</p>
              <p className="text-2xl font-display font-bold text-gray-900">
                {formatCurrency(avgSpendPerCustomer)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Per customer</p>
            </div>
            <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="text-white" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card-hover">
        <div className="flex gap-3">
          <Input
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} className="text-primary-500" />}
            className="input-field flex-1"
          />
          <Button className="bg-gradient-primary text-white hover:shadow-cunga">
            Search
          </Button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card-hover">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner size="lg" />
            <p className="text-gray-600 mt-4 font-medium">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={<Users size={64} className="text-gray-300" />}
            title="No customers yet"
            description="Start building your customer base by adding your first customer"
            action={
              <Button
                onClick={openCreateModal}
                leftIcon={<Plus size={20} />}
                className="btn-primary shadow-cunga"
              >
                Add Your First Customer
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-display font-bold text-gray-900">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-display font-bold text-gray-900">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-display font-bold text-gray-900">Purchases</th>
                    <th className="px-6 py-4 text-left text-sm font-display font-bold text-gray-900">Total Spent</th>
                    <th className="px-6 py-4 text-left text-sm font-display font-bold text-gray-900">Loyalty</th>
                    <th className="px-6 py-4 text-left text-sm font-display font-bold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-display font-bold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all group"
                    >
                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-cunga group-hover:scale-110 transition-transform">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                              {customer.name}
                            </p>
                            {customer.lastPurchaseDate && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                Last purchase: {formatDate(customer.lastPurchaseDate)}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Mail size={14} className="text-gray-400" />
                              <span>{customer.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone size={14} className="text-gray-400" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Purchases */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ShoppingBag size={18} className="text-primary-500" />
                          <span className="text-lg font-bold text-gray-900">{customer.totalPurchases}</span>
                        </div>
                      </td>

                      {/* Total Spent */}
                      <td className="px-6 py-4">
                        <span className="text-2xl font-display font-bold bg-gradient-success bg-clip-text text-transparent">
                          {formatCurrency(customer.totalSpent)}
                        </span>
                      </td>

                      {/* Loyalty */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold shadow-sm ${getTierColor(customer.tier)}`}>
                            {getTierIcon(customer.tier)}
                            <span className="uppercase">{customer.tier}</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-700">
                            {customer.loyaltyPoints} points
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <Badge variant={customer.status === 'active' ? 'success' : 'default'}>
                          {customer.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingCustomer(customer)}
                            className="p-2 rounded-lg text-primary-600 hover:bg-primary-50 transition-all hover:scale-110"
                            title="View details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => openEditModal(customer)}
                            className="p-2 rounded-lg text-accent-600 hover:bg-accent-50 transition-all hover:scale-110"
                            title="Edit customer"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(customer)}
                            className="p-2 rounded-lg text-error-600 hover:bg-error-50 transition-all hover:scale-110"
                            title="Delete customer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Customer Modal */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            leftIcon={<User size={18} />}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              leftIcon={<Mail size={18} />}
            />
            <Input
              label="Phone *"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              leftIcon={<Phone size={18} />}
            />
          </div>

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            leftIcon={<MapPin size={18} />}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowCustomerModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="btn-primary">
              {editingCustomer ? 'Update Customer' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Customer"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-error-50 rounded-lg border-2 border-error-200">
            <Trash2 className="text-error-600" size={24} />
            <p className="text-sm text-gray-700">
              Are you sure you want to delete <strong>{deletingCustomer?.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-gradient-to-r from-error-500 to-error-600 text-white hover:shadow-lg"
            >
              Delete Customer
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Customer Details Modal */}
      <Modal
        isOpen={viewingCustomer !== null}
        onClose={() => setViewingCustomer(null)}
        title="Customer Details"
        size="lg"
      >
        {viewingCustomer && (
          <div className="space-y-6">
            {/* Customer Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-cunga">
                {viewingCustomer.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-display font-bold text-gray-900">{viewingCustomer.name}</h3>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold shadow-sm mt-2 ${getTierColor(viewingCustomer.tier)}`}>
                  {getTierIcon(viewingCustomer.tier)}
                  <span className="uppercase">{viewingCustomer.tier} TIER</span>
                </div>
              </div>
              <Badge variant={viewingCustomer.status === 'active' ? 'success' : 'default'} size="lg">
                {viewingCustomer.status}
              </Badge>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-display font-bold text-gray-900 mb-3">Contact Information</h4>
              <div className="space-y-2">
                {viewingCustomer.email && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail size={18} className="text-primary-500" />
                    <span>{viewingCustomer.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone size={18} className="text-primary-500" />
                  <span>{viewingCustomer.phone}</span>
                </div>
                {viewingCustomer.address && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin size={18} className="text-primary-500" />
                    <span>{viewingCustomer.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Purchase Stats */}
            <div>
              <h4 className="font-display font-bold text-gray-900 mb-3">Purchase Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="card bg-gradient-to-br from-primary-50 to-white">
                  <p className="text-sm text-gray-600 mb-1">Total Purchases</p>
                  <p className="text-3xl font-display font-bold text-gray-900">{viewingCustomer.totalPurchases}</p>
                </div>
                <div className="card bg-gradient-to-br from-success-50 to-white">
                  <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                  <p className="text-2xl font-display font-bold bg-gradient-success bg-clip-text text-transparent">
                    {formatCurrency(viewingCustomer.totalSpent)}
                  </p>
                </div>
                <div className="card bg-gradient-to-br from-accent-50 to-white">
                  <p className="text-sm text-gray-600 mb-1">Loyalty Points</p>
                  <p className="text-3xl font-display font-bold text-accent-600">{viewingCustomer.loyaltyPoints}</p>
                </div>
                <div className="card bg-gradient-to-br from-warning-50 to-white">
                  <p className="text-sm text-gray-600 mb-1">Avg Purchase</p>
                  <p className="text-2xl font-display font-bold text-gray-900">
                    {formatCurrency(viewingCustomer.totalSpent / viewingCustomer.totalPurchases)}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="font-display font-bold text-gray-900 mb-3">Timeline</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer Since:</span>
                  <span className="font-semibold text-gray-900">{formatDate(viewingCustomer.createdAt)}</span>
                </div>
                {viewingCustomer.lastPurchaseDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Purchase:</span>
                    <span className="font-semibold text-gray-900">{formatDate(viewingCustomer.lastPurchaseDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Customers
