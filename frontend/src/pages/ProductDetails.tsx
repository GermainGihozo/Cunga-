import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Heart, Share2, MapPin, Store, Star, Shield,
  TrendingUp, Package, Truck, RotateCcw, MessageCircle,
  ChevronLeft, ChevronRight, Check, X, ThumbsUp, Flag,
  Phone, Mail, ExternalLink, Zap, Award, Clock,
} from 'lucide-react'
import { Button } from '@components/common'
import { BRAND_INFO } from '@constants/brand'
import { marketplaceService } from '@services/marketplaceService'
import { useAppDispatch } from '@hooks'
import { addItem } from '@store/slices/cartSlice'

interface Review {
  id: number
  user: string
  avatar?: string
  rating: number
  date: string
  comment: string
  verified: boolean
  helpful: number
  images?: string[]
}

interface Product {
  id: number
  name: string
  price: number
  oldPrice?: number
  images: string[]
  description: string
  category: string
  subcategory?: string
  seller: {
    id: number
    name: string
    logo?: string
    rating: number
    reviews: number
    location: string
    verified: boolean
    responseTime: string
    joinedDate: string
    totalProducts: number
  }
  rating: number
  totalReviews: number
  stock: number
  condition: 'new' | 'used'
  location: string
  views: number
  specifications?: { label: string; value: string }[]
  features?: string[]
  inStock: boolean
  featured: boolean
  badge?: string
}

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedTab, setSelectedTab] = useState<'description' | 'specs' | 'reviews'>('description')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  // ── API state ──────────────────────────────────────────
  const [apiLoading, setApiLoading] = useState(true)
  const [apiProduct, setApiProduct] = useState<Product | null>(null)
  const [apiReviews, setApiReviews] = useState<Review[]>([])
  const [apiRelated, setApiRelated] = useState<typeof similarProducts>([])

  useEffect(() => {
    if (!id) return
    setApiLoading(true)
    marketplaceService.getProduct(id)
      .then(({ product: p, reviews: r, related: rel }) => {
        // Map API product → local Product shape
        setApiProduct({
          id:          p.id,
          name:        p.name,
          price:       p.price,
          oldPrice:    p.old_price,
          images:      p.images?.length ? p.images : [
            'https://images.unsplash.com/photo-1678652632937-4b29d45ec934?w=600&h=600&fit=crop',
          ],
          description: p.description || '',
          category:    p.category,
          subcategory: p.subcategory,
          seller: {
            id:            p.seller_id,
            name:          p.shop_name,
            logo:          p.shop_logo ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(p.shop_name)}&background=3b82f6&color=fff&size=100`,
            rating:        p.avg_rating ?? 4.5,
            reviews:       p.review_count ?? 0,
            location:      p.district ? `${p.district}, Rwanda` : 'Rwanda',
            verified:      true,
            responseTime:  '< 2 hours',
            joinedDate:    'Jan 2024',
            totalProducts: 0,
          },
          rating:       p.avg_rating ?? 4.5,
          totalReviews: p.review_count ?? 0,
          stock:        p.stock,
          condition:    'new',
          location:     p.district ? `${p.district}, Rwanda` : 'Rwanda',
          views:        p.views ?? 0,
          inStock:      p.stock > 0,
          featured:     p.is_featured,
          badge:        p.is_featured ? 'Featured' : p.is_on_sale ? 'On Sale' : undefined,
        })
        setApiReviews(r.map((rv, i) => ({
          id:       i + 1,
          user:     rv.buyer_name || 'Buyer',
          rating:   rv.rating,
          date:     rv.created_at.slice(0, 10),
          comment:  rv.comment || '',
          verified: true,
          helpful:  0,
        })))
        setApiRelated(rel.map(rp => ({
          id:      rp.id,
          name:    rp.name,
          price:   rp.price,
          oldPrice: rp.old_price,
          image:   rp.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
          rating:  rp.avg_rating ?? 4.5,
          reviews: rp.review_count ?? 0,
        })))
      })
      .catch(() => { /* silently fall back to static data */ })
      .finally(() => setApiLoading(false))
  }, [id])

  // ── Cart handlers ──────────────────────────────────────
  const doAddToCart = (qty: number) => {
    const p = apiProduct || product
    dispatch(addItem({
      id:          p.id,
      name:        p.name,
      price:       p.price,
      oldPrice:    p.oldPrice,
      image:       p.images[0],
      seller_name: p.seller.name,
      seller_id:   p.seller.id,
      shop_slug:   '',
      category:    p.category,
      quantity:    qty,
      stock:       p.stock,
    }))
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  // Static fallback product data
  const product: Product = {
    id: Number(id) || 1,
    name: 'iPhone 14 Pro Max 256GB - Deep Purple',
    price: 850000,
    oldPrice: 950000,
    images: [
      'https://images.unsplash.com/photo-1678652632937-4b29d45ec934?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1678685888221-cda948a96c9e?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1678911820864-e5c67c7c3ffe?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1678685888857-9e1b8a50d0cd?w=600&h=600&fit=crop',
    ],
    description: `The iPhone 14 Pro Max is Apple's flagship smartphone featuring a stunning 6.7-inch Super Retina XDR display with ProMotion technology. Powered by the revolutionary A16 Bionic chip, this device delivers unmatched performance for all your needs.

Key Highlights:
• Dynamic Island - A new way to interact with iPhone
• 48MP Main camera with 2x Telephoto
• Cinematic mode now in 4K Dolby Vision up to 30 fps
• Action mode for incredibly smooth video
• All-day battery life
• Emergency SOS via satellite
• Crash Detection

This phone comes with all original accessories including USB-C to Lightning cable, documentation, and SIM ejector tool. The device is brand new, sealed in original packaging with full manufacturer warranty.

Perfect for professionals, content creators, and anyone who demands the best from their smartphone. Experience the pinnacle of mobile technology with the iPhone 14 Pro Max.`,
    category: 'Electronics',
    subcategory: 'Smartphones',
    seller: {
      id: 1,
      name: 'TechHub Rwanda',
      logo: 'https://ui-avatars.com/api/?name=TechHub+Rwanda&background=3b82f6&color=fff&size=100',
      rating: 4.8,
      reviews: 1234,
      location: 'Kigali',
      verified: true,
      responseTime: '< 1 hour',
      joinedDate: 'Jan 2022',
      totalProducts: 156,
    },
    rating: 4.8,
    totalReviews: 234,
    stock: 15,
    condition: 'new',
    location: 'Kigali, Rwanda',
    views: 3450,
    specifications: [
      { label: 'Brand', value: 'Apple' },
      { label: 'Model', value: 'iPhone 14 Pro Max' },
      { label: 'Storage', value: '256GB' },
      { label: 'RAM', value: '6GB' },
      { label: 'Display', value: '6.7" Super Retina XDR' },
      { label: 'Processor', value: 'A16 Bionic' },
      { label: 'Rear Camera', value: '48MP + 12MP + 12MP' },
      { label: 'Front Camera', value: '12MP TrueDepth' },
      { label: 'Battery', value: '4323 mAh' },
      { label: 'OS', value: 'iOS 16' },
      { label: 'Color', value: 'Deep Purple' },
      { label: 'Condition', value: 'Brand New' },
      { label: 'Warranty', value: '1 Year Manufacturer' },
    ],
    features: [
      'Dynamic Island for notifications and Live Activities',
      'Always-On display with ProMotion (1-120Hz)',
      'Ceramic Shield front, textured matte glass back',
      '5G capable for super-fast downloads',
      'Face ID for secure authentication',
      'Water and dust resistant (IP68)',
      'MagSafe and Qi wireless charging',
      'Emergency SOS via satellite',
      'Crash Detection',
      'Dolby Atmos spatial audio',
    ],
    inStock: true,
    featured: true,
    badge: 'Featured',
  }

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: 1,
      user: 'Adebayo Johnson',
      rating: 5,
      date: '2024-01-15',
      comment: 'Excellent product! The phone arrived in perfect condition, sealed and authentic. Seller was very responsive and shipping was fast. Highly recommend!',
      verified: true,
      helpful: 45,
      images: ['https://via.placeholder.com/200x200/6366F1/ffffff?text=Review+1'],
    },
    {
      id: 2,
      user: 'Chioma Okafor',
      rating: 5,
      date: '2024-01-10',
      comment: 'Best purchase ever! The camera quality is amazing and the battery life is impressive. TechHub Nigeria is a trustworthy seller.',
      verified: true,
      helpful: 32,
    },
    {
      id: 3,
      user: 'Mohammed Aliyu',
      rating: 4,
      date: '2024-01-05',
      comment: 'Good phone, works perfectly. Only issue was delivery took 3 days instead of 2, but overall satisfied with the purchase.',
      verified: true,
      helpful: 18,
    },
    {
      id: 4,
      user: 'Grace Okonkwo',
      rating: 5,
      date: '2023-12-28',
      comment: 'Absolutely love it! The Dynamic Island feature is so cool. Phone runs smoothly and fast. Worth every penny.',
      verified: false,
      helpful: 12,
    },
  ]

  // Mock similar products
  const similarProducts = [
    {
      id: 2,
      name: 'iPhone 13 Pro 128GB',
      price: 650000,
      image: 'https://images.unsplash.com/photo-1632633173522-c6cbd44b7a13?w=300&h=300&fit=crop',
      rating: 4.7,
      reviews: 189,
    },
    {
      id: 3,
      name: 'Samsung S23 Ultra 256GB',
      price: 780000,
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&h=300&fit=crop',
      rating: 4.8,
      reviews: 145,
    },
    {
      id: 4,
      name: 'iPhone 14 Pro 256GB',
      price: 750000,
      oldPrice: 850000,
      image: 'https://images.unsplash.com/photo-1678652632810-a1a88c0b1d34?w=300&h=300&fit=crop',
      rating: 4.9,
      reviews: 201,
    },
    {
      id: 5,
      name: 'iPhone 14 Plus 256GB',
      price: 700000,
      image: 'https://images.unsplash.com/photo-1678652632952-48d43e849e79?w=300&h=300&fit=crop',
      rating: 4.6,
      reviews: 98,
    },
  ]

  const formatPrice = (price: number) => {
    return `RWF ${price.toLocaleString()}`
  }

  const calculateSavings = () => {
    if (displayProduct.oldPrice) {
      return formatPrice(displayProduct.oldPrice - displayProduct.price)
    }
    return null
  }

  const calculateDiscount = () => {
    if (displayProduct.oldPrice) {
      const discount = ((displayProduct.oldPrice - displayProduct.price) / displayProduct.oldPrice) * 100
      return Math.round(discount)
    }
    return null
  }

  const handleAddToCart = () => { doAddToCart(quantity) }

  const handleBuyNow = () => {
    doAddToCart(quantity)
    navigate('/cart')
  }

  const handleContactSeller = () => {
    const p = apiProduct || product
    navigate(`/shop/${p.seller.id}`)
  }

  const handleShare = () => {
    if (navigator.share) {
      const p = apiProduct || product
      navigator.share({ title: p.name, text: `Check out this on ${BRAND_INFO.name}`, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {})
    }
  }

  // Use API data if available, otherwise static fallback
  const displayProduct  = apiProduct || product
  const displayReviews  = apiReviews.length  ? apiReviews  : reviews
  const displayRelated  = apiRelated.length   ? apiRelated  : similarProducts

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading skeleton */}
      {apiLoading && (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="aspect-square bg-gray-200 rounded-2xl" />
              <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-xl" />)}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-12 bg-gray-200 rounded w-1/2" />
              <div className="h-12 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      )}
      {/* Main content — hidden while loading */}
      <div className={apiLoading ? 'hidden' : ''}>
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
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-600">Products</Link>
          <span>/</span>
          <Link to={`/category/${displayProduct.category.toLowerCase()}`} className="hover:text-primary-600">
            {displayProduct.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{displayProduct.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {/* Badge */}
              {displayProduct.badge && (
                <div className="mb-4">
                  <span className="inline-flex px-4 py-2 bg-gradient-primary text-white text-sm font-bold rounded-full shadow-lg">
                    {displayProduct.badge}
                  </span>
                </div>
              )}

              {/* Main Image */}
              <div className="relative aspect-square mb-4 rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={displayProduct.images[selectedImage]}
                  alt={displayProduct.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Discount Badge */}
                {calculateDiscount() && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg">
                    -{calculateDiscount()}%
                  </div>
                )}

                {/* Navigation Arrows */}
                {displayProduct.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((selectedImage - 1 + displayProduct.images.length) % displayProduct.images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() => setSelectedImage((selectedImage + 1) % displayProduct.images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-3">
                {displayProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-primary-600 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={image} alt={`${displayProduct.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs: Description, Specs, Reviews */}
            <div className="bg-white rounded-2xl shadow-sm">
              {/* Tab Headers */}
              <div className="border-b border-gray-200">
                <div className="flex gap-0">
                  <button
                    onClick={() => setSelectedTab('description')}
                    className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                      selectedTab === 'description'
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setSelectedTab('specs')}
                    className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                      selectedTab === 'specs'
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Specifications
                  </button>
                  <button
                    onClick={() => setSelectedTab('reviews')}
                    className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                      selectedTab === 'reviews'
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Reviews ({displayProduct.totalReviews})
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {selectedTab === 'description' && (
                  <div className="space-y-6">
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {displayProduct.description}
                      </p>
                    </div>

                    {displayProduct.features && displayProduct.features.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Key Features</h3>
                        <ul className="space-y-3">
                          {displayProduct.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <Check size={20} className="text-success-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === 'specs' && displayProduct.specifications && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayProduct.specifications.map((spec, index) => (
                      <div key={index} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                        <span className="font-semibold text-gray-700">{spec.label}</span>
                        <span className="text-gray-900">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedTab === 'reviews' && (
                  <div className="space-y-6">
                    {/* Review Summary */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-gray-50 rounded-2xl">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-gray-900 mb-2">{displayProduct.rating}</div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={20}
                              className={i < Math.floor(displayProduct.rating) ? 'text-warning-500 fill-current' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">{displayProduct.totalReviews} reviews</p>
                      </div>

                      <div className="flex-1 w-full">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const count = displayReviews.filter(r => Math.round(r.rating) === stars).length
                          const percentage = displayReviews.length > 0
                            ? Math.round((count / displayReviews.length) * 100)
                            : 0
                          return (
                            <div key={stars} className="flex items-center gap-3 mb-2">
                              <span className="text-sm text-gray-600 w-8">{stars}★</span>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-warning-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-12">{percentage}%</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Individual Reviews */}
                    <div className="space-y-4">
                      {displayReviews.map((review) => (
                        <div key={review.id} className="border border-gray-200 rounded-2xl p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                                {review.user.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900">{review.user}</span>
                                  {review.verified && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-success-100 text-success-700 text-xs rounded-full">
                                      <Check size={12} />
                                      Verified Purchase
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        size={14}
                                        className={i < review.rating ? 'text-warning-500 fill-current' : 'text-gray-300'}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500">{review.date}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4">{review.comment}</p>

                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 mb-4">
                              {review.images.map((img, index) => (
                                <img
                                  key={index}
                                  src={img}
                                  alt={`Review ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm">
                            <button className="flex items-center gap-1 text-gray-600 hover:text-primary-600">
                              <ThumbsUp size={16} />
                              Helpful ({review.helpful})
                            </button>
                            <button className="flex items-center gap-1 text-gray-600 hover:text-red-600">
                              <Flag size={16} />
                              Report
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Similar Products */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {displayRelated.map((item) => (
                  <Link key={item.id} to={`/product/${item.id}`} className="group">
                    <div className="card-hover">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-primary-600">
                        {item.name}
                      </h4>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-gray-900">{formatPrice(item.price)}</span>
                        {item.oldPrice && (
                          <span className="text-xs text-gray-400 line-through">{formatPrice(item.oldPrice)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <Star size={12} className="text-warning-500 fill-current" />
                        <span className="text-xs text-gray-600">{item.rating} ({item.reviews})</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Card & Seller Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Purchase Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{displayProduct.name}</h1>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-gray-900">{formatPrice(displayProduct.price)}</span>
                  {displayProduct.oldPrice && (
                    <span className="text-xl text-gray-400 line-through">{formatPrice(displayProduct.oldPrice)}</span>
                  )}
                </div>
                {calculateSavings() && (
                  <p className="text-success-600 font-semibold">
                    Save {calculateSavings()} ({calculateDiscount()}% off)
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {displayProduct.inStock ? (
                  <div className="flex items-center gap-2 text-success-600">
                    <Check size={20} />
                    <span className="font-semibold">In Stock ({displayProduct.stock} available)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <X size={20} />
                    <span className="font-semibold">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(displayProduct.stock, Number(e.target.value))))}
                    className="w-20 text-center border border-gray-300 rounded-lg py-2 font-semibold"
                    min="1"
                    max={displayProduct.stock}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(displayProduct.stock, quantity + 1))}
                    disabled={quantity >= displayProduct.stock}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <Button
                  onClick={handleBuyNow}
                  disabled={!displayProduct.inStock}
                  className="btn-primary w-full py-3 text-lg font-bold shadow-cunga"
                  size="lg"
                >
                  <Zap size={20} className="mr-2" />
                  Buy Now
                </Button>
                <Button
                  onClick={handleAddToCart}
                  disabled={!displayProduct.inStock}
                  variant="outline"
                  className={`w-full py-3 text-lg font-semibold transition-all ${
                    addedToCart ? 'border-success-500 text-success-600 bg-success-50' : ''
                  }`}
                  size="lg"
                >
                  {addedToCart ? (
                    <><Check size={20} className="mr-2 text-success-600" /> Added to Cart!</>
                  ) : (
                    <><ShoppingCart size={20} className="mr-2" /> Add to Cart</>
                  )}
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    variant="outline"
                    className={`w-full ${isWishlisted ? 'border-red-300 bg-red-50' : ''}`}
                  >
                    <Heart size={18} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
                  </Button>
                  <Button onClick={handleShare} variant="outline" className="w-full">
                    <Share2 size={18} />
                  </Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="text-success-500" size={20} />
                  <span className="text-gray-700">Buyer Protection Guarantee</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="text-primary-500" size={20} />
                  <span className="text-gray-700">Free delivery on orders over ₦50,000</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RotateCcw className="text-warning-500" size={20} />
                  <span className="text-gray-700">7-day return policy</span>
                </div>
              </div>
            </div>

            {/* Seller Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Seller Information</h3>
              
              <div className="flex items-center gap-4 mb-4">
                {displayProduct.seller.logo ? (
                  <img src={displayProduct.seller.logo} alt={displayProduct.seller.name} className="w-16 h-16 rounded-full" />
                ) : (
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {displayProduct.seller.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">{displayProduct.seller.name}</h4>
                    {displayProduct.seller.verified && (
                      <Award size={16} className="text-primary-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={14} className="text-warning-500 fill-current" />
                    <span className="text-sm font-semibold text-gray-900">{displayProduct.seller.rating}</span>
                    <span className="text-sm text-gray-500">({displayProduct.seller.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Location</span>
                  <span className="font-semibold text-gray-900 flex items-center gap-1">
                    <MapPin size={14} />
                    {displayProduct.seller.location}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-semibold text-success-600 flex items-center gap-1">
                    <Clock size={14} />
                    {displayProduct.seller.responseTime}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold text-gray-900">{displayProduct.seller.joinedDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Products</span>
                  <span className="font-semibold text-gray-900">{displayProduct.seller.totalProducts}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link to={`/seller/${displayProduct.seller.id}`}>
                  <Button variant="outline" className="w-full" size="sm">
                    <Store size={16} className="mr-2" />
                    Visit Shop
                  </Button>
                </Link>
                <Button onClick={handleContactSeller} variant="outline" className="w-full" size="sm">
                  <MessageCircle size={16} className="mr-2" />
                  Contact Seller
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-100 rounded-2xl p-6">
              <h4 className="font-bold text-gray-900 mb-3">Product Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Condition</span>
                  <span className="font-semibold text-gray-900 capitalize">{displayProduct.condition}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="font-semibold text-gray-900">{displayProduct.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold text-gray-900">{displayProduct.views.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default ProductDetails
