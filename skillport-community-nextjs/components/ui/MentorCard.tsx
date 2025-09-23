import { cn } from '@/lib/utils'
import React from 'react'

interface MentorCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
}

export function MentorCard({ children, className, hover = true, gradient = false, ...props }: MentorCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-md p-6 transition-all duration-300',
        hover && 'hover:-translate-y-1 hover:shadow-lg',
        gradient && 'bg-gradient-to-br from-white to-gray-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
