/**
 * Cunga Brand Constants
 * Central place for brand colors, typography, and design tokens
 */

export const BRAND_COLORS = {
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  accent: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899',
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
  },
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
} as const

export const BRAND_GRADIENTS = {
  primary: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
  accent: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
  success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  warning: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  cunga: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)', // Primary to Accent
} as const

export const BRAND_TYPOGRAPHY = {
  fonts: {
    display: 'Poppins, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
} as const

const LOGO_TEMP = '/assets/logos/logo-temp.svg'

export const BRAND_INFO = {
  name: 'CUNGA',
  tagline: 'Grow Your Business, Simply.',
  description: 'Multi-Tenant SaaS Shop Management Platform',
  logo: {
    // All point to logo-temp.svg until production assets are added
    full:        LOGO_TEMP,
    icon:        LOGO_TEMP,
    wordmark:    LOGO_TEMP,
    dark:        LOGO_TEMP,
    light:       LOGO_TEMP,
    withTagline: LOGO_TEMP,
    temp:        LOGO_TEMP,
  },
} as const

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

/**
 * Status color mapping for consistent UI
 */
export const STATUS_COLORS = {
  active: BRAND_COLORS.success[500],
  inactive: '#9CA3AF', // gray-400
  pending: BRAND_COLORS.warning[500],
  approved: BRAND_COLORS.success[500],
  rejected: BRAND_COLORS.error[500],
  cancelled: '#6B7280', // gray-500
  completed: BRAND_COLORS.success[500],
  processing: BRAND_COLORS.primary[500],
  failed: BRAND_COLORS.error[500],
} as const

/**
 * Get status badge classes
 */
export const getStatusBadgeClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: 'badge-success',
    inactive: 'bg-gray-100 text-gray-700',
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-error',
    cancelled: 'bg-gray-100 text-gray-700',
    completed: 'badge-success',
    processing: 'badge-primary',
    failed: 'badge-error',
  }
  
  return statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-700'
}

/**
 * Chart color palette for data visualizations
 */
export const CHART_COLORS = [
  BRAND_COLORS.primary[500],
  BRAND_COLORS.accent[500],
  BRAND_COLORS.success[500],
  BRAND_COLORS.warning[500],
  BRAND_COLORS.error[500],
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#F97316', // Orange
] as const
