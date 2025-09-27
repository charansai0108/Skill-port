import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentStudent(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const userId = user.id

    // Get recent activities from various sources
    const [submissions, contestParticipations, feedbacks, notifications] = await prisma.$transaction([
      // Recent submissions
      prisma.submission.findMany({
        where: { userId },
        orderBy: { submittedAt: 'desc' },
        take: 10,
        include: {
          problem: { select: { title: true } },
          contest: { select: { title: true } }
        }
      }),
      
      // Recent contest participations
      prisma.contestParticipant.findMany({
        where: { userId },
        orderBy: { joinedAt: 'desc' },
        take: 5,
        include: {
          contest: { select: { title: true } }
        }
      }),
      
      // Recent feedback
      prisma.feedback.findMany({
        where: { studentId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          mentor: { select: { name: true } },
          contest: { select: { title: true } }
        }
      }),
      
      // Recent notifications
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ])

    // Transform data into activity feed format
    const activities: any[] = []

    // Add submissions
    submissions.forEach((submission: any) => {
      activities.push({
        id: `submission-${submission.id}`,
        type: 'submission',
        title: 'Problem Submission',
        description: `Submitted solution for "${submission.problem.title}"`,
        timestamp: submission.submittedAt.toISOString(),
        data: {
          problemId: submission.problemId,
          problemTitle: submission.problem.title,
          status: submission.status,
          score: submission.score,
          contestId: submission.contestId,
          contestTitle: submission.contest?.title
        },
        userId: submission.userId
      })
    })

    // Add contest participations
    contestParticipations.forEach((participation: any) => {
      activities.push({
        id: `contest-${participation.id}`,
        type: 'contest',
        title: 'Contest Participation',
        description: `Joined contest "${participation.contest.title}"`,
        timestamp: participation.joinedAt.toISOString(),
        data: {
          contestId: participation.contestId,
          contestTitle: participation.contest.title,
          status: participation.status,
          score: participation.score,
          rank: participation.rank
        },
        userId: participation.userId
      })
    })

    // Add feedback
    feedbacks.forEach((feedback: any) => {
      activities.push({
        id: `feedback-${feedback.id}`,
        type: 'feedback',
        title: 'Feedback Received',
        description: `Received feedback from ${feedback.mentor.name}`,
        timestamp: feedback.createdAt.toISOString(),
        data: {
          mentorId: feedback.mentorId,
          mentorName: feedback.mentor.name,
          rating: feedback.rating,
          category: feedback.category,
          contestId: feedback.contestId,
          contestTitle: feedback.contest?.title
        },
        userId: feedback.studentId
      })
    })

    // Add notifications
    notifications.forEach((notification: any) => {
      activities.push({
        id: `notification-${notification.id}`,
        type: 'general',
        title: notification.title,
        description: notification.message,
        timestamp: notification.createdAt.toISOString(),
        data: notification.data,
        userId: notification.userId
      })
    })

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Limit to 50 activities
    const limitedActivities = activities.slice(0, 50)

    return createResponse(
      { activities: limitedActivities },
      200,
      'Activity feed retrieved successfully'
    )

  } catch (error) {
    console.error('Get activity feed error:', error)
    return createErrorResponse('Failed to retrieve activity feed', 500)
  }
}
