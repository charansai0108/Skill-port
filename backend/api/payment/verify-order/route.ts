import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent } from '@/lib/auth'
import { verifyPaymentSignature, getPaymentDetails, SUBSCRIPTION_PLANS } from '@/lib/razorpay'
import { createResponse, createErrorResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const verifyOrderSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
  planId: z.enum(['BASIC', 'PREMIUM', 'YEARLY_BASIC', 'YEARLY_PREMIUM'])
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentStudent(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const validation = verifyOrderSchema.safeParse(body)
    
    if (!validation.success) {
      return createErrorResponse(
        validation.error.errors.map(e => e.message).join(', '),
        400
      )
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId } = validation.data

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    )

    if (!isValidSignature) {
      return createErrorResponse('Invalid payment signature', 400)
    }

    // Get payment details from Razorpay
    const paymentDetails = await getPaymentDetails(razorpayPaymentId)
    
    if (paymentDetails.status !== 'captured') {
      return createErrorResponse('Payment not captured', 400)
    }

    // Get plan details
    const plan = SUBSCRIPTION_PLANS[planId]
    if (!plan) {
      return createErrorResponse('Invalid subscription plan', 400)
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ['ACTIVE', 'TRIALING']
        }
      }
    })

    if (existingSubscription) {
      return createErrorResponse('User already has an active subscription', 400)
    }

    // Create subscription in database
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(
          Date.now() + (plan.interval === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
        )
      }
    })

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        subscriptionId: subscription.id,
        razorpayOrderId,
        razorpayPaymentId,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        status: 'CAPTURED',
        method: paymentDetails.method,
        description: `Subscription payment for ${plan.name}`,
        receipt: paymentDetails.receipt,
        notes: {
          planId: plan.id,
          planName: plan.name,
          interval: plan.interval
        }
      }
    })

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'SUBSCRIPTION_CREATED',
        details: {
          planId: plan.id,
          planName: plan.name,
          amount: paymentDetails.amount,
          currency: paymentDetails.currency
        }
      }
    })

    return createResponse(
      {
        subscription: {
          id: subscription.id,
          planId: subscription.planId,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd
        },
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method
        }
      },
      200,
      'Payment verified and subscription created successfully'
    )

  } catch (error) {
    console.error('Verify order error:', error)
    return createErrorResponse('Failed to verify payment', 500)
  }
}
