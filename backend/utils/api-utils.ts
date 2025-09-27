import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from './types'

// Helper function to create API responses
export function createResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message
    },
    { status }
  )
}

export function createErrorResponse(
  error: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error
    },
    { status }
  )
}

// Helper function to get user ID from request (for authentication)
export function getUserIdFromRequest(request: NextRequest): string | null {
  // In a real app, this would extract user ID from JWT token or session
  // For now, we'll use a header or query parameter
  const userId = request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId')
  return userId
}

// Helper function to validate request body
export function validateRequestBody<T>(
  body: any,
  requiredFields: (keyof T)[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      errors.push(`${String(field)} is required`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Helper function to handle async API routes
export function withErrorHandling(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      return await handler(request)
    } catch (error) {
      console.error('API Error:', error)
      return createErrorResponse(
        error instanceof Error ? error.message : 'Internal server error',
        500
      )
    }
  }
}

// Helper function to parse query parameters
export function parseQueryParams(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const params: Record<string, string> = {}
  
  for (const [key, value] of searchParams.entries()) {
    params[key] = value
  }
  
  return params
}

// Helper function to paginate results
export function paginate<T>(
  items: T[],
  page: number = 1,
  limit: number = 10
) {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  
  return {
    items: items.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
      hasNext: endIndex < items.length,
      hasPrev: page > 1
    }
  }
}
