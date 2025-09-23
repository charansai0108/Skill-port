import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import { cancelSubscription } from '@/lib/razorpay'
import { z } from 'zod'

const cancelSubscriptionSchema = z.object({
  cancelAtPeriodEnd: z.boolean().default(true)
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentStudent(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const validation = cancelSubscriptionSchema.safeParse(body)
    
    if (!validation.success) {
      return createErrorResponse(
        validation.error.errors.map(e => e.message).join(', '),
        400
      )
    }

    const { cancelAtPeriodEnd } = validation.data

    // Get user's active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ['ACTIVE', 'TRIALING']
        }
      }
    })

    if (!subscription) {
      return createErrorResponse('No active subscription found', 404)
    }

    // Cancel subscription in Razorpay if it has a Razorpay subscription ID
    if (subscription.razorpaySubId) {
      try {
        await cancelSubscription(subscription.razorpaySubId, cancelAtPeriodEnd)
      } catch (error) {
        console.error('Error canceling Razorpay subscription:', error)
        // Continue with database update even if Razorpay fails
      }
    }

    // Update subscription in database
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd,
        status: cancelAtPeriodEnd ? 'ACTIVE' : 'CANCELED',
        canceledAt: cancelAtPeriodEnd ? null : new Date()
      }
    })

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'SUBSCRIPTION_CANCELED',
        details: {
          subscriptionId: subscription.id,
          cancelAtPeriodEnd,
          canceledAt: updatedSubscription.canceledAt
        }
      }
    })

    return createResponse(
      {
        subscription: {
          id: updatedSubscription.id,
          status: updatedSubscription.status,
          cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
          canceledAt: updatedSubscription.canceledAt
        }
      },
      200,
      cancelAtPeriodEnd 
        ? 'Subscription will be canceled at the end of the current period'
        : 'Subscription canceled immediately'
    )

  } catch (error) {
    console.error('Cancel subscription error:', error)
    return createErrorResponse('Failed to cancel subscription', 500)
  }
}
