import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const GET = async (request: NextRequest) => {
  try {
    const user = await getCurrentUser(request)
    
    if (!user || user.role !== 'PERSONAL') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's profile data
    const profileData = {
      id: user.id,
      firstName: user.name.split(' ')[0] || '',
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      username: user.username || user.email.split('@')[0],
      email: user.email,
      phone: user.phone || '',
      bio: user.bio || '',
      location: user.location || '',
      profileImage: user.profilePic || '',
      joinDate: user.createdAt,
      lastActive: user.lastLoginAt || user.updatedAt,
      isEmailVerified: user.isVerified || false,
      isActive: user.isActive || false
    }

    // Get user's learning goals (if you have a goals system)
    const learningGoals = await prisma.learningGoal.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        category: true,
        progress: true,
        target: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []) // Handle case where learning goals table doesn't exist

    // Get user's achievements (if you have an achievements system)
    const achievements = await prisma.achievement.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        earnedAt: true,
        communityId: true
      },
      orderBy: { earnedAt: 'desc' }
    }).catch(() => []) // Handle case where achievements table doesn't exist

    // Get user's community memberships
    const communityMemberships = await prisma.communityMember.findMany({
      where: { userId: user.id },
      include: {
        community: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            isPublic: true,
            slug: true,
            _count: {
              select: {
                members: true
              }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    })

    // Get user's recent activity
    const recentActivity = await prisma.activityLog.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        action: true,
        description: true,
        createdAt: true,
        communityId: true
      },
      take: 20,
      orderBy: { createdAt: 'desc' }
    }).catch(() => []) // Handle case where activity log doesn't exist

    // Get user's privacy settings (if you have a privacy settings system)
    const privacySettings = await prisma.privacySettings.findUnique({
      where: { userId: user.id },
      select: {
        profileVisibility: true,
        showEmail: true,
        showPhone: true,
        showLocation: true,
        allowMentorProgress: true,
        publicProfile: true,
        theme: true
      }
    }).catch(() => null) // Handle case where privacy settings table doesn't exist

    return NextResponse.json({
      success: true,
      data: {
        profile: profileData,
        learningGoals,
        achievements,
        communityMemberships: communityMemberships.map(cm => cm.community),
        recentActivity,
        privacySettings: privacySettings || {
          profileVisibility: 'public',
          showEmail: false,
          showPhone: false,
          showLocation: false,
          allowMentorProgress: true,
          publicProfile: true,
          theme: 'light'
        }
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error fetching personal profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile data', details: error.message }, { status: 500 })
  }
}

export const PUT = async (request: NextRequest) => {
  try {
    const user = await getCurrentUser(request)
    
    if (!user || user.role !== 'PERSONAL') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, username, bio, phone, location, profileImage } = body

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: `${firstName} ${lastName}`.trim(),
        username: username || user.username,
        bio: bio || user.bio,
        phone: phone || user.phone,
        location: location || user.location,
        profilePic: profileImage || user.profilePic
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        bio: true,
        location: true,
        profilePic: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: updatedUser.id,
          firstName: updatedUser.name.split(' ')[0] || '',
          lastName: updatedUser.name.split(' ').slice(1).join(' ') || '',
          username: updatedUser.username,
          email: updatedUser.email,
          phone: updatedUser.phone,
          bio: updatedUser.bio,
          location: updatedUser.location,
          profileImage: updatedUser.profilePic,
          joinDate: updatedUser.createdAt,
          lastActive: updatedUser.updatedAt
        }
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error updating personal profile:', error)
    return NextResponse.json({ error: 'Failed to update profile', details: error.message }, { status: 500 })
  }
}
