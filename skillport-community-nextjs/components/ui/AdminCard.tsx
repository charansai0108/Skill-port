import React from 'react'
import { cn } from '@/lib/utils'

interface AdminCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'elevated' | 'outlined'
}

export function AdminCard({ 
  children, 
  className, 
  hover = false, 
  padding = 'md',
  variant = 'default'
}: AdminCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const variantClasses = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg border border-gray-100',
    outlined: 'bg-white border-2 border-gray-200'
  }

  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300',
        paddingClasses[padding],
        variantClasses[variant],
        hover && 'hover:shadow-xl hover:-translate-y-1 hover:border-gray-300',
        className
      )}
    >
      {children}
    </div>
  )
}
