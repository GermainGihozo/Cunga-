import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from '@hooks'
import { UserRole } from '@types'
import { DashboardLayout } from '@components/layout'
import { lazy, Suspense } from 'react'

// ── Auth pages ────────────────────────────────────────────
const Login    = lazy(() => import('@pages/auth/Login'))
const Register = lazy(() => import('@pages/auth/Register'))

// ── Admin pages ───────────────────────────────────────────
const AdminDashboard    = lazy(() => import('@pages/admin/Dashboard'))
const AdminUsers        = lazy(() => import('@pages/admin/Users'))
const AdminBranches     = lazy(() => import('@pages/admin/Branches'))
const AdminCustomers    = lazy(() => import('@pages/admin/Customers'))
const AdminAnalytics    = lazy(() => import('@pages/admin/Analytics'))
const AdminReports      = lazy(() => import('@pages/admin/Reports'))
const StyleGuide        = lazy(() => import('@pages/admin/StyleGuide'))
const MarketplaceAdminPage = lazy(() => import('@pages/admin/MarketplaceAdmin'))

// ── Branch pages ──────────────────────────────────────────
const BranchDashboard = lazy(() => import('@pages/branch/Dashboard'))
const Products        = lazy(() => import('@pages/branch/Products'))
const Sales           = lazy(() => import('@pages/branch/Sales'))
const Inventory       = lazy(() => import('@pages/branch/Inventory'))

// ── Public / Marketplace pages ────────────────────────────
const LandingPage        = lazy(() => import('@pages/LandingPage'))
const MarketplaceLanding = lazy(() => import('@pages/MarketplaceLanding'))
const ProductListing     = lazy(() => import('@pages/ProductListing'))
const ProductDetails     = lazy(() => import('@pages/ProductDetails'))
const Pricing            = lazy(() => import('@pages/Pricing'))
const Cart               = lazy(() => import('@pages/Cart'))
const OrderTracking      = lazy(() => import('@pages/OrderTracking'))
const SellerStorefront   = lazy(() => import('@pages/SellerStorefront'))

// ── Seller pages ──────────────────────────────────────────
const SellerLogin          = lazy(() => import('@pages/seller/SellerLogin'))
const SellerRegister       = lazy(() => import('@pages/seller/SellerRegister'))
const SellerOnboarding     = lazy(() => import('@pages/seller/SellerOnboarding'))
const SellerForgotPassword = lazy(() => import('@pages/seller/SellerForgotPassword'))
const SellerDashboard      = lazy(() => import('@pages/SellerDashboard'))
const NotFoundPage     = lazy(() => import('@pages/NotFound'))
const StaticPage       = lazy(() => import('@pages/StaticPage'))

// ─────────────────────────────────────────────────────────
// Spinners / Guards
// ─────────────────────────────────────────────────────────
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-600" />
      <p className="text-sm text-gray-400 font-medium">Loading…</p>
    </div>
  </div>
)

// ── SaaS / Admin guard ────────────────────────────────────
interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAppSelector(state => state.auth)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

// ── Seller auth guard ─────────────────────────────────────
// Reads from localStorage (seller JWT is independent of Redux store)
const SellerRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('seller_token')
  if (!token) return <Navigate to="/seller/login" replace />
  return <>{children}</>
}

// ── Seller "already logged in" redirect ───────────────────
// Prevents a logged-in seller from visiting /seller/login again
const SellerGuestRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('seller_token')
  if (token) return <Navigate to="/seller/dashboard" replace />
  return <>{children}</>
}

// ─────────────────────────────────────────────────────────
// App Routes
// ─────────────────────────────────────────────────────────
export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>

        {/* ── Marketplace / Public ── */}
        <Route path="/"                     element={<MarketplaceLanding />} />
        <Route path="/products"             element={<ProductListing />} />
        <Route path="/product/:id"          element={<ProductDetails />} />
        <Route path="/marketplace"          element={<ProductListing />} />
        <Route path="/category/:category"   element={<ProductListing />} />
        <Route path="/pricing"              element={<Pricing />} />
        <Route path="/cart"                 element={<Cart />} />
        <Route path="/order"                element={<OrderTracking />} />
        <Route path="/order/:ref"           element={<OrderTracking />} />
        <Route path="/shop/:slug"           element={<SellerStorefront />} />
        <Route path="/saas"                 element={<LandingPage />} />
        <Route path="/terms"                element={<StaticPage />} />
        <Route path="/privacy"              element={<StaticPage />} />
        <Route path="/cookies"              element={<StaticPage />} />
        <Route path="/contact"              element={<StaticPage />} />

        {/* ── SaaS Admin / Staff auth ── */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/seller/forgot-password" element={<SellerForgotPassword />} />

        {/* ── Seller auth (guest-only) ── */}
        <Route
          path="/seller/login"
          element={
            <SellerGuestRoute>
              <SellerLogin />
            </SellerGuestRoute>
          }
        />
        <Route
          path="/seller/register"
          element={
            <SellerGuestRoute>
              <SellerRegister />
            </SellerGuestRoute>
          }
        />

        {/* ── Seller protected ── */}
        <Route
          path="/seller/onboarding"
          element={
            <SellerRoute>
              <SellerOnboarding />
            </SellerRoute>
          }
        />
        <Route
          path="/seller/dashboard"
          element={
            <SellerRoute>
              <SellerDashboard />
            </SellerRoute>
          }
        />

        {/* ── Admin routes ── */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard"   element={<AdminDashboard />} />
          <Route path="users"       element={<AdminUsers />} />
          <Route path="branches"    element={<AdminBranches />} />
          <Route path="customers"   element={<AdminCustomers />} />
          <Route path="analytics"   element={<AdminAnalytics />} />
          <Route path="reports"     element={<AdminReports />} />
          <Route path="style-guide" element={<StyleGuide />} />
          <Route path="marketplace" element={<MarketplaceAdminPage />} />
        </Route>

        {/* ── Branch routes ── */}
        <Route
          path="/branch/*"
          element={
            <ProtectedRoute allowedRoles={[UserRole.BRANCH]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<BranchDashboard />} />
          <Route path="products"  element={<Products />} />
          <Route path="sales"     element={<Sales />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>

        {/* ── Fallback 404 ── */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Suspense>
  )
}
