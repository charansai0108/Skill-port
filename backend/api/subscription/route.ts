import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import { SUBSCRIPTION_PLANS } from '@/lib/razorpay'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentStudent(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Get user's current subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ['ACTIVE', 'TRIALING', 'PAST_DUE']
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        payments: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      }
    })

    // Get subscription history
    const subscriptionHistory = await prisma.subscription.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        payments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    // Get plan details if subscription exists
    let planDetails = null
    if (subscription) {
      planDetails = Object.values(SUBSCRIPTION_PLANS).find(
        plan => plan.id === subscription.planId
      )
    }

    return createResponse(
      {
        currentSubscription: subscription ? {
          id: subscription.id,
          planId: subscription.planId,
          planName: planDetails?.name || subscription.planId,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          createdAt: subscription.createdAt,
          planDetails: planDetails
        } : null,
        subscriptionHistory: subscriptionHistory.map(sub => ({
          id: sub.id,
          planId: sub.planId,
          status: sub.status,
          createdAt: sub.createdAt,
          canceledAt: sub.canceledAt,
          payments: sub.payments.map(payment => ({
            id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            method: payment.method,
            createdAt: payment.createdAt
          }))
        }))
      },
      200,
      'Subscription details retrieved successfully'
    )

  } catch (error) {
    console.error('Get subscription error:', error)
    return createErrorResponse('Failed to retrieve subscription details', 500)
  }
}
