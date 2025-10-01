import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateOTP, getCurrentUser } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const currentUser = await getCurrentUser(request)
    
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'COMMUNITY_ADMIN')) {
      return NextResponse.json({
        error: 'Unauthorized. Only admins can add mentors.'
      }, { status: 403 })
    }

    const body = await request.json()
    const { name, username, email, subject, password, communityId } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({
        error: 'Name, email, and password are required'
      }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({
        error: 'User already exists with this email'
      }, { status: 400 })
    }

    // Check username uniqueness if provided
    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username }
      })
      if (existingUsername) {
        return NextResponse.json({
          error: 'Username already taken'
        }, { status: 400 })
      }
    }

    // Use admin's community if not specified
    const targetCommunityId = communityId || currentUser.communityId

    if (!targetCommunityId) {
      return NextResponse.json({
        error: 'Community ID is required'
      }, { status: 400 })
    }

    // Verify community exists and admin has access
    const community = await prisma.community.findUnique({
      where: { id: targetCommunityId }
    })

    if (!community) {
      return NextResponse.json({
        error: 'Community not found'
      }, { status: 404 })
    }

    if (currentUser.role === 'COMMUNITY_ADMIN' && community.adminId !== currentUser.id) {
      return NextResponse.json({
        error: 'You can only add mentors to your own community'
      }, { status: 403 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    // Create mentor
    const mentor = await prisma.user.create({
      data: {
        name,
        username: username || email.split('@')[0],
        email,
        password: hashedPassword,
        role: 'MENTOR',
        subject: subject || null,
        communityId: targetCommunityId,
        otpCode: otp,
        otpExpiry,
        isVerified: false // Mentor must verify email
      }
    })

    // Add mentor to community members
    await prisma.communityMember.create({
      data: {
        userId: mentor.id,
        communityId: targetCommunityId,
        role: 'MENTOR'
      }
    })

    // Send verification email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to SkillPort!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            You have been added as a <strong>Mentor</strong> in <strong>${community.name}</strong> community.
            ${subject ? `<br/>Your subject: <strong>${subject}</strong>` : ''}
          </p>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #333; margin-top: 0;">Your Login Details:</h3>
            <p style="color: #666; margin: 5px 0;">
              <strong>Email:</strong> ${email}<br/>
              <strong>Community:</strong> ${community.name}
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            To activate your account, please verify your email using the OTP below:
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #10b981; font-size: 36px; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</h1>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            This OTP will expire in <strong>10 minutes</strong>.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-top: 25px;">
            After verification, you can login with your email and the password provided by your admin.
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 SkillPort. All rights reserved.</p>
        </div>
      </div>
    `

    const emailSent = await sendEmail({
      to: email,
      subject: `Welcome to ${community.name} - Mentor Account Created`,
      html: emailHtml
    })

    // In development, log credentials
    if (!emailSent) {
      console.log(`🔐 Mentor OTP for ${email}: ${otp}`)
    }

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: currentUser.id,
          action: 'MENTOR_ADDED',
          details: `Added mentor ${email} to community ${community.name}`
        }
      })
    } catch (err) {
      console.error('Activity log error:', err)
    }

    return NextResponse.json({
      success: true,
      message: 'Mentor added successfully. Verification email sent.',
      data: {
        id: mentor.id,
        name: mentor.name,
        email: mentor.email,
        role: mentor.role,
        subject: mentor.subject,
        communityId: mentor.communityId
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Add mentor error:', error)
    return NextResponse.json({
      error: 'Failed to add mentor',
      details: error.message
    }, { status: 500 })
  }
}

