import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentMentor } from '@/lib/auth'

export const GET = async (request: NextRequest, { params }: { params: { slug: string } }) => {
  try {
    const { slug } = params
    const mentor = await getCurrentMentor(request)

    if (!mentor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the community by slug
    const community = await prisma.community.findUnique({
      where: { slug },
      select: { id: true, name: true }
    })

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    // Verify mentor belongs to this community
    if (mentor.communityId !== community.id) {
      return NextResponse.json({ error: 'Forbidden: Not your community' }, { status: 403 })
    }

    // Get mentor's assigned students
    const assignedStudents = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        communityId: community.id,
        // Add mentor assignment logic here if you have a mentor-student relationship table
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        createdAt: true
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    })

    // Get recent feedbacks (if you have a feedback system)
    const recentFeedbacks = await prisma.feedback.findMany({
      where: {
        mentorId: mentor.id,
        communityId: community.id
      },
      include: {
        student: {
          select: {
            name: true,
            email: true
          }
        }
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    }).catch(() => []) // Handle case where feedback table doesn't exist

    // Get recent contests (if you have a contest system)
    const recentContests = await prisma.contest.findMany({
      where: {
        communityId: community.id
      },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        status: true
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    }).catch(() => []) // Handle case where contest table doesn't exist

    // Get notifications (if you have a notification system)
    const notifications = await prisma.notification.findMany({
      where: {
        userId: mentor.id,
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

    // Calculate stats
    const stats = {
      assignedStudents: assignedStudents.length,
      totalFeedbacks: recentFeedbacks.length,
      pendingFeedbacks: recentFeedbacks.filter(f => !f.isRead).length,
      activeContests: recentContests.filter(c => c.status === 'active').length,
      totalNotifications: notifications.length,
      unreadNotifications: notifications.filter(n => !n.isRead).length
    }

    const dashboardData = {
      user: {
        id: mentor.id,
        name: mentor.name,
        email: mentor.email,
        role: mentor.role,
        profilePic: mentor.profilePic
      },
      community: {
        id: community.id,
        name: community.name
      },
      stats,
      assignedStudents,
      recentFeedbacks,
      recentContests,
      notifications
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error fetching mentor dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data', details: error.message }, { status: 500 })
  }
}
