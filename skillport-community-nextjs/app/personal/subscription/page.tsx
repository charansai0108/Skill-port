'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Calendar, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react'
import { PricingCard } from '@/components/payment/PricingCard'
import { PaymentModal } from '@/components/payment/PaymentModal'
import { SUBSCRIPTION_PLANS, SubscriptionPlanId } from '@/lib/razorpay'

interface Subscription {
  id: string
  planId: string
  planName: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  createdAt: string
  planDetails?: any
}

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  method: string
  createdAt: string
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [subscriptionHistory, setSubscriptionHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId | null>(null)
  const [canceling, setCanceling] = useState(false)

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/subscription')
      const data = await response.json()

      if (response.ok) {
        setSubscription(data.currentSubscription)
        setSubscriptionHistory(data.subscriptionHistory)
      } else {
        setError(data.error || 'Failed to fetch subscription data')
      }
    } catch (err) {
      setError('Failed to fetch subscription data')
    } finally {
      setLoading(false)
    }
  }

  const handlePlanSelect = (planId: SubscriptionPlanId) => {
    setSelectedPlan(planId)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (newSubscription: any) => {
    setSubscription(newSubscription)
    setShowPaymentModal(false)
    setSelectedPlan(null)
    fetchSubscriptionData() // Refresh data
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return

    try {
      setCanceling(true)
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelAtPeriodEnd: true
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubscription({
          ...subscription,
          cancelAtPeriodEnd: true
        })
      } else {
        setError(data.error || 'Failed to cancel subscription')
      }
    } catch (err) {
      setError('Failed to cancel subscription')
    } finally {
      setCanceling(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'CANCELED':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'TRIALING':
        return <AlertCircle className="w-5 h-5 text-blue-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'CANCELED':
        return 'bg-red-100 text-red-800'
      case 'TRIALING':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage your SkillPort subscription and billing</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Current Subscription */}
        {subscription ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Current Subscription</h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                {subscription.status}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Plan Details</h3>
                <p className="text-gray-600">{subscription.planName}</p>
                {subscription.planDetails && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      ₹{subscription.planDetails.price} / {subscription.planDetails.interval}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Billing Period</h3>
                <p className="text-gray-600">
                  {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {' '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
                {subscription.cancelAtPeriodEnd && (
                  <p className="text-sm text-orange-600 mt-1">
                    Will cancel at period end
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Actions</h3>
                {subscription.status === 'ACTIVE' && !subscription.cancelAtPeriodEnd && (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={canceling}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {canceling ? 'Canceling...' : 'Cancel Subscription'}
                  </button>
                )}
                {subscription.cancelAtPeriodEnd && (
                  <p className="text-sm text-gray-500">
                    Subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="text-center">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Subscription</h2>
              <p className="text-gray-600 mb-6">Choose a plan to unlock premium features</p>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PricingCard
              planId="BASIC"
              onSelect={handlePlanSelect}
              loading={loading}
            />
            <PricingCard
              planId="PREMIUM"
              isPopular
              onSelect={handlePlanSelect}
              loading={loading}
            />
            <PricingCard
              planId="YEARLY_BASIC"
              onSelect={handlePlanSelect}
              loading={loading}
            />
            <PricingCard
              planId="YEARLY_PREMIUM"
              onSelect={handlePlanSelect}
              loading={loading}
            />
          </div>
        </div>

        {/* Subscription History */}
        {subscriptionHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Subscription History</h2>
            <div className="space-y-4">
              {subscriptionHistory.map((sub) => (
                <div key={sub.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(sub.status)}
                      <span className="font-semibold text-gray-900">{sub.planName}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                      {sub.status}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Started: {new Date(sub.createdAt).toLocaleDateString()}</p>
                    {sub.canceledAt && (
                      <p>Canceled: {new Date(sub.canceledAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedPlan && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false)
              setSelectedPlan(null)
            }}
            planId={selectedPlan}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  )
}
