import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json({
        error: 'Email and password are required'
      }, { status: 400 })
    }

    // Find user by email with community data
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        communities: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        error: 'Invalid email or password'
      }, { status: 401 })
    }

    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json({
        error: 'Please verify your email first. Check your inbox for the OTP.',
        code: 'NOT_VERIFIED',
        email: user.email
      }, { status: 403 })
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({
        error: 'Your account has been deactivated. Please contact support.'
      }, { status: 403 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({
        error: 'Invalid email or password'
      }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken(user)

    // Get community slug for admin, mentor, and student users
    let communitySlug = null
    if (user.role === 'ADMIN') {
      const community = user.communities[0] // Admin creates community, so they own it
      communitySlug = community?.slug
    } else if (user.role === 'MENTOR' && user.communityId) {
      // For mentors, get their community by communityId
      const community = await prisma.community.findUnique({
        where: { id: user.communityId },
        select: { slug: true }
      })
      communitySlug = community?.slug
    } else if (user.role === 'STUDENT' && user.communityId) {
      // For students, get their community by communityId
      const community = await prisma.community.findUnique({
        where: { id: user.communityId },
        select: { slug: true }
      })
      communitySlug = community?.slug
    } else if (user.role === 'PERSONAL') {
      // For personal users, get their first joined community
      const communityMember = await prisma.communityMember.findFirst({
        where: { userId: user.id },
        include: {
          community: {
            select: { slug: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      })
      communitySlug = communityMember?.community?.slug
    }

    // Determine redirect URL based on role
    let redirectUrl = '/personal/dashboard'
    
    switch (user.role) {
      case 'ADMIN':
        // Redirect to their community's admin dashboard
        redirectUrl = communitySlug 
          ? `/community/${communitySlug}/dashboard`
          : '/admin/dashboard' // Fallback to old route if no community
        break
      case 'MENTOR':
        redirectUrl = communitySlug 
          ? `/community/${communitySlug}/mentor/dashboard`
          : '/mentor/dashboard' // Fallback to old route if no community
        break
      case 'STUDENT':
        redirectUrl = communitySlug 
          ? `/community/${communitySlug}/user/dashboard`
          : '/student/dashboard' // Fallback to old route if no community
        break
      case 'PERSONAL':
      default:
        redirectUrl = communitySlug 
          ? `/community/${communitySlug}/user/dashboard`
          : '/personal/dashboard' // Fallback to old route if no community
        break
    }

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'USER_LOGIN',
          details: `User ${user.email} logged in successfully`
        }
      })
    } catch (err) {
      // Don't fail login if activity log fails
      console.error('Activity log error:', err)
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePic: user.profilePic,
          communityId: user.communityId,
          batchId: user.batchId,
          communitySlug
        },
        token,
        redirectUrl
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({
      error: 'Login failed',
      details: error.message
    }, { status: 500 })
  }
}
