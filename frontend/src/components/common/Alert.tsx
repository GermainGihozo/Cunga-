import React from 'react'
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react'
import { cn } from '@utils/cn'

export interface AlertProps {
  variant?: 'success' | 'warning' | 'error' | 'info'
  title?: string
  children: React.ReactNode
  onClose?: () => void
  className?: string
}

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className,
}) => {
  const variants = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: <CheckCircle className="text-green-500" size={20} />,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: <AlertCircle className="text-yellow-500" size={20} />,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <XCircle className="text-red-500" size={20} />,
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="text-blue-500" size={20} />,
    },
  }

  const { container, icon } = variants[variant]

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border',
        container,
        className
      )}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{icon}</div>

      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
          aria-label="Close alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

export default Alert
