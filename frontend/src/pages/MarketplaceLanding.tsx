import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, ShoppingBag, Store, ShoppingCart, Heart, Star,
  Shield, Package, TrendingUp, ArrowRight, Menu, X, Zap, Truck,
  Clock, Users, Check, Headphones,
} from 'lucide-react'
import { Button } from '@components/common'
import { BRAND_INFO } from '@constants/brand'
import { marketplaceService, MarketProduct, FeaturedData } from '@services/marketplaceService'
import { useSelector } from 'react-redux'
import { selectCartCount } from '@store/slices/cartSlice'
import { selectWishlistCount } from '@store/slices/wishlistSlice'
import type { RootState } from '@store'

const MarketplaceLanding = () => {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const cartCount     = useSelector((state: RootState) => selectCartCount(state))
  const wishlistCount = useSelector((state: RootState) => selectWishlistCount(state))

  const handleSearch = () => {
    const q = searchQuery.trim()
    if (q) navigate(`/products?q=${encodeURIComponent(q)}`)
    else   navigate('/products')
  }

  // ── API data ──────────────────────────────────────────
  const [featured, setFeatured] = useState<FeaturedData | null>(null)

  const loadFeatured = useCallback(async () => {
    try {
      const data = await marketplaceService.getFeatured()
      setFeatured(data)
    } catch { /* silently fall back to static data */ }
  }, [])

  useEffect(() => {
    loadFeatured()
  }, [loadFeatured])

  // ── Newsletter ────────────────────────────────────────
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterDone, setNewsletterDone]   = useState(false)

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return
    setNewsletterDone(true)
    // Store in localStorage as a lightweight persistence mechanism
    const subs: string[] = JSON.parse(localStorage.getItem('cunga_newsletter') || '[]')
    if (!subs.includes(newsletterEmail)) {
      subs.push(newsletterEmail)
      localStorage.setItem('cunga_newsletter', JSON.stringify(subs))
    }
  }
  const [timeLeft, setTimeLeft] = useState({ h: 23, m: 47, s: 12 })
  useEffect(() => {
    const end = Date.now() + (23 * 3600 + 47 * 60 + 12) * 1000
    const timer = setInterval(() => {
      const diff = Math.max(0, end - Date.now())
      setTimeLeft({
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const categories = [
    { name: 'Electronics', icon: '📱', link: '/category/electronics' },
    { name: 'Fashion & Clothing', icon: '👕', link: '/category/fashion' },
    { name: 'Home & Living', icon: '🏠', link: '/category/home' },
    { name: 'Beauty & Health', icon: '💄', link: '/category/beauty' },
    { name: 'Sports & Fitness', icon: '⚽', link: '/category/sports' },
    { name: 'Books & Media', icon: '📚', link: '/category/books' },
    { name: 'Automotive', icon: '🚗', link: '/category/automotive' },
    { name: 'Food & Groceries', icon: '🍕', link: '/category/food' },
  ]

  const STATIC_FEATURED = [
    { id: 1, name: 'iPhone 14 Pro Max', price: 850000, oldPrice: 950000,
      image: 'https://images.unsplash.com/photo-1678652632937-4b29d45ec934?w=400&h=400&fit=crop',
      badge: 'FEATURED', inStock: true },
    { id: 2, name: 'Nike Air Max Sneakers', price: 45000, oldPrice: 60000,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      badge: 'NEW', inStock: true },
    { id: 3, name: 'Office Desk & Chair Set', price: 125000, oldPrice: 180000,
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop',
      badge: 'HOT', inStock: true },
    { id: 4, name: 'Smart Watch Pro', price: 35000,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      inStock: true },
  ]

  // Map API products → the shape used by the Featured section
  const mapApi = (p: MarketProduct) => ({
    id:      p.id,
    name:    p.name,
    price:   p.price,
    oldPrice: p.old_price,
    image:   p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    badge:   p.is_featured ? 'FEATURED' : p.is_on_sale ? 'SALE' : undefined,
    inStock: p.stock > 0,
  })

  const featuredProducts = featured?.featured?.length
    ? featured.featured.map(mapApi)
    : STATIC_FEATURED

  const bestSellerProducts = featured?.bestSellers?.length
    ? featured.bestSellers.map((p, i) => ({ ...mapApi(p), rank: i + 1, rating: p.avg_rating ?? 4.5, sold: p.sold }))
    : null

  const newArrivalProducts = featured?.newArrivals?.length
    ? featured.newArrivals.map(p => ({ ...mapApi(p), rating: p.avg_rating ?? 4.5, reviews: p.review_count ?? 0 }))
    : null

  const formatPrice = (price: number) => {
    return `RWF ${price.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <img
                src="/assets/logos/logo-temp.svg"
                alt={BRAND_INFO.name}
                className="w-12 h-12"
              />
              <span className="text-2xl font-bold text-blue-700">
                {BRAND_INFO.name}
              </span>
            </Link>

            {/* Search Bar - desktop */}
            <div className="flex-1 max-w-2xl hidden lg:block">
              <div className="flex items-center gap-2">
                <select className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
                  <option>All Categories</option>
                  <option>Electronics</option>
                  <option>Fashion</option>
                  <option>Home & Living</option>
                  <option>Beauty</option>
                  <option>Sports</option>
                </select>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search for products, brands, categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <Link to="/products">
                  <Button
                    onClick={handleSearch}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl whitespace-nowrap">
                    Search
                  </Button>
                </Link>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">Login</span>
                <span className="text-xs text-gray-500">WELCOME BACK</span>
              </Link>
              <Link to="/register">
                <Button className="hidden md:flex flex-col items-center bg-gradient-primary hover:opacity-90 text-white px-4 py-1.5 rounded-lg transition-all">
                  <span className="font-semibold">Register</span>
                  <span className="text-xs">JOIN FREE</span>
                </Button>
              </Link>
              <Link to="/cart" className="relative p-2 touch-manipulation">
                <ShoppingCart size={28} className="text-gray-700" />
                <span className={`absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold transition-all ${cartCount === 0 ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              </Link>
              <Link to="/wishlist" className="relative p-2 touch-manipulation hidden sm:block">
                <Heart size={24} className={`transition-colors ${wishlistCount > 0 ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

            {/* Mobile search bar */}
            <div className="lg:hidden mt-3 pb-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm whitespace-nowrap">
                  Search
                </Button>
              </div>
            </div>
        </div>

        {/* Navigation */}
        <div className="border-t border-gray-200 hidden lg:block">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-8 py-3">
              <Link to="/products" className="flex items-center gap-2 font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                <ShoppingBag size={18} />
                Shop
              </Link>
              <Link to="/seller/register" className="font-medium text-gray-700 hover:text-primary-600 transition-colors">
                Sell on Cunga
              </Link>
              <Link to="/products?sort=trending" className="font-medium text-gray-700 hover:text-accent-600 transition-colors flex items-center gap-1">
                <TrendingUp size={16} />
                Hot Deals
              </Link>
              <Link to="/pricing" className="font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Pricing
              </Link>
              <Link to="/order" className="font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Track Order
              </Link>
              <Link to="/orders" className="font-medium text-gray-700 hover:text-blue-600 transition-colors">
                My Orders
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-4 py-6 space-y-1">
              <Link 
                to="/products" 
                className="block py-3 px-4 font-semibold text-gray-900 hover:bg-primary-50 rounded-lg transition-colors active:bg-primary-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                🛍️ Shop All Products
              </Link>
              <Link 
                to="/products?sort=trending" 
                className="block py-3 px-4 text-gray-700 hover:bg-primary-50 rounded-lg transition-colors active:bg-primary-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                🔥 Hot Deals
              </Link>
              <Link 
                to="/products" 
                className="block py-3 px-4 text-gray-700 hover:bg-primary-50 rounded-lg transition-colors active:bg-primary-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                📂 All Categories
              </Link>
              <Link 
                to="/pricing" 
                className="block py-3 px-4 text-gray-700 hover:bg-primary-50 rounded-lg transition-colors active:bg-primary-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                � Pricing Plans
              </Link>
              <Link 
                to="/order" 
                className="block py-3 px-4 text-gray-700 hover:bg-primary-50 rounded-lg transition-colors active:bg-primary-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                📦 Track My Order
              </Link>
              <Link 
                to="/orders" 
                className="block py-3 px-4 text-gray-700 hover:bg-primary-50 rounded-lg transition-colors active:bg-primary-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                🛒 My Orders
              </Link>
              <Link 
                to="/seller/register" 
                className="block py-3 px-4 text-gray-700 hover:bg-primary-50 rounded-lg transition-colors active:bg-primary-100"
                onClick={() => setMobileMenuOpen(false)}
              >
              🏪 Become a Seller
              </Link>
              <div className="border-t border-gray-200 my-4"></div>
              <Link 
                to="/login" 
                className="block py-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button variant="outline" className="w-full py-3 text-base active:scale-95 transition-transform">
                  Login
                </Button>
              </Link>
              <Link 
                to="/register" 
                className="block py-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="w-full bg-primary-600 py-3 text-base active:scale-95 transition-transform">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Announcement Bar ── */}
      <div className="bg-gray-900 text-white py-2 overflow-hidden relative">
        <div className="flex announcement-track whitespace-nowrap">
          {[
            '🚚 Free delivery on orders above RWF 50,000',
            '⚡ Flash Sale ends soon — up to 31% OFF',
            '🛡️ Buyer protection on every order',
            '📦 Same-day dispatch for orders before 2PM',
            '🎁 New arrivals added daily',
            '💳 Pay with MTN Mobile Money or Airtel',
            '🇷🇼 Serving all provinces of Rwanda',
          ].concat([
            '🚚 Free delivery on orders above RWF 50,000',
            '⚡ Flash Sale ends soon — up to 31% OFF',
            '🛡️ Buyer protection on every order',
            '📦 Same-day dispatch for orders before 2PM',
            '🎁 New arrivals added daily',
            '💳 Pay with MTN Mobile Money or Airtel',
            '🇷🇼 Serving all provinces of Rwanda',
          ]).map((msg, i) => (
            <span key={i} className="inline-flex items-center mx-8 text-sm font-medium text-gray-200">
              {msg}
            </span>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 py-16 px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                <Store size={16} />
                YOUR ONE-STOP MARKETPLACE
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Shop Smarter<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-600">
                  Save More
                </span>
              </h1>
              <p className="text-base sm:text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                Discover amazing deals on thousands of products.<br className="hidden sm:block" />
                <span className="text-white font-semibold">Fast delivery • Secure payments • Quality guaranteed</span>
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                <Link to="/products" className="w-full sm:w-auto">
                  <Button className="w-full bg-gradient-accent hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-accent-500/50 transition-all transform hover:scale-105">
                    <ShoppingBag size={20} className="mr-2" />
                    Start Shopping
                  </Button>
                </Link>
                <Link to="/seller/register" className="w-full sm:w-auto"><Button className="w-full bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg backdrop-blur-sm border-2 border-white/20 transition-all hover:border-white/40"><Store size={20} className="mr-2" />Start Selling
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 text-white/80 text-sm mb-8">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-success-400" />
                  <span>Buyer Protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-success-400" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2 hidden sm:flex">
                  <Zap size={18} className="text-success-400" />
                  <span>24/7 Support</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
                {[
                  { value: '50K+', label: 'Products', icon: <Package size={18} /> },
                  { value: '24/7', label: 'Support', icon: <Clock size={18} /> },
                  { value: '100K+', label: 'Customers', icon: <Users size={18} /> },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <div className="text-accent-400">{stat.icon}</div>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                    </div>
                    <p className="text-blue-200 text-xs sm:text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Featured Product */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-3xl p-6 shadow-2xl">
                <span className="inline-block px-3 py-1.5 bg-orange-100 text-orange-600 text-xs font-bold rounded-full mb-4">
                  FEATURED
                </span>
                <div className="bg-gray-100 rounded-2xl p-8 mb-4 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1678652632937-4b29d45ec934?w=500&h=500&fit=crop"
                    alt="iPhone 14 Pro Max"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">iPhone 14 Pro Max</h3>
                <p className="text-3xl font-bold text-blue-600 mb-4">RWF 850,000</p>
                <Link to="/product/1">
                  <Button className="w-full bg-gradient-accent hover:opacity-90 text-white py-3 rounded-xl font-semibold shadow-lg transition-all">
                    View product
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="py-12 px-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-accent-600" size={24} />
                <span className="inline-block px-3 py-1 bg-accent-100 text-accent-600 text-xs font-bold rounded-full">
                  TRENDING NOW
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Hot Deals This Week</h2>
              <p className="text-gray-600 mt-2">Limited time offers - grab them before they're gone!</p>
            </div>
            <Link to="/products?sort=trending" className="hidden md:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors">
              View All
              <ArrowRight size={20} />
            </Link>
          </div>

          {/* Infinite Auto-Sliding Carousel */}
          <div className="relative overflow-hidden">
            {/* Left / right fade edges */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-white to-transparent"></div>
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-white to-transparent"></div>

            {/* Scrolling track — duplicated so the loop is seamless */}
            <div className="flex gap-5 carousel-track">
              {[
                {
                  id: 1,
                  name: 'MacBook Pro M3',
                  price: 1250000,
                  oldPrice: 1450000,
                  image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
                  discount: '14%',
                  badge: '🔥 Hot',
                  timeLeft: '2 days left',
                },
                {
                  id: 2,
                  name: 'iPhone 14 Pro Max',
                  price: 850000,
                  oldPrice: 950000,
                  image: 'https://images.unsplash.com/photo-1678652632937-4b29d45ec934?w=400&h=400&fit=crop',
                  discount: '11%',
                  badge: '⚡ Flash Sale',
                  timeLeft: '5 hours left',
                },
                {
                  id: 3,
                  name: 'Sony WH-1000XM5',
                  price: 95000,
                  oldPrice: 120000,
                  image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop',
                  discount: '21%',
                  badge: '💥 Best Deal',
                  timeLeft: '1 day left',
                },
                {
                  id: 4,
                  name: 'Samsung 4K Smart TV',
                  price: 325000,
                  oldPrice: 400000,
                  image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
                  discount: '19%',
                  badge: '🎯 Limited',
                  timeLeft: '3 days left',
                },
                {
                  id: 5,
                  name: 'Canon EOS R6',
                  price: 780000,
                  oldPrice: 920000,
                  image: 'https://images.unsplash.com/photo-1606980702228-6eeb8cb13861?w=400&h=400&fit=crop',
                  discount: '15%',
                  badge: '📸 Popular',
                  timeLeft: '4 days left',
                },
                {
                  id: 6,
                  name: 'Gaming Chair Pro',
                  price: 125000,
                  oldPrice: 180000,
                  image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&h=400&fit=crop',
                  discount: '31%',
                  badge: '🎮 Top Rated',
                  timeLeft: '6 hours left',
                },
              ]
              // Duplicate the array for seamless looping
                .concat([
                  {
                    id: 1,
                    name: 'MacBook Pro M3',
                    price: 1250000,
                    oldPrice: 1450000,
                    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
                    discount: '14%',
                    badge: '🔥 Hot',
                    timeLeft: '2 days left',
                  },
                  {
                    id: 2,
                    name: 'iPhone 14 Pro Max',
                    price: 850000,
                    oldPrice: 950000,
                    image: 'https://images.unsplash.com/photo-1678652632937-4b29d45ec934?w=400&h=400&fit=crop',
                    discount: '11%',
                    badge: '⚡ Flash Sale',
                    timeLeft: '5 hours left',
                  },
                  {
                    id: 3,
                    name: 'Sony WH-1000XM5',
                    price: 95000,
                    oldPrice: 120000,
                    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop',
                    discount: '21%',
                    badge: '💥 Best Deal',
                    timeLeft: '1 day left',
                  },
                  {
                    id: 4,
                    name: 'Samsung 4K Smart TV',
                    price: 325000,
                    oldPrice: 400000,
                    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
                    discount: '19%',
                    badge: '🎯 Limited',
                    timeLeft: '3 days left',
                  },
                  {
                    id: 5,
                    name: 'Canon EOS R6',
                    price: 780000,
                    oldPrice: 920000,
                    image: 'https://images.unsplash.com/photo-1606980702228-6eeb8cb13861?w=400&h=400&fit=crop',
                    discount: '15%',
                    badge: '📸 Popular',
                    timeLeft: '4 days left',
                  },
                  {
                    id: 6,
                    name: 'Gaming Chair Pro',
                    price: 125000,
                    oldPrice: 180000,
                    image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&h=400&fit=crop',
                    discount: '31%',
                    badge: '🎮 Top Rated',
                    timeLeft: '6 hours left',
                  },
                ])
                .map((product, idx) => (
                  <Link
                    key={`${product.id}-${idx}`}
                    to={`/product/${product.id}`}
                    className="flex-shrink-0 w-64 md:w-72 group"
                  >
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-accent-400 transition-all hover-lift shadow-md hover:shadow-2xl">
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden bg-gray-100 p-4">
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-xl font-bold text-sm shadow-lg z-10">
                          -{product.discount} OFF
                        </div>
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl font-bold text-xs shadow-lg z-10">
                          {product.badge}
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 z-10">
                          <Clock size={14} />
                          {product.timeLeft}
                        </div>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      {/* Info */}
                      <div className="p-4 bg-white">
                        <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-2xl font-bold text-primary-600">
                            {formatPrice(product.price)}
                          </span>
                          {product.oldPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.oldPrice)}
                          </span>
                          )}
                        </div>
                        <Button className="w-full bg-gradient-accent hover:opacity-90 text-white py-2.5 rounded-xl font-semibold transition-all">
                          Grab Deal Now
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          {/* Mobile View All Link */}
          <Link to="/products?sort=trending" className="md:hidden flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mt-6">
            View All Trending Products
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-2">
                CATEGORIES
              </span>
              <h2 className="text-3xl font-bold text-gray-900">BROWSE CATALOG</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="flex items-center gap-3 p-4 md:p-5 bg-white hover:bg-primary-50 active:bg-primary-100 border border-gray-200 hover:border-primary-300 rounded-xl transition-all group hover-lift active:scale-95 touch-manipulation"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-primary rounded-xl flex items-center justify-center text-2xl md:text-3xl group-hover:scale-110 transition-transform shadow-md flex-shrink-0">
                  {category.icon}
                </div>
                <span className="text-sm md:text-base font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full mb-2">
              DEALS
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="group">
                <div className="bg-white rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-primary-400 transition-all hover-lift shadow-md hover:shadow-2xl">
                  {/* Image */}
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-square p-6 overflow-hidden">
                    {/* Wishlist Button */}
                    <button className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-20">
                      <Heart size={18} className="text-gray-700 hover:text-red-500 hover:fill-red-500 transition-colors" />
                    </button>
                    
                    {product.badge && (
                      <span className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-accent text-white text-xs font-bold rounded-full shadow-lg z-10 animate-scale-in">
                        {product.badge}
                      </span>
                    )}
                    
                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                      <span className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-semibold text-sm shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        Quick View
                      </span>
                    </div>
                    
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    {/* Category Badge */}
                    <span className="inline-block px-2 py-1 bg-primary-50 text-primary-600 text-xs font-semibold rounded-md mb-2">
                      Electronics
                    </span>
                    
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors text-lg">
                      {product.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-4">
                      <p className="text-2xl font-bold text-primary-600">
                        {formatPrice(product.price)}
                      </p>
                      {product.oldPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                    </div>
                    
                    <Button className="w-full bg-gradient-accent hover:opacity-90 text-white rounded-xl py-2.5 font-semibold transition-all group-hover:shadow-lg transform group-hover:-translate-y-0.5">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Promotional Banners ── */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Banner 1 */}
            <div className="relative rounded-2xl overflow-hidden h-40 bg-gradient-to-r from-primary-600 to-primary-800 flex items-center px-6 group cursor-pointer hover:shadow-xl transition-all hover-lift">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }}
              />
              <div className="relative z-10">
                <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">Electronics</span>
                <h3 className="text-xl md:text-2xl font-bold text-white mt-1 leading-tight">Up to 30% Off<br/>Top Gadgets</h3>
                <Link to="/products?category=electronics">
                  <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors">
                    Shop Now <ArrowRight size={12} />
                  </span>
                </Link>
              </div>
              <img
                src="https://images.unsplash.com/photo-1678652632937-4b29d45ec934?w=200&h=160&fit=crop"
                alt="Electronics sale"
                className="absolute right-0 bottom-0 h-36 w-auto object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Banner 2 */}
            <div className="relative rounded-2xl overflow-hidden h-40 bg-gradient-to-r from-accent-500 to-accent-700 flex items-center px-6 group cursor-pointer hover:shadow-xl transition-all hover-lift">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }}
              />
              <div className="relative z-10">
                <span className="text-xs font-bold text-orange-100 uppercase tracking-widest">Fashion</span>
                <h3 className="text-xl md:text-2xl font-bold text-white mt-1 leading-tight">New Season<br/>Styles Arrived</h3>
                <Link to="/products?category=fashion">
                  <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors">
                    Explore <ArrowRight size={12} />
                  </span>
                </Link>
              </div>
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=160&fit=crop"
                alt="Fashion"
                className="absolute right-0 bottom-0 h-36 w-auto object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Banner 3 */}
            <div className="relative rounded-2xl overflow-hidden h-40 bg-gradient-to-r from-success-600 to-success-800 flex items-center px-6 group cursor-pointer hover:shadow-xl transition-all hover-lift">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }}
              />
              <div className="relative z-10">
                <span className="text-xs font-bold text-green-100 uppercase tracking-widest">Free Delivery</span>
                <h3 className="text-xl md:text-2xl font-bold text-white mt-1 leading-tight">Orders Above<br/>RWF 50,000</h3>
                <Link to="/products">
                  <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors">
                    Shop Free <ArrowRight size={12} />
                  </span>
                </Link>
              </div>
              <div className="absolute right-4 bottom-0 text-7xl opacity-30">🚚</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Flash Sale Section ── */}
      <section className="py-12 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg">
                <Zap size={16} className="fill-white" />
                FLASH SALE
              </div>
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <span className="text-gray-400">Ends in:</span>
                {[
                  { label: 'HRS', val: String(timeLeft.h).padStart(2, '0') },
                  { label: 'MIN', val: String(timeLeft.m).padStart(2, '0') },
                  { label: 'SEC', val: String(timeLeft.s).padStart(2, '0') },
                ].map((t, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="bg-gray-800 border border-gray-700 text-white font-bold text-lg px-3 py-1.5 rounded-lg min-w-[3rem] text-center tabular-nums">
                      {t.val}
                    </span>
                    <span className="text-gray-400 text-xs font-semibold">{t.label}</span>
                    {i < 2 && <span className="text-red-400 font-bold text-xl">:</span>}
                  </span>
                ))}
              </div>
            </div>
            <Link to="/products?sort=sale" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white font-semibold transition-colors whitespace-nowrap">
              View All Deals <ArrowRight size={16} />
            </Link>
          </div>

          {/* Flash sale products grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {[
              { id: 1, name: 'iPhone 14 Pro', price: 850000, oldPrice: 950000, pct: 11, image: 'https://images.unsplash.com/photo-1678652632937-4b29d45ec934?w=300&h=300&fit=crop' },
              { id: 2, name: 'Sony Headphones', price: 95000, oldPrice: 120000, pct: 21, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&h=300&fit=crop' },
              { id: 3, name: 'Nike Air Max', price: 45000, oldPrice: 60000, pct: 25, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop' },
              { id: 4, name: 'Samsung 4K TV', price: 325000, oldPrice: 400000, pct: 19, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop' },
              { id: 5, name: 'Gaming Chair', price: 125000, oldPrice: 180000, pct: 31, image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=300&h=300&fit=crop' },
              { id: 6, name: 'MacBook Pro M3', price: 1250000, oldPrice: 1450000, pct: 14, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop' },
            ].map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="group">
                <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-red-500 transition-all hover:shadow-lg hover:shadow-red-900/20">
                  <div className="relative aspect-square overflow-hidden bg-gray-700">
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg z-10">
                      -{p.pct}%
                    </span>
                    <img
                      src={p.image} alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Stock bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-900/80 px-2 py-1.5">
                      <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
                        <span>Sold: 67%</span>
                        <span className="text-red-400 font-semibold">Low stock!</span>
                      </div>
                      <div className="h-1.5 bg-gray-600 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '67%' }} />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-white text-xs font-semibold line-clamp-2 mb-2">{p.name}</p>
                    <p className="text-red-400 font-bold text-sm">{formatPrice(p.price)}</p>
                    {p.oldPrice && <p className="text-gray-500 text-xs line-through">{formatPrice(p.oldPrice)}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── New Arrivals ── */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-success-100 text-success-700 text-xs font-bold rounded-full mb-2">
                <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                JUST ARRIVED
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">New Arrivals</h2>
              <p className="text-gray-500 text-sm mt-1">Fresh products added this week</p>
            </div>
            <Link to="/products?sort=newest" className="hidden sm:flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors">
              See All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {(newArrivalProducts || [
              { id: 7, name: 'Dyson V15 Vacuum', price: 280000, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', category: 'Home', isNew: true, rating: 4.9, reviews: 12 },
              { id: 8, name: 'Adidas Ultra Boost', price: 55000, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop', category: 'Fashion', isNew: true, rating: 4.7, reviews: 34 },
              { id: 9, name: 'Dell XPS 15 Laptop', price: 920000, image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=400&fit=crop', category: 'Electronics', isNew: true, rating: 4.8, reviews: 8 },
              { id: 10, name: 'LG OLED 65" TV', price: 580000, image: 'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=400&h=400&fit=crop', category: 'Electronics', isNew: true, rating: 4.9, reviews: 5 },
            ]).slice(0, 4).map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="group">
                <div className="bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-success-300 transition-all hover-lift shadow-sm hover:shadow-xl">
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <span className="absolute top-3 left-3 bg-success-500 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      NEW
                    </span>
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 z-10">
                      <Heart size={15} className="text-gray-500 hover:text-red-500 transition-colors" />
                    </button>
                    <img
                      src={p.image} alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-primary-600 font-semibold bg-primary-50 px-2 py-0.5 rounded-md">{('category' in p ? (p as {category:string}).category : '')}</span>
                    <h3 className="font-bold text-gray-900 mt-2 mb-1.5 line-clamp-2 group-hover:text-primary-600 transition-colors text-sm md:text-base">
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < Math.floor(p.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">({p.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-primary-600">{formatPrice(p.price)}</p>
                      <button className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-colors active:scale-95 opacity-0 group-hover:opacity-100">
                        <ShoppingCart size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Link to="/products?sort=newest" className="sm:hidden flex items-center justify-center gap-1.5 mt-6 text-sm text-primary-600 font-semibold">
            See All New Arrivals <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Best Sellers ── */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full mb-2">
                <TrendingUp size={12} /> BEST SELLERS
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Top Selling Products</h2>
              <p className="text-gray-500 text-sm mt-1">Most loved by our customers</p>
            </div>
            <Link to="/products?sort=popular" className="hidden sm:flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {/* Tab filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-1">
            {['All', 'Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Sports'].map((cat, i) => (
              <button
                key={cat}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                  i === 0
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(bestSellerProducts || [
              { id: 2, rank: 1, name: 'Nike Air Max 270', price: 45000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', rating: 4.9, sold: 234, category: 'Fashion' },
              { id: 1, rank: 2, name: 'iPhone 14 Pro Max', price: 850000, image: 'https://images.unsplash.com/photo-1678652632937-4b29d45ec934?w=400&h=400&fit=crop', rating: 4.8, sold: 189, category: 'Electronics' },
              { id: 3, rank: 3, name: 'Sony WH-1000XM5', price: 95000, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop', rating: 4.8, sold: 156, category: 'Electronics' },
              { id: 6, rank: 4, name: 'Gaming Chair Pro', price: 125000, image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&h=400&fit=crop', rating: 4.7, sold: 112, category: 'Home & Living' },
            ]).slice(0, 4).map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="group">
                <div className="bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-yellow-300 transition-all hover-lift shadow-sm hover:shadow-xl">
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    {/* Rank badge */}
                    <div className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${
                      p.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                      p.rank === 2 ? 'bg-gray-300 text-gray-700' :
                      p.rank === 3 ? 'bg-amber-600 text-white' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      #{p.rank}
                    </div>
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Heart size={15} className="text-gray-500 hover:text-red-500 transition-colors" />
                    </button>
                    <img
                      src={p.image} alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-primary-600 font-semibold bg-primary-50 px-2 py-0.5 rounded-md">{('category' in p ? (p as {category:string}).category : '')}</span>
                    <h3 className="font-bold text-gray-900 mt-2 mb-1.5 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < Math.floor(p.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                      ))}
                      <span className="text-xs text-gray-500 ml-1 font-medium">{p.rating} · {p.sold} sold</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-primary-600">{formatPrice(p.price)}</p>
                      <Button className="bg-gradient-accent text-white px-4 py-2 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity active:scale-95">
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary-100 text-primary-600 text-sm font-bold rounded-full mb-4">
              WHY CUNGA?
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Trusted <span className="text-gradient">Marketplace</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied buyers and sellers who trust Cunga for safe, fast, and reliable transactions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Secure Payments */}
            <div className="group bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl active:shadow-xl transition-all hover-lift active:scale-95 border-2 border-transparent hover:border-primary-200 touch-manipulation">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Payments</h3>
              <p className="text-gray-600 leading-relaxed">
                Your transactions are protected with bank-level encryption and secure payment gateways. Shop with confidence.
              </p>
              <div className="mt-4 flex items-center gap-2 text-primary-600 font-semibold text-sm">
                <Check size={18} />
                <span>100% Safe & Encrypted</span>
              </div>
            </div>

            {/* Fast Delivery */}
            <div className="group bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl active:shadow-xl transition-all hover-lift active:scale-95 border-2 border-transparent hover:border-accent-200 touch-manipulation">
              <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Truck className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Delivery</h3>
              <p className="text-gray-600 leading-relaxed">
                Get your orders delivered quickly to any location in Rwanda. Track your package in real-time.
              </p>
              <div className="mt-4 flex items-center gap-2 text-accent-600 font-semibold text-sm">
                <Check size={18} />
                <span>Nationwide Coverage</span>
              </div>
            </div>

            {/* Quality Products */}
            <div className="group bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl active:shadow-xl transition-all hover-lift active:scale-95 border-2 border-transparent hover:border-success-200 touch-manipulation">
              <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Star className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Guarantee</h3>
              <p className="text-gray-600 leading-relaxed">
                All products are verified by our team. Return any item within 7 days if you're not satisfied.
              </p>
              <div className="mt-4 flex items-center gap-2 text-success-600 font-semibold text-sm">
                <Check size={18} />
                <span>7-Day Return Policy</span>
              </div>
            </div>

            {/* 24/7 Support */}
            <div className="group bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl active:shadow-xl transition-all hover-lift active:scale-95 border-2 border-transparent hover:border-purple-200 touch-manipulation">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Headphones className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">24/7 Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Our customer support team is always ready to help. Contact us anytime via phone, email, or chat.
              </p>
              <div className="mt-4 flex items-center gap-2 text-purple-600 font-semibold text-sm">
                <Check size={18} />
                <span>Always Here to Help</span>
              </div>
            </div>
          </div>

          {/* Trust Stats */}
          <div className="mt-12 md:mt-16 bg-white rounded-3xl shadow-xl p-6 md:p-12 border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">50K+</div>
                <div className="text-gray-600 font-medium">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-accent-600 mb-2">200K+</div>
                <div className="text-gray-600 font-medium">Products Sold</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-success-600 mb-2">98%</div>
                <div className="text-gray-600 font-medium">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-gray-600 font-medium">Customer Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-accent-500 to-accent-700 py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4 animate-fade-in">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl text-white/90 mb-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
            Browse thousands of products from trusted sellers across Rwanda
          </p>
          <Link to="/products">
            <Button className="bg-white text-accent-600 hover:bg-gray-100 px-8 py-4 text-lg font-bold rounded-xl shadow-2xl hover:scale-105 transition-all animate-scale-in" style={{animationDelay: '0.4s'}}>
              Start Shopping
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 animate-float">
            <Zap className="text-white" size={32} />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Updated with the Best Deals!
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get exclusive offers, new arrivals, and hot deals delivered to your inbox.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto" onSubmit={handleNewsletter}>
            {newsletterDone ? (
              <div className="flex-1 px-6 py-4 bg-success-500/20 backdrop-blur-sm border-2 border-success-400/40 rounded-xl text-white flex items-center justify-center gap-2 font-semibold">
                <Check size={18} className="text-green-300" /> Subscribed! Check your inbox.
              </div>
            ) : (
              <input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                className="flex-1 px-6 py-4 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-blue-200 focus:outline-none focus:ring-4 focus:ring-white/30 focus:border-white/40 transition-all"
                required
              />
            )}
            {!newsletterDone && (
            <Button type="submit" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
              Subscribe Now
            </Button>
            )}
          </form>
          
          <div className="flex items-center justify-center gap-8 mt-8 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <Check size={18} className="text-green-300" />
              <span>No spam, ever</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={18} className="text-green-300" />
              <span>Unsubscribe anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/assets/logos/logo-temp.svg" alt={BRAND_INFO.name} className="w-10 h-10" />
                <span className="text-2xl font-bold text-white">{BRAND_INFO.name}</span>
              </div>
              <p className="text-gray-400 mb-4">
                Rwanda's trusted marketplace for buying and selling anything.
              </p>
              <div className="flex gap-3 mt-4">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-xl">f</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-xl">𝕏</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-xl">in</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-xl">📷</span>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/products" className="hover:text-primary-400 transition-colors">Shop</Link></li>
                <li><Link to="/products" className="hover:text-primary-400 transition-colors">Categories</Link></li>
                <li><Link to="/products?sort=popular" className="hover:text-primary-400 transition-colors">Sellers</Link></li>
                <li><Link to="/products?sort=trending" className="hover:text-primary-400 transition-colors">Hot Deals</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Returns</Link></li>
                <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Shipping Info</Link></li>
                <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Sell on Cunga</h3>
              <ul className="space-y-2">
                <li><Link to="/seller/register" className="hover:text-primary-400 transition-colors">Start Selling</Link></li>
                <li><Link to="/pricing" className="hover:text-primary-400 transition-colors">Pricing Plans</Link></li>
                <li><Link to="/seller/dashboard" className="hover:text-primary-400 transition-colors">Seller Dashboard</Link></li>
                <li><Link to="/pricing" className="hover:text-primary-400 transition-colors">Seller Guide</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} {BRAND_INFO.name}. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link>
                <Link to="/cookies" className="hover:text-primary-400 transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MarketplaceLanding
