import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withMentorAuth, MentorAuthRequest } from '@/lib/mentor-middleware'

const prisma = new PrismaClient()

// Cache for dashboard data (in production, use Redis)
const dashboardCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function getDashboardData(mentorId: string) {
  const cacheKey = `dashboard_${mentorId}`
  const cached = dashboardCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  try {
    // Get mentor's assigned batches
    const mentorBatches = await prisma.mentorBatch.findMany({
      where: { mentorId },
      include: { batch: true }
    })
    const batchIds = mentorBatches.map(mb => mb.batchId)

    // Get total students in mentor's batches
    const totalStudents = await prisma.user.count({
      where: {
        batchId: { in: batchIds },
        role: 'STUDENT',
        status: 'ACTIVE'
      }
    })

    // Get total contests created by mentor
    const totalContests = await prisma.contest.count({
      where: { createdBy: mentorId }
    })

    // Get active contests
    const activeContests = await prisma.contest.count({
      where: {
        createdBy: mentorId,
        status: 'ACTIVE'
      }
    })

    // Get completed tasks (assuming tasks are linked to contests)
    const completedTasks = await prisma.contestParticipant.count({
      where: {
        contest: {
          createdBy: mentorId
        },
        status: 'COMPLETED'
      }
    })

    // Get top performing students
    const topStudents = await prisma.user.findMany({
      where: {
        batchId: { in: batchIds },
        role: 'STUDENT',
        status: 'ACTIVE'
      },
      include: {
        contestParticipants: {
          include: {
            contest: {
              where: { createdBy: mentorId }
            }
          }
        }
      },
      take: 5,
      orderBy: {
        contestParticipants: {
          _count: 'desc'
        }
      }
    })

    // Get recent activities
    const recentActivities = await prisma.activityLog.findMany({
      where: {
        userId: mentorId,
        action: {
          in: ['CONTEST_CREATED', 'FEEDBACK_GIVEN', 'STUDENT_ASSIGNED', 'CONTEST_UPDATED']
        }
      },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get contest participation trends (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const participationTrends = await prisma.contestParticipant.groupBy({
      by: ['createdAt'],
      where: {
        contest: {
          createdBy: mentorId,
          createdAt: { gte: thirtyDaysAgo }
        }
      },
      _count: true,
      orderBy: { createdAt: 'asc' }
    })

    // Calculate success rate
    const totalParticipants = await prisma.contestParticipant.count({
      where: {
        contest: { createdBy: mentorId }
      }
    })

    const successRate = totalParticipants > 0 ? Math.round((completedTasks / totalParticipants) * 100) : 0

    const dashboardData = {
      statistics: {
        totalStudents,
        totalContests,
        activeContests,
        completedTasks,
        successRate
      },
      topStudents: topStudents.map(student => ({
        id: student.id,
        name: student.name,
        score: Math.round(Math.random() * 40 + 60), // Mock score calculation
        rank: 0, // Will be calculated on frontend
        color: ['green', 'blue', 'purple', 'orange', 'amber'][Math.floor(Math.random() * 5)]
      })),
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        type: activity.action.toLowerCase(),
        title: getActivityTitle(activity.action),
        description: getActivityDescription(activity.action, activity.details),
        time: getTimeAgo(activity.createdAt),
        icon: getActivityIcon(activity.action),
        color: getActivityColor(activity.action)
      })),
      participationTrends: participationTrends.map(trend => ({
        date: trend.createdAt.toISOString().split('T')[0],
        count: trend._count
      }))
    }

    // Cache the data
    dashboardCache.set(cacheKey, { data: dashboardData, timestamp: Date.now() })

    return dashboardData
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    throw new Error('Failed to fetch dashboard data')
  }
}

function getActivityTitle(action: string): string {
  const titles = {
    'CONTEST_CREATED': 'Created new contest',
    'FEEDBACK_GIVEN': 'Gave feedback to student',
    'STUDENT_ASSIGNED': 'New student assigned',
    'CONTEST_UPDATED': 'Updated contest details'
  }
  return titles[action as keyof typeof titles] || 'Activity performed'
}

function getActivityDescription(action: string, details: any): string {
  const descriptions = {
    'CONTEST_CREATED': 'Contest created successfully',
    'FEEDBACK_GIVEN': 'Provided feedback on student performance',
    'STUDENT_ASSIGNED': 'Student added to your mentorship',
    'CONTEST_UPDATED': 'Contest details modified'
  }
  return descriptions[action as keyof typeof descriptions] || 'Activity completed'
}

function getActivityIcon(action: string): string {
  const icons = {
    'CONTEST_CREATED': 'trophy',
    'FEEDBACK_GIVEN': 'message-circle',
    'STUDENT_ASSIGNED': 'users',
    'CONTEST_UPDATED': 'settings'
  }
  return icons[action as keyof typeof icons] || 'check-circle'
}

function getActivityColor(action: string): string {
  const colors = {
    'CONTEST_CREATED': 'blue',
    'FEEDBACK_GIVEN': 'green',
    'STUDENT_ASSIGNED': 'purple',
    'CONTEST_UPDATED': 'amber'
  }
  return colors[action as keyof typeof colors] || 'blue'
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return `${Math.floor(diffInSeconds / 2592000)} months ago`
}

export const GET = withMentorAuth(async (request: MentorAuthRequest) => {
  try {
    const mentorId = request.mentor!.id
    const dashboardData = await getDashboardData(mentorId)

    return NextResponse.json({
      success: true,
      data: dashboardData
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
})
