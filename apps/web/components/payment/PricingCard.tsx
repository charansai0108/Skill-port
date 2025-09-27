'use client'

import { useState } from 'react'
import { Check, Star, Zap } from 'lucide-react'
import { SUBSCRIPTION_PLANS, SubscriptionPlanId } from '@/lib/razorpay'

interface PricingCardProps {
  planId: SubscriptionPlanId
  isPopular?: boolean
  onSelect: (planId: SubscriptionPlanId) => void
  loading?: boolean
}

export function PricingCard({ planId, isPopular = false, onSelect, loading = false }: PricingCardProps) {
  const plan = SUBSCRIPTION_PLANS[planId]
  const [isHovered, setIsHovered] = useState(false)

  const getPriceDisplay = () => {
    if (plan.interval === 'yearly') {
      const monthlyPrice = Math.round(plan.price / 12)
      return (
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900">₹{monthlyPrice}</div>
          <div className="text-sm text-gray-500">per month</div>
          <div className="text-sm text-green-600 font-medium">
            Billed annually (₹{plan.price}/year)
          </div>
        </div>
      )
    }
    return (
      <div className="text-center">
        <div className="text-4xl font-bold text-gray-900">₹{plan.price}</div>
        <div className="text-sm text-gray-500">per month</div>
      </div>
    )
  }

  const getCardStyles = () => {
    if (isPopular) {
      return 'relative bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 shadow-xl'
    }
    if (isHovered) {
      return 'bg-white border-2 border-gray-200 shadow-lg'
    }
    return 'bg-white border border-gray-200 shadow-md'
  }

  return (
    <div
      className={`rounded-2xl p-8 transition-all duration-300 ${getCardStyles()}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
            <Star className="w-4 h-4" />
            Most Popular
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          {planId === 'PREMIUM' || planId === 'YEARLY_PREMIUM' ? (
            <Zap className="w-8 h-8 text-white" />
          ) : (
            <Check className="w-8 h-8 text-white" />
          )}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 mb-4">{plan.description}</p>
        {getPriceDisplay()}
      </div>

      <div className="space-y-4 mb-8">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSelect(planId)}
        disabled={loading}
        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
          isPopular
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
            : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Processing...' : 'Choose Plan'}
      </button>

      {plan.interval === 'yearly' && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            <Check className="w-4 h-4" />
            Save 2 months free
          </div>
        </div>
      )}
    </div>
  )
}
