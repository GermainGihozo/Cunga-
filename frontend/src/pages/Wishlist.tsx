import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, ArrowLeft, Trash2, Package } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@hooks'
import { selectWishlistItems, toggleWishlist } from '@store/slices/wishlistSlice'
import { addItem } from '@store/slices/cartSlice'
import { Button } from '@components/common'
import { BRAND_INFO } from '@constants/brand'

const fmt = (n: number) => `RWF ${Number(n).toLocaleString()}`

export default function Wishlist() {
  const dispatch = useAppDispatch()
  const items    = useAppSelector(selectWishlistItems)

  const handleAddToCart = (item: typeof items[0]) => {
    dispatch(addItem({
      id:          item.id,
      name:        item.name,
      price:       item.price,
      oldPrice:    item.oldPrice,
      image:       item.image,
      seller_name: item.seller_name,
      seller_id:   0,
      shop_slug:   item.shop_slug,
      category:    item.category,
      quantity:    1,
      stock:       99,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/logos/logo-temp.svg" alt={BRAND_INFO.name} className="w-8 h-8" />
            <span className="font-bold text-primary-700 hidden sm:block">{BRAND_INFO.name}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/products" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
              <ArrowLeft size={15} /> Continue Shopping
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <Heart size={22} className="text-red-500 fill-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-500 text-sm">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl py-20 text-center shadow-sm border border-gray-100">
            <Heart size={56} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-400 mb-6 text-sm">Save items you love to buy them later</p>
            <Link to="/products">
              <Button className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold">
                Discover Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                <Link to={`/product/${item.id}`} className="block relative">
                  <div className="aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <button
                    onClick={e => { e.preventDefault(); dispatch(toggleWishlist(item)) }}
                    className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-colors active:scale-90"
                    title="Remove from wishlist"
                  >
                    <Heart size={16} className="fill-red-500 text-red-500" />
                  </button>
                </Link>
                <div className="p-4">
                  <span className="text-xs text-primary-600 font-semibold bg-primary-50 px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                  <Link to={`/product/${item.id}`}>
                    <h3 className="font-bold text-gray-900 mt-2 mb-1 line-clamp-2 text-sm group-hover:text-primary-600 transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 mb-3">{item.seller_name}</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-lg font-bold text-primary-600">{fmt(item.price)}</span>
                    {item.oldPrice && (
                      <span className="text-xs text-gray-400 line-through">{fmt(item.oldPrice)}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <ShoppingCart size={15} /> Add to Cart
                    </Button>
                    <button
                      onClick={() => dispatch(toggleWishlist(item))}
                      className="p-2.5 bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 rounded-xl transition-colors active:scale-95"
                      title="Remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
