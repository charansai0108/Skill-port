import { NextRequest, NextResponse } from 'next/server'
import { generatePasswordResetToken } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'
import { createResponse, createErrorResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return createErrorResponse('Email is required', 400)
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email, status: 'ACTIVE' }
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return createResponse(
        { message: 'If an account with that email exists, a password reset link has been sent.' },
        200,
        'Password reset email sent'
      )
    }

    // Generate reset token
    const token = await generatePasswordResetToken(email)

    if (!token) {
      return createErrorResponse('Failed to generate reset token', 500)
    }

    // Send reset email
    const emailSent = await sendPasswordResetEmail(email, token, user.name)

    if (!emailSent) {
      return createErrorResponse('Failed to send password reset email', 500)
    }

    return createResponse(
      { message: 'If an account with that email exists, a password reset link has been sent.' },
      200,
      'Password reset email sent'
    )

  } catch (error) {
    console.error('Forgot password error:', error)
    return createErrorResponse('Failed to process password reset request', 500)
  }
}
