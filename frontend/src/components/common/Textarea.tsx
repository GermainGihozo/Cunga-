import React from 'react'
import { cn } from '@utils/cn'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helpText?: string
  maxLength?: number
  showCount?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helpText,
      id,
      disabled,
      maxLength,
      showCount = false,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const currentLength = value?.toString().length || 0

    const baseStyles =
      'w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none'

    const normalStyles =
      'border-gray-300 focus:ring-primary-500 focus:border-transparent'
    const errorStyles = 'border-red-500 focus:ring-red-500'

    const textareaStyles = error ? errorStyles : normalStyles

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          {label && (
            <label
              htmlFor={textareaId}
              className="block text-sm font-medium text-gray-700"
            >
              {label}
            </label>
          )}
          {showCount && maxLength && (
            <span className="text-xs text-gray-500">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(baseStyles, textareaStyles, className)}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          {...props}
        />

        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        {helpText && !error && (
          <p className="text-gray-500 text-sm mt-1">{helpText}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
