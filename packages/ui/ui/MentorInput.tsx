import { cn } from '@/lib/utils'
import React from 'react'

interface MentorInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  icon?: React.ReactNode
  error?: string
}

export function MentorInput({ label, helperText, icon, error, className, ...props }: MentorInputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5 text-gray-400' })}
          </div>
        )}
        <input
          className={cn(
            'block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:shadow-lg transition-all duration-300 sm:text-sm',
            icon ? 'pl-10 pr-3 py-2.5' : 'px-3 py-2.5',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
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
