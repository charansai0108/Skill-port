import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-utils'
import { registerSchema, validateInput } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = validateInput(registerSchema, body)
    if (!validation.success) {
      return createErrorResponse(validation.errors.join(', '), 400)
    }

    const { name, email, password, role } = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return createErrorResponse('User with this email already exists', 409)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    })

    // Send OTP for email verification
    const otpResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        type: 'VERIFICATION'
      }),
    })

    if (!otpResponse.ok) {
      console.error('Failed to send OTP, but user was created')
    }

    return createResponse(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified
        },
        message: 'Registration successful. Please check your email for verification code.'
      },
      201,
      'User registered successfully'
    )

  } catch (error) {
    console.error('Registration error:', error)
    return createErrorResponse('Failed to register user', 500)
  }
}
