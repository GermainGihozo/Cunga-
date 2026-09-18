import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Check,
  X,
  Zap,
  Star,
  Shield,
  TrendingUp,
  Users,
  Package,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@components/common'
import { BRAND_INFO } from '@constants/brand'

const plans = [
  {
    id: 'free',
    name: 'Basic Seller',
    tagline: 'Perfect to get started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    commission: '8%',
    color: 'gray',
    icon: <Package size={28} />,
    badge: null,
    features: [
      { text: 'List up to 10 products', included: true },
      { text: '8% commission per sale', included: true },
      { text: 'Basic seller profile', included: true },
      { text: 'Standard support', included: true },
      { text: 'Sales analytics', included: false },
      { text: 'Featured listings', included: false },
      { text: 'Bulk product upload', included: false },
      { text: 'Priority search ranking', included: false },
      { text: 'Dedicated account manager', included: false },
    ],
    cta: 'Start Free',
    ctaLink: '/register?plan=free',
  },
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For growing sellers',
    monthlyPrice: 15000,
    yearlyPrice: 144000,
    commission: '5%',
    color: 'primary',
    icon: <TrendingUp size={28} />,
    badge: null,
    features: [
      { text: 'List up to 100 products', included: true },
      { text: '5% commission per sale', included: true },
      { text: 'Enhanced seller profile', included: true },
      { text: 'Priority support', included: true },
      { text: 'Basic sales analytics', included: true },
      { text: '2 featured listings/month', included: true },
      { text: 'Bulk product upload', included: false },
      { text: 'Priority search ranking', included: false },
      { text: 'Dedicated account manager', included: false },
    ],
    cta: 'Start Starter',
    ctaLink: '/register?plan=starter',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Best for serious sellers',
    monthlyPrice: 45000,
    yearlyPrice: 432000,
    commission: '3%',
    color: 'accent',
    icon: <Star size={28} />,
    badge: 'Most Popular',
    features: [
      { text: 'Unlimited products', included: true },
      { text: '3% commission per sale', included: true },
      { text: 'Premium seller storefront', included: true },
      { text: '24/7 priority support', included: true },
      { text: 'Advanced analytics dashboard', included: true },
      { text: '10 featured listings/month', included: true },
      { text: 'Bulk product upload', included: true },
      { text: 'Priority search ranking', included: true },
      { text: 'Dedicated account manager', included: false },
    ],
    cta: 'Start Pro',
    ctaLink: '/register?plan=pro',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For large businesses',
    monthlyPrice: 75000,
    yearlyPrice: 720000,
    commission: '1.5%',
    color: 'purple',
    icon: <Shield size={28} />,
    badge: null,
    features: [
      { text: 'Unlimited products', included: true },
      { text: '1.5% commission per sale', included: true },
      { text: 'Custom branded storefront', included: true },
      { text: 'Dedicated support line', included: true },
      { text: 'Full analytics & reports', included: true },
      { text: 'Unlimited featured listings', included: true },
      { text: 'Bulk product upload', included: true },
      { text: 'Top search ranking', included: true },
      { text: 'Dedicated account manager', included: true },
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact?plan=enterprise',
  },
]

const faqs = [
  {
    q: 'Can I switch plans at any time?',
    a: 'Yes. You can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated.',
  },
  {
    q: 'What does the commission cover?',
    a: 'Commission is a percentage of each sale. It covers payment processing, platform maintenance, buyer protection, and fraud prevention.',
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: 'Yes — Starter and Pro plans come with a 14-day free trial. No credit card required to start.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept Mobile Money (MTN, Airtel), bank transfers, and major debit/credit cards for subscription payments.',
  },
  {
    q: 'Can I sell on the Basic (free) plan?',
    a: 'Absolutely. The Basic plan lets you list up to 10 products with an 8% commission — no monthly fee, ever.',
  },
  {
    q: 'Do you offer discounts for yearly billing?',
    a: 'Yes — paying annually saves you approximately 20% compared to monthly billing.',
  },
]

const Pricing = () => {
  const [yearly, setYearly] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const formatPrice = (price: number) =>
    price === 0 ? 'Free' : `RWF ${price.toLocaleString()}`

  const colorMap: Record<string, { bg: string; text: string; border: string; btn: string; badge: string; icon: string }> = {
    gray: {
      bg: 'bg-white',
      text: 'text-gray-700',
      border: 'border-gray-200',
      btn: 'bg-gray-900 hover:bg-gray-700 text-white',
      badge: 'bg-gray-100 text-gray-600',
      icon: 'bg-gray-100 text-gray-600',
    },
    primary: {
      bg: 'bg-white',
      text: 'text-primary-600',
      border: 'border-primary-200',
      btn: 'bg-primary-600 hover:bg-primary-700 text-white',
      badge: 'bg-primary-100 text-primary-700',
      icon: 'bg-primary-100 text-primary-600',
    },
    accent: {
      bg: 'bg-gradient-to-b from-accent-500 to-accent-600',
      text: 'text-white',
      border: 'border-accent-400',
      btn: 'bg-white text-accent-600 hover:bg-gray-100',
      badge: 'bg-white/20 text-white',
      icon: 'bg-white/20 text-white',
    },
    purple: {
      bg: 'bg-white',
      text: 'text-purple-600',
      border: 'border-purple-200',
      btn: 'bg-purple-600 hover:bg-purple-700 text-white',
      badge: 'bg-purple-100 text-purple-700',
      icon: 'bg-purple-100 text-purple-600',
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/logos/logo-temp.svg" alt={BRAND_INFO.name} className="w-10 h-10" />
            <span className="text-xl font-bold text-primary-700">{BRAND_INFO.name}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-primary-600 hidden sm:block">
              ← Back to Marketplace
            </Link>
            <Link to="/register">
              <Button className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 py-16 md:py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent-500 rounded-full opacity-20 blur-3xl animate-float"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-primary-400 rounded-full opacity-20 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
            <Zap size={16} className="text-accent-400" />
            Simple, transparent pricing
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Choose Your Seller Plan
          </h1>
          <p className="text-blue-100 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Start free, upgrade as you grow. Every plan includes buyer protection and secure payments.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-full p-1.5 border border-white/20">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                !yearly ? 'bg-white text-primary-700 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                yearly ? 'bg-white text-primary-700 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              Yearly
              <span className="bg-accent-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">-20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {plans.map((plan) => {
              const c = colorMap[plan.color]
              const price = yearly ? plan.yearlyPrice : plan.monthlyPrice
              const isAccent = plan.color === 'accent'
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border-2 ${c.border} overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all ${c.bg} ${
                    plan.badge ? 'ring-2 ring-accent-400 ring-offset-2' : ''
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute top-0 left-0 right-0 bg-accent-500 text-white text-xs font-bold text-center py-1.5 tracking-wider uppercase">
                      ⭐ {plan.badge}
                    </div>
                  )}

                  <div className={`p-6 ${plan.badge ? 'pt-10' : ''}`}>
                    {/* Icon + name */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${c.icon}`}>
                      {plan.icon}
                    </div>
                    <h3 className={`text-xl font-bold mb-1 ${isAccent ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm mb-5 ${isAccent ? 'text-white/80' : 'text-gray-500'}`}>
                      {plan.tagline}
                    </p>

                    {/* Price */}
                    <div className="mb-2">
                      {price === 0 ? (
                        <span className={`text-4xl font-bold ${isAccent ? 'text-white' : 'text-gray-900'}`}>
                          Free
                        </span>
                      ) : (
                        <>
                          <span className={`text-3xl font-bold ${isAccent ? 'text-white' : 'text-gray-900'}`}>
                            RWF {price.toLocaleString()}
                          </span>
                          <span className={`text-sm ml-1 ${isAccent ? 'text-white/70' : 'text-gray-500'}`}>
                            /{yearly ? 'year' : 'month'}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Commission chip */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-6 ${c.badge}`}>
                      <TrendingUp size={12} />
                      {plan.commission} commission per sale
                    </div>

                    <Link to={plan.ctaLink}>
                      <Button className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 ${c.btn}`}>
                        {plan.cta}
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className={`h-px mx-6 ${isAccent ? 'bg-white/20' : 'bg-gray-100'}`}></div>

                  {/* Features */}
                  <div className="p-6 space-y-3">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-3">
                        {f.included ? (
                          <Check size={16} className={`mt-0.5 flex-shrink-0 ${isAccent ? 'text-white' : 'text-success-500'}`} />
                        ) : (
                          <X size={16} className={`mt-0.5 flex-shrink-0 ${isAccent ? 'text-white/40' : 'text-gray-300'}`} />
                        )}
                        <span className={`text-sm ${f.included ? (isAccent ? 'text-white' : 'text-gray-700') : (isAccent ? 'text-white/50' : 'text-gray-400')}`}>
                          {f.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-10 px-4 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🔒', label: 'Secure Payments', sub: 'Bank-level encryption' },
              { icon: '↩️', label: 'Cancel Anytime', sub: 'No lock-in contracts' },
              { icon: '🆓', label: '14-day Free Trial', sub: 'Starter & Pro plans' },
              { icon: '🇷🇼', label: 'Rwanda-Based', sub: 'Local support team' },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="font-bold text-gray-900 text-sm">{item.label}</div>
                <div className="text-gray-500 text-xs">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compare table - hidden on mobile, visible on md+ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
            Full Plan Comparison
          </h2>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-4 font-semibold text-gray-600 w-1/3">Feature</th>
                    {plans.map((p) => (
                      <th key={p.id} className={`px-4 py-4 font-bold text-center ${p.color === 'accent' ? 'text-accent-600' : 'text-gray-900'}`}>
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Monthly Fee', values: ['Free', 'RWF 15,000', 'RWF 45,000', 'RWF 75,000'] },
                    { label: 'Commission', values: ['8%', '5%', '3%', '1.5%'] },
                    { label: 'Product Listings', values: ['10', '100', 'Unlimited', 'Unlimited'] },
                    { label: 'Featured Listings/mo', values: ['—', '2', '10', 'Unlimited'] },
                    { label: 'Analytics', values: ['—', 'Basic', 'Advanced', 'Full'] },
                    { label: 'Bulk Upload', values: [false, false, true, true] },
                    { label: 'Priority Ranking', values: [false, false, true, true] },
                    { label: 'Support', values: ['Standard', 'Priority', '24/7 Chat', 'Dedicated'] },
                    { label: 'Account Manager', values: [false, false, false, true] },
                  ].map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-6 py-4 font-medium text-gray-700">{row.label}</td>
                      {row.values.map((val, vi) => (
                        <td key={vi} className="px-4 py-4 text-center text-gray-600">
                          {val === true ? (
                            <Check size={18} className="text-success-500 mx-auto" />
                          ) : val === false ? (
                            <X size={18} className="text-gray-300 mx-auto" />
                          ) : (
                            <span className={vi === 2 ? 'text-accent-600 font-semibold' : ''}>{val}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-gray-900 text-sm md:text-base pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={18} className="flex-shrink-0 text-primary-600" />
                    : <ChevronDown size={18} className="flex-shrink-0 text-gray-400" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-200 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Selling?</h2>
          <p className="text-blue-100 mb-8">
            Join thousands of sellers already growing their business on {BRAND_INFO.name}.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?plan=free">
              <Button className="bg-white text-primary-700 hover:bg-gray-100 px-8 py-3 rounded-xl font-bold transition-all hover:shadow-xl active:scale-95">
                Start Free
              </Button>
            </Link>
            <Link to="/register?plan=pro">
              <Button className="bg-accent-500 hover:bg-accent-600 text-white px-8 py-3 rounded-xl font-bold transition-all hover:shadow-xl active:scale-95">
                Try Pro Free for 14 Days
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-500 text-center py-6 px-4 text-sm">
        © {new Date().getFullYear()} {BRAND_INFO.name}. All rights reserved. ·{' '}
        <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link> ·{' '}
        <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
      </footer>
    </div>
  )
}

export default Pricing
