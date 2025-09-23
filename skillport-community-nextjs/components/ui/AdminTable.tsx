import React from 'react'
import { cn } from '@/lib/utils'

interface AdminTableProps {
  children: React.ReactNode
  className?: string
}

interface AdminTableHeaderProps {
  children: React.ReactNode
  className?: string
}

interface AdminTableBodyProps {
  children: React.ReactNode
  className?: string
}

interface AdminTableRowProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

interface AdminTableCellProps {
  children: React.ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
  colSpan?: number
}

export function AdminTable({ children, className }: AdminTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className={cn('w-full', className)}>
          {children}
        </table>
      </div>
    </div>
  )
}

export function AdminTableHeader({ children, className }: AdminTableHeaderProps) {
  return (
    <thead className="bg-gray-50">
      <tr className={className}>
        {children}
      </tr>
    </thead>
  )
}

export function AdminTableBody({ children, className }: AdminTableBodyProps) {
  return (
    <tbody className="divide-y divide-gray-200 bg-white">
      {children}
    </tbody>
  )
}

export function AdminTableRow({ 
  children, 
  className, 
  hover = false, 
  onClick 
}: AdminTableRowProps) {
  return (
    <tr
      className={cn(
        'transition-all duration-200',
        hover && 'hover:bg-gray-50 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function AdminTableCell({ 
  children, 
  className, 
  align = 'left',
  colSpan
}: AdminTableCellProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return (
    <td
      colSpan={colSpan}
      className={cn(
        'px-6 py-4 text-sm text-gray-900',
        alignClasses[align],
        className
      )}
    >
      {children}
    </td>
  )
}

export function AdminTableHeaderCell({ 
  children, 
  className, 
  align = 'left' 
}: AdminTableCellProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return (
    <th
      className={cn(
        'px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        alignClasses[align],
        className
      )}
    >
      {children}
    </th>
  )
}
