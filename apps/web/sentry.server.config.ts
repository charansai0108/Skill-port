import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Set tracesSampleRate to 1.0 to capture 100% of the transactions for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Set sampleRate to 1.0 to capture 100% of the errors for testing
  sampleRate: 1.0,
  
  // Capture unhandled promise rejections
  captureUnhandledRejections: true,
  
  // Capture uncaught exceptions
  captureUncaughtException: true,
  
  // Set user context
  beforeSend(event, hint) {
    // Filter out certain errors in development
    if (process.env.NODE_ENV === 'development') {
      // Don't send console errors in development
      if (event.exception) {
        const error = hint.originalException
        if (error instanceof Error && error.message.includes('console.error')) {
          return null
        }
      }
    }
    
    return event
  },
  
  // Add custom tags
  initialScope: {
    tags: {
      component: 'skillport-server'
    }
  },
  
  // Integrations
  integrations: [
    // Use the new integrations API
    Sentry.httpIntegration({ tracing: true }),
    Sentry.expressIntegration({ app: undefined }),
    Sentry.prismaIntegration({ client: undefined }),
  ],
})
