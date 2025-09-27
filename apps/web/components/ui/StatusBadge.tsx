import { cn } from '@/lib/utils'
import React from 'react'

interface StatusBadgeProps {
  status: 'active' | 'upcoming' | 'completed' | 'cancelled' | 'inactive' | 'suspended'
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles = {
    active: 'bg-green-100 text-green-800 border-green-200',
    upcoming: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    suspended: 'bg-red-100 text-red-800 border-red-200',
  }

  const statusLabels = {
    active: 'Active',
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled',
    inactive: 'Inactive',
    suspended: 'Suspended',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
