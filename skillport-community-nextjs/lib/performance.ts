import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'
import { trackPerformance } from './analytics'

// Performance monitoring configuration
const PERFORMANCE_THRESHOLDS = {
  CLS: 0.1,      // Cumulative Layout Shift
  FID: 100,      // First Input Delay (ms)
  FCP: 1800,     // First Contentful Paint (ms)
  LCP: 2500,     // Largest Contentful Paint (ms)
  TTFB: 600,     // Time to First Byte (ms)
} as const

// Track Web Vitals
export const trackWebVitals = () => {
  if (typeof window === 'undefined') return

  // Track Cumulative Layout Shift (CLS)
  getCLS((metric) => {
    trackPerformance('CLS', metric.value)
    
    if (metric.value > PERFORMANCE_THRESHOLDS.CLS) {
      console.warn('Poor CLS score:', metric.value)
    }
  })

  // Track First Input Delay (FID)
  getFID((metric) => {
    trackPerformance('FID', metric.value)
    
    if (metric.value > PERFORMANCE_THRESHOLDS.FID) {
      console.warn('Poor FID score:', metric.value)
    }
  })

  // Track First Contentful Paint (FCP)
  getFCP((metric) => {
    trackPerformance('FCP', metric.value)
    
    if (metric.value > PERFORMANCE_THRESHOLDS.FCP) {
      console.warn('Poor FCP score:', metric.value)
    }
  })

  // Track Largest Contentful Paint (LCP)
  getLCP((metric) => {
    trackPerformance('LCP', metric.value)
    
    if (metric.value > PERFORMANCE_THRESHOLDS.LCP) {
      console.warn('Poor LCP score:', metric.value)
    }
  })

  // Track Time to First Byte (TTFB)
  getTTFB((metric) => {
    trackPerformance('TTFB', metric.value)
    
    if (metric.value > PERFORMANCE_THRESHOLDS.TTFB) {
      console.warn('Poor TTFB score:', metric.value)
    }
  })
}

// Track custom performance metrics
export const trackCustomMetrics = () => {
  if (typeof window === 'undefined') return

  // Track page load time
  window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
    trackPerformance('page_load_time', loadTime)
  })

  // Track DOM content loaded time
  window.addEventListener('DOMContentLoaded', () => {
    const domContentLoadedTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
    trackPerformance('dom_content_loaded_time', domContentLoadedTime)
  })

  // Track resource loading times
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'resource') {
        const resourceEntry = entry as PerformanceResourceTiming
        trackPerformance('resource_load_time', resourceEntry.duration, 'ms')
        
        // Track specific resource types
        if (resourceEntry.name.includes('.js')) {
          trackPerformance('js_load_time', resourceEntry.duration, 'ms')
        } else if (resourceEntry.name.includes('.css')) {
          trackPerformance('css_load_time', resourceEntry.duration, 'ms')
        } else if (resourceEntry.name.includes('.png') || resourceEntry.name.includes('.jpg')) {
          trackPerformance('image_load_time', resourceEntry.duration, 'ms')
        }
      }
    }
  })

  observer.observe({ entryTypes: ['resource'] })

  // Track navigation timing
  const navigationObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'navigation') {
        const navEntry = entry as PerformanceNavigationTiming
        trackPerformance('navigation_time', navEntry.duration, 'ms')
        trackPerformance('dns_lookup_time', navEntry.domainLookupEnd - navEntry.domainLookupStart, 'ms')
        trackPerformance('tcp_connection_time', navEntry.connectEnd - navEntry.connectStart, 'ms')
        trackPerformance('request_time', navEntry.responseEnd - navEntry.requestStart, 'ms')
        trackPerformance('response_time', navEntry.responseEnd - navEntry.responseStart, 'ms')
      }
    }
  })

  navigationObserver.observe({ entryTypes: ['navigation'] })
}

// Track API performance
export const trackApiPerformance = async <T>(
  apiCall: () => Promise<T>,
  endpoint: string,
  method: string = 'GET'
): Promise<T> => {
  const startTime = performance.now()
  
  try {
    const result = await apiCall()
    const duration = performance.now() - startTime
    
    trackPerformance('api_response_time', duration, 'ms')
    trackPerformance('api_success', 1, 'count')
    
    return result
  } catch (error) {
    const duration = performance.now() - startTime
    
    trackPerformance('api_response_time', duration, 'ms')
    trackPerformance('api_error', 1, 'count')
    
    throw error
  }
}

// Track component render time
export const trackComponentRender = (componentName: string, renderTime: number) => {
  trackPerformance(`component_${componentName}_render_time`, renderTime, 'ms')
}

// Track user interaction performance
export const trackInteractionPerformance = (interactionType: string, duration: number) => {
  trackPerformance(`interaction_${interactionType}_time`, duration, 'ms')
}

// Track memory usage
export const trackMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory
    
    trackPerformance('memory_used', memory.usedJSHeapSize, 'bytes')
    trackPerformance('memory_total', memory.totalJSHeapSize, 'bytes')
    trackPerformance('memory_limit', memory.jsHeapSizeLimit, 'bytes')
  }
}

// Track network information
export const trackNetworkInfo = () => {
  if (typeof window !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection
    
    trackPerformance('connection_type', connection.effectiveType, 'string')
    trackPerformance('connection_downlink', connection.downlink, 'mbps')
    trackPerformance('connection_rtt', connection.rtt, 'ms')
  }
}

// Initialize performance monitoring
export const initializePerformanceMonitoring = () => {
  if (typeof window === 'undefined') return

  // Track Web Vitals
  trackWebVitals()
  
  // Track custom metrics
  trackCustomMetrics()
  
  // Track memory usage every 30 seconds
  setInterval(trackMemoryUsage, 30000)
  
  // Track network info on page load
  trackNetworkInfo()
  
  // Track performance on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      trackPerformance('page_visibility_visible', 1, 'count')
    } else {
      trackPerformance('page_visibility_hidden', 1, 'count')
    }
  })
}

// Performance monitoring hook for React components
export const usePerformanceMonitoring = (componentName: string) => {
  const startTime = performance.now()
  
  return {
    trackRender: () => {
      const renderTime = performance.now() - startTime
      trackComponentRender(componentName, renderTime)
    }
  }
}
