import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  max: number
  windowMs: number
  message: string
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest) => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const windowMs = config.windowMs
    const max = config.max

    const key = `${ip}:${Math.floor(now / windowMs)}`
    const current = rateLimitMap.get(key)

    if (!current) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
      return null
    }

    if (now > current.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
      return null
    }

    if (current.count >= max) {
      return NextResponse.json(
        { 
          success: false, 
          error: config.message,
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': Math.max(0, max - current.count - 1).toString(),
            'X-RateLimit-Reset': new Date(current.resetTime).toISOString(),
          }
        }
      )
    }

    current.count++
    rateLimitMap.set(key, current)
    return null
  }
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 60000) // Clean up every minute

// Predefined rate limiters
export const authRateLimit = rateLimit({
  max: 50, // Increased for testing
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many authentication attempts, please try again later'
})

export const apiRateLimit = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many API requests, please try again later'
})

export const emailRateLimit = rateLimit({
  max: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many email requests, please try again later'
})
