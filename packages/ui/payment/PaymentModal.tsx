'use client'

import { useState, useEffect } from 'react'
import { X, CreditCard, Smartphone, Wifi } from 'lucide-react'
import { SUBSCRIPTION_PLANS, SubscriptionPlanId } from '@/lib/razorpay'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  planId: SubscriptionPlanId
  onPaymentSuccess: (subscription: any) => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function PaymentModal({ isOpen, onClose, planId, onPaymentSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderData, setOrderData] = useState<any>(null)
  
  const plan = SUBSCRIPTION_PLANS[planId]

  useEffect(() => {
    if (isOpen && !orderData) {
      createOrder()
    }
  }, [isOpen, planId])

  const createOrder = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          type: 'subscription'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      setOrderData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!orderData) return

    try {
      setLoading(true)
      setError('')

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SkillPort',
        description: `Subscription: ${plan.name}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch('/api/payment/verify-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                planId
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyResponse.ok) {
              onPaymentSuccess(verifyData.subscription)
              onClose()
            } else {
              setError(verifyData.error || 'Payment verification failed')
            }
          } catch (err) {
            setError('Payment verification failed')
          }
        },
        prefill: {
          name: 'User Name', // You can get this from user context
          email: 'user@example.com', // You can get this from user context
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Plan Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{plan.name}</h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Billing</span>
              <span className="font-semibold text-gray-900">
                ₹{plan.price} / {plan.interval === 'yearly' ? 'year' : 'month'}
              </span>
            </div>
            {plan.interval === 'yearly' && (
              <div className="text-sm text-green-600 mt-1">
                Save 2 months free with yearly billing
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="space-y-3 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Payment Methods</h4>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Credit/Debit Card</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                <Smartphone className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">UPI</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                <Wifi className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Net Banking</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={loading || !orderData}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              `Pay ₹${plan.price} ${plan.interval === 'yearly' ? 'per year' : 'per month'}`
            )}
          </button>

          {/* Security Note */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              🔒 Your payment is secure and encrypted. Powered by Razorpay.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
