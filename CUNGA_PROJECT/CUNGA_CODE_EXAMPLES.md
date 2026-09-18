# 💻 Cunga - Code Examples & Implementation

## Complete code examples with Cunga branding

---

## 🎨 Theme Configuration (TailwindCSS)

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cunga Brand Colors
        cunga: {
          primary: {
            50: '#EEF2FF',
            100: '#E0E7FF',
            200: '#C7D2FE',
            300: '#A5B4FC',
            400: '#818CF8',
            500: '#6366F1',  // Main brand color
            600: '#4F46E5',
            700: '#4338CA',
            800: '#3730A3',
            900: '#312E81',
          },
          secondary: {
            400: '#F472B6',
            500: '#EC4899',  // Accent color
            600: '#DB2777',
          },
        },
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'hero': 'clamp(2.5rem, 6vw, 5rem)',
        'display': 'clamp(2rem, 4vw, 3.5rem)',
      },
      backgroundImage: {
        'cunga-gradient': 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
        'cunga-hero': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
```

---

## 🏠 Landing Page - Hero Section

```tsx
// src/pages/Home.tsx
import { motion } from 'framer-motion';
import { ArrowRight, Play, Check, Users, TrendingUp, Shield } from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cunga-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-cunga-secondary-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        </div>
        
        <div className="container relative z-10 mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Announcement Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-8 border border-cunga-primary-200"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">
                🎉 Join 10,000+ businesses worldwide
              </span>
            </motion.div>
            
            {/* Hero Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display text-hero font-bold mb-6 leading-tight"
            >
              Grow Your Business with
              <span className="bg-cunga-gradient bg-clip-text text-transparent">
                {' '}Cunga
              </span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="font-body text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto"
            >
              The all-in-one platform for inventory management, online selling,
              and wholesale trading. Simple to start, powerful to scale.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button className="group relative px-8 py-4 bg-cunga-gradient text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cunga-primary-700 to-cunga-secondary-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              
              <button className="group px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-cunga-primary-300 flex items-center gap-2">
                <Play className="w-5 h-5 fill-current" />
                Watch Demo
              </button>
            </motion.div>
            
            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-600"
            >
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="font-medium">No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cunga-primary-500" />
                <span className="font-medium">10,000+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Bank-Level Security</span>
              </div>
            </motion.div>
          </div>
          
          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-20 relative max-w-6xl mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <img 
                src="/images/dashboard-preview.png" 
                alt="Cunga Dashboard Preview" 
                className="w-full h-auto"
              />
              
              {/* Floating Stats Card */}
              <div className="absolute top-10 -left-10 bg-white p-6 rounded-xl shadow-xl animate-float hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Today's Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">$12,450</p>
                    <p className="text-xs text-green-600">+18.2% from yesterday</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
```

---

## 🔐 Login Page

```tsx
// src/pages/Login.tsx
import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-cunga-primary-50 via-white to-cunga-secondary-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="w-16 h-16 bg-cunga-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl font-bold text-white">C</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Cunga
            </h1>
            <p className="text-gray-600 mt-1">Grow Your Business, Simply</p>
          </Link>
        </div>
        
        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
            Welcome back
          </h2>
          <p className="text-gray-600 mb-8">
            Sign in to your Cunga account
          </p>
          
          <form className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cunga-primary-500 focus:ring-4 focus:ring-cunga-primary-100 transition-all outline-none"
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-cunga-primary-500 focus:ring-4 focus:ring-cunga-primary-100 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-cunga-primary-500 border-gray-300 rounded focus:ring-cunga-primary-500" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-semibold text-cunga-primary-600 hover:text-cunga-primary-700">
                Forgot password?
              </Link>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-cunga-gradient text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Sign In
            </button>
          </form>
          
          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          
          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button className="py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
              <span className="font-semibold text-gray-700">Google</span>
            </button>
            <button className="py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              <img src="/microsoft-icon.svg" alt="Microsoft" className="w-5 h-5" />
              <span className="font-semibold text-gray-700">Microsoft</span>
            </button>
          </div>
          
          {/* Sign Up Link */}
          <p className="mt-8 text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-cunga-primary-600 hover:text-cunga-primary-700">
              Start free trial
            </Link>
          </p>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Protected by reCAPTCHA and subject to the</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Link to="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-gray-700">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 📊 Dashboard Component

```tsx
// src/components/Dashboard/StatCard.tsx
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  gradient: string;
}

export const StatCard = ({ title, value, change, icon, gradient }: StatCardProps) => {
  const isPositive = change >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 ${gradient} rounded-xl flex items-center justify-center shadow-md`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
          isPositive 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      
      <h3 className="text-sm font-semibold text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      
      <p className="text-xs text-gray-500 mt-2">
        {isPositive ? 'Increase' : 'Decrease'} from last month
      </p>
    </motion.div>
  );
};

// Usage
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard
    title="Total Revenue"
    value="$45,231"
    change={18.2}
    icon={<DollarSign className="w-7 h-7 text-white" />}
    gradient="bg-gradient-to-br from-green-400 to-green-600"
  />
  <StatCard
    title="Total Orders"
    value="1,248"
    change={12.5}
    icon={<ShoppingBag className="w-7 h-7 text-white" />}
    gradient="bg-cunga-gradient"
  />
  <StatCard
    title="Total Profit"
    value="$12,450"
    change={24.7}
    icon={<TrendingUp className="w-7 h-7 text-white" />}
    gradient="bg-gradient-to-br from-purple-400 to-purple-600"
  />
  <StatCard
    title="Active Users"
    value="324"
    change={8.3}
    icon={<Users className="w-7 h-7 text-white" />}
    gradient="bg-gradient-to-br from-pink-400 to-pink-600"
  />
</div>
```

---

## 🎨 Reusable Button Components

```tsx
// src/components/ui/Button.tsx
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading, 
    leftIcon, 
    rightIcon, 
    className,
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-cunga-gradient text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-cunga-primary-200',
      secondary: 'bg-gray-900 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-gray-300',
      outline: 'border-2 border-gray-200 text-gray-700 hover:border-cunga-primary-300 hover:bg-cunga-primary-50 focus:ring-cunga-primary-200',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-200',
      danger: 'bg-red-500 text-white shadow-lg hover:bg-red-600 hover:scale-105 focus:ring-red-200',
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };
    
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

---

## 🎉 That's it!

You now have complete code examples for the Cunga brand! All components follow:
- ✅ Cunga color palette
- ✅ Cunga typography
- ✅ Modern animations
- ✅ Responsive design
- ✅ Accessible markup

**Ready to build Cunga!** 🚀

