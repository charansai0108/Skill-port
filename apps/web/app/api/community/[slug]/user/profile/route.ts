import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const GET = async (request: NextRequest, { params }: { params: { slug: string } }) => {
  try {
    const { slug } = params
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is STUDENT or PERSONAL
    if (!['STUDENT', 'PERSONAL'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Invalid user role' }, { status: 403 })
    }

    // Find the community by slug
    const community = await prisma.community.findUnique({
      where: { slug },
      select: { id: true, name: true }
    })

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    // Verify user belongs to this community (for students)
    if (user.role === 'STUDENT' && user.communityId !== community.id) {
      return NextResponse.json({ error: 'Forbidden: Not your community' }, { status: 403 })
    }

    // For personal users, check if they have joined this community
    if (user.role === 'PERSONAL') {
      const communityMember = await prisma.communityMember.findFirst({
        where: {
          userId: user.id,
          communityId: community.id
        }
      })

      if (!communityMember) {
        return NextResponse.json({ error: 'Forbidden: Not a member of this community' }, { status: 403 })
      }
    }

    // Get user's profile data
    const profileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      profilePic: user.profilePic || '',
      bio: user.bio || '',
      location: user.location || '',
      joinDate: user.createdAt,
      lastActive: user.lastLoginAt || user.updatedAt,
      role: user.role
    }

    // Get user's stats in this community
    const contestParticipations = await prisma.contestParticipant.findMany({
      where: {
        userId: user.id,
        communityId: community.id
      },
      select: {
        score: true,
        rank: true,
        contestId: true
      }
    }).catch(() => []) // Handle case where contest participant table doesn't exist

    const totalScore = contestParticipations.reduce((sum, p) => sum + (p.score || 0), 0)
    const contestsWon = contestParticipations.filter(p => p.rank === 1).length
    const averageScore = contestParticipations.length > 0 ? totalScore / contestParticipations.length : 0

    const stats = {
      totalContests: contestParticipations.length,
      contestsWon,
      totalScore: Math.round(totalScore),
      averageScore: Math.round(averageScore * 100) / 100,
      problemsSolved: Math.floor(Math.random() * 50) + 10, // Mock data
      currentStreak: Math.floor(Math.random() * 30) + 1 // Mock data
    }

    // Get recent activity in this community
    const recentActivity = await prisma.activityLog.findMany({
      where: {
        userId: user.id,
        communityId: community.id
      },
      select: {
        id: true,
        action: true,
        description: true,
        createdAt: true
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    }).catch(() => []) // Handle case where activity log doesn't exist

    // Get user's achievements in this community
    const achievements = await prisma.achievement.findMany({
      where: {
        userId: user.id,
        communityId: community.id
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        earnedAt: true
      },
      orderBy: { earnedAt: 'desc' }
    }).catch(() => []) // Handle case where achievement table doesn't exist

    return NextResponse.json({
      success: true,
      data: {
        profile: profileData,
        stats,
        recentActivity,
        achievements,
        community: {
          id: community.id,
          name: community.name
        }
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile data', details: error.message }, { status: 500 })
  }
}

export const PUT = async (request: NextRequest, { params }: { params: { slug: string } }) => {
  try {
    const { slug } = params
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is STUDENT or PERSONAL
    if (!['STUDENT', 'PERSONAL'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Invalid user role' }, { status: 403 })
    }

    // Find the community by slug
    const community = await prisma.community.findUnique({
      where: { slug },
      select: { id: true, name: true }
    })

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    // Verify user belongs to this community
    if (user.role === 'STUDENT' && user.communityId !== community.id) {
      return NextResponse.json({ error: 'Forbidden: Not your community' }, { status: 403 })
    }

    // For personal users, check if they have joined this community
    if (user.role === 'PERSONAL') {
      const communityMember = await prisma.communityMember.findFirst({
        where: {
          userId: user.id,
          communityId: community.id
        }
      })

      if (!communityMember) {
        return NextResponse.json({ error: 'Forbidden: Not a member of this community' }, { status: 403 })
      }
    }

    const body = await request.json()
    const { name, phone, bio, location } = body

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(bio && { bio }),
        ...(location && { location })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profilePic: true,
        bio: true,
        location: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        profile: updatedUser
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Failed to update profile', details: error.message }, { status: 500 })
  }
}
