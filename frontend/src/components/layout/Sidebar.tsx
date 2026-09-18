import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Users,
  Store,
  TrendingUp,
  Settings,
  ChevronLeft,
  Globe,
  DollarSign,
} from 'lucide-react'
import { useAuth } from '@hooks/useAuth'
import { UserRole } from '@types'
import { cn } from '@utils/cn'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  label: string
  icon: React.ReactNode
  path: string
  badge?: string
  roles?: UserRole[]
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { user } = useAuth()

  const adminNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/admin/dashboard',
      roles: [UserRole.ADMIN],
    },
    {
      label: 'Users',
      icon: <Users size={20} />,
      path: '/admin/users',
      roles: [UserRole.ADMIN],
    },
    {
      label: 'Branches',
      icon: <Store size={20} />,
      path: '/admin/branches',
      roles: [UserRole.ADMIN],
    },
    {
      label: 'Analytics',
      icon: <TrendingUp size={20} />,
      path: '/admin/analytics',
      roles: [UserRole.ADMIN],
    },
    {
      label: 'Reports',
      icon: <FileText size={20} />,
      path: '/admin/reports',
      roles: [UserRole.ADMIN],
    },
    {
      label: 'Settings',
      icon: <Settings size={20} />,
      path: '/admin/settings',
      roles: [UserRole.ADMIN],
    },
  ]

  const branchNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/branch/dashboard',
      roles: [UserRole.BRANCH],
    },
    {
      label: 'Products',
      icon: <Package size={20} />,
      path: '/branch/products',
      roles: [UserRole.BRANCH],
    },
    {
      label: 'Sales',
      icon: <ShoppingCart size={20} />,
      path: '/branch/sales',
      roles: [UserRole.BRANCH],
    },
    {
      label: 'Deposits',
      icon: <DollarSign size={20} />,
      path: '/branch/deposits',
      roles: [UserRole.BRANCH],
    },
    {
      label: 'Reports',
      icon: <FileText size={20} />,
      path: '/branch/reports',
      roles: [UserRole.BRANCH],
    },
    {
      label: 'Online Requests',
      icon: <Globe size={20} />,
      path: '/branch/online-requests',
      roles: [UserRole.BRANCH],
      badge: '2',
    },
  ]

  const navItems = user?.role === UserRole.ADMIN ? adminNavItems : branchNavItems

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40 transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'w-64'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Store className="text-white" size={18} />
            </div>
            <span className="font-display font-bold text-gray-900">Cunga</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 lg:hidden transition-colors"
            aria-label="Close sidebar"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 h-[calc(100%-4rem)] overflow-y-auto">
          <div className="space-y-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'transition-colors',
                      isActive(item.path)
                        ? 'text-primary-600'
                        : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Branch Info (for branch users) */}
          {user?.role === UserRole.BRANCH && user?.branchName && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="px-3 py-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Current Branch</p>
                <p className="text-sm font-medium text-gray-900">{user.branchName}</p>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="px-3 py-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Need Help?</h4>
              <p className="text-xs text-gray-600 mb-3">Check our documentation</p>
              <button className="w-full px-3 py-1.5 bg-white text-primary-600 text-xs font-medium rounded-lg hover:shadow-md transition-shadow">
                View Docs
              </button>
            </div>
          </div>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
