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

    // Get user's stats
    const stats = {
      totalContests: 0,
      contestsWon: 0,
      problemsSolved: 0,
      currentStreak: 0,
      totalPoints: 0,
      rank: 0
    }

    // Get recent submissions (if you have a submission system)
    const recentSubmissions = await prisma.submission.findMany({
      where: {
        userId: user.id,
        communityId: community.id
      },
      include: {
        contest: {
          select: {
            title: true,
            id: true
          }
        }
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    }).catch(() => []) // Handle case where submission table doesn't exist

    // Get recent contests for this community
    const recentContests = await prisma.contest.findMany({
      where: {
        communityId: community.id,
        status: 'active'
      },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        participants: true
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    }).catch(() => []) // Handle case where contest table doesn't exist

    // Get recent activities (if you have an activity log)
    const recentActivities = await prisma.activityLog.findMany({
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

    // Get notifications (if you have a notification system)
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        communityId: community.id
      },
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        createdAt: true
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    }).catch(() => []) // Handle case where notification table doesn't exist

    const dashboardData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic
      },
      community: {
        id: community.id,
        name: community.name
      },
      stats,
      recentSubmissions,
      recentContests,
      recentActivities,
      notifications
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error fetching user dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data', details: error.message }, { status: 500 })
  }
}
