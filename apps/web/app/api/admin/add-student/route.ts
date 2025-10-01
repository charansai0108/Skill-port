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
        error: 'Unauthorized. Only admins can add students.'
      }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, batchId, batchName, communityId, sendCredentials = true } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({
        error: 'Name and email are required'
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

    // Use admin's community if not specified
    const targetCommunityId = communityId || currentUser.communityId

    if (!targetCommunityId) {
      return NextResponse.json({
        error: 'Community ID is required'
      }, { status: 400 })
    }

    // Verify community exists and admin has access
    const community = await prisma.community.findUnique({
      where: { id: targetCommunityId },
      include: {
        batches: true
      }
    })

    if (!community) {
      return NextResponse.json({
        error: 'Community not found'
      }, { status: 404 })
    }

    if (currentUser.role === 'COMMUNITY_ADMIN' && community.adminId !== currentUser.id) {
      return NextResponse.json({
        error: 'You can only add students to your own community'
      }, { status: 403 })
    }

    // Handle batch
    let targetBatchId = batchId
    
    if (!targetBatchId && batchName) {
      // Create new batch if batch name provided
      const newBatch = await prisma.batch.create({
        data: {
          name: batchName,
          communityId: targetCommunityId
        }
      })
      targetBatchId = newBatch.id
    } else if (!targetBatchId && community.batches.length > 0) {
      // Use first batch as default
      targetBatchId = community.batches[0].id
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8).toUpperCase()
    const hashedPassword = await hashPassword(tempPassword)

    // Generate OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours for students

    // Create student - NOT verified yet, must set password and verify OTP
    const student = await prisma.user.create({
      data: {
        name,
        username: email.split('@')[0],
        email,
        password: hashedPassword,
        role: 'STUDENT',
        communityId: targetCommunityId,
        batchId: targetBatchId || null,
        otpCode: otp,
        otpExpiry,
        isVerified: false
      }
    })

    // Add student to community members
    await prisma.communityMember.create({
      data: {
        userId: student.id,
        communityId: targetCommunityId,
        role: 'STUDENT'
      }
    })

    // Add student to allowed emails (for private communities)
    await prisma.communityAllowedEmail.create({
      data: {
        email,
        communityId: targetCommunityId,
        batchId: targetBatchId,
        role: 'STUDENT'
      }
    }).catch(() => {
      // Ignore if already exists
    })

    // Send activation email
    if (sendCredentials) {
      const batch = targetBatchId ? await prisma.batch.findUnique({ where: { id: targetBatchId } }) : null
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to SkillPort!</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              You have been enrolled as a <strong>Student</strong> in <strong>${community.name}</strong>.
              ${batch ? `<br/>Your batch: <strong>${batch.name}</strong>` : ''}
            </p>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #333; margin-top: 0;">Your Account Details:</h3>
              <p style="color: #666; margin: 5px 0;">
                <strong>Email:</strong> ${email}<br/>
                <strong>Community:</strong> ${community.name}<br/>
                ${batch ? `<strong>Batch:</strong> ${batch.name}<br/>` : ''}
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              To activate your account, please verify your email using the OTP below:
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h1 style="color: #3b82f6; font-size: 36px; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</h1>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              This OTP will expire in <strong>24 hours</strong>.
            </p>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="color: #92400e; margin: 0;">
                <strong>⚠️ Important:</strong> After verification, you'll be able to set your own password. 
                Your temporary password is: <strong style="font-family: 'Courier New', monospace;">${tempPassword}</strong>
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-top: 25px;">
              After verification, you can login with your email and either set a new password or use the temporary password.
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0;">© 2024 SkillPort. All rights reserved.</p>
          </div>
        </div>
      `

      await sendEmail({
        to: email,
        subject: `Welcome to ${community.name} - Student Account Created`,
        html: emailHtml
      })
    }

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: currentUser.id,
          action: 'STUDENT_ADDED',
          details: `Added student ${email} to community ${community.name}`
        }
      })
    } catch (err) {
      console.error('Activity log error:', err)
    }

    return NextResponse.json({
      success: true,
      message: 'Student added successfully. Activation email sent.',
      data: {
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role,
        batchId: student.batchId,
        communityId: student.communityId,
        tempPassword: sendCredentials ? tempPassword : undefined
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Add student error:', error)
    return NextResponse.json({
      error: 'Failed to add student',
      details: error.message
    }, { status: 500 })
  }
}

