'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface AnalyticsCardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  subtitle?: string
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo'
}

export function AnalyticsCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  subtitle, 
  icon,
  color = 'blue'
}: AnalyticsCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      case 'red':
        return 'bg-red-50 border-red-200 text-red-700'
      case 'purple':
        return 'bg-purple-50 border-purple-200 text-purple-700'
      case 'indigo':
        return 'bg-indigo-50 border-indigo-200 text-indigo-700'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700'
    }
  }

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-4 h-4" />
      case 'decrease':
        return <TrendingDown className="w-4 h-4" />
      default:
        return <Minus className="w-4 h-4" />
    }
  }

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600'
      case 'decrease':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        
        {icon && (
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses()}`}>
            {icon}
          </div>
        )}
      </div>
      
      {change !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          <div className={`flex items-center gap-1 ${getChangeColor()}`}>
            {getChangeIcon()}
            <span className="text-sm font-medium">
              {Math.abs(change)}%
            </span>
          </div>
          <span className="text-sm text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  )
}
