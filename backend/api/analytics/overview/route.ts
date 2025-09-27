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
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get analytics data
    const [
      totalSubmissions,
      acceptedSubmissions,
      totalContests,
      completedContests,
      totalFeedback,
      averageRating,
      totalScore,
      recentActivity
    ] = await prisma.$transaction([
      // Total submissions
      prisma.submission.count({
        where: {
          userId,
          submittedAt: { gte: startDate }
        }
      }),
      
      // Accepted submissions
      prisma.submission.count({
        where: {
          userId,
          status: 'ACCEPTED',
          submittedAt: { gte: startDate }
        }
      }),
      
      // Total contests participated
      prisma.contestParticipant.count({
        where: {
          userId,
          joinedAt: { gte: startDate }
        }
      }),
      
      // Completed contests
      prisma.contestParticipant.count({
        where: {
          userId,
          status: 'COMPLETED',
          joinedAt: { gte: startDate }
        }
      }),
      
      // Total feedback received
      prisma.feedback.count({
        where: {
          studentId: userId,
          createdAt: { gte: startDate }
        }
      }),
      
      // Average rating
      prisma.feedback.aggregate({
        where: {
          studentId: userId,
          createdAt: { gte: startDate },
          rating: { gt: 0 }
        },
        _avg: { rating: true }
      }),
      
      // Total score
      prisma.submission.aggregate({
        where: {
          userId,
          status: 'ACCEPTED',
          submittedAt: { gte: startDate }
        },
        _sum: { score: true }
      }),
      
      // Recent activity count
      prisma.activityLog.count({
        where: {
          userId,
          createdAt: { gte: startDate }
        }
      })
    ])

    // Calculate accuracy
    const accuracy = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0

    // Calculate contest completion rate
    const contestCompletionRate = totalContests > 0 ? (completedContests / totalContests) * 100 : 0

    // Get daily activity data
    const dailyActivity = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM activity_logs 
      WHERE user_id = ${userId} 
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    // Get submission trends
    const submissionTrends = await prisma.$queryRaw`
      SELECT 
        DATE(submitted_at) as date,
        COUNT(*) as total_submissions,
        SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted_submissions
      FROM submissions 
      WHERE user_id = ${userId} 
        AND submitted_at >= ${startDate}
      GROUP BY DATE(submitted_at)
      ORDER BY date ASC
    `

    // Get problem difficulty distribution
    const difficultyDistribution = await prisma.$queryRaw`
      SELECT 
        p.difficulty,
        COUNT(*) as count
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      WHERE s.user_id = ${userId} 
        AND s.submitted_at >= ${startDate}
        AND s.status = 'ACCEPTED'
      GROUP BY p.difficulty
    `

    // Get language usage
    const languageUsage = await prisma.$queryRaw`
      SELECT 
        language,
        COUNT(*) as count
      FROM submissions 
      WHERE user_id = ${userId} 
        AND submitted_at >= ${startDate}
        AND status = 'ACCEPTED'
      GROUP BY language
      ORDER BY count DESC
    `

    const analyticsData = {
      overview: {
        totalSubmissions,
        acceptedSubmissions,
        accuracy: Math.round(accuracy * 100) / 100,
        totalContests,
        completedContests,
        contestCompletionRate: Math.round(contestCompletionRate * 100) / 100,
        totalFeedback,
        averageRating: averageRating._avg.rating || 0,
        totalScore: totalScore._sum.score || 0,
        recentActivity
      },
      trends: {
        dailyActivity,
        submissionTrends,
        difficultyDistribution,
        languageUsage
      },
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    }

    return createResponse(analyticsData, 200, 'Analytics data retrieved successfully')

  } catch (error) {
    console.error('Get analytics overview error:', error)
    return createErrorResponse('Failed to retrieve analytics data', 500)
  }
}
