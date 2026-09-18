import { useState } from 'react'
import {
  Palette,
  Type,
  Layout,
  Box,
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
} from 'lucide-react'
import { Button, Badge, Card, Alert, Input, Spinner } from '@components/common'
import { BRAND_COLORS, BRAND_GRADIENTS, BRAND_INFO } from '@constants/brand'

const StyleGuide = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const ColorSwatch = ({ name, value, textColor = 'text-gray-900' }: { name: string; value: string; textColor?: string }) => (
    <div className="group cursor-pointer" onClick={() => copyToClipboard(value, name)}>
      <div 
        className="h-24 rounded-xl shadow-md group-hover:shadow-xl transition-all mb-3 flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: value }}
      >
        <span className={`font-mono text-sm font-semibold ${textColor} opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-3 py-1 rounded-lg`}>
          {value}
        </span>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {copiedCode === name ? (
            <Check className="text-white" size={16} />
          ) : (
            <Copy className="text-white" size={16} />
          )}
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-900">{name}</p>
      <p className="text-xs text-gray-500 font-mono">{value}</p>
    </div>
  )

  const CodeBlock = ({ code, language = 'tsx' }: { code: string; language?: string }) => (
    <div className="relative group">
      <button
        onClick={() => copyToClipboard(code, code)}
        className="absolute top-3 right-3 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-10"
      >
        {copiedCode === code ? (
          <Check className="text-green-400" size={16} />
        ) : (
          <Copy className="text-white" size={16} />
        )}
      </button>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Cunga Brand Style Guide
        </h1>
        <p className="text-gray-600 flex items-center gap-2">
          <Palette size={16} className="text-primary-500" />
          Design system, components, and branding guidelines
        </p>
      </div>

      {/* Brand Identity */}
      <section className="card-hover">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-1 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Info className="text-white" size={20} />
            </div>
            Brand Identity
          </h2>
          <p className="text-gray-600 ml-13">Core brand information and values</p>
        </div>

        <div className="space-y-6">
          {/* Logo */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Logo Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white border-2 border-gray-200 rounded-xl">
                <div className="flex items-center justify-center h-32 mb-4">
                  <img src="/assets/logos/logo-temp.svg" alt="Cunga Logo" className="w-20 h-20" />
                </div>
                <p className="text-sm font-medium text-gray-900 text-center">Primary Logo</p>
                <p className="text-xs text-gray-500 text-center mt-1">Use on light backgrounds</p>
              </div>
              <div className="p-6 bg-gradient-primary rounded-xl">
                <div className="flex items-center justify-center h-32 mb-4">
                  <img src="/assets/logos/logo-temp.svg" alt="Cunga Logo" className="w-20 h-20" />
                </div>
                <p className="text-sm font-medium text-white text-center">On Brand Colors</p>
                <p className="text-xs text-white/80 text-center mt-1">Use white version</p>
              </div>
              <div className="p-6 bg-gray-900 rounded-xl">
                <div className="flex items-center justify-center h-32 mb-4">
                  <img src="/assets/logos/logo-temp.svg" alt="Cunga Logo" className="w-20 h-20" />
                </div>
                <p className="text-sm font-medium text-white text-center">On Dark Backgrounds</p>
                <p className="text-xs text-white/80 text-center mt-1">Use white version</p>
              </div>
            </div>
          </div>

          {/* Brand Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-200">
              <p className="text-sm font-semibold text-gray-600 mb-1">Brand Name</p>
              <p className="text-2xl font-display font-bold text-gray-900">{BRAND_INFO.name}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-accent-50 to-white rounded-xl border border-accent-200">
              <p className="text-sm font-semibold text-gray-600 mb-1">Tagline</p>
              <p className="text-lg font-medium text-gray-900">{BRAND_INFO.tagline}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Color Palette */}
      <section className="card-hover">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-1 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
              <Palette className="text-white" size={20} />
            </div>
            Color Palette
          </h2>
          <p className="text-gray-600 ml-13">Click any color to copy hex code</p>
        </div>

        <div className="space-y-8">
          {/* Primary Colors */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Primary Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <ColorSwatch name="Primary 50" value={BRAND_COLORS.primary[50]} />
              <ColorSwatch name="Primary 100" value={BRAND_COLORS.primary[100]} />
              <ColorSwatch name="Primary 200" value={BRAND_COLORS.primary[200]} />
              <ColorSwatch name="Primary 500" value={BRAND_COLORS.primary[500]} textColor="text-white" />
              <ColorSwatch name="Primary 600" value={BRAND_COLORS.primary[600]} textColor="text-white" />
            </div>
          </div>

          {/* Accent Colors */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Accent Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <ColorSwatch name="Accent 50" value={BRAND_COLORS.accent[50]} />
              <ColorSwatch name="Accent 100" value={BRAND_COLORS.accent[100]} />
              <ColorSwatch name="Accent 200" value={BRAND_COLORS.accent[200]} />
              <ColorSwatch name="Accent 500" value={BRAND_COLORS.accent[500]} textColor="text-white" />
              <ColorSwatch name="Accent 600" value={BRAND_COLORS.accent[600]} textColor="text-white" />
            </div>
          </div>

          {/* Semantic Colors */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Semantic Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch name="Success" value={BRAND_COLORS.success[500]} textColor="text-white" />
              <ColorSwatch name="Warning" value={BRAND_COLORS.warning[500]} textColor="text-white" />
              <ColorSwatch name="Error" value={BRAND_COLORS.error[500]} textColor="text-white" />
              <ColorSwatch name="Info" value={BRAND_COLORS.info[500]} textColor="text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="card-hover">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-1 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-warning rounded-lg flex items-center justify-center">
              <Type className="text-white" size={20} />
            </div>
            Typography
          </h2>
          <p className="text-gray-600 ml-13">Font families and text styles</p>
        </div>

        <div className="space-y-6">
          {/* Font Families */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Font Families</h3>
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">Display Font (Headings)</p>
                <p className="text-4xl font-display font-bold text-gray-900 mb-2">Poppins</p>
                <p className="text-gray-600 font-display">The quick brown fox jumps over the lazy dog</p>
                <CodeBlock code={`font-family: 'Poppins', sans-serif;\nfont-class: font-display`} />
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">Body Font</p>
                <p className="text-4xl font-sans font-bold text-gray-900 mb-2">Inter</p>
                <p className="text-gray-600">The quick brown fox jumps over the lazy dog</p>
                <CodeBlock code={`font-family: 'Inter', sans-serif;\nfont-class: font-sans (default)`} />
              </div>
            </div>
          </div>

          {/* Text Sizes */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Text Sizes</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-16">xs</span>
                <p className="text-xs text-gray-900">The quick brown fox (12px)</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-16">sm</span>
                <p className="text-sm text-gray-900">The quick brown fox (14px)</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-16">base</span>
                <p className="text-base text-gray-900">The quick brown fox (16px)</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-16">lg</span>
                <p className="text-lg text-gray-900">The quick brown fox (18px)</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-16">xl</span>
                <p className="text-xl text-gray-900">The quick brown fox (20px)</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-16">2xl</span>
                <p className="text-2xl font-display font-bold text-gray-900">The quick brown fox (24px)</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-16">4xl</span>
                <p className="text-4xl font-display font-bold text-gray-900">The quick brown fox (36px)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gradients */}
      <section className="card-hover">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-1 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-success rounded-lg flex items-center justify-center">
              <Box className="text-white" size={20} />
            </div>
            Gradients
          </h2>
          <p className="text-gray-600 ml-13">Brand gradient styles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            className="h-32 rounded-xl flex items-center justify-center shadow-xl"
            style={{ background: BRAND_GRADIENTS.primary }}
          >
            <span className="text-white font-bold text-lg">Primary Gradient</span>
          </div>
          <div 
            className="h-32 rounded-xl flex items-center justify-center shadow-xl"
            style={{ background: BRAND_GRADIENTS.accent }}
          >
            <span className="text-white font-bold text-lg">Accent Gradient</span>
          </div>
          <div 
            className="h-32 rounded-xl flex items-center justify-center shadow-xl"
            style={{ background: BRAND_GRADIENTS.success }}
          >
            <span className="text-white font-bold text-lg">Success Gradient</span>
          </div>
          <div 
            className="h-32 rounded-xl flex items-center justify-center shadow-xl"
            style={{ background: BRAND_GRADIENTS.warning }}
          >
            <span className="text-white font-bold text-lg">Warning Gradient</span>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">CSS Classes</h3>
          <CodeBlock code={`/* Background Gradients */
.bg-gradient-primary { background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); }
.bg-gradient-accent { background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%); }
.bg-gradient-success { background: linear-gradient(135deg, #10B981 0%, #059669 100%); }
.bg-gradient-warning { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }

/* Text Gradients */
.bg-gradient-primary.bg-clip-text.text-transparent`} />
        </div>
      </section>

      {/* Components */}
      <section className="card-hover">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-1 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <Layout className="text-white" size={20} />
            </div>
            Components
          </h2>
          <p className="text-gray-600 ml-13">Reusable UI components and patterns</p>
        </div>

        <div className="space-y-8">
          {/* Buttons */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Buttons</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              <Button className="btn-primary">Primary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button size="sm">Small Button</Button>
              <Button size="lg">Large Button</Button>
              <Button disabled>Disabled</Button>
            </div>
            <CodeBlock code={`<Button className="btn-primary">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button disabled>Disabled</Button>`} />
          </div>

          {/* Badges */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Badges</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="default">Default</Badge>
            </div>
            <CodeBlock code={`<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>`} />
          </div>

          {/* Alerts */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Alerts</h3>
            <div className="space-y-3 mb-4">
              <Alert variant="success">
                <CheckCircle size={18} />
                <span>This is a success alert message</span>
              </Alert>
              <Alert variant="info">
                <Info size={18} />
                <span>This is an info alert message</span>
              </Alert>
              <Alert variant="warning">
                <AlertTriangle size={18} />
                <span>This is a warning alert message</span>
              </Alert>
              <Alert variant="error">
                <XCircle size={18} />
                <span>This is an error alert message</span>
              </Alert>
            </div>
            <CodeBlock code={`<Alert variant="success">Success message</Alert>
<Alert variant="info">Info message</Alert>
<Alert variant="warning">Warning message</Alert>
<Alert variant="error">Error message</Alert>`} />
          </div>

          {/* Inputs */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Input Fields</h3>
            <div className="space-y-3 mb-4 max-w-md">
              <Input placeholder="Default input" />
              <Input placeholder="With left icon" leftIcon={<Type size={18} />} />
              <Input placeholder="Disabled input" disabled />
              <Input placeholder="Error state" className="border-error-500" />
            </div>
            <CodeBlock code={`<Input placeholder="Default input" />
<Input placeholder="With icon" leftIcon={<Icon />} />
<Input disabled />
<Input className="border-error-500" />`} />
          </div>

          {/* Cards */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card>
                <h4 className="font-bold text-gray-900 mb-2">Default Card</h4>
                <p className="text-gray-600 text-sm">Basic card component with padding and shadow</p>
              </Card>
              <Card className="card-hover bg-gradient-to-br from-primary-50 to-white">
                <h4 className="font-bold text-gray-900 mb-2">Enhanced Card</h4>
                <p className="text-gray-600 text-sm">Card with hover effect and gradient</p>
              </Card>
            </div>
            <CodeBlock code={`<Card>Basic card content</Card>
<Card className="card-hover">Card with hover effect</Card>
<Card className="bg-gradient-to-br from-primary-50 to-white">
  Card with gradient background
</Card>`} />
          </div>

          {/* Loading States */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Loading States</h3>
            <div className="flex flex-wrap items-center gap-6 mb-4">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </div>
            <CodeBlock code={`<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />`} />
          </div>
        </div>
      </section>

      {/* Utility Classes */}
      <section className="card-hover">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-1 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white" size={20} />
            </div>
            Utility Classes
          </h2>
          <p className="text-gray-600 ml-13">Custom utility classes for common patterns</p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Card Hover Effect</h3>
            <CodeBlock code={`.card-hover {
  @apply transition-all duration-200;
  @apply hover:shadow-xl hover:-translate-y-1;
}`} />
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Animations</h3>
            <CodeBlock code={`.animate-fade-in { animation: fadeIn 0.5s ease-in; }
.animate-slide-in { animation: slideIn 0.4s ease-out; }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }`} />
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Shadows</h3>
            <CodeBlock code={`.shadow-cunga { box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.3); }
.shadow-accent { box-shadow: 0 10px 25px -5px rgba(236, 72, 153, 0.3); }`} />
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="card-hover bg-gradient-to-br from-primary-50 via-white to-accent-50 border-2 border-primary-200">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-1 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-cunga">
              <CheckCircle className="text-white" size={20} />
            </div>
            Best Practices
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-success-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-semibold text-gray-900">Use gradient backgrounds for primary CTAs and hero sections</p>
              <p className="text-sm text-gray-600 mt-1">Apply bg-gradient-primary class for consistent branding</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="text-success-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-semibold text-gray-900">Use font-display for headings, font-sans for body text</p>
              <p className="text-sm text-gray-600 mt-1">Maintains typographic hierarchy and readability</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="text-success-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-semibold text-gray-900">Add card-hover class to interactive cards</p>
              <p className="text-sm text-gray-600 mt-1">Provides consistent hover feedback across the platform</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="text-success-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-semibold text-gray-900">Use semantic color variants for status indicators</p>
              <p className="text-sm text-gray-600 mt-1">success (green), warning (orange), error (red), info (blue)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="text-success-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-semibold text-gray-900">Maintain minimum contrast ratios for accessibility</p>
              <p className="text-sm text-gray-600 mt-1">WCAG AA requires 4.5:1 for normal text, 3:1 for large text</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default StyleGuide
