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
  Alert
} from '@components/common'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Package, 
  AlertTriangle,
  Image as ImageIcon,
  TrendingDown,
  Eye,
  Download,
  BarChart3
} from 'lucide-react'
import { BRAND_COLORS, getStatusBadgeClass } from '@constants/brand'
import productService, { ProductFilters, ProductFormData, Category } from '@services/productService'
import { Product } from '@types'

const Products = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Filters
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'desc',
  })
  const [searchTerm, setSearchTerm] = useState('')

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    sku: '',
    categoryId: undefined,
    costPrice: 0,
    sellingPrice: 0,
    quantity: 0,
    minStockLevel: 10,
    status: 'active',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Alert state
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [filters])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const result = await productService.getProducts(filters)
      setProducts(result.data)
      setTotalPages(result.pagination.totalPages)
      setCurrentPage(result.pagination.page)
    } catch (error) {
      console.error('Failed to load products:', error)
      showAlert('error', 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const cats = await productService.getCategories()
      setCategories(cats)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm, page: 1 })
  }

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      sku: '',
      categoryId: undefined,
      costPrice: 0,
      sellingPrice: 0,
      quantity: 0,
      minStockLevel: 10,
      status: 'active',
    })
    setImageFile(null)
    setImagePreview(null)
    setShowProductModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      sku: product.sku || '',
      categoryId: product.category_id || undefined,
      costPrice: product.cost_price,
      sellingPrice: product.selling_price,
      quantity: product.quantity,
      minStockLevel: product.min_stock_level,
      status: product.status,
    })
    setImageFile(null)
    setImagePreview(product.image_url || null)
    setShowProductModal(true)
  }

  const openDeleteModal = (product: Product) => {
    setDeletingProduct(product)
    setShowDeleteModal(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const data = { ...formData, image: imageFile || undefined }
      
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, data)
        showAlert('success', 'Product updated successfully')
      } else {
        await productService.createProduct(data)
        showAlert('success', 'Product created successfully')
      }
      
      setShowProductModal(false)
      loadProducts()
    } catch (error: any) {
      console.error('Failed to save product:', error)
      showAlert('error', error.response?.data?.message || 'Failed to save product')
    }
  }

  const handleDelete = async () => {
    if (!deletingProduct) return

    try {
      await productService.deleteProduct(deletingProduct.id)
      showAlert('success', 'Product deleted successfully')
      setShowDeleteModal(false)
      loadProducts()
    } catch (error: any) {
      console.error('Failed to delete product:', error)
      showAlert('error', error.response?.data?.message || 'Failed to delete product')
    }
  }

  const formatCurrency = (amount: number) => {
    return `RWF ${Math.round(amount).toLocaleString()}`
  }

  const getStockStatus = (quantity: number, minLevel: number) => {
    if (quantity === 0) return { label: 'Out of Stock', variant: 'error' as const }
    if (quantity <= minLevel) return { label: 'Low Stock', variant: 'warning' as const }
    return { label: 'In Stock', variant: 'success' as const }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <Package size={16} className="text-primary-500" />
            Manage your product inventory and stock levels
          </p>
        </div>
        <Button 
          onClick={openCreateModal} 
          leftIcon={<Plus size={20} />}
          className="btn-primary shadow-cunga"
        >
          Add Product
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-hover bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
              <p className="text-3xl font-display font-bold text-gray-900">
                {products.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-cunga">
              <Package className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-success-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">In Stock</p>
              <p className="text-3xl font-display font-bold text-success-600">
                {products.filter(p => p.quantity > p.min_stock_level).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-warning-50 to-white border-2 border-warning-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Low Stock</p>
              <p className="text-3xl font-display font-bold text-warning-600">
                {products.filter(p => p.quantity > 0 && p.quantity <= p.min_stock_level).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center shadow-lg">
              <TrendingDown className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-error-50 to-white border-2 border-error-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Out of Stock</p>
              <p className="text-3xl font-display font-bold text-error-600">
                {products.filter(p => p.quantity === 0).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-error-500 to-error-600 rounded-xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="text-white" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <Alert 
          variant={alert.type} 
          onClose={() => setAlert(null)}
          className="mb-6"
        >
          {alert.message}
        </Alert>
      )}

      {/* Filters */}
      <div className="card-hover">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="flex gap-2">
              <Input
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                leftIcon={<Search size={18} className="text-primary-500" />}
                className="input-field"
              />
              <Button 
                onClick={handleSearch}
                className="bg-gradient-primary text-white hover:shadow-cunga"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          <Select
            value={filters.categoryId?.toString() || ''}
            onChange={(e) => handleFilterChange('categoryId', e.target.value ? parseInt(e.target.value) : undefined)}
            leftIcon={<Filter size={18} />}
            className="input-field"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </Select>

          {/* Status Filter */}
          <Select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filters.lowStock ? 'primary' : 'outline'}
              onClick={() => handleFilterChange('lowStock', !filters.lowStock)}
              className={filters.lowStock ? 'bg-gradient-warning text-white shadow-lg' : ''}
            >
              <AlertTriangle size={16} className="mr-1" />
              Low Stock Only
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setFilters({ page: 1, limit: 10, sortBy: 'created_at', sortOrder: 'desc' })
                setSearchTerm('')
              }}
            >
              Clear Filters
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Download size={16} />}
            className="text-primary-600 hover:bg-primary-50"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="card-hover">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner size="lg" />
            <p className="text-gray-600 mt-4 font-medium">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Package size={64} className="text-gray-300" />}
            title="No products found"
            description="Get started by adding your first product or adjust your filters"
            action={
              <Button 
                onClick={openCreateModal} 
                leftIcon={<Plus size={20} />}
                className="btn-primary shadow-cunga"
              >
                Add Your First Product
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-display font-bold text-gray-900">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-display font-bold text-gray-900">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-display font-bold text-gray-900">Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-display font-bold text-gray-900">Cost</th>
                    <th className="px-6 py-4 text-left text-sm font-display font-bold text-gray-900">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-display font-bold text-gray-900">Margin</th>
                    <th className="px-6 py-4 text-left text-sm font-display font-bold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-display font-bold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => {
                    const status = getStockStatus(product.quantity, product.min_stock_level)
                    const margin = ((product.selling_price - product.cost_price) / product.selling_price * 100).toFixed(1)
                    
                    return (
                      <tr 
                        key={product.id}
                        className="hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all group"
                      >
                        {/* Product */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-14 h-14 rounded-xl object-cover shadow-md ring-2 ring-white group-hover:scale-110 transition-transform"
                              />
                            ) : (
                              <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Package size={24} className="text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                {product.name}
                              </p>
                              {product.sku && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  SKU: <span className="font-medium">{product.sku}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-sm font-medium text-gray-700">
                            {product.category_name || 'Uncategorized'}
                          </span>
                        </td>

                        {/* Stock */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-lg font-bold text-gray-900">{product.quantity}</p>
                            <Badge variant={status.variant} size="sm" className="mt-1">
                              {status.label}
                            </Badge>
                          </div>
                        </td>

                        {/* Cost */}
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-700">
                            {formatCurrency(product.cost_price)}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold bg-gradient-success bg-clip-text text-transparent">
                            {formatCurrency(product.selling_price)}
                          </span>
                        </td>

                        {/* Margin */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-success rounded-full"
                                style={{ width: `${Math.min(parseFloat(margin), 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-success-600">{margin}%</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <Badge 
                            variant={product.status === 'active' ? 'success' : 'default'}
                            className="capitalize"
                          >
                            {product.status}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-2 rounded-lg text-primary-600 hover:bg-primary-50 transition-all hover:scale-110"
                              title="Edit product"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(product)}
                              className="p-2 rounded-lg text-error-600 hover:bg-error-50 transition-all hover:scale-110"
                              title="Delete product"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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

      {/* Product Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-24 h-24 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ImageIcon size={32} className="text-gray-400" />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Product Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />
          </div>

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formData.categoryId?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value ? parseInt(e.target.value) : undefined })}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Select>

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cost Price *"
              type="number"
              step="0.01"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
              required
            />
            <Input
              label="Selling Price *"
              type="number"
              step="0.01"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity *"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              required
            />
            <Input
              label="Min Stock Level"
              type="number"
              value={formData.minStockLevel}
              onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowProductModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Product"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="text-red-600" size={24} />
            <p className="text-sm text-gray-700">
              Are you sure you want to delete <strong>{deletingProduct?.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Products
