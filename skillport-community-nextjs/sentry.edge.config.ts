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
  
  // Add custom tags
  initialScope: {
    tags: {
      component: 'skillport-edge'
    }
  },
})
