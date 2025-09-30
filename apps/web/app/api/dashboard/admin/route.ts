import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get platform-wide statistics
    const totalUsers = await prisma.user.count()
    const totalStudents = await prisma.user.count({
      where: { role: 'STUDENT' }
    })
    const totalMentors = await prisma.user.count({
      where: { role: 'MENTOR' }
    })
    const totalContests = await prisma.contest.count()
    const totalSubmissions = await prisma.submission.count()
    const totalCommunities = await prisma.community.count()

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    // Get recent contests
    const recentContests = await prisma.contest.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            participants: true,
            submissions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get recent submissions
    const recentSubmissions = await prisma.submission.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        contest: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get recent communities
    const recentCommunities = await prisma.community.findMany({
      include: {
        admin: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get activity logs
    const recentActivities = await prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Get notifications
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
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
        totalUsers,
        totalStudents,
        totalMentors,
        totalContests,
        totalSubmissions,
        totalCommunities,
        activeUsers: totalUsers // All users are considered active in the new schema
      },
      recentUsers,
      recentContests,
      recentSubmissions,
      recentCommunities,
      recentActivities,
      notifications
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
