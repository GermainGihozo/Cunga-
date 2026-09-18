import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Store, MapPin, Star, Package, ShoppingBag, Shield, Check,
  ArrowLeft, Search, Filter, ChevronDown, Heart, ShoppingCart,
  Phone, Share2, TrendingUp, Award, MessageCircle,
} from 'lucide-react'
import { Button } from '@components/common'
import { BRAND_INFO } from '@constants/brand'
import { marketplaceService, MarketProduct, MarketSeller } from '@services/marketplaceService'
import { useAppDispatch } from '@hooks'
import { addItem } from '@store/slices/cartSlice'

const fmt = (n: number) => `RWF ${Number(n).toLocaleString()}`

const CATEGORIES_FILTER = [
  'All', 'Electronics', 'Fashion & Clothing', 'Home & Living',
  'Beauty & Health', 'Sports & Fitness', 'Food & Groceries', 'Other',
]

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
]

export default function SellerStorefront() {
  const { slug } = useParams<{ slug: string }>()
  const navigate  = useNavigate()
  const dispatch  = useAppDispatch()

  const [seller,   setSeller]   = useState<MarketSeller | null>(null)
  const [products, setProducts] = useState<MarketProduct[]>([])
  const [reviews,  setReviews]  = useState<{ buyer_name: string; rating: number; comment?: string; created_at: string }[]>([])
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Filters
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('All')
  const [sort,     setSort]     = useState('default')
  const [tab,      setTab]      = useState<'products' | 'reviews'>('products')

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    marketplaceService.getSellerStorefront(slug)
      .then(data => {
        setSeller(data.seller as MarketSeller)
        setProducts(data.products)
        setReviews(data.reviews)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  const handleAddToCart = (p: MarketProduct) => {
    dispatch(addItem({
      id:          p.id,
      name:        p.name,
      price:       p.price,
      oldPrice:    p.old_price,
      image:       p.images?.[0] || '',
      seller_name: p.shop_name,
      seller_id:   p.seller_id,
      shop_slug:   p.shop_slug,
      category:    p.category,
      quantity:    1,
      stock:       p.stock,
    }))
  }

  // Client-side filter + sort
  const displayProducts = products
    .filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      if (category !== 'All' && p.category !== category) return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'price_asc')  return a.price - b.price
      if (sort === 'price_desc') return b.price - a.price
      if (sort === 'popular')    return b.sold - a.sold
      if (sort === 'newest')     return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      return 0
    })

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  // ── Loading skeleton ──────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="h-48 bg-gray-300" />
        <div className="max-w-6xl mx-auto px-4 -mt-16 pb-8">
          <div className="flex items-end gap-5 mb-6">
            <div className="w-28 h-28 rounded-2xl bg-gray-300 flex-shrink-0" />
            <div className="space-y-2 pb-4">
              <div className="h-7 bg-gray-300 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-square bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── 404 ───────────────────────────────────────────────
  if (notFound || !seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Store size={64} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Shop Not Found</h2>
          <p className="text-gray-500 mb-6">
            This shop doesn't exist or may have been removed.
          </p>
          <Link to="/products">
            <Button className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Minimal header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/logos/logo-temp.svg" alt={BRAND_INFO.name} className="w-8 h-8" />
            <span className="font-bold text-primary-700 hidden sm:block">{BRAND_INFO.name}</span>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
              <ArrowLeft size={15} /> Back
            </button>
            <Link to="/products" className="text-sm text-gray-500 hover:text-primary-600 transition-colors hidden sm:block">
              Browse All Products
            </Link>
          </div>
        </div>
      </header>

      {/* ── Shop banner ── */}
      <div className="relative">
        {/* Banner image or gradient fallback */}
        {(seller as MarketSeller & { shop_banner?: string }).shop_banner ? (
          <img
            src={(seller as MarketSeller & { shop_banner?: string }).shop_banner}
            alt={`${seller.shop_name} banner`}
            className="w-full h-44 sm:h-56 object-cover"
          />
        ) : (
          <div className="w-full h-44 sm:h-56 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-900">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 0%, transparent 60%)' }} />
          </div>
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Breadcrumb on banner */}
        <div className="absolute top-4 left-4 text-xs text-white/70 flex items-center gap-1.5">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-white transition-colors">Products</Link>
          <span>/</span>
          <span className="text-white">{seller.shop_name}</span>
        </div>
      </div>

      {/* ── Shop profile header ── */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-md -mt-10 sm:-mt-14 relative z-10 p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg flex-shrink-0 bg-primary-100">
              {seller.shop_logo ? (
                <img src={seller.shop_logo} alt={seller.shop_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{seller.shop_name.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{seller.shop_name}</h1>
                {seller.is_verified && (
                  <span className="inline-flex items-center gap-1 text-xs text-primary-600 font-semibold bg-primary-50 px-2 py-0.5 rounded-full">
                    <Shield size={11} className="fill-primary-600" /> Verified
                  </span>
                )}
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${
                  seller.plan === 'pro' ? 'bg-purple-100 text-purple-700' :
                  seller.plan === 'starter' ? 'bg-blue-100 text-blue-700' :
                  seller.plan === 'enterprise' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {seller.plan}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {(seller.province || seller.district) && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {seller.district ? `${seller.district}, ` : ''}{seller.province || 'Rwanda'}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Package size={14} /> {seller.product_count ?? products.length} products
                </span>
                <span className="flex items-center gap-1">
                  <ShoppingBag size={14} /> {(seller.total_sold ?? 0).toLocaleString()} sold
                </span>
                {avgRating && (
                  <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    {avgRating} ({reviews.length} reviews)
                  </span>
                )}
              </div>

              {seller.shop_description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2 max-w-xl">
                  {seller.shop_description}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  if (navigator.share) navigator.share({ title: seller.shop_name, url: window.location.href })
                  else navigator.clipboard.writeText(window.location.href).catch(() => {})
                }}
                className="p-2.5 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all text-gray-500 hover:text-primary-600"
                title="Share shop"
              >
                <Share2 size={18} />
              </button>
              {(seller as MarketSeller & { phone?: string }).phone && (
                <a
                  href={`tel:${(seller as MarketSeller & { phone?: string }).phone}`}
                  className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all text-sm font-semibold text-gray-700 hover:text-primary-700"
                >
                  <Phone size={15} /> Contact
                </a>
              )}
              <Link to={`/seller/register`}>
                <Button className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-all shadow-md">
                  Open Your Shop
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
            {[
              { icon: <Package size={18} className="text-primary-600" />, value: String(seller.product_count ?? products.length), label: 'Products' },
              { icon: <TrendingUp size={18} className="text-success-600" />, value: (seller.total_sold ?? 0).toLocaleString(), label: 'Total Sold' },
              { icon: <Award size={18} className="text-yellow-500" />, value: avgRating ? `${avgRating}/5` : '—', label: 'Rating' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-1">{s.icon}</div>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tab bar: Products / Reviews ── */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl shadow-sm p-1 border border-gray-100 w-fit">
          {[
            { id: 'products', label: `Products (${products.length})`, icon: <Package size={15} /> },
            { id: 'reviews',  label: `Reviews (${reviews.length})`,   icon: <MessageCircle size={15} /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as 'products' | 'reviews')}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── PRODUCTS tab ── */}
        {tab === 'products' && (
          <div>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" placeholder={`Search in ${seller.shop_name}…`}
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 bg-white"
                />
              </div>
              <div className="relative">
                <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="appearance-none pl-8 pr-8 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 bg-white text-gray-700 font-medium">
                  {CATEGORIES_FILTER.map(c => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select value={sort} onChange={e => setSort(e.target.value)}
                  className="appearance-none pl-4 pr-8 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 bg-white text-gray-700 font-medium">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {displayProducts.length === 0 ? (
              <div className="bg-white rounded-2xl py-20 text-center shadow-sm border border-gray-100 mb-8">
                <Package size={48} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  {products.length === 0 ? 'No products listed yet' : 'No products match your filters'}
                </p>
                {products.length > 0 && (
                  <button onClick={() => { setSearch(''); setCategory('All') }}
                    className="mt-3 text-sm text-primary-600 hover:underline font-semibold">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mb-10">
                {displayProducts.map(p => (
                  <ProductCard key={p.id} product={p} onAddToCart={() => handleAddToCart(p)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS tab ── */}
        {tab === 'reviews' && (
          <div className="mb-10 space-y-4">
            {/* Rating summary */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-8 mb-2">
                <div className="text-center flex-shrink-0">
                  <p className="text-5xl font-bold text-gray-900">{avgRating}</p>
                  <div className="flex items-center justify-center gap-0.5 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} className={
                        i < Math.floor(Number(avgRating))
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-200 fill-gray-200'
                      } />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex-1 space-y-2 w-full">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviews.filter(r => Math.round(r.rating) === star).length
                    const pct   = reviews.length ? Math.round((count / reviews.length) * 100) : 0
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-8 text-right">{star}★</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-8">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="bg-white rounded-2xl py-20 text-center shadow-sm border border-gray-100">
                <MessageCircle size={48} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No reviews yet</p>
                <p className="text-xs text-gray-400 mt-1">Be the first to leave a review after purchasing</p>
              </div>
            ) : (
              reviews.map((r, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {(r.buyer_name || 'B').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{r.buyer_name || 'Anonymous'}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} size={12} className={j < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-700 leading-relaxed">{r.comment}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Footer strip ── */}
      <footer className="bg-gray-900 text-gray-500 text-xs text-center py-5 px-4">
        <Link to="/" className="text-gray-400 hover:text-white transition-colors font-semibold">
          {BRAND_INFO.name}
        </Link>
        {' '}· Secure payments · Buyer protection ·{' '}
        <Link to="/pricing" className="hover:text-gray-300 transition-colors">Sell on {BRAND_INFO.name}</Link>
      </footer>
    </div>
  )
}

// ── Product card ───────────────────────────────────────────
interface ProductCardProps {
  product: MarketProduct
  onAddToCart: () => void
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [added, setAdded] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    onAddToCart()
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const discountPct = product.old_price && product.old_price > product.price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : null

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-gray-100 hover:border-primary-300 hover:shadow-xl transition-all">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {discountPct && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
              -{discountPct}%
            </span>
          )}
          {product.is_featured && (
            <span className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
              Featured
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span>
            </div>
          )}
          {/* Quick-add button */}
          {product.stock > 0 && (
            <button
              onClick={handleAdd}
              className={`absolute bottom-2 right-2 w-9 h-9 rounded-full shadow-lg flex items-center justify-center
                opacity-0 group-hover:opacity-100 transition-all active:scale-90 ${
                added ? 'bg-success-500 text-white' : 'bg-white hover:bg-primary-600 hover:text-white text-gray-700'
              }`}
              title={added ? 'Added!' : 'Add to Cart'}
            >
              {added ? <Check size={14} /> : <ShoppingCart size={14} />}
            </button>
          )}
          <button
            onClick={e => e.preventDefault()}
            className="absolute top-8 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart size={13} className="text-gray-400 hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-primary-600 transition-colors mb-1.5">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-base font-bold text-primary-600">{fmt(product.price)}</span>
            {product.old_price && (
              <span className="text-xs text-gray-400 line-through">{fmt(product.old_price)}</span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            {product.avg_rating && product.avg_rating > 0 ? (
              <span className="flex items-center gap-0.5">
                <Star size={11} className="fill-yellow-400 text-yellow-400" />
                {product.avg_rating.toFixed(1)}
                {product.review_count ? ` (${product.review_count})` : ''}
              </span>
            ) : <span />}
            <span>{product.sold > 0 ? `${product.sold} sold` : 'New'}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
