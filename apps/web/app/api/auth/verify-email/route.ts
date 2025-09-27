import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailToken } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return createErrorResponse('Verification token is required', 400)
    }

    const isValid = await verifyEmailToken(token)

    if (!isValid) {
      return createErrorResponse('Invalid or expired verification token', 400)
    }

    return createResponse(
      { verified: true },
      200,
      'Email verified successfully'
    )

  } catch (error) {
    console.error('Email verification error:', error)
    return createErrorResponse('Failed to verify email', 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return createErrorResponse('Verification token is required', 400)
    }

    const isValid = await verifyEmailToken(token)

    if (!isValid) {
      return createErrorResponse('Invalid or expired verification token', 400)
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/auth/verify-email/success', request.url)
    )

  } catch (error) {
    console.error('Email verification error:', error)
    return createErrorResponse('Failed to verify email', 500)
  }
}
