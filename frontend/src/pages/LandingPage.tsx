import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Store,
  TrendingUp,
  Globe,
  ShoppingBag,
  BarChart3,
  Users,
  Package,
  Zap,
  Shield,
  Smartphone,
  ChevronRight,
  Check,
  ArrowRight,
  Star,
  Menu,
  X,
  Play,
  Sparkles,
} from 'lucide-react'
import { Button } from '@components/common'
import { BRAND_INFO } from '@constants/brand'

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: <Store size={28} />,
      title: 'Multi-Branch Management',
      description: 'Manage unlimited branches from a single, unified dashboard with real-time synchronization.',
      gradient: 'from-primary-500 to-primary-600',
    },
    {
      icon: <BarChart3 size={28} />,
      title: 'Advanced Analytics',
      description: 'Get deep insights with real-time analytics, sales trends, and profit tracking.',
      gradient: 'from-accent-500 to-accent-600',
    },
    {
      icon: <Package size={28} />,
      title: 'Inventory Control',
      description: 'Smart inventory management with low-stock alerts and automated reordering.',
      gradient: 'from-success-500 to-success-600',
    },
    {
      icon: <Users size={28} />,
      title: 'Customer Management',
      description: 'Build loyalty with customer profiles, purchase history, and rewards programs.',
      gradient: 'from-warning-500 to-warning-600',
    },
    {
      icon: <Globe size={28} />,
      title: 'E-Commerce Ready',
      description: 'Launch your online store instantly with built-in e-commerce capabilities.',
      gradient: 'from-primary-500 to-accent-500',
    },
    {
      icon: <ShoppingBag size={28} />,
      title: 'B2B Marketplace',
      description: 'Connect with suppliers and buyers in our integrated B2B marketplace.',
      gradient: 'from-success-500 to-primary-500',
    },
  ]

  const stats = [
    { value: '10K+', label: 'Active Businesses' },
    { value: '₦50M+', label: 'Processed Monthly' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '24/7', label: 'Support Available' },
  ]

  const testimonials = [
    {
      name: 'Adebayo Ogunleye',
      role: 'CEO, TechMart Lagos',
      image: '👨‍💼',
      content: 'Cunga transformed how we manage our 5 retail locations. Sales increased by 40% in the first quarter!',
      rating: 5,
    },
    {
      name: 'Chidinma Nwankwo',
      role: 'Owner, Fashion Hub',
      image: '👩‍💼',
      content: 'The inventory management alone saved us countless hours. The analytics are incredibly detailed and actionable.',
      rating: 5,
    },
    {
      name: 'Ibrahim Mohammed',
      role: 'Manager, SuperMart Chains',
      image: '👨‍💼',
      content: 'Best investment we made. Customer management features helped us build a loyal customer base quickly.',
      rating: 5,
    },
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      price: '₦15,000',
      period: '/month',
      description: 'Perfect for small businesses',
      features: [
        '1 Branch Location',
        'Up to 1,000 Products',
        'Basic Analytics',
        'Mobile App Access',
        'Email Support',
      ],
      popular: false,
    },
    {
      name: 'Professional',
      price: '₦35,000',
      period: '/month',
      description: 'For growing businesses',
      features: [
        '5 Branch Locations',
        'Unlimited Products',
        'Advanced Analytics',
        'Priority Support',
        'E-Commerce Integration',
        'Custom Reports',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      features: [
        'Unlimited Branches',
        'Unlimited Everything',
        'Dedicated Account Manager',
        '24/7 Phone Support',
        'Custom Integrations',
        'White-label Options',
      ],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src="/assets/logos/logo-temp.svg"
                alt={BRAND_INFO.name}
                className="w-10 h-10"
              />
              <div>
                <span className="text-2xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {BRAND_INFO.name}
                </span>
                <p className="text-xs text-gray-600 hidden sm:block">{BRAND_INFO.tagline}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Testimonials
              </a>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="btn-primary shadow-cunga">
                  Start Free Trial
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-xl">
            <div className="px-4 py-6 space-y-4">
              <a
                href="#features"
                className="block text-gray-600 hover:text-gray-900 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block text-gray-600 hover:text-gray-900 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="block text-gray-600 hover:text-gray-900 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </a>
              <Link to="/login" className="block">
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
              <Link to="/register" className="block">
                <Button className="w-full btn-primary">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 -z-10" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full mb-6">
                <Sparkles size={16} className="text-primary-600" />
                <span className="text-sm font-semibold text-primary-700">
                  #1 Shop Management Platform in Nigeria
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-gray-900 mb-6 leading-tight">
                Grow Your Business,{' '}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Simply.
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                The all-in-one SaaS platform for retail management, inventory tracking, and e-commerce.
                Join 10,000+ businesses transforming their operations.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                <Link to="/register">
                  <Button size="lg" className="btn-primary shadow-cunga group">
                    Start Free Trial
                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="group">
                    <Play size={18} className="mr-2" />
                    Watch Demo
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-success-600" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-success-600" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative animate-slide-in">
              <div className="relative">
                {/* Floating Card 1 */}
                <div className="absolute -top-6 -left-6 bg-white rounded-2xl shadow-2xl p-4 animate-float z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
                      <TrendingUp className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">₦2.4M</p>
                    </div>
                  </div>
                </div>

                {/* Main Dashboard Image Placeholder */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-700">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-32 bg-gray-700 rounded animate-pulse" />
                      <div className="h-8 w-24 bg-gray-700 rounded animate-pulse" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                          <div className="h-4 w-16 bg-gray-700 rounded mb-2 animate-pulse" />
                          <div className="h-8 w-24 bg-gray-700 rounded animate-pulse" />
                        </div>
                      ))}
                    </div>

                    {/* Chart */}
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 h-48 flex items-end gap-2">
                      {[40, 60, 45, 75, 55, 80, 65].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-primary rounded-t animate-pulse"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating Card 2 */}
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-2xl p-4 animate-float delay-1000 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
                      <Users className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Customers</p>
                      <p className="text-2xl font-bold text-gray-900">1,248</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-primary">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl lg:text-5xl font-display font-bold text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-primary-100 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to streamline your operations and grow your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group card-hover bg-gradient-to-br from-gray-50 to-white border border-gray-200 p-8 rounded-2xl"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-display font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600">
              Simple setup, powerful results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Sign Up',
                description: 'Create your free account in seconds. No credit card required.',
                icon: <Zap size={32} />,
              },
              {
                step: '2',
                title: 'Setup Your Store',
                description: 'Add your products, branches, and team members with our easy wizard.',
                icon: <Store size={32} />,
              },
              {
                step: '3',
                title: 'Start Selling',
                description: 'Go live immediately and start managing your business smarter.',
                icon: <Smartphone size={32} />,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-xl card-hover">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6">
                    <div className="text-white">{item.icon}</div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">{item.step}</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight size={32} className="text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">
              Loved by Business Owners
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied customers
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`transition-all duration-500 ${
                  index === activeTestimonial
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95 absolute inset-0'
                }`}
              >
                <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-3xl p-12 shadow-2xl">
                  <div className="flex justify-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={24} className="text-warning-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-2xl text-gray-900 font-medium mb-8 text-center leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-5xl">{testimonial.image}</div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{testimonial.name}</p>
                      <p className="text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Testimonial Indicators */}
            <div className="flex justify-center gap-3 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`h-3 rounded-full transition-all ${
                    index === activeTestimonial
                      ? 'w-12 bg-primary-600'
                      : 'w-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the perfect plan for your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-3xl p-8 ${
                  plan.popular
                    ? 'bg-gradient-primary shadow-2xl ring-4 ring-primary-200 scale-105'
                    : 'bg-white shadow-xl card-hover'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-accent-500 to-accent-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className={`mb-8 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  <h3 className="text-2xl font-display font-bold mb-2">{plan.name}</h3>
                  <p className={plan.popular ? 'text-primary-100' : 'text-gray-600'}>
                    {plan.description}
                  </p>
                </div>

                <div className={`mb-8 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  <span className="text-5xl font-display font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className={plan.popular ? 'text-primary-100' : 'text-gray-600'}>
                      {plan.period}
                    </span>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        plan.popular
                          ? 'bg-white/20'
                          : 'bg-success-100'
                      }`}>
                        <Check
                          size={16}
                          className={plan.popular ? 'text-white' : 'text-success-600'}
                        />
                      </div>
                      <span className={plan.popular ? 'text-white' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to="/register" className="block">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-white text-primary-600 hover:bg-primary-50'
                        : 'btn-primary'
                    }`}
                    size="lg"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gray-600 font-medium mb-6">Trusted by leading businesses across Nigeria</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-50">
            {/* Logo placeholders */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-center">
                <div className="h-12 w-32 bg-gray-300 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join 10,000+ businesses already using Cunga to grow faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-primary-50 shadow-2xl">
                Start Free Trial
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View Demo
              </Button>
            </Link>
          </div>
          <p className="text-primary-100 mt-6 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/assets/logos/logo-temp.svg"
                  alt={BRAND_INFO.name}
                  className="w-10 h-10"
                />
                <span className="text-2xl font-display font-bold text-white">
                  {BRAND_INFO.name}
                </span>
              </div>
              <p className="text-gray-400 mb-6 max-w-sm">
                {BRAND_INFO.tagline}
              </p>
              <p className="text-gray-500 text-sm">
                The all-in-one platform for modern retail businesses.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-white font-bold mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="hover:text-white transition-colors">
                    Testimonials
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-bold mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} {BRAND_INFO.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Shield size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
