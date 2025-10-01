import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateOTP, saveOTP, generateCommunityCode } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { generateUniqueSlug } from '@/lib/slugify'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, username, email, password, role, communityName } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 })
    }

    // Check username uniqueness if provided
    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username }
      })
      if (existingUsername) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Handle different registration types
    let user
    let community = null

    if (role === 'ADMIN') {
      // Admin Registration - Create community automatically
      if (!communityName) {
        return NextResponse.json({ error: 'Community name is required for admin registration' }, { status: 400 })
      }

      // Create user first
      user = await prisma.user.create({
        data: {
          name,
          username: username || email.split('@')[0],
          email,
          password: hashedPassword,
          role: 'ADMIN',
          otpCode: otp,
          otpExpiry,
          isVerified: false
        }
      })

      // Create community with slug
      const communityCode = generateCommunityCode()
      const slug = generateUniqueSlug(communityName)
      
      community = await prisma.community.create({
        data: {
          name: communityName,
          slug,
          description: `${communityName} Learning Community`,
          type: 'public',
          isPublic: true,
          adminId: user.id,
          communityCode
        }
      })

      // Update user with communityId
      user = await prisma.user.update({
        where: { id: user.id },
        data: { communityId: community.id }
      })

    } else if (role === 'PERSONAL' || !role) {
      // Personal User Registration - Simple self-registration
      user = await prisma.user.create({
        data: {
          name,
          username: username || email.split('@')[0],
          email,
          password: hashedPassword,
          role: 'PERSONAL',
          otpCode: otp,
          otpExpiry,
          isVerified: false
        }
      })

    } else {
      // MENTOR and STUDENT cannot self-register
      return NextResponse.json({
        error: 'Mentors and students cannot self-register. They must be added by a community admin.'
      }, { status: 403 })
    }

    // Send OTP email
    const emailSubject = role === 'ADMIN' || role === 'COMMUNITY_ADMIN'
      ? `Welcome to SkillPort - Verify Your Community Admin Account`
      : `Welcome to SkillPort - Verify Your Account`

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to SkillPort!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Thank you for registering with SkillPort! To complete your registration, please verify your email address using the OTP below:
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</h1>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            This OTP will expire in <strong>10 minutes</strong>.
          </p>
          
          ${community ? `
            <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #0066cc; margin: 0; font-weight: bold;">🎉 Your Community Has Been Created!</p>
              <p style="color: #333; margin: 10px 0 0 0;">
                <strong>Community:</strong> ${community.name}<br/>
                <strong>Community Code:</strong> <span style="font-size: 18px; color: #667eea; font-family: 'Courier New', monospace;">${community.communityCode}</span><br/>
                <small style="color: #666;">Share this code with students and mentors to join your community</small>
              </p>
            </div>
          ` : ''}
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If you didn't create this account, you can safely ignore this email.
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 SkillPort. All rights reserved.</p>
        </div>
      </div>
    `

    const emailSent = await sendEmail({
      to: email,
      subject: emailSubject,
      html: emailHtml
    })

    // In development, log OTP if email fails
    if (!emailSent) {
      console.log(`🔐 OTP for ${email}: ${otp}`)
      if (community) {
        console.log(`🏢 Community Code: ${community.communityCode}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email for OTP verification.',
      data: {
        email: user.email,
        role: user.role,
        requiresOTP: true,
        communityCode: community?.communityCode,
        communitySlug: community?.slug,
        // Include OTP in dev mode if email failed
        ...((!emailSent) && { otp, devMode: true })
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json({
      error: 'Registration failed',
      details: error.message
    }, { status: 500 })
  }
}
