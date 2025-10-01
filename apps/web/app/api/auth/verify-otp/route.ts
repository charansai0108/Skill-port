import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyOTP } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    if (!email || !otp) {
      return NextResponse.json({
        error: 'Email and OTP are required'
      }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }

    // Check if already verified
    if (user.isVerified) {
      return NextResponse.json({
        error: 'Account is already verified. Please login.',
        code: 'ALREADY_VERIFIED'
      }, { status: 400 })
    }

    // Verify OTP
    const isValid = await verifyOTP(email, otp)

    if (!isValid) {
      return NextResponse.json({
        error: 'Invalid or expired OTP. Please request a new one.',
        code: 'INVALID_OTP'
      }, { status: 400 })
    }

    // Get updated user data
    const verifiedUser = await prisma.user.findUnique({
      where: { email }
    })

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'EMAIL_VERIFIED',
          details: `User ${email} verified their email successfully`
        }
      })
    } catch (err) {
      console.error('Activity log error:', err)
    }

    // Determine redirect URL based on role
    let redirectUrl = '/personal/dashboard'
    
    switch (verifiedUser?.role) {
      case 'ADMIN':
        redirectUrl = '/admin/dashboard'
        break
      case 'COMMUNITY_ADMIN':
        redirectUrl = '/community/dashboard'
        break
      case 'MENTOR':
        redirectUrl = '/mentor/dashboard'
        break
      case 'STUDENT':
        redirectUrl = '/student/dashboard'
        break
      case 'PERSONAL':
      default:
        redirectUrl = '/auth/login' // Redirect to login for personal users
        break
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      data: {
        email: verifiedUser?.email,
        role: verifiedUser?.role,
        redirectUrl,
        verified: true
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('OTP verification error:', error)
    return NextResponse.json({
      error: 'OTP verification failed',
      details: error.message
    }, { status: 500 })
  }
}
