import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, User, LogOut, Settings, Menu, X, TrendingUp } from 'lucide-react'
import { useAuth } from '@hooks/useAuth'
import { Badge } from '@components/common'
import { BRAND_INFO } from '@constants/brand'
import { cn } from '@utils/cn'

interface NavbarProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, showMenuButton = true }) => {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // Mock notifications count
  const notificationCount = 3

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm backdrop-blur-sm bg-white/95">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Menu */}
          <div className="flex items-center gap-4">
            {showMenuButton && (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-lg text-gray-600 hover:bg-gradient-to-br hover:from-primary-50 hover:to-accent-50 lg:hidden transition-all duration-200"
                aria-label="Toggle menu"
              >
                <Menu size={24} />
              </button>
            )}

            <Link to="/" className="flex items-center gap-3 group">
              {/* Cunga Logo */}
              <div className="relative">
                <img
                  src={BRAND_INFO.logo.temp}
                  alt={BRAND_INFO.name}
                  className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback if logo not found
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
                {/* Fallback gradient icon */}
                <div className="hidden w-10 h-10 bg-gradient-primary rounded-xl items-center justify-center group-hover:shadow-cunga transition-all duration-300">
                  <TrendingUp className="text-white" size={20} />
                </div>
              </div>
              
              {/* Brand name - hidden on mobile, shown on tablet+ */}
              <div className="hidden sm:flex flex-col">
                <span className="text-xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {BRAND_INFO.name}
                </span>
                <span className="text-[10px] font-medium text-gray-500 -mt-1 hidden lg:block">
                  {BRAND_INFO.tagline}
                </span>
              </div>
            </Link>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowUserMenu(false)
                }}
                className="relative p-2 rounded-lg text-gray-600 hover:bg-gradient-to-br hover:from-primary-50 hover:to-accent-50 transition-all duration-200"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-gradient-to-br from-accent-500 to-accent-600 text-white text-[10px] items-center justify-center font-semibold">
                      {notificationCount}
                    </span>
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-slide-down">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-accent-50">
                      <h3 className="font-display font-semibold text-gray-900">Notifications</h3>
                      <p className="text-xs text-gray-600 mt-0.5">{notificationCount} new updates</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {/* Mock notifications */}
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-gradient-primary rounded-full mt-2 animate-pulse" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 font-medium">New product request</p>
                            <p className="text-xs text-gray-500 mt-1">Branch A requested iPhone 15 Pro</p>
                            <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-gradient-success rounded-full mt-2" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 font-medium">Sale completed</p>
                            <p className="text-xs text-gray-500 mt-1">$1,299 - MacBook Air M2</p>
                            <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-gradient-warning rounded-full mt-2" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 font-medium">Low stock alert</p>
                            <p className="text-xs text-gray-500 mt-1">Only 3 units left - AirPods Pro</p>
                            <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100">
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                        View all notifications →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu)
                  setShowNotifications(false)
                }}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gradient-to-br hover:from-primary-50 hover:to-accent-50 transition-all duration-200"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-white">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-slide-down">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-primary-50 to-accent-50">
                      <p className="text-sm font-bold text-gray-900">{user?.username}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{user?.email || 'No email set'}</p>
                      <div className="mt-2 inline-flex">
                        <Badge variant="info" size="sm" className="capitalize bg-white/80 backdrop-blur-sm">
                          {user?.role}
                        </Badge>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all duration-200 font-medium"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User size={18} className="text-primary-500" />
                        My Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all duration-200 font-medium"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings size={18} className="text-primary-500" />
                        Settings
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          logout()
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-error-600 hover:bg-error-50 transition-all duration-200 w-full font-semibold"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
