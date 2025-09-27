import Razorpay from 'razorpay'
import crypto from 'crypto'

// Initialize Razorpay only if credentials are available
let razorpay: Razorpay | null = null

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

export { razorpay }

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'basic',
    name: 'Basic Plan',
    description: 'Perfect for individual learners',
    price: 299, // ₹299 per month
    currency: 'INR',
    interval: 'monthly',
    features: [
      'Access to all contests',
      'Basic feedback from mentors',
      'Progress tracking',
      'Community access',
      '5 submissions per day'
    ],
    limits: {
      dailySubmissions: 5,
      mentorFeedback: 2,
      contestParticipation: 'unlimited'
    }
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium Plan',
    description: 'For serious learners and professionals',
    price: 599, // ₹599 per month
    currency: 'INR',
    interval: 'monthly',
    features: [
      'Everything in Basic',
      'Priority mentor feedback',
      'Advanced analytics',
      'Unlimited submissions',
      '1-on-1 mentoring sessions',
      'Early contest access',
      'Custom study plans'
    ],
    limits: {
      dailySubmissions: -1, // unlimited
      mentorFeedback: 10,
      contestParticipation: 'unlimited',
      oneOnOneSessions: 2
    }
  },
  YEARLY_BASIC: {
    id: 'yearly_basic',
    name: 'Basic Plan (Yearly)',
    description: 'Basic plan with 2 months free',
    price: 2990, // ₹2990 per year (2 months free)
    currency: 'INR',
    interval: 'yearly',
    features: [
      'Everything in Basic',
      '2 months free',
      'Priority support',
      'Yearly progress report'
    ],
    limits: {
      dailySubmissions: 5,
      mentorFeedback: 2,
      contestParticipation: 'unlimited'
    }
  },
  YEARLY_PREMIUM: {
    id: 'yearly_premium',
    name: 'Premium Plan (Yearly)',
    description: 'Premium plan with 2 months free',
    price: 5990, // ₹5990 per year (2 months free)
    currency: 'INR',
    interval: 'yearly',
    features: [
      'Everything in Premium',
      '2 months free',
      'Priority support',
      'Yearly progress report',
      'Exclusive yearly contests'
    ],
    limits: {
      dailySubmissions: -1,
      mentorFeedback: 10,
      contestParticipation: 'unlimited',
      oneOnOneSessions: 2
    }
  }
} as const

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS

// Generate Razorpay order
export async function createRazorpayOrder(amount: number, currency: string = 'INR', receipt?: string) {
  if (!razorpay) {
    throw new Error('Razorpay is not configured')
  }

  const options = {
    amount: amount * 100, // Razorpay expects amount in paise
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
    notes: {
      source: 'skillport_web'
    }
  }

  try {
    const order = await razorpay.orders.create(options)
    return order
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    throw new Error('Failed to create payment order')
  }
}

// Verify payment signature
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const body = razorpayOrderId + '|' + razorpayPaymentId
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')

  return expectedSignature === razorpaySignature
}

// Create subscription
export async function createRazorpaySubscription(
  planId: string,
  customerId: string,
  totalCount?: number
) {
  if (!razorpay) {
    throw new Error('Razorpay is not configured')
  }

  const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId)
  if (!plan) {
    throw new Error('Invalid subscription plan')
  }

  const options = {
    plan_id: planId,
    customer_id: customerId,
    total_count: totalCount || (plan.interval === 'yearly' ? 1 : 12), // 1 for yearly, 12 for monthly
    quantity: 1,
    notes: {
      source: 'skillport_web',
      plan_name: plan.name
    }
  }

  try {
    const subscription = await razorpay.subscriptions.create(options)
    return subscription
  } catch (error) {
    console.error('Error creating Razorpay subscription:', error)
    throw new Error('Failed to create subscription')
  }
}

// Get subscription details
export async function getSubscriptionDetails(subscriptionId: string) {
  if (!razorpay) {
    throw new Error('Razorpay is not configured')
  }

  try {
    const subscription = await razorpay.subscriptions.fetch(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error fetching subscription:', error)
    throw new Error('Failed to fetch subscription details')
  }
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string, cancelAtCycleEnd: boolean = true) {
  if (!razorpay) {
    throw new Error('Razorpay is not configured')
  }

  try {
    const subscription = await razorpay.subscriptions.cancel(subscriptionId, {
      cancel_at_cycle_end: cancelAtCycleEnd
    })
    return subscription
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw new Error('Failed to cancel subscription')
  }
}

// Get payment details
export async function getPaymentDetails(paymentId: string) {
  if (!razorpay) {
    throw new Error('Razorpay is not configured')
  }

  try {
    const payment = await razorpay.payments.fetch(paymentId)
    return payment
  } catch (error) {
    console.error('Error fetching payment:', error)
    throw new Error('Failed to fetch payment details')
  }
}

// Generate invoice
export async function generateInvoice(
  customerId: string,
  amount: number,
  currency: string = 'INR',
  description?: string
) {
  if (!razorpay) {
    throw new Error('Razorpay is not configured')
  }

  const options = {
    type: 'invoice',
    description: description || 'SkillPort Subscription',
    customer: {
      id: customerId
    },
    amount: amount * 100, // Convert to paise
    currency,
    receipt: `invoice_${Date.now()}`,
    notes: {
      source: 'skillport_web'
    }
  }

  try {
    const invoice = await razorpay.invoices.create(options)
    return invoice
  } catch (error) {
    console.error('Error creating invoice:', error)
    throw new Error('Failed to create invoice')
  }
}
