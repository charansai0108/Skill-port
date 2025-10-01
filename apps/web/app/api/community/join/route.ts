import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateOTP } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, communityCode } = body

    // Validate required fields
    if (!name || !email || !password || !communityCode) {
      return NextResponse.json({
        error: 'Name, email, password, and community code are required'
      }, { status: 400 })
    }

    // Find community by code
    const community = await prisma.community.findUnique({
      where: { communityCode },
      include: {
        allowedEmails: true
      }
    })

    if (!community) {
      return NextResponse.json({
        error: 'Invalid community code'
      }, { status: 404 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // Check if already in this community
      const existingMember = await prisma.communityMember.findFirst({
        where: {
          userId: existingUser.id,
          communityId: community.id
        }
      })

      if (existingMember) {
        return NextResponse.json({
          error: 'You are already a member of this community'
        }, { status: 400 })
      }

      return NextResponse.json({
        error: 'User already exists with this email. Please login instead.'
      }, { status: 400 })
    }

    // Check community privacy
    if (!community.isPublic || community.type === 'private') {
      // For private communities, check if email is in allowed list
      const isAllowed = community.allowedEmails.some(
        allowed => allowed.email.toLowerCase() === email.toLowerCase()
      )

      if (!isAllowed) {
        return NextResponse.json({
          error: 'This is a private community. Your email is not authorized to join. Please contact the community admin.',
          code: 'NOT_AUTHORIZED'
        }, { status: 403 })
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    // Find batch if email is in allowed list
    const allowedEmail = community.allowedEmails.find(
      allowed => allowed.email.toLowerCase() === email.toLowerCase()
    )

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        username: email.split('@')[0],
        email,
        password: hashedPassword,
        role: 'STUDENT', // Default role for community join
        communityId: community.id,
        batchId: allowedEmail?.batchId || null,
        otpCode: otp,
        otpExpiry,
        isVerified: false
      }
    })

    // Add to community members
    await prisma.communityMember.create({
      data: {
        userId: user.id,
        communityId: community.id,
        role: 'STUDENT'
      }
    })

    // Get batch info if assigned
    const batch = allowedEmail?.batchId 
      ? await prisma.batch.findUnique({ where: { id: allowedEmail.batchId } })
      : null

    // Send verification email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${community.name}!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Congratulations! You have successfully joined <strong>${community.name}</strong> on SkillPort.
            ${batch ? `<br/>You have been assigned to <strong>${batch.name}</strong>` : ''}
          </p>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h3 style="color: #333; margin-top: 0;">Community Details:</h3>
            <p style="color: #666; margin: 5px 0;">
              <strong>Community:</strong> ${community.name}<br/>
              ${batch ? `<strong>Batch:</strong> ${batch.name}<br/>` : ''}
              <strong>Your Email:</strong> ${email}
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            To activate your account, please verify your email using the OTP below:
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #3b82f6; font-size: 36px; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</h1>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            This OTP will expire in <strong>10 minutes</strong>.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-top: 25px;">
            After verification, you can login with your email and password to access the community dashboard.
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 SkillPort. All rights reserved.</p>
        </div>
      </div>
    `

    const emailSent = await sendEmail({
      to: email,
      subject: `Welcome to ${community.name} - Verify Your Account`,
      html: emailHtml
    })

    // In development, log OTP
    if (!emailSent) {
      console.log(`🔐 OTP for ${email}: ${otp}`)
    }

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'COMMUNITY_JOINED',
          details: `User ${email} joined community ${community.name}`
        }
      })
    } catch (err) {
      console.error('Activity log error:', err)
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the community! Please check your email for OTP verification.',
      data: {
        email: user.email,
        communityName: community.name,
        batchName: batch?.name,
        requiresOTP: true,
        ...((!emailSent) && { otp, devMode: true })
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Community join error:', error)
    return NextResponse.json({
      error: 'Failed to join community',
      details: error.message
    }, { status: 500 })
  }
}

