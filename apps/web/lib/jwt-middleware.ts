import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromRequest } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: string
    communityId: string | null
    name: string
  }
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const token = getTokenFromRequest(request)

      if (!token) {
        return NextResponse.json({
          error: 'Authentication required. Please login.'
        }, { status: 401 })
      }

      const decoded = verifyToken(token)

      if (!decoded) {
        return NextResponse.json({
          error: 'Invalid or expired token. Please login again.'
        }, { status: 401 })
      }

      // Attach user to request
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.user = {
        id: (decoded as any).id,
        email: (decoded as any).email,
        role: (decoded as any).role,
        communityId: (decoded as any).communityId,
        name: (decoded as any).name
      }

      return handler(authenticatedRequest)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json({
        error: 'Authentication failed'
      }, { status: 401 })
    }
  }
}

/**
 * Middleware to verify JWT token and check for specific roles
 */
export function withRole(roles: string[], handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withAuth(async (request: AuthenticatedRequest) => {
    try {
      if (!request.user) {
        return NextResponse.json({
          error: 'Authentication required'
        }, { status: 401 })
      }

      const hasRole = roles.includes(request.user.role)

      if (!hasRole) {
        return NextResponse.json({
          error: `Access denied. Required roles: ${roles.join(', ')}`
        }, { status: 403 })
      }

      return handler(request)
    } catch (error) {
      console.error('Role middleware error:', error)
      return NextResponse.json({
        error: 'Authorization failed'
      }, { status: 403 })
    }
  })
}

/**
 * Middleware for admin-only routes
 */
export function withAdmin(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withRole(['ADMIN', 'COMMUNITY_ADMIN'], handler)
}

/**
 * Middleware for mentor routes
 */
export function withMentor(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withRole(['MENTOR', 'ADMIN', 'COMMUNITY_ADMIN'], handler)
}

/**
 * Middleware for student routes
 */
export function withStudent(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withRole(['STUDENT', 'MENTOR', 'ADMIN', 'COMMUNITY_ADMIN'], handler)
}

