import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams, useParams } from 'react-router-dom'
import {
  Search,
  Filter,
  Grid,
  List,
  X,
  Check,
  ChevronDown,
  Star,
  MapPin,
  Store,
  Heart,
  ArrowRight,
  SlidersHorizontal,
  TrendingUp,
  Package,
  ShoppingCart,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@components/common'
import { BRAND_INFO } from '@constants/brand'
import { marketplaceService, MarketProduct } from '@services/marketplaceService'
import { useAppDispatch } from '@hooks'
import { addItem } from '@store/slices/cartSlice'
import { toggleWishlist, selectIsWishlisted } from '@store/slices/wishlistSlice'
import { useSelector } from 'react-redux'
import type { RootState } from '@store'

interface Product {
  id: number
  name: string
  price: number
  oldPrice?: number
  image: string
  seller: string
  rating: number
  reviews: number
  location: string
  badge?: string
  inStock: boolean
  category: string
  condition: 'new' | 'used'
  featured: boolean
}

/** Map API product â†’ local Product shape */
const mapApiProduct = (p: MarketProduct): Product => ({
  id:       p.id,
  name:     p.name,
  price:    p.price,
  oldPrice: p.old_price,
  image:    p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
  seller:   p.shop_name,
  rating:   p.avg_rating ?? 4.5,
  reviews:  p.review_count ?? 0,
  location: p.district || p.province || 'Rwanda',
  badge:    p.is_featured ? 'Featured' : p.is_on_sale ? 'On Sale' : undefined,
  inStock:  p.stock > 0,
  category: p.category,
  condition: 'new',
  featured:  p.is_featured,
})

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { category: routeCategory } = useParams<{ category?: string }>()
  const dispatch = useAppDispatch()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  // Category comes from either URL path (/category/electronics) or query param (?category=)
  // Normalize slug â†’ display label (e.g. "fashion" â†’ "Fashion & Clothing")
  const CATEGORY_SLUG_MAP: Record<string, string> = {
    electronics:   'Electronics',
    fashion:       'Fashion & Clothing',
    'fashion-clothing': 'Fashion & Clothing',
    home:          'Home & Living',
    'home-living': 'Home & Living',
    beauty:        'Beauty & Health',
    'beauty-health': 'Beauty & Health',
    sports:        'Sports & Fitness',
    'sports-fitness': 'Sports & Fitness',
    food:          'Food & Groceries',
    automotive:    'Automotive',
    books:         'Books & Media',
  }
  const normalizeCategory = (slug: string) =>
    slug === 'all' ? 'all' : CATEGORY_SLUG_MAP[slug.toLowerCase()] || slug

  const [selectedCategory, setSelectedCategory] = useState(
    normalizeCategory(routeCategory || searchParams.get('category') || 'all')
  )
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000000 })
  const [selectedCondition, setSelectedCondition] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedRating, setSelectedRating] = useState(0)
  const [sortBy, setSortBy] = useState('relevance')

  // â”€â”€ API state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [apiProducts, setApiProducts] = useState<Product[]>([])
  const [apiLoading, setApiLoading] = useState(false)
  const [apiTotal, setApiTotal]     = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [usingApi, setUsingApi]     = useState(false)

  const fetchProducts = useCallback(async () => {
    setApiLoading(true)
    try {
      const sortMap: Record<string, 'newest' | 'price_asc' | 'price_desc' | 'popular'> = {
        relevance:  'newest',
        price_low:  'price_asc',
        price_high: 'price_desc',
        popular:    'popular',
        newest:     'newest',
      }
      const result = await marketplaceService.listProducts({
        search:    searchQuery || undefined,
        category:  selectedCategory !== 'all' ? selectedCategory : undefined,
        min_price: priceRange.min > 0 ? priceRange.min : undefined,
        max_price: priceRange.max < 2000000 ? priceRange.max : undefined,
        sort:      sortMap[sortBy] || 'newest',
        page:      currentPage,
        limit:     12,
      })
      setApiProducts(result.items.map(mapApiProduct))
      setApiTotal(result.pagination.total)
      setUsingApi(true)
    } catch {
      // API unavailable â€” keep static fallback data
      setUsingApi(false)
    } finally {
      setApiLoading(false)
    }
  }, [searchQuery, selectedCategory, priceRange, sortBy, currentPage])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Sync URL params â†’ state when navigating to this page
  useEffect(() => {
    const q   = searchParams.get('q')
    const cat = routeCategory || searchParams.get('category')
    if (q   && q   !== searchQuery)               setSearchQuery(q)
    if (cat && normalizeCategory(cat) !== selectedCategory) setSelectedCategory(normalizeCategory(cat))
  }, [searchParams, routeCategory]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddToCart = (product: Product) => {
    dispatch(addItem({
      id:          product.id,
      name:        product.name,
      price:       product.price,
      oldPrice:    product.oldPrice,
      image:       product.image,
      seller_name: product.seller,
      seller_id:   0,
      shop_slug:   '',
      category:    product.category,
      quantity:    1,
      stock:       product.inStock ? 99 : 0,
    }))
  }

  // Mock products data - In real app, fetch from API
  const allProducts: Product[] = [
    {
      id: 1,
      name: 'iPhone 14 Pro Max 256GB',
      price: 850000,
      oldPrice: 950000,
      image: 'https://images.unsplash.com/photo-1678652632937-4b29d45ec934?w=500&h=500&fit=crop',
      seller: 'TechHub Rwanda',
      rating: 4.8,
      reviews: 234,
      location: 'Kigali',
      badge: 'Featured',
      inStock: true,
      category: 'Electronics',
      condition: 'new',
      featured: true,
    },
    {
      id: 2,
      name: 'Nike Air Max 2024 Running Shoes',
      price: 45000,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
      seller: 'Sports World',
      rating: 4.9,
      reviews: 189,
      location: 'Kigali',
      badge: 'Hot Deal',
      inStock: true,
      category: 'Fashion',
      condition: 'new',
      featured: true,
    },
    {
      id: 3,
      name: 'MacBook Pro M3 16-inch 32GB RAM',
      price: 1250000,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
      seller: 'Apple Store RW',
      rating: 5.0,
      reviews: 456,
      location: 'Kigali',
      badge: 'Verified',
      inStock: true,
      category: 'Electronics',
      condition: 'new',
      featured: true,
    },
    {
      id: 4,
      name: 'Samsung 65" 4K Smart TV',
      price: 325000,
      oldPrice: 400000,
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&h=500&fit=crop',
      seller: 'Electronics Plus',
      rating: 4.7,
      reviews: 167,
      location: 'Kigali',
      inStock: true,
      category: 'Electronics',
      condition: 'new',
      featured: false,
    },
    {
      id: 5,
      name: 'Sony WH-1000XM5 Noise Cancelling',
      price: 95000,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&h=500&fit=crop',
      seller: 'AudioTech',
      rating: 4.9,
      reviews: 312,
      location: 'Kigali',
      badge: 'Trending',
      inStock: true,
      category: 'Electronics',
      condition: 'new',
      featured: true,
    },
    {
      id: 6,
      name: 'Canon EOS R6 Mirrorless Camera',
      price: 780000,
      image: 'https://images.unsplash.com/photo-1606980702228-6eeb8cb13861?w=500&h=500&fit=crop',
      seller: 'Photo Pro',
      rating: 4.8,
      reviews: 98,
      location: 'Kigali',
      inStock: true,
      category: 'Electronics',
      condition: 'new',
      featured: false,
    },
    {
      id: 7,
      name: 'Gaming Chair RGB with Lumbar Support',
      price: 125000,
      oldPrice: 150000,
      image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=500&h=500&fit=crop',
      seller: 'Gamers Paradise',
      rating: 4.6,
      reviews: 145,
      location: 'Kigali',
      badge: 'Sale',
      inStock: true,
      category: 'Home & Living',
      condition: 'new',
      featured: false,
    },
    {
      id: 8,
      name: 'Dyson V15 Detect Cordless Vacuum',
      price: 385000,
      image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&h=500&fit=crop',
      seller: 'Home Essentials',
      rating: 4.9,
      reviews: 76,
      location: 'Kigali',
      inStock: false,
      category: 'Home & Living',
      condition: 'new',
      featured: false,
    },
    {
      id: 9,
      name: 'Dell XPS 13 Laptop i7 16GB',
      price: 650000,
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=500&fit=crop',
      seller: 'Computer World',
      rating: 4.7,
      reviews: 203,
      location: 'Kigali',
      inStock: true,
      category: 'Electronics',
      condition: 'new',
      featured: false,
    },
    {
      id: 10,
      name: 'Adidas Ultraboost Running Shoes',
      price: 52000,
      image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&h=500&fit=crop',
      seller: 'Sports World',
      rating: 4.8,
      reviews: 167,
      location: 'Kigali',
      inStock: true,
      category: 'Fashion',
      condition: 'new',
      featured: false,
    },
    {
      id: 11,
      name: 'LG 43" Smart TV Full HD',
      price: 185000,
      oldPrice: 220000,
      image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&h=500&fit=crop',
      seller: 'Electronics Plus',
      rating: 4.5,
      reviews: 89,
      location: 'Kigali',
      inStock: true,
      category: 'Electronics',
      condition: 'used',
      featured: false,
    },
    {
      id: 12,
      name: 'Office Desk Ergonomic Standing',
      price: 95000,
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&h=500&fit=crop',
      seller: 'Office Pro',
      rating: 4.6,
      reviews: 54,
      location: 'Kigali',
      inStock: true,
      category: 'Home & Living',
      condition: 'new',
      featured: false,
    },
  ]

  const categories = [
    { id: 'all', name: 'All Categories', count: usingApi ? apiTotal : allProducts.length },
    { id: 'electronics', name: 'Electronics', count: allProducts.filter(p => p.category === 'Electronics').length },
    { id: 'fashion', name: 'Fashion', count: allProducts.filter(p => p.category === 'Fashion').length },
    { id: 'home-living', name: 'Home & Living', count: allProducts.filter(p => p.category === 'Home & Living').length },
  ]

  const locations = ['Kigali', 'Gisenyi', 'Butare', 'Ruhengeri', 'Kibungo']

  // Use real API data when available, otherwise fall back to static + client-side filtering
  const displayProducts: Product[] = usingApi
    ? apiProducts
    : allProducts.filter((product) => {
        if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
        if (selectedCategory !== 'all' && product.category.toLowerCase().replace(' & ', '-') !== selectedCategory) return false
        if (product.price < priceRange.min || product.price > priceRange.max) return false
        if (selectedCondition.length > 0 && !selectedCondition.includes(product.condition)) return false
        if (selectedLocations.length > 0 && !selectedLocations.includes(product.location)) return false
        if (selectedRating > 0 && product.rating < selectedRating) return false
        return true
      })

  // Client-side sort (only applied on static fallback; API handles sorting)
  const sortedProducts = usingApi
    ? displayProducts
    : [...displayProducts].sort((a, b) => {
        switch (sortBy) {
          case 'price-low':  return a.price - b.price
          case 'price-high': return b.price - a.price
          case 'rating':     return b.rating - a.rating
          case 'newest':     return b.id - a.id
          case 'popular':    return b.reviews - a.reviews
          default:           return b.featured ? 1 : -1
        }
      })

  // filteredProducts alias for backward-compat with rest of file
  const filteredProducts = displayProducts

  const formatPrice = (price: number) => {
    return `RWF ${price.toLocaleString()}`
  }

  const handleClearFilters = () => {
    setSelectedCategory('all')
    setPriceRange({ min: 0, max: 2000000 })
    setSelectedCondition([])
    setSelectedLocations([])
    setSelectedRating(0)
    setSearchQuery('')
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/assets/logos/logo-temp.svg"
                alt={BRAND_INFO.name}
                className="w-10 h-10"
              />
              <span className="text-2xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
                {BRAND_INFO.name}
              </span>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="btn-primary" size="sm">
                  <Store size={16} className="mr-2" />
                  Sell
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Products</span>
          {selectedCategory !== 'all' && (
            <>
              <span>/</span>
              <span className="text-gray-900 font-medium capitalize">{selectedCategory.replace('-', ' & ')}</span>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-72 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal size={20} />
                  Filters
                </h2>
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === cat.id}
                          onChange={() => setSelectedCategory(cat.id)}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-gray-700 group-hover:text-gray-900">{cat.name}</span>
                      </div>
                      <span className="text-sm text-gray-400">({cat.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="my-6 border-gray-200" />

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Min: {formatPrice(priceRange.min)}</label>
                    <input
                      type="range"
                      min="0"
                      max="2000000"
                      step="10000"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Max: {formatPrice(priceRange.max)}</label>
                    <input
                      type="range"
                      min="0"
                      max="2000000"
                      step="10000"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>
                </div>
              </div>

              <hr className="my-6 border-gray-200" />

              {/* Condition */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Condition</h3>
                <div className="space-y-2">
                  {['new', 'used'].map((condition) => (
                    <label key={condition} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCondition.includes(condition)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCondition([...selectedCondition, condition])
                          } else {
                            setSelectedCondition(selectedCondition.filter((c) => c !== condition))
                          }
                        }}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                      />
                      <span className="text-gray-700 group-hover:text-gray-900 capitalize">{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="my-6 border-gray-200" />

              {/* Location */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {locations.map((location) => (
                    <label key={location} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(location)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLocations([...selectedLocations, location])
                          } else {
                            setSelectedLocations(selectedLocations.filter((l) => l !== location))
                          }
                        }}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                      />
                      <span className="text-gray-700 group-hover:text-gray-900">{location}</span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="my-6 border-gray-200" />

              {/* Rating */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Minimum Rating</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="rating"
                        checked={selectedRating === rating}
                        onChange={() => setSelectedRating(rating)}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < rating ? 'text-warning-500 fill-current' : 'text-gray-300'}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">& Up</span>
                      </div>
                    </label>
                  ))}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="rating"
                      checked={selectedRating === 0}
                      onChange={() => setSelectedRating(0)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700 group-hover:text-gray-900">All Ratings</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Filter size={18} />
                    Filters
                  </button>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">{sortedProducts.length}</span> products found
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Sort Dropdown */}
                  <div className="relative flex-1 sm:flex-none">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full sm:w-auto appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                    >
                      <option value="relevance">Most Relevant</option>
                      <option value="newest">Newest First</option>
                      <option value="popular">Most Popular</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>

                  {/* View Toggle */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400'}`}
                    >
                      <Grid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400'}`}
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory !== 'all' || selectedCondition.length > 0 || selectedLocations.length > 0 || selectedRating > 0 || searchQuery) && (
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                      Search: {searchQuery}
                      <button onClick={() => setSearchQuery('')} className="hover:bg-primary-200 rounded-full p-0.5">
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {selectedCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full capitalize">
                      {selectedCategory.replace('-', ' & ')}
                      <button onClick={() => setSelectedCategory('all')} className="hover:bg-primary-200 rounded-full p-0.5">
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {selectedCondition.map((condition) => (
                    <span key={condition} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full capitalize">
                      {condition}
                      <button
                        onClick={() => setSelectedCondition(selectedCondition.filter((c) => c !== condition))}
                        className="hover:bg-primary-200 rounded-full p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  {selectedLocations.map((location) => (
                    <span key={location} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                      {location}
                      <button
                        onClick={() => setSelectedLocations(selectedLocations.filter((l) => l !== location))}
                        className="hover:bg-primary-200 rounded-full p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  {selectedRating > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                      {selectedRating}â˜… & Up
                      <button onClick={() => setSelectedRating(0)} className="hover:bg-primary-200 rounded-full p-0.5">
                        <X size={14} />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* API loading state */}
            {apiLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-6 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-10 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Products Grid/List */}
            {!apiLoading && sortedProducts.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    formatPrice={formatPrice}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                ))}
              </div>
            ) : !apiLoading ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
                <Button onClick={handleClearFilters} variant="outline">Clear Filters</Button>
              </div>
            ) : null}

            {/* Pagination */}
            {!apiLoading && sortedProducts.length > 0 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button
                  variant="outline" size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(5, Math.ceil((usingApi ? apiTotal : sortedProducts.length) / 12)) }).map((_, i) => (
                  <Button
                    key={i + 1}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className={currentPage === i + 1 ? 'btn-primary' : ''}
                    variant={currentPage === i + 1 ? undefined : 'outline'}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline" size="sm"
                  disabled={currentPage >= Math.ceil((usingApi ? apiTotal : sortedProducts.length) / 12)}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

// Product Card Component
interface ProductCardProps {
  product: Product
  viewMode: 'grid' | 'list'
  formatPrice: (price: number) => string
  onAddToCart: () => void
}

const ProductCard = ({ product, viewMode, formatPrice, onAddToCart }: ProductCardProps) => {
  const dispatch    = useAppDispatch()
  const isWishlisted = useSelector((state: RootState) => selectIsWishlisted(product.id)(state))
  const [added, setAdded] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    onAddToCart()
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    dispatch(toggleWishlist({
      id:          product.id,
      name:        product.name,
      price:       product.price,
      oldPrice:    product.oldPrice,
      image:       product.image,
      seller_name: product.seller,
      shop_slug:   '',
      category:    product.category,
    }))
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all card-hover">
        <div className="flex flex-col sm:flex-row">
          <div className="relative sm:w-64 aspect-square overflow-hidden bg-gray-100 flex-shrink-0">
            <img src={product.image} alt={product.name}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
            {product.badge && (
              <span className="absolute top-3 left-3 px-3 py-1 bg-gradient-primary text-white text-xs font-bold rounded-full shadow-lg">
                {product.badge}
              </span>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="px-4 py-2 bg-white rounded-full text-sm font-bold">Out of Stock</span>
              </div>
            )}
          </div>
          <div className="flex-1 p-6">
            <Link to={`/product/${product.id}`}>
              <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-primary-600 transition-colors">
                {product.name}
              </h3>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.oldPrice)}</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5"><Store size={15} className="text-gray-400" />{product.seller}</span>
              <span className="flex items-center gap-1">
                <Star size={15} className="text-warning-500 fill-current" />
                <span className="font-medium text-gray-900">{product.rating}</span>
                <span className="text-gray-400">({product.reviews})</span>
              </span>
              <span className="flex items-center gap-1"><MapPin size={15} />{product.location}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to={`/product/${product.id}`} className="flex-1">
                <Button className="btn-primary w-full">
                  View Details <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <button
                onClick={handleAdd}
                disabled={!product.inStock}
                className={`p-3 rounded-xl border-2 transition-all active:scale-95 ${
                  added ? 'bg-success-50 border-success-400 text-success-600'
                        : 'border-gray-300 hover:bg-primary-50 hover:border-primary-400 hover:text-primary-600'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
                title={added ? 'Added!' : 'Add to Cart'}
              >
                {added ? <Check size={20} /> : <ShoppingCart size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid View
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all card-hover">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img src={product.image} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        {product.badge && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-gradient-primary text-white text-xs font-bold rounded-full shadow-lg">
            {product.badge}
          </span>
        )}
        {/* Quick-add on hover */}
        <button
          onClick={handleAdd}
          disabled={!product.inStock}
          className={`absolute bottom-3 right-3 w-10 h-10 rounded-full shadow-lg flex items-center justify-center
            opacity-0 group-hover:opacity-100 transition-all active:scale-90 disabled:opacity-0 ${
            added ? 'bg-success-500 text-white' : 'bg-white hover:bg-primary-600 hover:text-white text-gray-700'
          }`}
          title={added ? 'Added!' : 'Add to Cart'}
        >
          {added ? <Check size={16} /> : <ShoppingCart size={16} />}
        </button>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleWishlist} className={`p-2 bg-white rounded-full shadow-lg transition-colors ${isWishlisted ? "bg-red-50" : "hover:bg-red-50"}`}><Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"} /></button>
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-4 py-2 bg-white rounded-full text-sm font-bold">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.oldPrice)}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mb-3 text-sm text-gray-500">
          <Store size={13} className="text-gray-400" />
          <span className="truncate">{product.seller}</span>
        </div>
        <div className="flex items-center justify-between text-xs mb-4 text-gray-500">
          <span className="flex items-center gap-1">
            <Star size={13} className="text-warning-500 fill-current" />
            <span className="font-medium text-gray-800">{product.rating}</span>
            <span>({product.reviews})</span>
          </span>
          <span className="flex items-center gap-1"><MapPin size={13} />{product.location}</span>
        </div>
        <div className="flex gap-2">
          <Link to={`/product/${product.id}`} className="flex-1">
            <button className="w-full btn-primary py-2.5 text-sm font-semibold group/btn">
              View Details
              <ArrowRight size={14} className="ml-1.5 inline group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </Link>
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all active:scale-95 flex items-center gap-1 ${
              added ? 'bg-success-50 border-success-400 text-success-600'
                    : 'border-gray-200 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 text-gray-500'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {added ? <Check size={14} /> : <ShoppingCart size={14} />}
            <span className="hidden sm:inline">{added ? 'Added' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductListing
