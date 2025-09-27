import { NextRequest, NextResponse } from 'next/server'
import { authenticateStudentWithVerification, generateToken } from '@/lib/auth'
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

    // Authenticate user with email verification check
    const user = await authenticateStudentWithVerification(email, password)

    if (!user) {
      return createErrorResponse('Invalid credentials', 401)
    }

    // Generate JWT token
    const token = generateToken(user, 'student')

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
    
    if (error instanceof Error && error.message === 'EMAIL_NOT_VERIFIED') {
      return createErrorResponse('Please verify your email before logging in', 403)
    }
    
    return createErrorResponse('Login failed', 500)
  }
}
