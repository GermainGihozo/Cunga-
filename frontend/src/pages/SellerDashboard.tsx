import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, TrendingUp, Settings,
  Bell, Plus, Search, Edit3, Trash2, Eye, EyeOff, Upload, X,
  Check, ChevronDown, Star, ArrowUp, ArrowDown, Clock, Truck,
  AlertCircle, Store, DollarSign, BarChart2, Menu, LogOut,
  Image, RefreshCw, Wallet, MapPin, Save, ExternalLink,
  CreditCard, Phone, Building2,
} from 'lucide-react'
import { Button } from '@components/common'
import { BRAND_INFO } from '@constants/brand'
import { sellerAuthApi, sellerProductsApi, sellerOrdersApi, sellerAnalyticsApi } from '@services/sellerApi'
import sellerApiDefault from '@services/sellerApi'

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type Tab = 'overview' | 'products' | 'orders' | 'analytics' | 'payouts' | 'settings'
type ProductStatus = 'active' | 'draft' | 'out_of_stock'
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface Product {
  id: number
  name: string
  price: number
  old_price?: number
  stock: number
  sold: number
  category: string
  images: string[]
  status: ProductStatus
  createdAt: string
  sku?: string
  description?: string
}

interface Order {
  id: number
  order_ref: string
  buyer_name: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
  seller_earnings: number
  status: OrderStatus
  created_at: string
  delivery_district: string
  delivery_province: string
  payment_method: string
  payment_status: string
}

interface SellerProfile {
  id: number
  full_name: string
  email: string
  phone: string
  shop_name: string
  shop_slug: string
  shop_description: string
  shop_logo: string
  province: string
  district: string
  plan: string
  commission_rate: number
  status: string
  wallet_balance: number
  total_earned: number
}

// â”€â”€â”€ Seed fallback data (used while API loads or offline) â”€
const SEED_PRODUCTS: Product[] = [
  { id: 1, name: 'iPhone 14 Pro Max 256GB', price: 850000, stock: 5, sold: 23, category: 'Electronics', images: ['https://images.unsplash.com/photo-1678652632937-4b29d45ec934?w=120&h=120&fit=crop'], status: 'active', createdAt: '2026-07-10' },
  { id: 2, name: 'Nike Air Max 270 White', price: 45000, stock: 12, sold: 57, category: 'Fashion', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop'], status: 'active', createdAt: '2026-07-15' },
  { id: 3, name: 'Sony WH-1000XM5 Headphones', price: 95000, stock: 0, sold: 18, category: 'Electronics', images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=120&h=120&fit=crop'], status: 'out_of_stock', createdAt: '2026-07-20' },
  { id: 4, name: 'Samsung 55" 4K Smart TV', price: 325000, stock: 3, sold: 8, category: 'Electronics', images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=120&h=120&fit=crop'], status: 'active', createdAt: '2026-08-01' },
  { id: 5, name: 'Office Ergonomic Chair', price: 125000, stock: 7, sold: 14, category: 'Home & Living', images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=120&h=120&fit=crop'], status: 'draft', createdAt: '2026-08-10' },
]

const SEED_ORDERS: Order[] = [
  { id: 1, order_ref: 'CNG-001482', buyer_name: 'Jean Pierre N.', product_name: 'iPhone 14 Pro Max', quantity: 1, unit_price: 850000, subtotal: 850000, seller_earnings: 782000, status: 'delivered', created_at: '2026-08-18', delivery_district: 'Gasabo', delivery_province: 'Kigali', payment_method: 'mtn', payment_status: 'paid' },
  { id: 2, order_ref: 'CNG-001501', buyer_name: 'Alice Uwase', product_name: 'Nike Air Max 270', quantity: 2, unit_price: 45000, subtotal: 90000, seller_earnings: 81000, status: 'shipped', created_at: '2026-08-19', delivery_district: 'Huye', delivery_province: 'Southern Province', payment_method: 'airtel', payment_status: 'paid' },
  { id: 3, order_ref: 'CNG-001519', buyer_name: 'Robert Habimana', product_name: 'Sony WH-1000XM5', quantity: 1, unit_price: 95000, subtotal: 95000, seller_earnings: 85500, status: 'processing', created_at: '2026-08-20', delivery_district: 'Rubavu', delivery_province: 'Western Province', payment_method: 'mtn', payment_status: 'paid' },
  { id: 4, order_ref: 'CNG-001537', buyer_name: 'Marie Claire K.', product_name: 'Samsung 4K TV', quantity: 1, unit_price: 325000, subtotal: 325000, seller_earnings: 292500, status: 'pending', created_at: '2026-08-21', delivery_district: 'Musanze', delivery_province: 'Northern Province', payment_method: 'card', payment_status: 'paid' },
  { id: 5, order_ref: 'CNG-001544', buyer_name: 'Emmanuel T.', product_name: 'Nike Air Max 270', quantity: 1, unit_price: 45000, subtotal: 45000, seller_earnings: 40500, status: 'cancelled', created_at: '2026-08-21', delivery_district: 'Kicukiro', delivery_province: 'Kigali', payment_method: 'mtn', payment_status: 'refunded' },
]

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const fmt = (n: number) => `RWF ${Number(n).toLocaleString()}`

const CATEGORIES = ['Electronics', 'Fashion & Clothing', 'Home & Living', 'Beauty & Health', 'Sports & Fitness', 'Food & Groceries', 'Automotive', 'Books & Media']

const statusBadge: Record<ProductStatus, string> = {
  active: 'bg-success-100 text-success-700',
  draft: 'bg-yellow-100 text-yellow-700',
  out_of_stock: 'bg-red-100 text-red-600',
}
const statusLabel: Record<ProductStatus, string> = {
  active: 'Active', draft: 'Draft', out_of_stock: 'Out of Stock',
}
const orderBadge: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-success-100 text-success-700',
  cancelled: 'bg-red-100 text-red-600',
}
const orderIcon: Record<OrderStatus, React.ReactNode> = {
  pending: <Clock size={12} />,
  processing: <AlertCircle size={12} />,
  shipped: <Truck size={12} />,
  delivered: <Check size={12} />,
  cancelled: <X size={12} />,
}
const ORDER_NEXT_STATUS: Partial<Record<OrderStatus, { label: string; value: OrderStatus; color: string }>> = {
  pending:    { label: 'Mark Processing', value: 'processing', color: 'bg-blue-600 text-white' },
  processing: { label: 'Mark Shipped',    value: 'shipped',    color: 'bg-purple-600 text-white' },
  shipped:    { label: 'Mark Delivered',  value: 'delivered',  color: 'bg-success-600 text-white' },
}

// â”€â”€â”€ Product Form Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface ProductModalProps {
  initial?: Partial<Product> | null
  onClose: () => void
  onSave: (p: Product) => void
}

function ProductModal({ initial, onClose, onSave }: ProductModalProps) {
  const isEdit = !!initial?.id
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [form, setForm] = useState({
    name: initial?.name || '',
    category: initial?.category || CATEGORIES[0],
    price: String(initial?.price || ''),
    old_price: String(initial?.old_price || ''),
    stock: String(initial?.stock ?? ''),
    sku: initial?.sku || '',
    description: initial?.description || '',
    status: (initial?.status || 'draft') as ProductStatus,
    images: initial?.images || [] as string[],
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { setErr('Product name is required'); return }
    if (!form.price || isNaN(Number(form.price))) { setErr('Valid price is required'); return }
    if (form.stock === '' || isNaN(Number(form.stock))) { setErr('Valid stock quantity is required'); return }
    setErr('')
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        old_price: form.old_price ? Number(form.old_price) : undefined,
        stock: Number(form.stock),
        sku: form.sku || undefined,
        description: form.description || undefined,
        status: form.status,
        images: form.images,
      }
      let saved: Product
      if (isEdit && initial?.id) {
        const res = await sellerProductsApi.update(initial.id, payload)
        saved = { ...res.data.data, images: res.data.data.images || [] }
      } else {
        const res = await sellerProductsApi.create(payload)
        saved = { ...res.data.data, images: res.data.data.images || [] }
      }
      onSave(saved)
    } catch {
      // Offline fallback â€” persist locally
      const fallback: Product = {
        id: initial?.id || Date.now(),
        name: form.name,
        category: form.category,
        price: Number(form.price),
        old_price: form.old_price ? Number(form.old_price) : undefined,
        stock: Number(form.stock),
        sold: initial?.sold || 0,
        sku: form.sku,
        description: form.description,
        status: form.status,
        images: form.images,
        createdAt: initial?.createdAt || new Date().toISOString().slice(0, 10),
      }
      onSave(fallback)
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            {isEdit ? <Edit3 size={18} className="text-primary-600" /> : <Plus size={18} className="text-primary-600" />}
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Image upload zone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Images</label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-300 transition-colors bg-gray-50 group cursor-pointer"
              onClick={() => document.getElementById('product-image-input')?.click()}
            >
              {form.images.length > 0 ? (
                <div className="flex flex-wrap gap-2 justify-center mb-2">
                  {form.images.slice(0, 4).map((src, idx) => (
                    <div key={idx} className="relative">
                      <img src={src} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                      <button type="button" onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, images: f.images.filter((_,j) => j!==idx) })) }} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">x</button>
                    </div>
                  ))}
                </div>
              ) : (
                <Image size={24} className="text-gray-300 mx-auto mb-1.5 group-hover:text-primary-400 transition-colors" />
              )}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-sm font-semibold hover:bg-primary-100 transition-colors mt-1">
                <Upload size={13} /> {form.images.length > 0 ? 'Add More' : 'Choose Images'}
              </div>
              <p className="text-xs text-gray-300 mt-1">PNG, JPG, WebP up to 5MB</p>
            </div>
            <input id="product-image-input" type="file" accept="image/*" multiple className="sr-only"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []).slice(0, 4 - form.images.length)
                const urls: string[] = []
                for (const f of files) {
                  const fd = new FormData(); fd.append('image', f)
                  try {
                    const tok = localStorage.getItem('seller_token')
                    const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/seller/products/upload`, { method:'POST', headers: tok ? {Authorization:`Bearer ${tok}`} : {}, body: fd })
                    if (r.ok) { const d = await r.json(); urls.push(d.data?.url || URL.createObjectURL(f)) }
                    else urls.push(URL.createObjectURL(f))
                  } catch { urls.push(URL.createObjectURL(f)) }
                }
                setForm(prev => ({ ...prev, images: [...prev.images, ...urls].slice(0, 4) }))
                e.target.value = ''
              }}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
            <input type="text" placeholder="e.g. iPhone 14 Pro Max 256GB Space Black"
              value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
            <div className="relative">
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className={`${inputCls} appearance-none`}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Price + Old price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (RWF) <span className="text-red-500">*</span></label>
              <input type="number" placeholder="e.g. 85000"
                value={form.price} onChange={e => set('price', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Old Price <span className="text-gray-400 font-normal text-xs">(for discount)</span>
              </label>
              <input type="number" placeholder="e.g. 100000"
                value={form.old_price} onChange={e => set('old_price', e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Stock + SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock Qty <span className="text-red-500">*</span></label>
              <input type="number" placeholder="e.g. 10"
                value={form.stock} onChange={e => set('stock', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">SKU <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
              <input type="text" placeholder="e.g. IPHONE-14-BLK"
                value={form.sku} onChange={e => set('sku', e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea rows={3} placeholder="Describe your product: key features, condition, what's included..."
              value={form.description} onChange={e => set('description', e.target.value)}
              className={`${inputCls} resize-none`} />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Listing Status</label>
            <div className="flex gap-3">
              {(['active', 'draft'] as ProductStatus[]).map(s => (
                <label key={s} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer font-semibold text-sm transition-all ${
                  form.status === s ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}>
                  <input type="radio" className="sr-only" checked={form.status === s}
                    onChange={() => setForm(f => ({ ...f, status: s }))} />
                  {s === 'active' ? <Eye size={14} /> : <EyeOff size={14} />}
                  {s === 'active' ? 'Publish Now' : 'Save as Draft'}
                </label>
              ))}
            </div>
          </div>

          {err && (
            <p className="text-red-500 text-sm flex items-center gap-1.5 font-medium">
              <AlertCircle size={14} /> {err}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={onClose} variant="outline" className="flex-1 py-3 rounded-xl font-semibold border-2">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-xl font-semibold transition-all active:scale-95">
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save size={15} /> {isEdit ? 'Save Changes' : 'Add Product'}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// â”€â”€â”€ Main Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function SellerDashboard() {
  const navigate = useNavigate()

  // Auth
  const sellerRaw = localStorage.getItem('seller_data')
  const sellerData: SellerProfile | null = sellerRaw ? JSON.parse(sellerRaw) : null

  // State
  const [tab, setTab] = useState<Tab>('overview')
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS)
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS)
  const [analyticsData, setAnalyticsData] = useState<Record<string, unknown> | null>(null)
  const [profile, setProfile] = useState<SellerProfile | null>(sellerData)
  const [profileForm, setProfileForm] = useState({
    full_name: sellerData?.full_name || '',
    phone: sellerData?.phone || '',
    shop_name: sellerData?.shop_name || '',
    shop_description: sellerData?.shop_description || '',
    province: sellerData?.province || '',
    district: sellerData?.district || '',
  })

  const [loading, setLoading] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all')
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'all'>('all')
  const [productModal, setProductModal] = useState<{ open: boolean; product?: Partial<Product> | null }>({ open: false })
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null)

  // â”€â”€ API Loaders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadProducts = useCallback(async () => {
    try {
      const res = await sellerProductsApi.list()
      if (res.data?.data?.items?.length) {
        setProducts(res.data.data.items.map((p: Product) => ({ ...p, images: p.images || [] })))
      }
    } catch { /* use seed */ }
  }, [])

  const loadOrders = useCallback(async () => {
    try {
      const res = await sellerOrdersApi.list()
      if (res.data?.data?.items?.length) setOrders(res.data.data.items)
    } catch { /* use seed */ }
  }, [])

  const loadAnalytics = useCallback(async () => {
    try {
      const res = await sellerAnalyticsApi.summary()
      setAnalyticsData(res.data?.data || null)
    } catch { /* leave null */ }
  }, [])

  // Load on mount
  useEffect(() => {
    loadProducts()
    loadOrders()
    loadAnalytics()
  }, [loadProducts, loadOrders, loadAnalytics])

  // â”€â”€ Computed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.seller_earnings, 0)

  const filteredProducts = products.filter(p =>
    (statusFilter === 'all' || p.status === statusFilter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  )
  const filteredOrders = orders.filter(o =>
    (orderFilter === 'all' || o.status === orderFilter) &&
    (o.order_ref.includes(search) || o.buyer_name.toLowerCase().includes(search.toLowerCase()))
  )

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleProductSave = (saved: Product) => {
    setProducts(prev => {
      const exists = prev.find(p => p.id === saved.id)
      return exists ? prev.map(p => p.id === saved.id ? saved : p) : [saved, ...prev]
    })
    setProductModal({ open: false })
  }

  const toggleStatus = async (id: number) => {
    const p = products.find(x => x.id === id)
    if (!p) return
    const next: ProductStatus = p.status === 'active' ? 'draft' : 'active'
    setProducts(prev => prev.map(x => x.id === id ? { ...x, status: next } : x))
    try { await sellerProductsApi.update(id, { status: next }) } catch { /* optimistic update stays */ }
  }

  const deleteProduct = async (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id))
    try { await sellerProductsApi.remove(id) } catch { /* already removed locally */ }
  }

  const updateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingOrder(orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    try { await sellerOrdersApi.updateStatus(orderId, newStatus) } catch { /* optimistic */ }
    finally { setUpdatingOrder(null) }
  }

  const saveProfile = async () => {
    setProfileSaving(true)
    try {
      const res = await sellerAuthApi.updateProfile(profileForm)
      const updated = res.data?.data
      if (updated) {
        setProfile(updated)
        localStorage.setItem('seller_data', JSON.stringify(updated))
      }
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 3000)
    } catch { /* show saved locally anyway */ setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000) }
    finally { setProfileSaving(false) }
  }

  const handleLogout = async () => {
    const rt = localStorage.getItem('seller_refresh_token') || ''
    try { await sellerAuthApi.logout(rt) } catch { /* ok */ }
    localStorage.removeItem('seller_token')
    localStorage.removeItem('seller_refresh_token')
    localStorage.removeItem('seller_data')
    navigate('/seller/login')
  }

  const refreshAll = async () => {
    setLoading(true)
    await Promise.allSettled([loadProducts(), loadOrders(), loadAnalytics()])
    setLoading(false)
  }

  // â”€â”€ Nav items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const navItems: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview',  label: 'Overview',    icon: <LayoutDashboard size={18} /> },
    { id: 'products',  label: 'My Products', icon: <Package size={18} /> },
    { id: 'orders',    label: 'Orders',      icon: <ShoppingBag size={18} />, badge: pendingOrders },
    { id: 'analytics', label: 'Analytics',   icon: <BarChart2 size={18} /> },
    { id: 'payouts',   label: 'Payouts',     icon: <Wallet size={18} /> },
    { id: 'settings',  label: 'Settings',    icon: <Settings size={18} /> },
  ]

  const shopImage = profile?.shop_logo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.shop_name || 'Seller')}&background=3b82f6&color=fff&size=40`

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* â”€â”€ Sidebar â”€â”€ */}
      <aside className={`fixed top-0 left-0 h-full z-40 w-64 bg-gray-900 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        {/* Brand */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Store size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">{BRAND_INFO.name}</span>
              <p className="text-xs text-gray-400">Seller Hub</p>
            </div>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Seller chip */}
        <div className="p-4 mx-3 mt-4 bg-gray-800 rounded-xl flex items-center gap-3">
          <img src={shopImage} alt="Seller" className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate">{profile?.shop_name || 'My Shop'}</p>
            <p className="text-xs text-gray-400 truncate capitalize">{profile?.plan || 'Free'} Seller</p>
          </div>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${profile?.status === 'active' ? 'bg-success-400' : 'bg-yellow-400'}`} />
        </div>

        {/* Wallet */}
        <div className="mx-3 mt-3 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl px-4 py-3 flex items-center gap-3">
          <Wallet size={18} className="text-white/80 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-blue-200">Wallet Balance</p>
            <p className="font-bold text-white text-sm">{fmt(profile?.wallet_balance || 0)}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 mt-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false); setSearch('') }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                tab === item.id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
              {item.badge ? (
                <span className="ml-auto bg-accent-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-800 space-y-0.5">
          <Link to={`/shop/${profile?.shop_slug || ''}`} target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
            <ExternalLink size={18} /> View My Shop
          </Link>
          <Link to="/pricing"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
            <TrendingUp size={18} /> Upgrade Plan
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition-all">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* â”€â”€ Main Area â”€â”€ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <Menu size={20} />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">
              {tab === 'overview' ? 'Dashboard' : tab === 'products' ? 'My Products' : tab === 'orders' ? 'Orders' : tab === 'analytics' ? 'Analytics' : 'Settings'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refreshAll} disabled={loading}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Refresh data">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="relative p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <Bell size={18} className="text-gray-600" />
              {pendingOrders > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {pendingOrders}
                </span>
              )}
            </button>
            {tab === 'products' && (
              <Button onClick={() => setProductModal({ open: true, product: null })}
                className="bg-primary-600 hover:bg-primary-700 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-md">
                <Plus size={16} />
                <span className="hidden sm:inline">Add Product</span>
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">

          {/* â•â• OVERVIEW â•â• */}
          {tab === 'overview' && (
            <div className="space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Revenue', value: fmt(totalRevenue), icon: <DollarSign size={22} />, color: 'bg-primary-500', change: '+12%', up: true },
                  { label: 'Total Orders', value: String(orders.length), icon: <ShoppingBag size={22} />, color: 'bg-accent-500', change: '+8%', up: true },
                  { label: 'Products Listed', value: String(products.length), icon: <Package size={22} />, color: 'bg-success-500', change: `+${products.filter(p => p.status === 'active').length} active`, up: true },
                  { label: 'Pending Orders', value: String(pendingOrders), icon: <Clock size={22} />, color: 'bg-yellow-500', change: 'Need action', up: false },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-11 h-11 ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        {stat.icon}
                      </div>
                      <span className={`text-xs font-bold flex items-center gap-1 ${stat.up ? 'text-success-600' : 'text-yellow-600'}`}>
                        {stat.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-0.5">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Recent Orders</h3>
                  <button onClick={() => setTab('orders')} className="text-sm text-primary-600 hover:text-primary-700 font-semibold">View all â†’</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                      <tr>
                        <th className="px-5 py-3 text-left font-semibold">Order</th>
                        <th className="px-5 py-3 text-left font-semibold">Customer</th>
                        <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Product</th>
                        <th className="px-5 py-3 text-left font-semibold">Earnings</th>
                        <th className="px-5 py-3 text-left font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-xs text-gray-500 font-semibold">{o.order_ref}</td>
                          <td className="px-5 py-3.5 font-medium text-gray-900">{o.buyer_name}</td>
                          <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell truncate max-w-[160px]">{o.product_name}</td>
                          <td className="px-5 py-3.5 font-bold text-success-600">{fmt(o.seller_earnings)}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${orderBadge[o.status]}`}>
                              {orderIcon[o.status]} {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top products */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Top Selling Products</h3>
                  <button onClick={() => setTab('products')} className="text-sm text-primary-600 hover:text-primary-700 font-semibold">Manage â†’</button>
                </div>
                <div className="p-4 space-y-3">
                  {[...products].sort((a, b) => b.sold - a.sold).slice(0, 3).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                        i === 0 ? 'bg-yellow-400 text-yellow-900' : i === 1 ? 'bg-gray-300 text-gray-700' : 'bg-amber-600 text-white'
                      }`}>#{i + 1}</span>
                      <img src={p.images[0] || 'https://via.placeholder.com/48'} alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.sold} sold Â· {fmt(p.price)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-primary-600 text-sm">{fmt(p.price * p.sold)}</p>
                        <p className="text-xs text-gray-400">revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* â•â• PRODUCTS â•â• */}
          {tab === 'products' && (
            <div className="space-y-5">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search products..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 bg-white" />
                </div>
                <div className="relative">
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ProductStatus | 'all')}
                    className="appearance-none pl-4 pr-9 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 bg-white font-medium text-gray-700">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {filteredProducts.length === 0 ? (
                  <div className="py-20 text-center">
                    <Package size={48} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium mb-4">No products found</p>
                    <Button onClick={() => setProductModal({ open: true, product: null })}
                      className="bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold">
                      <Plus size={15} className="mr-1.5" /> Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                          <th className="px-5 py-3 text-left font-semibold">Product</th>
                          <th className="px-5 py-3 text-left font-semibold hidden sm:table-cell">Category</th>
                          <th className="px-5 py-3 text-left font-semibold">Price</th>
                          <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Stock</th>
                          <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Sold</th>
                          <th className="px-5 py-3 text-left font-semibold">Status</th>
                          <th className="px-5 py-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredProducts.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <img src={p.images[0] || 'https://via.placeholder.com/44'} alt={p.name}
                                  className="w-11 h-11 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                                <div>
                                  <p className="font-semibold text-gray-900 line-clamp-1 max-w-[140px]">{p.name}</p>
                                  <p className="text-xs text-gray-400">{p.createdAt}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-gray-500 hidden sm:table-cell">{p.category}</td>
                            <td className="px-5 py-4">
                              <p className="font-bold text-primary-600">{fmt(p.price)}</p>
                              {p.old_price && <p className="text-xs text-gray-400 line-through">{fmt(p.old_price)}</p>}
                            </td>
                            <td className="px-5 py-4 hidden md:table-cell">
                              <span className={`font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock < 5 ? 'text-yellow-600' : 'text-gray-700'}`}>
                                {p.stock} units
                              </span>
                            </td>
                            <td className="px-5 py-4 text-gray-600 hidden md:table-cell">{p.sold}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge[p.status]}`}>
                                {statusLabel[p.status]}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => toggleStatus(p.id)} title={p.status === 'active' ? 'Set Draft' : 'Set Active'}
                                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-primary-600 transition-colors">
                                  {p.status === 'active' ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                                <button onClick={() => setProductModal({ open: true, product: p })}
                                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-primary-600 transition-colors">
                                  <Edit3 size={14} />
                                </button>
                                <button onClick={() => deleteProduct(p.id)}
                                  className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* â•â• ORDERS â•â• */}
          {tab === 'orders' && (
            <div className="space-y-5">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search order or customer..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 bg-white" />
                </div>
                <div className="relative">
                  <select value={orderFilter} onChange={e => setOrderFilter(e.target.value as OrderStatus | 'all')}
                    className="appearance-none pl-4 pr-9 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 bg-white font-medium text-gray-700">
                    <option value="all">All Orders</option>
                    {(['pending','processing','shipped','delivered','cancelled'] as OrderStatus[]).map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Status chips */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map(s => {
                  const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length
                  return (
                    <button key={s} onClick={() => setOrderFilter(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                        orderFilter === s
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                      }`}>
                      {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)} ({count})
                    </button>
                  )
                })}
              </div>

              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl py-16 text-center border border-gray-100">
                    <ShoppingBag size={40} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400">No orders found</p>
                  </div>
                ) : filteredOrders.map(o => {
                  const nextAction = ORDER_NEXT_STATUS[o.status]
                  return (
                    <div key={o.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs text-gray-500 font-semibold">{o.order_ref}</span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${orderBadge[o.status]}`}>
                              {orderIcon[o.status]} {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                            </span>
                            {o.payment_status === 'paid' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-success-50 text-success-700 rounded-full text-xs font-semibold">
                                <Check size={10} /> Paid
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-gray-900 mt-1">{o.buyer_name}</p>
                          <p className="text-sm text-gray-500">{o.product_name} Ã— {o.quantity}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <MapPin size={11} /> {o.delivery_district}, {o.delivery_province}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary-600">{fmt(o.seller_earnings)}</p>
                          <p className="text-xs text-gray-400">your earnings</p>
                          <p className="text-xs text-gray-400 mt-0.5">{o.created_at}</p>
                        </div>
                      </div>

                      {/* Action button */}
                      {nextAction && o.status !== 'cancelled' && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                          <Button
                            onClick={() => updateOrderStatus(o.id, nextAction.value)}
                            disabled={updatingOrder === o.id}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all ${nextAction.color}`}>
                            {updatingOrder === o.id ? (
                              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                            ) : nextAction.value === 'shipped' ? <Truck size={13} /> : <Check size={13} />}
                            {nextAction.label}
                          </Button>
                          <button
                            onClick={() => updateOrderStatus(o.id, 'cancelled')}
                            disabled={updatingOrder === o.id}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                            Cancel Order
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* â•â• ANALYTICS â•â• */}
          {tab === 'analytics' && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'This Month Revenue', value: fmt(totalRevenue), sub: 'From delivered orders', color: 'text-primary-600', bg: 'bg-primary-50' },
                  { label: 'Avg. Order Value', value: fmt(Math.round(totalRevenue / Math.max(orders.filter(o => o.status === 'delivered').length, 1))), sub: 'Per delivered order', color: 'text-accent-600', bg: 'bg-accent-50' },
                  { label: 'Total Units Sold', value: String(products.reduce((s, p) => s + p.sold, 0)), sub: 'Across all products', color: 'text-success-600', bg: 'bg-success-50' },
                ].map((m, i) => (
                  <div key={i} className={`${m.bg} rounded-2xl p-5 border border-gray-100`}>
                    <p className={`text-3xl font-bold ${m.color} mb-1`}>{m.value}</p>
                    <p className="font-semibold text-gray-800 text-sm">{m.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.sub}</p>
                  </div>
                ))}
              </div>

              {/* Revenue by product */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <BarChart2 size={18} className="text-primary-600" /> Revenue by Product
                </h3>
                <div className="space-y-4">
                  {[...products].sort((a, b) => b.price * b.sold - a.price * a.sold).map(p => {
                    const maxRev = Math.max(...products.map(pr => pr.price * pr.sold), 1)
                    const pct = Math.round((p.price * p.sold / maxRev) * 100)
                    return (
                      <div key={p.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-4">{p.name}</span>
                          <span className="text-sm font-bold text-primary-600 flex-shrink-0">{fmt(p.price * p.sold)}</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{p.sold} units Â· {pct}% of top</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Order breakdown */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-5">Order Status Breakdown</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {(['pending','processing','shipped','delivered','cancelled'] as OrderStatus[]).map(s => {
                    const count = orders.filter(o => o.status === s).length
                    return (
                      <div key={s} className={`rounded-xl p-3 text-center ${orderBadge[s]}`}>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-xs font-semibold mt-1 capitalize">{s}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Commission info */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Wallet size={18} className="text-primary-600" /> Earnings Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Gross Sales', value: fmt(orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.subtotal, 0)), color: 'text-gray-900' },
                    { label: 'Platform Commission', value: `${profile?.commission_rate || 8}%`, color: 'text-red-500' },
                    { label: 'Net Earnings', value: fmt(totalRevenue), color: 'text-success-600' },
                    { label: 'Wallet Balance', value: fmt(profile?.wallet_balance || 0), color: 'text-primary-600' },
                    { label: 'Total Earned (All Time)', value: fmt(profile?.total_earned || 0), color: 'text-gray-900' },
                    { label: 'Pending Payout', value: fmt(0), color: 'text-yellow-600' },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-5">
                <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Star size={32} className="text-yellow-400 fill-yellow-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {analyticsData ? String((analyticsData as { rating?: { avg_rating?: number } })?.rating?.avg_rating?.toFixed(1) || 'â€”') : '4.8'}
                    <span className="text-lg font-normal text-gray-400"> / 5.0</span>
                  </p>
                  <p className="text-sm font-semibold text-gray-700">Average Seller Rating</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Based on {analyticsData ? String((analyticsData as { rating?: { total_reviews?: number } })?.rating?.total_reviews || 0) : '42'} customer reviews
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* â•â• PAYOUTS â•â• */}
          {tab === 'payouts' && (
            <div className="space-y-6">
              {/* Wallet summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Wallet Balance',     value: fmt(profile?.wallet_balance || 0),  color: 'text-primary-600', bg: 'bg-primary-50',  icon: <Wallet size={22} className="text-primary-600" /> },
                  { label: 'Total Earned',        value: fmt(profile?.total_earned || 0),     color: 'text-success-600', bg: 'bg-success-50',  icon: <DollarSign size={22} className="text-success-600" /> },
                  { label: 'Commission Rate',     value: `${profile?.commission_rate || 8}%`, color: 'text-accent-600',  bg: 'bg-accent-50',   icon: <BarChart2 size={22} className="text-accent-600" /> },
                ].map((s, i) => (
                  <div key={i} className={`${s.bg} rounded-2xl p-5 border border-gray-100 flex items-center gap-4`}>
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                      {s.icon}
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Request payout form */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Wallet size={18} className="text-primary-600" /> Request a Payout
                </h3>
                <PayoutForm
                  walletBalance={profile?.wallet_balance || 0}
                  onSuccess={() => {
                    // Reload profile to get updated wallet balance
                    sellerAuthApi.me().then(res => {
                      const updated = res.data?.data
                      if (updated) {
                        setProfile(updated)
                        localStorage.setItem('seller_data', JSON.stringify(updated))
                      }
                    }).catch(() => {})
                  }}
                />
              </div>

              {/* Payout history */}
              <PayoutHistory />
            </div>
          )}

          {/* â•â• SETTINGS â•â• */}
          {tab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              {/* Shop profile form */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Store size={18} className="text-primary-600" /> Shop Profile
                </h3>

                {/* Avatar row */}
                <div className="flex items-center gap-4 mb-6">
                  <img src={shopImage} alt="Shop" className="w-16 h-16 rounded-2xl border-2 border-gray-200 object-cover" />
                  <div>
                    <Button className="bg-primary-50 text-primary-600 hover:bg-primary-100 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                      <Upload size={14} /> Change Logo
                    </Button>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'full_name', label: 'Full Name', placeholder: 'Jean Pierre Nkurunziza' },
                    { key: 'phone', label: 'Business Phone', placeholder: '+250 788 123 456' },
                    { key: 'shop_name', label: 'Shop Name', placeholder: 'TechHub Kigali' },
                    { key: 'province', label: 'Province', placeholder: 'Kigali' },
                    { key: 'district', label: 'District', placeholder: 'Gasabo' },
                  ].map(field => (
                    <div key={field.key} className={field.key === 'shop_name' ? 'sm:col-span-2' : ''}>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                      <input
                        type="text"
                        value={profileForm[field.key as keyof typeof profileForm]}
                        placeholder={field.placeholder}
                        onChange={e => setProfileForm(f => ({ ...f, [field.key]: e.target.value }))}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors"
                      />
                    </div>
                  ))}

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Shop Description</label>
                    <textarea rows={3}
                      value={profileForm.shop_description}
                      placeholder="Tell customers about your shop..."
                      onChange={e => setProfileForm(f => ({ ...f, shop_description: e.target.value }))}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-5">
                  <Button onClick={saveProfile} disabled={profileSaving}
                    className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center gap-2">
                    {profileSaving ? (
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : <Save size={15} />}
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  {profileSaved && (
                    <span className="text-sm text-success-600 font-semibold flex items-center gap-1.5">
                      <Check size={15} /> Saved!
                    </span>
                  )}
                </div>
              </div>

              {/* Current plan card */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Current Plan</span>
                    <h3 className="text-2xl font-bold mt-1 capitalize">{profile?.plan || 'Free'} Seller</h3>
                    <p className="text-blue-100 text-sm mt-0.5">{profile?.commission_rate || 8}% commission per sale</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Star size={22} className="text-yellow-300 fill-yellow-300" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/pricing" className="flex-1">
                    <Button className="w-full bg-white text-primary-700 hover:bg-gray-100 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95">
                      View All Plans
                    </Button>
                  </Link>
                  <Link to="/pricing?plan=pro" className="flex-1">
                    <Button className="w-full bg-accent-500 hover:bg-accent-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95">
                      Upgrade Plan
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Danger zone */}
              <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
                <h3 className="font-bold text-red-600 mb-3 flex items-center gap-2">
                  <AlertCircle size={18} /> Danger Zone
                </h3>
                <p className="text-sm text-gray-500 mb-4">These actions are permanent and cannot be undone.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="border-2 border-red-200 text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
                    Pause My Shop
                  </Button>
                  <Button variant="outline" className="border-2 border-red-500 text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Product modal */}
      {productModal.open && (
        <ProductModal
          initial={productModal.product}
          onClose={() => setProductModal({ open: false })}
          onSave={handleProductSave}
        />
      )}
    </div>
  )
}

// ─── PayoutForm sub-component ───────────────────────────

function PayoutForm({ walletBalance, onSuccess }: { walletBalance: number; onSuccess: () => void }) {
  const [method,  setMethod]  = useState<'mtn' | 'airtel' | 'bank'>('mtn')
  const [account, setAccount] = useState('')
  const [amount,  setAmount]  = useState('')
  const [note,    setNote]    = useState('')
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const MIN = 5000

  const handleSubmit = async () => {
    const amt = Number(amount)
    if (!account.trim())        { setMsg({ type: 'error', text: 'Account number is required' }); return }
    if (!amt || amt < MIN)      { setMsg({ type: 'error', text: `Minimum payout is RWF ${MIN.toLocaleString()}` }); return }
    if (amt > walletBalance)    { setMsg({ type: 'error', text: 'Amount exceeds your wallet balance' }); return }
    setSaving(true); setMsg(null)
    try {
      await sellerApiDefault.post('/payouts', { method, account_number: account, amount: amt, note })
      setMsg({ type: 'success', text: `Payout of RWF ${amt.toLocaleString()} requested! Processing in 1â€“3 business days.` })
      setAmount(''); setAccount(''); setNote('')
      onSuccess()
    } catch (e: unknown) {
      const m = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to request payout'
      setMsg({ type: 'error', text: m })
    } finally { setSaving(false) }
  }

  const inputCls = 'w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors'

  return (
    <div className="space-y-4">
      {msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
          msg.type === 'success' ? 'bg-success-50 border border-success-200 text-success-700' : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {msg.type === 'error' ? <AlertCircle size={15} /> : <Check size={15} />}
          {msg.text}
        </div>
      )}

      {/* Method */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Payout Method</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'mtn'    as const, label: 'MTN MoMo',     icon: <Phone size={18} />,     color: 'text-yellow-600' },
            { id: 'airtel' as const, label: 'Airtel Money',  icon: <Phone size={18} />,     color: 'text-red-600'    },
            { id: 'bank'   as const, label: 'Bank Transfer', icon: <Building2 size={18} />, color: 'text-gray-700'   },
          ].map(m => (
            <button key={m.id} type="button" onClick={() => setMethod(m.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-semibold ${
                method === m.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              <span className={m.color}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {method === 'bank' ? 'Account Number' : 'Mobile Number'} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <CreditCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder={method === 'bank' ? '000123456789' : '+250 7XX XXX XXX'}
              value={account} onChange={e => setAccount(e.target.value)} className={`${inputCls} pl-10`} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Amount (RWF) <span className="text-red-500">*</span>
          </label>
          <input type="number" placeholder={`Min RWF ${MIN.toLocaleString()}`}
            value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} />
          <p className="text-xs text-gray-400 mt-1">
            Available: <span className="font-semibold text-primary-600">RWF {walletBalance.toLocaleString()}</span>
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Note (optional)</label>
        <input type="text" placeholder="e.g. Weekly earnings payout"
          value={note} onChange={e => setNote(e.target.value)} className={inputCls} />
      </div>

      <Button onClick={handleSubmit} disabled={saving}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white py-3 rounded-xl font-bold active:scale-95 transition-all shadow-md">
        {saving ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Submitting...
          </span>
        ) : `Request Payout Â· RWF ${Number(amount || 0).toLocaleString()}`}
      </Button>
    </div>
  )
}

// â”€â”€â”€ PayoutHistory sub-component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PayoutHistory() {
  const [payouts,  setPayouts]  = useState<{ id: number; amount: number; method: string; account_number: string; status: string; created_at: string }[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    sellerApiDefault.get('/payouts')
      .then(r => setPayouts(r.data?.data?.items || r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statusColor: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    completed:  'bg-success-100 text-success-700',
    failed:     'bg-red-100 text-red-600',
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Clock size={16} className="text-primary-600" /> Payout History
        </h3>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin w-8 h-8 text-primary-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      ) : payouts.length === 0 ? (
        <div className="py-12 text-center">
          <Wallet size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No payouts yet. Request your first payout above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Date</th>
                <th className="px-5 py-3 text-left font-semibold">Amount</th>
                <th className="px-5 py-3 text-left font-semibold hidden sm:table-cell">Method</th>
                <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Account</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payouts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-gray-500 text-xs">
                    {new Date(p.created_at).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-primary-600">RWF {Number(p.amount).toLocaleString()}</td>
                  <td className="px-5 py-3.5 hidden sm:table-cell text-gray-600 uppercase text-xs">{p.method}</td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-gray-500 font-mono text-xs">{p.account_number}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
