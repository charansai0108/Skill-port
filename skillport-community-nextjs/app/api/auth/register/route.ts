import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken, generateEmailVerificationToken } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'
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

    const { name, email, password, role, phone, bio } = validation.data

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
        role,
        phone,
        bio,
        emailVerified: false
      }
    })

    // Generate email verification token
    const verificationToken = await generateEmailVerificationToken(email)

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken, name)

    if (!emailSent) {
      console.error('Failed to send verification email to:', email)
      // Don't fail registration if email fails, just log it
    }

    // Generate JWT token (but user needs to verify email to use it)
    const token = generateToken(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic
      },
      'student'
    )

    return createResponse(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified
        },
        token,
        message: 'Registration successful. Please check your email to verify your account.'
      },
      201,
      'User registered successfully'
    )

  } catch (error) {
    console.error('Registration error:', error)
    return createErrorResponse('Failed to register user', 500)
  }
}
