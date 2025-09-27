import { NextRequest, NextResponse } from 'next/server'
import { resetPassword, verifyPasswordResetToken } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-utils'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = resetPasswordSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(
        validation.error.errors.map(e => e.message).join(', '),
        400
      )
    }

    const { token, password } = validation.data

    // Verify token is valid
    const userId = await verifyPasswordResetToken(token)
    if (!userId) {
      return createErrorResponse('Invalid or expired reset token', 400)
    }

    // Reset password
    const success = await resetPassword(token, password)

    if (!success) {
      return createErrorResponse('Failed to reset password', 500)
    }

    return createResponse(
      { success: true },
      200,
      'Password reset successfully'
    )

  } catch (error) {
    console.error('Reset password error:', error)
    return createErrorResponse('Failed to reset password', 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return createErrorResponse('Reset token is required', 400)
    }

    const userId = await verifyPasswordResetToken(token)

    if (!userId) {
      return createErrorResponse('Invalid or expired reset token', 400)
    }

    return createResponse(
      { valid: true },
      200,
      'Reset token is valid'
    )

  } catch (error) {
    console.error('Token validation error:', error)
    return createErrorResponse('Failed to validate reset token', 500)
  }
}
