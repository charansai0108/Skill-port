import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent } from './auth'
import { prisma } from './prisma'
import { SUBSCRIPTION_PLANS } from './razorpay'

export interface SubscriptionLimits {
  dailySubmissions: number
  mentorFeedback: number
  contestParticipation: string
  oneOnOneSessions?: number
}

export async function checkSubscription(
  request: NextRequest,
  requiredFeature?: keyof SubscriptionLimits
): Promise<{
  hasAccess: boolean
  subscription?: any
  limits?: SubscriptionLimits
  error?: string
}> {
  try {
    // Get current user
    const user = await getCurrentStudent(request)
    if (!user) {
      return { hasAccess: false, error: 'Unauthorized' }
    }

    // Get user's active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ['ACTIVE', 'TRIALING']
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // If no subscription, user has basic access (free tier)
    if (!subscription) {
      const freeLimits: SubscriptionLimits = {
        dailySubmissions: 3,
        mentorFeedback: 1,
        contestParticipation: 'limited'
      }
      
      // Check if the required feature is available in free tier
      if (requiredFeature && freeLimits[requiredFeature] === 0) {
        return { 
          hasAccess: false, 
          limits: freeLimits,
          error: 'This feature requires a subscription'
        }
      }
      
      return { 
        hasAccess: true, 
        limits: freeLimits 
      }
    }

    // Get plan details
    const plan = Object.values(SUBSCRIPTION_PLANS).find(
      p => p.id === subscription.planId
    )

    if (!plan) {
      return { 
        hasAccess: false, 
        error: 'Invalid subscription plan' 
      }
    }

    // Check if subscription is expired
    if (subscription.currentPeriodEnd && new Date() > subscription.currentPeriodEnd) {
      return { 
        hasAccess: false, 
        error: 'Subscription has expired' 
      }
    }

    // Check if subscription is canceled and period has ended
    if (subscription.cancelAtPeriodEnd && 
        subscription.currentPeriodEnd && 
        new Date() > subscription.currentPeriodEnd) {
      return { 
        hasAccess: false, 
        error: 'Subscription has been canceled' 
      }
    }

    // Check specific feature access
    if (requiredFeature) {
      const limit = plan.limits[requiredFeature]
      if (limit === 0) {
        return { 
          hasAccess: false, 
          subscription,
          limits: plan.limits,
          error: 'This feature is not available in your current plan'
        }
      }
    }

    return { 
      hasAccess: true, 
      subscription,
      limits: plan.limits 
    }

  } catch (error) {
    console.error('Subscription check error:', error)
    return { 
      hasAccess: false, 
      error: 'Failed to check subscription status' 
    }
  }
}

export function subscriptionMiddleware(
  handler: (request: NextRequest, params?: any) => Promise<NextResponse>,
  requiredFeature?: keyof SubscriptionLimits
) {
  return async (request: NextRequest, params?: any) => {
    const { hasAccess, error, limits } = await checkSubscription(request, requiredFeature)
    
    if (!hasAccess) {
      return NextResponse.json(
        { 
          success: false, 
          error: error || 'Subscription required',
          limits,
          upgradeRequired: true
        },
        { status: 403 }
      )
    }

    return handler(request, params)
  }
}

// Usage examples:
// export const premiumFeatureMiddleware = subscriptionMiddleware(handler, 'oneOnOneSessions')
// export const unlimitedSubmissionsMiddleware = subscriptionMiddleware(handler, 'dailySubmissions')
