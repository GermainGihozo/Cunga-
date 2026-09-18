import { Link } from 'react-router-dom'
import { Heart, TrendingUp } from 'lucide-react'
import { BRAND_INFO } from '@constants/brand'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={BRAND_INFO.logo.temp}
                alt={BRAND_INFO.name}
                className="h-10 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
              <div className="hidden w-10 h-10 bg-gradient-primary rounded-xl items-center justify-center shadow-sm">
                <TrendingUp className="text-white" size={20} />
              </div>
            </div>
            <h3 className="text-2xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              {BRAND_INFO.name}
            </h3>
            <p className="text-base font-medium text-gray-700 mb-3">{BRAND_INFO.tagline}</p>
            <p className="text-gray-600 text-sm mb-4 max-w-sm">
              {BRAND_INFO.description} - The all-in-one platform for retail management,
              inventory tracking, and seamless e-commerce operations.
            </p>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <span>Made with</span>
              <Heart size={14} className="text-accent-500 fill-accent-500 animate-pulse" />
              <span>by the Cunga Team</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-bold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-primary-600 transition-colors font-medium hover:translate-x-1 inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/features"
                  className="text-gray-600 hover:text-primary-600 transition-colors font-medium hover:translate-x-1 inline-block"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-gray-600 hover:text-primary-600 transition-colors font-medium hover:translate-x-1 inline-block"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-primary-600 transition-colors font-medium hover:translate-x-1 inline-block">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display font-bold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/help" className="text-gray-600 hover:text-primary-600 transition-colors font-medium hover:translate-x-1 inline-block">
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-primary-600 transition-colors font-medium hover:translate-x-1 inline-block"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-gray-600 hover:text-primary-600 transition-colors font-medium hover:translate-x-1 inline-block">
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  to="/status"
                  className="text-gray-600 hover:text-primary-600 transition-colors font-medium hover:translate-x-1 inline-block"
                >
                  System Status
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-300">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 font-medium">
              © {currentYear} {BRAND_INFO.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link to="/privacy" className="hover:text-primary-600 transition-colors font-medium">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-primary-600 transition-colors font-medium">
                Terms of Service
              </Link>
              <Link to="/cookies" className="hover:text-primary-600 transition-colors font-medium">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
