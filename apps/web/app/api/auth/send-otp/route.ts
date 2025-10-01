import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { generateOTP } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already verified
    if (user.isVerified) {
      return NextResponse.json({
        error: 'Account is already verified. Please login.',
        code: 'ALREADY_VERIFIED'
      }, { status: 400 })
    }

    // Generate new OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Update user with new OTP
    await prisma.user.update({
      where: { email },
      data: {
        otpCode: otp,
        otpExpiry
      }
    })

    // Send OTP email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SkillPort Verification</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${user.name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Your new verification code is:
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</h1>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            This code will expire in <strong>10 minutes</strong>.
          </p>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 SkillPort. All rights reserved.</p>
        </div>
      </div>
    `

    const emailSent = await sendEmail({
      to: email,
      subject: 'SkillPort - Your Verification Code',
      html: emailHtml
    })

    // In development, log OTP if email fails
    if (!emailSent) {
      console.log(`🔐 OTP for ${email}: ${otp}`)
    }

    return NextResponse.json({ 
      success: true, 
      message: emailSent ? 'OTP sent successfully to your email' : 'OTP generated (check console in dev mode)',
      ...((!emailSent) && { otp, devMode: true })
    }, { status: 200 })

  } catch (error: any) {
    console.error('Send OTP error:', error)
    return NextResponse.json({
      error: 'Failed to send OTP',
      details: error.message
    }, { status: 500 })
  }
}
