import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = await getCurrentAdmin(request)
    if (!admin) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

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

    // Get system-wide analytics
    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalContests,
      activeContests,
      totalSubmissions,
      totalFeedback,
      totalRevenue,
      userGrowth,
      contestParticipation,
      submissionTrends,
      feedbackTrends,
      revenueTrends,
      topPerformers,
      popularProblems,
      userEngagement
    ] = await prisma.$transaction([
      // Total users
      prisma.user.count(),
      
      // Active users (users with activity in the period)
      prisma.user.count({
        where: {
          activityLogs: {
            some: {
              createdAt: { gte: startDate }
            }
          }
        }
      }),
      
      // New users in period
      prisma.user.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      // Total contests
      prisma.contest.count(),
      
      // Active contests
      prisma.contest.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      
      // Total submissions
      prisma.submission.count({
        where: {
          submittedAt: { gte: startDate }
        }
      }),
      
      // Total feedback
      prisma.feedback.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      // Total revenue
      prisma.payment.aggregate({
        where: {
          status: 'CAPTURED',
          createdAt: { gte: startDate }
        },
        _sum: { amount: true }
      }),
      
      // User growth over time
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM users 
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      
      // Contest participation
      prisma.$queryRaw`
        SELECT 
          c.title as contest_name,
          COUNT(cp.id) as participants,
          AVG(cp.score) as avg_score
        FROM contests c
        LEFT JOIN contest_participants cp ON c.id = cp.contest_id
        WHERE c.created_at >= ${startDate}
        GROUP BY c.id, c.title
        ORDER BY participants DESC
        LIMIT 10
      `,
      
      // Submission trends
      prisma.$queryRaw`
        SELECT 
          DATE(submitted_at) as date,
          COUNT(*) as total_submissions,
          SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted_submissions
        FROM submissions 
        WHERE submitted_at >= ${startDate}
        GROUP BY DATE(submitted_at)
        ORDER BY date ASC
      `,
      
      // Feedback trends
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as feedback_count,
          AVG(rating) as avg_rating
        FROM feedback 
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      
      // Revenue trends
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as payment_count,
          SUM(amount) as total_amount
        FROM payments 
        WHERE status = 'CAPTURED' 
          AND created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      
      // Top performers
      prisma.$queryRaw`
        SELECT 
          u.name as user_name,
          u.email as user_email,
          COUNT(s.id) as total_submissions,
          SUM(CASE WHEN s.status = 'ACCEPTED' THEN s.score ELSE 0 END) as total_score,
          AVG(f.rating) as avg_rating
        FROM users u
        LEFT JOIN submissions s ON u.id = s.user_id AND s.submitted_at >= ${startDate}
        LEFT JOIN feedback f ON u.id = f.student_id AND f.created_at >= ${startDate}
        WHERE u.role = 'STUDENT'
        GROUP BY u.id, u.name, u.email
        ORDER BY total_score DESC
        LIMIT 10
      `,
      
      // Popular problems
      prisma.$queryRaw`
        SELECT 
          p.title as problem_title,
          p.difficulty,
          COUNT(s.id) as submission_count,
          SUM(CASE WHEN s.status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted_count
        FROM problems p
        LEFT JOIN submissions s ON p.id = s.problem_id AND s.submitted_at >= ${startDate}
        GROUP BY p.id, p.title, p.difficulty
        ORDER BY submission_count DESC
        LIMIT 10
      `,
      
      // User engagement metrics
      prisma.$queryRaw`
        SELECT 
          'daily_active_users' as metric,
          COUNT(DISTINCT user_id) as value
        FROM activity_logs 
        WHERE created_at >= ${startDate}
        UNION ALL
        SELECT 
          'avg_session_duration' as metric,
          AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as value
        FROM activity_logs 
        WHERE created_at >= ${startDate}
        UNION ALL
        SELECT 
          'total_page_views' as metric,
          COUNT(*) as value
        FROM activity_logs 
        WHERE action = 'PAGE_VIEW' AND created_at >= ${startDate}
      `
    ])

    const analyticsData = {
      overview: {
        totalUsers,
        activeUsers,
        newUsers,
        totalContests,
        activeContests,
        totalSubmissions,
        totalFeedback,
        totalRevenue: totalRevenue._sum.amount || 0,
        userGrowthRate: newUsers / Math.max(totalUsers - newUsers, 1) * 100
      },
      trends: {
        userGrowth,
        contestParticipation,
        submissionTrends,
        feedbackTrends,
        revenueTrends
      },
      insights: {
        topPerformers,
        popularProblems,
        userEngagement
      },
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    }

    return createResponse(analyticsData, 200, 'Admin analytics data retrieved successfully')

  } catch (error) {
    console.error('Get admin analytics error:', error)
    return createErrorResponse('Failed to retrieve admin analytics data', 500)
  }
}