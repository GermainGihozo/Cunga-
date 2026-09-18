import { Link, useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Search, ShoppingBag, Store } from 'lucide-react'
import { BRAND_INFO } from '@constants/brand'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-10">
        <img src="/assets/logos/logo-temp.svg" alt={BRAND_INFO.name} className="w-10 h-10" />
        <span className="text-xl font-bold text-primary-700">{BRAND_INFO.name}</span>
      </Link>

      {/* 404 graphic */}
      <div className="relative mb-8">
        <div className="text-[10rem] font-black text-gray-100 leading-none select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Search size={64} className="text-primary-200" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
      <p className="text-gray-500 text-lg max-w-md mb-10">
        The page you're looking for doesn't exist or has been moved.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-primary-300 hover:bg-primary-50 transition-all active:scale-95"
        >
          <ArrowLeft size={18} /> Go Back
        </button>
        <Link to="/">
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-md transition-all active:scale-95">
            <Home size={18} /> Go Home
          </button>
        </Link>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
        {[
          { icon: <ShoppingBag size={20} />, label: 'Browse Products', to: '/products', color: 'text-primary-600 bg-primary-50 border-primary-200' },
          { icon: <Store size={20} />, label: 'Start Selling', to: '/seller/register', color: 'text-accent-600 bg-accent-50 border-accent-200' },
          { icon: <Search size={20} />, label: 'Marketplace', to: '/', color: 'text-success-600 bg-success-50 border-success-200' },
        ].map((link, i) => (
          <Link key={i} to={link.to}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 hover:shadow-md transition-all active:scale-95 ${link.color}`}>
              {link.icon}
              <span className="font-semibold text-sm">{link.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-xs text-gray-400">
        If you think this is a mistake, please{' '}
        <Link to="/contact" className="text-primary-600 hover:underline">contact us</Link>.
      </p>
    </div>
  )
}
