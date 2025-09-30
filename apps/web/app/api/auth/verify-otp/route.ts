import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, code, type = 'VERIFICATION' } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
    }

    // Find valid OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        code,
        type,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { used: true }
    })

    // If verification, mark user as verified
    if (type === 'VERIFICATION') {
      await prisma.user.update({
        where: { email },
        data: { emailVerified: true }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'OTP verified successfully' 
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 })
  }
}
