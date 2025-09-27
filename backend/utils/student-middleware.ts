import { NextRequest } from 'next/server'
import { getCurrentStudent, StudentUser } from './auth'
import { createErrorResponse } from './api-utils'

export interface AuthenticatedRequest extends NextRequest {
  student: StudentUser
}

/**
 * Middleware to authenticate student requests
 */
export async function withStudentAuth(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<Response>
): Promise<Response> {
  try {
    const student = await getCurrentStudent(request)
    
    if (!student) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Add student to request object
    const authenticatedRequest = Object.assign(request, { student })
    
    return await handler(authenticatedRequest as AuthenticatedRequest)
  } catch (error) {
    console.error('Authentication middleware error:', error)
    return createErrorResponse('Authentication failed', 401)
  }
}

/**
 * Middleware to validate student role access
 */
export async function withStudentRoleAuth(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<Response>,
  allowedRoles: string[] = ['STUDENT']
): Promise<Response> {
  return withStudentAuth(request, async (authenticatedRequest) => {
    if (!allowedRoles.includes(authenticatedRequest.student.role)) {
      return createErrorResponse('Insufficient permissions', 403)
    }
    
    return await handler(authenticatedRequest)
  })
}

/**
 * Higher-order function to wrap API handlers with student authentication
 */
export function requireStudentAuth(
  handler: (request: AuthenticatedRequest) => Promise<Response>
) {
  return async (request: NextRequest) => {
    return withStudentAuth(request, handler)
  }
}

/**
 * Higher-order function to wrap API handlers with role-based authentication
 */
export function requireStudentRole(
  handler: (request: AuthenticatedRequest) => Promise<Response>,
  allowedRoles: string[] = ['STUDENT']
) {
  return async (request: NextRequest) => {
    return withStudentRoleAuth(request, handler, allowedRoles)
  }
}
