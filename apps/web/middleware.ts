import { NextRequest, NextResponse } from 'next/server'
import { authRateLimit, apiRateLimit, emailRateLimit } from '@/lib/rate-limit'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.razorpay.com; frame-src 'self' https://api.razorpay.com;"
  )
  
  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // Rate limiting based on path
  const { pathname } = request.nextUrl
  
  // Auth endpoints
  if (pathname.startsWith('/api/auth/')) {
    const rateLimitResponse = authRateLimit(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
  }
  
  // Email endpoints
  if (pathname.includes('/forgot-password') || pathname.includes('/verify-email')) {
    const rateLimitResponse = emailRateLimit(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
  }
  
  // General API endpoints
  if (pathname.startsWith('/api/')) {
    const rateLimitResponse = apiRateLimit(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
