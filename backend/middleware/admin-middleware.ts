import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin, createActivityLog } from './auth'

export function withAdminAuth(handler: (request: NextRequest, admin: any) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const admin = await getCurrentAdmin(request)
      
      if (!admin) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized. Please login.' },
          { status: 401 }
        )
      }

      return handler(request, admin)
    } catch (error) {
      console.error('Admin middleware error:', error)
      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

export function validateAdminRole(requiredRole: string) {
  return (admin: any) => {
    if (admin.role !== requiredRole && admin.role !== 'super-admin') {
      throw new Error('Insufficient permissions')
    }
  }
}

export function validateRequestBody(requiredFields: string[]) {
  return (body: any) => {
    const missingFields = requiredFields.filter(field => !body[field])
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }
  }
}

export function validatePaginationParams(params: any) {
  const page = Math.max(1, parseInt(params.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 10))
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  )
}

export function createSuccessResponse(data: any, message: string = 'Success') {
  return NextResponse.json(
    { success: true, message, data },
    { status: 200 }
  )
}
