import { useEffect, useState } from 'react'
import {
  Card,
  Button,
  Input,
  Select,
  Modal,
  Table,
  Badge,
  Spinner,
  Pagination,
  EmptyState,
  Alert,
} from '@components/common'
import {
  Plus,
  ShoppingCart,
  Search,
  Receipt,
  Trash2,
  Eye,
  Package,
  DollarSign,
  Minus,
  CreditCard,
  Smartphone,
  Banknote,
  TrendingUp,
  Clock,
  CheckCircle2,
  User
} from 'lucide-react'
import { BRAND_COLORS, BRAND_INFO } from '@constants/brand'
import salesService, { CartItem, SaleFilters, SaleWithItems, Receipt as ReceiptType } from '@services/salesService'
import productService from '@services/productService'
import { Product, Sale } from '@types'

const Sales = () => {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCartModal, setShowCartModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile_money'>('cash')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [processingPayment, setProcessingPayment] = useState(false)

  // Product search
  const [productSearch, setProductSearch] = useState('')
  const [showProductSearch, setShowProductSearch] = useState(false)

  // Receipt modal
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptType | null>(null)
  const [viewingSale, setViewingSale] = useState<SaleWithItems | null>(null)

  // Filters
  const [filters, setFilters] = useState<SaleFilters>({
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'desc',
  })

  // Alert
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    loadSales()
  }, [filters])

  useEffect(() => {
    if (showProductSearch) {
      loadProducts()
    }
  }, [productSearch, showProductSearch])

  const loadSales = async () => {
    try {
      setLoading(true)
      const result = await salesService.getSales(filters)
      setSales(result.data)
      setTotalPages(result.pagination.totalPages)
      setCurrentPage(result.pagination.page)
    } catch (error) {
      console.error('Failed to load sales:', error)
      showAlert('error', 'Failed to load sales')
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const result = await productService.getProducts({
        page: 1,
        limit: 50,
        search: productSearch,
        status: 'active',
      })
      setProducts(result.data)
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  // Cart functions
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id)
    
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        showAlert('error', `Only ${product.quantity} units available`)
        return
      }
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
          : item
      ))
    } else {
      const newItem: CartItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.selling_price,
        totalPrice: product.selling_price,
      }
      setCart([...cart, newItem])
    }
    
    showAlert('success', `${product.name} added to cart`)
  }

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    const product = products.find(p => p.id === productId)
    if (product && quantity > product.quantity) {
      showAlert('error', `Only ${product.quantity} units available`)
      return
    }

    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
        : item
    ))
  }

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId))
  }

  const clearCart = () => {
    setCart([])
    setCustomerName('')
    setCustomerPhone('')
    setPaymentMethod('cash')
  }

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showAlert('error', 'Cart is empty')
      return
    }

    try {
      setProcessingPayment(true)
      
      const saleData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
      }

      const sale = await salesService.createSale(saleData)
      showAlert('success', 'Sale completed successfully!')
      
      // Show receipt
      const receipt = await salesService.getReceipt(sale.id)
      setCurrentReceipt(receipt)
      setShowReceiptModal(true)
      
      // Clear cart and close modal
      clearCart()
      setShowCartModal(false)
      
      // Reload sales
      loadSales()
    } catch (error: any) {
      console.error('Failed to process sale:', error)
      showAlert('error', error.response?.data?.message || 'Failed to process sale')
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleViewSale = async (sale: Sale) => {
    try {
      const saleDetails = await salesService.getSaleById(sale.id)
      setViewingSale(saleDetails)
    } catch (error) {
      console.error('Failed to load sale details:', error)
      showAlert('error', 'Failed to load sale details')
    }
  }

  const handleViewReceipt = async (sale: Sale) => {
    try {
      const receipt = await salesService.getReceipt(sale.id)
      setCurrentReceipt(receipt)
      setShowReceiptModal(true)
    } catch (error) {
      console.error('Failed to load receipt:', error)
      showAlert('error', 'Failed to load receipt')
    }
  }

  const formatCurrency = (amount: number) => {
    return `RWF ${Math.round(amount).toLocaleString()}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const printReceipt = () => {
    window.print()
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote size={16} className="text-success-600" />
      case 'card':
        return <CreditCard size={16} className="text-primary-600" />
      case 'mobile_money':
        return <Smartphone size={16} className="text-accent-600" />
      default:
        return <DollarSign size={16} />
    }
  }

  const getPaymentColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'badge-success'
      case 'card':
        return 'badge-primary'
      case 'mobile_money':
        return 'bg-accent-100 text-accent-700'
      default:
        return 'badge-default'
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
            Sales
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <ShoppingCart size={16} className="text-primary-500" />
            Record and track sales transactions in real-time
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowProductSearch(true)}
            leftIcon={<Search size={20} />}
            className="hover:bg-gradient-to-br hover:from-primary-50 hover:to-accent-50"
          >
            Add Items
          </Button>
          <Button
            onClick={() => setShowCartModal(true)}
            leftIcon={<ShoppingCart size={20} />}
            className="btn-primary shadow-cunga relative"
          >
            Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-accent-500 to-accent-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-accent animate-pulse">
                {cart.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <Alert variant={alert.type} onClose={() => setAlert(null)} className="mb-6">
          {alert.message}
        </Alert>
      )}

      {/* Quick Cart Summary */}
      {cart.length > 0 && (
        <div className="card-hover bg-gradient-to-br from-primary-50 via-accent-50 to-success-50 border-2 border-primary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-cunga animate-pulse">
                <ShoppingCart className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Current Cart</p>
                <p className="text-3xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </p>
                <p className="text-sm font-semibold text-gray-700 mt-1">
                  Total: <span className="text-success-600">{formatCurrency(getCartTotal())}</span>
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCartModal(true)}
              className="btn-primary shadow-cunga"
              leftIcon={<CheckCircle2 size={20} />}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-hover bg-gradient-to-br from-success-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Today's Sales</p>
              <p className="text-3xl font-display font-bold text-success-600">
                {sales.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Today's Revenue</p>
              <p className="text-2xl font-display font-bold text-gray-900">
                {formatCurrency(
                  sales
                    .filter(s => new Date(s.created_at).toDateString() === new Date().toDateString())
                    .reduce((sum, s) => sum + s.total_amount, 0)
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-cunga">
              <DollarSign className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-accent-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Transaction</p>
              <p className="text-2xl font-display font-bold text-gray-900">
                {sales.length > 0
                  ? formatCurrency(sales.reduce((sum, s) => sum + s.total_amount, 0) / sales.length)
                  : '$0.00'}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-accent">
              <Receipt className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-warning-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Last Sale</p>
              <p className="text-sm font-bold text-gray-900">
                {sales.length > 0 ? formatDate(sales[0].created_at).split(',')[1] : 'No sales yet'}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="text-white" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="card-hover">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner size="lg" />
            <p className="text-gray-600 mt-4 font-medium">Loading sales...</p>
          </div>
        ) : sales.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart size={64} className="text-gray-300" />}
            title="No sales yet"
            description="Start recording sales by adding items to cart"
            action={
              <Button 
                onClick={() => setShowProductSearch(true)} 
                leftIcon={<Plus size={20} />}
                className="btn-primary shadow-cunga"
              >
                Start Your First Sale
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-display font-bold text-gray-900">Receipt #</th>
                    <th className="px-6 py-4 text-left text-sm font-display font-bold text-gray-900">Date & Time</th>
                    <th className="px-6 py-4 text-left text-sm font-display font-bold text-gray-900">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-display font-bold text-gray-900">Profit</th>
                    <th className="px-6 py-4 text-left text-sm font-display font-bold text-gray-900">Payment</th>
                    <th className="px-6 py-4 text-left text-sm font-display font-bold text-gray-900">Customer</th>
                    <th className="px-6 py-4 text-right text-sm font-display font-bold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sales.map((sale) => (
                    <tr 
                      key={sale.id}
                      className="hover:bg-gradient-to-r hover:from-success-50 hover:to-primary-50 transition-all group"
                    >
                      {/* Receipt Number */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Receipt className="text-white" size={18} />
                          </div>
                          <span className="font-mono text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {sale.receipt_number}
                          </span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{formatDate(sale.created_at).split(',')[0]}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatDate(sale.created_at).split(',')[1]}</p>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <span className="text-2xl font-display font-bold bg-gradient-success bg-clip-text text-transparent">
                          {formatCurrency(sale.total_amount)}
                        </span>
                      </td>

                      {/* Profit */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={16} className="text-success-600" />
                          <span className="font-bold text-success-600">{formatCurrency(sale.total_profit)}</span>
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getPaymentIcon(sale.payment_method)}
                          <Badge className={getPaymentColor(sale.payment_method)}>
                            {sale.payment_method.replace('_', ' ')}
                          </Badge>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        {sale.customer_name ? (
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <span className="font-medium text-gray-900">{sale.customer_name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Walk-in</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewSale(sale)}
                            className="p-2 rounded-lg text-primary-600 hover:bg-primary-50 transition-all hover:scale-110"
                            title="View details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleViewReceipt(sale)}
                            className="p-2 rounded-lg text-accent-600 hover:bg-accent-50 transition-all hover:scale-110"
                            title="View receipt"
                          >
                            <Receipt size={18} />
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
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Search Modal */}
      <Modal
        isOpen={showProductSearch}
        onClose={() => setShowProductSearch(false)}
        title="Add Items to Cart"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            placeholder="Search products..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            leftIcon={<Search size={18} />}
          />

          <div className="max-h-96 overflow-y-auto space-y-2">
            {products.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No products found</p>
            ) : (
              products.map(product => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package size={24} className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(product.selling_price)} | Stock: {product.quantity}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addToCart(product)}
                    disabled={product.quantity === 0}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Cart Modal - Continued in next message due to length */}
      {/* Cart Modal */}
      <Modal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        title="Shopping Cart"
        size="lg"
      >
        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {cart.map(item => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(item.unitPrice)} each</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                      <div className="w-24 text-right">
                        <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Info */}
              <div className="border-t pt-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Customer Information (Optional)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter name"
                  />
                  <Input
                    label="Phone Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter phone"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="border-t pt-4">
                <Select
                  label="Payment Method *"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mobile_money">Mobile Money</option>
                </Select>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-primary-600">{formatCurrency(getCartTotal())}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={clearCart} className="flex-1">
                  Clear Cart
                </Button>
                <Button
                  onClick={handleCheckout}
                  isLoading={processingPayment}
                  className="flex-1"
                  leftIcon={<DollarSign size={20} />}
                >
                  Complete Sale
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false)
          setCurrentReceipt(null)
        }}
        title="Receipt"
        size="md"
      >
        {currentReceipt && (
          <div className="space-y-6" id="receipt-print">
            {/* Header */}
            <div className="text-center border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentReceipt.business.business_name}
              </h2>
              <p className="text-sm text-gray-600">{currentReceipt.branch.name}</p>
              {currentReceipt.branch.location && (
                <p className="text-sm text-gray-600">{currentReceipt.branch.location}</p>
              )}
              {currentReceipt.branch.phone && (
                <p className="text-sm text-gray-600">{currentReceipt.branch.phone}</p>
              )}
            </div>

            {/* Receipt Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Receipt #:</p>
                <p className="font-mono font-medium">{currentReceipt.sale.receipt_number}</p>
              </div>
              <div>
                <p className="text-gray-600">Date:</p>
                <p className="font-medium">{formatDate(currentReceipt.sale.created_at)}</p>
              </div>
              {currentReceipt.sale.customer_name && (
                <div>
                  <p className="text-gray-600">Customer:</p>
                  <p className="font-medium">{currentReceipt.sale.customer_name}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Payment:</p>
                <p className="font-medium capitalize">
                  {currentReceipt.sale.payment_method.replace('_', ' ')}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-b py-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Item</th>
                    <th className="text-center py-2">Qty</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {currentReceipt.sale.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{item.product_name}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">{formatCurrency(item.unit_price)}</td>
                      <td className="text-right py-2">{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="space-y-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary-600">
                  {formatCurrency(currentReceipt.sale.total_amount)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600 border-t pt-4">
              <p>Thank you for your business!</p>
              <p className="mt-2">
                {currentReceipt.business.contact_email} | {currentReceipt.business.contact_phone}
              </p>
            </div>

            {/* Print Button */}
            <div className="flex justify-center pt-4 print:hidden">
              <Button onClick={printReceipt} leftIcon={<Receipt size={20} />}>
                Print Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Sale Details Modal */}
      <Modal
        isOpen={viewingSale !== null}
        onClose={() => setViewingSale(null)}
        title="Sale Details"
        size="lg"
      >
        {viewingSale && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Receipt #:</p>
                <p className="font-mono font-medium">{viewingSale.receipt_number}</p>
              </div>
              <div>
                <p className="text-gray-600">Date:</p>
                <p className="font-medium">{formatDate(viewingSale.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-600">Branch:</p>
                <p className="font-medium">{viewingSale.branch_name}</p>
              </div>
              <div>
                <p className="text-gray-600">User:</p>
                <p className="font-medium">{viewingSale.user_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Payment Method:</p>
                <p className="font-medium capitalize">{viewingSale.payment_method.replace('_', ' ')}</p>
              </div>
              {viewingSale.customer_name && (
                <div>
                  <p className="text-gray-600">Customer:</p>
                  <p className="font-medium">{viewingSale.customer_name}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
              <Table
                columns={[
                  { key: 'product_name', header: 'Product' },
                  { key: 'quantity', header: 'Qty' },
                  {
                    key: 'unit_price',
                    header: 'Price',
                    render: (item: any) => formatCurrency(item.unit_price),
                  },
                  {
                    key: 'total_price',
                    header: 'Total',
                    render: (item: any) => formatCurrency(item.total_price),
                  },
                  {
                    key: 'profit',
                    header: 'Profit',
                    render: (item: any) => (
                      <span className="text-green-600">{formatCurrency(item.profit)}</span>
                    ),
                  },
                ]}
                data={viewingSale.items}
              />
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">{formatCurrency(viewingSale.total_amount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total Profit:</span>
                <span className="text-green-600">{formatCurrency(viewingSale.total_profit)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Sales
