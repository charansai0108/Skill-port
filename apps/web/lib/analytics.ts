import { getCookie, setCookie } from 'cookies-next'

// Google Analytics configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// Analytics event types
export const ANALYTICS_EVENTS = {
  // User events
  USER_REGISTERED: 'user_registered',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_PROFILE_UPDATED: 'user_profile_updated',
  
  // Contest events
  CONTEST_VIEWED: 'contest_viewed',
  CONTEST_JOINED: 'contest_joined',
  CONTEST_LEFT: 'contest_left',
  CONTEST_SUBMISSION: 'contest_submission',
  CONTEST_COMPLETED: 'contest_completed',
  
  // Learning events
  PROBLEM_VIEWED: 'problem_viewed',
  PROBLEM_SOLVED: 'problem_solved',
  PROBLEM_ATTEMPTED: 'problem_attempted',
  FEEDBACK_REQUESTED: 'feedback_requested',
  FEEDBACK_RECEIVED: 'feedback_received',
  
  // Subscription events
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
  
  // Community events
  COMMUNITY_JOINED: 'community_joined',
  COMMUNITY_LEFT: 'community_left',
  POST_CREATED: 'post_created',
  POST_LIKED: 'post_liked',
  COMMENT_CREATED: 'comment_created',
  
  // Navigation events
  PAGE_VIEW: 'page_view',
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  
  // Error events
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
  VALIDATION_ERROR: 'validation_error'
} as const

// Track page view
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_location: url,
      page_title: title
    })
  }
}

// Track custom event
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'engagement',
      ...parameters
    })
  }
}

// Track user engagement
export const trackEngagement = (action: string, category: string, label?: string, value?: number) => {
  trackEvent('engagement', {
    event_category: category,
    event_label: label,
    value: value,
    custom_parameter: action
  })
}

// Track conversion
export const trackConversion = (conversionType: string, value: number, currency = 'INR') => {
  trackEvent('conversion', {
    event_category: 'ecommerce',
    currency: currency,
    value: value,
    conversion_type: conversionType
  })
}

// Track user properties
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      user_properties: properties
    })
  }
}

// Track user ID
export const setUserId = (userId: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      user_id: userId
    })
  }
}

// Track session duration
export const trackSessionDuration = () => {
  const startTime = Date.now()
  
  const trackDuration = () => {
    const duration = Math.round((Date.now() - startTime) / 1000)
    trackEvent('session_duration', {
      duration: duration
    })
  }
  
  // Track on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', trackDuration)
  }
  
  return trackDuration
}

// Track performance metrics
export const trackPerformance = (metricName: string, value: number, unit = 'ms') => {
  trackEvent('performance_metric', {
    metric_name: metricName,
    metric_value: value,
    metric_unit: unit
  })
}

// Track error
export const trackError = (error: Error, context?: Record<string, any>) => {
  trackEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
    error_message: error.message,
    error_stack: error.stack,
    ...context
  })
}

// Track API call
export const trackApiCall = (endpoint: string, method: string, statusCode: number, duration: number) => {
  trackEvent('api_call', {
    endpoint: endpoint,
    method: method,
    status_code: statusCode,
    duration: duration
  })
}

// Track contest activity
export const trackContestActivity = (action: string, contestId: string, additionalData?: Record<string, any>) => {
  trackEvent(action, {
    event_category: 'contest',
    contest_id: contestId,
    ...additionalData
  })
}

// Track learning activity
export const trackLearningActivity = (action: string, problemId: string, additionalData?: Record<string, any>) => {
  trackEvent(action, {
    event_category: 'learning',
    problem_id: problemId,
    ...additionalData
  })
}

// Track subscription activity
export const trackSubscriptionActivity = (action: string, planId: string, value?: number) => {
  trackEvent(action, {
    event_category: 'subscription',
    plan_id: planId,
    value: value,
    currency: 'INR'
  })
}

// Get client ID for analytics
export const getClientId = (): string => {
  if (typeof window === 'undefined') return ''
  
  let clientId = getCookie('_ga')
  if (!clientId) {
    clientId = `GA1.2.${Date.now()}.${Math.random().toString(36).substr(2, 9)}`
    setCookie('_ga', clientId, { maxAge: 60 * 60 * 24 * 365 * 2 }) // 2 years
  }
  
  return clientId.toString()
}

// Initialize analytics
export const initializeAnalytics = () => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    // Load Google Analytics script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`
    document.head.appendChild(script)
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    window.gtag = gtag
    
    gtag('js', new Date())
    gtag('config', GA_TRACKING_ID, {
      page_location: window.location.href,
      page_title: document.title
    })
  }
}

// Declare global gtag function
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}
