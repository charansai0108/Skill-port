import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentStudent } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentStudent(request)
    
    if (!user || user.role !== 'MENTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get assigned students (users who have received feedback from this mentor)
    const assignedStudents = await prisma.user.findMany({
      where: {
        studentFeedbacks: {
          some: {
            mentorId: user.id
          }
        }
      },
      include: {
        submissions: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            submissions: true,
            studentFeedbacks: true
          }
        }
      },
      take: 10
    })

    // Get recent feedback given
    const recentFeedbacks = await prisma.feedback.findMany({
      where: { mentorId: user.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        submission: {
          select: {
            id: true,
            title: true,
            platform: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get pending feedback requests
    const pendingFeedbacks = await prisma.feedback.findMany({
      where: { 
        mentorId: user.id,
        status: 'PENDING'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        submission: {
          select: {
            id: true,
            title: true,
            platform: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Get mentor's contests
    const contests = await prisma.contest.findMany({
      where: { createdById: user.id },
      include: {
        _count: {
          select: {
            participants: true,
            submissions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const dashboardData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic
      },
      stats: {
        assignedStudents: assignedStudents.length,
        totalFeedbacks: recentFeedbacks.length,
        pendingFeedbacks: pendingFeedbacks.length,
        activeContests: contests.length
      },
      assignedStudents,
      recentFeedbacks,
      pendingFeedbacks,
      contests,
      notifications
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Mentor dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
