import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Shield, FileText, Phone } from 'lucide-react'
import { BRAND_INFO } from '@constants/brand'

const PAGES: Record<string, {
  icon: React.ReactNode
  title: string
  subtitle: string
  sections: { heading: string; body: string }[]
}> = {
  '/terms': {
    icon: <FileText size={28} className="text-primary-600" />,
    title: 'Terms of Service',
    subtitle: `Last updated: September 2026`,
    sections: [
      { heading: '1. Acceptance of Terms', body: `By accessing or using ${BRAND_INFO.name}, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.` },
      { heading: '2. Description of Service', body: `${BRAND_INFO.name} is a multi-tenant SaaS platform and marketplace that enables businesses to manage inventory, track sales, operate online stores, and connect with buyers across Rwanda.` },
      { heading: '3. User Accounts', body: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.` },
      { heading: '4. Seller Obligations', body: `Sellers must list accurate product information, fulfill orders in a timely manner, and comply with all applicable Rwandan laws and regulations. Counterfeit, illegal, or prohibited items are strictly forbidden.` },
      { heading: '5. Marketplace Commission', body: `${BRAND_INFO.name} charges a commission on each sale made through the marketplace. Commission rates vary by plan: Free (8%), Starter (5%), Pro (3%), Enterprise (1.5%). Commissions are deducted before seller payouts.` },
      { heading: '6. Buyer Protection', body: `We offer buyer protection on all marketplace orders. If you receive a product that does not match the listing description, you may request a refund within 7 days of delivery.` },
      { heading: '7. Payment Terms', body: `All prices on ${BRAND_INFO.name} are in Rwandan Francs (RWF). We accept MTN Mobile Money, Airtel Money, debit/credit cards, and bank transfers. Seller payouts are processed weekly.` },
      { heading: '8. Intellectual Property', body: `All content, trademarks, and intellectual property on ${BRAND_INFO.name} are owned by Cunga Ltd or licensed to us. You may not reproduce, distribute, or create derivative works without our written permission.` },
      { heading: '9. Termination', body: `We reserve the right to suspend or terminate any account that violates these terms, engages in fraudulent activity, or harms the platform community.` },
      { heading: '10. Governing Law', body: `These terms are governed by the laws of Rwanda. Any disputes shall be subject to the exclusive jurisdiction of the courts of Kigali, Rwanda.` },
    ],
  },
  '/privacy': {
    icon: <Shield size={28} className="text-primary-600" />,
    title: 'Privacy Policy',
    subtitle: `Last updated: September 2026`,
    sections: [
      { heading: 'Information We Collect', body: `We collect information you provide directly: name, email address, phone number, business information, and payment details. We also collect usage data, IP addresses, and device information automatically.` },
      { heading: 'How We Use Your Information', body: `We use your information to provide and improve our services, process transactions, communicate with you, prevent fraud, and comply with legal obligations.` },
      { heading: 'Sharing of Information', body: `We do not sell your personal data. We may share information with service providers who assist us in operating the platform, law enforcement when required by law, and other users to the extent necessary to complete transactions.` },
      { heading: 'Data Security', body: `We implement bank-level encryption (TLS/SSL), secure data centers, regular security audits, and access controls to protect your information.` },
      { heading: 'Cookies', body: `We use cookies and similar technologies to maintain your session, remember preferences, and analyze platform usage. You can control cookie settings in your browser.` },
      { heading: 'Data Retention', body: `We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your data by contacting us.` },
      { heading: 'Your Rights', body: `You have the right to access, correct, export, or delete your personal data. Contact us at privacy@cunga.rw to exercise these rights.` },
      { heading: 'Contact Us', body: `For privacy-related questions or concerns, contact our Data Protection Officer at privacy@cunga.rw.` },
    ],
  },
  '/contact': {
    icon: <Phone size={28} className="text-primary-600" />,
    title: 'Contact Us',
    subtitle: 'We\'d love to hear from you',
    sections: [
      { heading: 'General Support', body: `Email: support@cunga.rw\nPhone: +250 788 000 000\nMonday–Friday: 8am–6pm CAT\nSaturday: 9am–1pm CAT` },
      { heading: 'Seller Support', body: `Email: sellers@cunga.rw\nFor account setup, product listings, payouts, and commission questions.` },
      { heading: 'Buyer Support', body: `Email: buyers@cunga.rw\nFor order issues, returns, refunds, and delivery inquiries.` },
      { heading: 'Business & Enterprise', body: `Email: business@cunga.rw\nFor enterprise plans, API access, white-label solutions, and custom integrations.` },
      { heading: 'Office Address', body: `Cunga Ltd\nKG 123 Street, Remera\nGasabo, Kigali\nRwanda` },
    ],
  },
  '/cookies': {
    icon: <Shield size={28} className="text-primary-600" />,
    title: 'Cookie Policy',
    subtitle: `Last updated: September 2026`,
    sections: [
      { heading: 'What Are Cookies', body: 'Cookies are small text files stored on your device when you visit our website. They help us remember your preferences and improve your experience.' },
      { heading: 'Types of Cookies We Use', body: 'Essential cookies (required for the site to function), preference cookies (remember your settings), analytics cookies (understand usage patterns), and marketing cookies (relevant advertisements).' },
      { heading: 'Managing Cookies', body: 'You can control cookies through your browser settings. Disabling essential cookies may affect site functionality. Third-party analytics can be opted out via your browser.' },
      { heading: 'Updates', body: 'We may update this policy periodically. Continued use of our platform after changes constitutes acceptance of the updated policy.' },
    ],
  },
}

export default function StaticPage() {
  const { pathname } = useLocation()
  const page = PAGES[pathname]

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Page not found</p>
          <Link to="/" className="text-primary-600 hover:underline mt-2 block">← Go Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/logos/logo-temp.svg" alt={BRAND_INFO.name} className="w-8 h-8" />
            <span className="font-bold text-primary-700">{BRAND_INFO.name}</span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
            <ArrowLeft size={15} /> Back
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Page title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center">
            {page.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{page.subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {page.sections.map((section, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">{section.heading}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{section.body}</p>
            </div>
          ))}
        </div>

        {/* Footer nav */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center text-sm text-gray-400">
          {['/terms', '/privacy', '/cookies', '/contact'].filter(p => p !== pathname).map(p => (
            <Link key={p} to={p} className="hover:text-primary-600 capitalize transition-colors">
              {p.replace('/', '')}
            </Link>
          ))}
          <span>·</span>
          <Link to="/" className="hover:text-primary-600 transition-colors">← {BRAND_INFO.name} Home</Link>
        </div>
      </div>
    </div>
  )
}
