import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'

interface MentorButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient-orange' | 'gradient-purple'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
  href?: string
}

export function MentorButton({
  className,
  variant = 'primary',
  size = 'md',
  asChild = false,
  href,
  ...props
}: MentorButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95'

  const variantStyles = {
    primary: 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5',
    secondary: 'bg-gray-200 text-gray-800 shadow-sm hover:bg-gray-300 hover:shadow-md hover:-translate-y-0.5',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:-translate-y-0.5',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:-translate-y-0.5',
    'gradient-orange': 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-md hover:from-orange-700 hover:to-orange-800 hover:shadow-lg hover:-translate-y-0.5',
    'gradient-purple': 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md hover:from-purple-700 hover:to-purple-800 hover:shadow-lg hover:-translate-y-0.5',
  }

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const Component = asChild && href ? Link : 'button'
  const componentProps = asChild && href ? { href, passHref: true } : {}

  return (
    <Component
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...componentProps}
      {...props}
    />
  )
}
