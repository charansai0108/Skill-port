import { cn } from '@/lib/utils'
import React from 'react'

interface MentorTableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode
  className?: string
}

export function MentorTable({ children, className, ...props }: MentorTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className={cn('min-w-full divide-y divide-gray-200', className)} {...props}>
          {children}
        </table>
      </div>
    </div>
  )
}

interface MentorTableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
  className?: string
}

export function MentorTableHeader({ children, className, ...props }: MentorTableHeaderProps) {
  return (
    <thead className={cn('bg-gradient-to-r from-gray-50 to-blue-50', className)} {...props}>
      <tr>{children}</tr>
    </thead>
  )
}

interface MentorTableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}

export function MentorTableHeaderCell({ children, className, align = 'left', ...props }: MentorTableHeaderCellProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }
  return (
    <th
      scope="col"
      className={cn(
        'px-6 py-3 text-sm font-semibold text-gray-700 uppercase tracking-wider',
        alignClass[align],
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
}

interface MentorTableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
  className?: string
}

export function MentorTableBody({ children, className, ...props }: MentorTableBodyProps) {
  return (
    <tbody className={cn('bg-white divide-y divide-gray-200', className)} {...props}>
      {children}
    </tbody>
  )
}

interface MentorTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function MentorTableRow({ children, className, hover = true, ...props }: MentorTableRowProps) {
  return (
    <tr className={cn('transition-all duration-200', hover && 'hover:bg-gray-50', className)} {...props}>
      {children}
    </tr>
  )
}

interface MentorTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}

export function MentorTableCell({ children, className, align = 'left', ...props }: MentorTableCellProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }
  return (
    <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', alignClass[align], className)} {...props}>
      {children}
    </td>
  )
}
