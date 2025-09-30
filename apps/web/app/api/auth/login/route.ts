import { NextRequest, NextResponse } from 'next/server'
import { authenticateStudent, authenticateAdmin, generateToken } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-utils'
import { loginSchema, validateInput } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = validateInput(loginSchema, body)
    if (!validation.success) {
      return createErrorResponse(validation.errors.join(', '), 400)
    }

    const { email, password } = validation.data

    // Authenticate user
    const user = await authenticateStudent(email, password)
    
    if (!user) {
      return createErrorResponse('Invalid credentials', 401)
    }

    // Determine user type based on role
    let userType = 'student'
    if (user.role === 'ADMIN') {
      userType = 'admin'
    }

    // Generate JWT token
    const token = generateToken(user, userType)

    return createResponse(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePic: user.profilePic,
          batchId: user.batchId
        },
        token
      },
      200,
      'Login successful'
    )

  } catch (error) {
    console.error('Login error:', error)
    return createErrorResponse('Login failed', 500)
  }
}
