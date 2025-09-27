import React from 'react'
import { cn } from '@/lib/utils'

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  icon?: React.ReactNode
  variant?: 'default' | 'filled'
}

export function AdminInput({
  label,
  helperText,
  error,
  icon,
  variant = 'default',
  className,
  ...props
}: AdminInputProps) {
  const inputClasses = cn(
    'w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1',
    variant === 'filled' ? 'bg-gray-50 border-gray-200 focus:bg-white' : 'bg-white border-gray-300',
    error 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
      : 'focus:ring-blue-500 focus:border-blue-500',
    icon && 'pl-12',
    className
  )

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={inputClasses}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}
