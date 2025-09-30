import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, type = 'VERIFICATION' } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store OTP in database
    await prisma.oTP.create({
      data: {
        email,
        code: otp,
        type,
        expiresAt
      }
    })

    // Send email
    const subject = type === 'VERIFICATION' 
      ? 'Verify your SkillPort account' 
      : 'Reset your SkillPort password'
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">SkillPort Community</h2>
        <p>Your verification code is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #dc2626; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `

    const emailSent = await sendEmail({
      to: email,
      subject,
      html
    })

    // In development, if email fails, we still return success but log the OTP
    if (!emailSent) {
      console.log(`🔐 OTP for ${email}: ${otp}`)
      console.log(`📧 Email sending failed, but OTP is stored in database`)
    }

    return NextResponse.json({ 
      success: true, 
      message: emailSent ? 'OTP sent successfully' : 'OTP generated (check console for development)',
      otp: !emailSent ? otp : undefined // Include OTP in response for development
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
