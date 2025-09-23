import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent } from '@/lib/auth'
import { createRazorpayOrder, SUBSCRIPTION_PLANS, SubscriptionPlanId } from '@/lib/razorpay'
import { createResponse, createErrorResponse } from '@/lib/api-utils'
import { z } from 'zod'

const createOrderSchema = z.object({
  planId: z.enum(['BASIC', 'PREMIUM', 'YEARLY_BASIC', 'YEARLY_PREMIUM']),
  type: z.enum(['subscription', 'one_time']).default('subscription')
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentStudent(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const validation = createOrderSchema.safeParse(body)
    
    if (!validation.success) {
      return createErrorResponse(
        validation.error.errors.map(e => e.message).join(', '),
        400
      )
    }

    const { planId, type } = validation.data

    // Get plan details
    const plan = SUBSCRIPTION_PLANS[planId as SubscriptionPlanId]
    if (!plan) {
      return createErrorResponse('Invalid subscription plan', 400)
    }

    // Create Razorpay order
    const order = await createRazorpayOrder(
      plan.price,
      plan.currency,
      `order_${user.id}_${Date.now()}`
    )

    return createResponse(
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        plan: {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          currency: plan.currency,
          interval: plan.interval,
          features: plan.features
        }
      },
      200,
      'Payment order created successfully'
    )

  } catch (error) {
    console.error('Create order error:', error)
    return createErrorResponse('Failed to create payment order', 500)
  }
}
