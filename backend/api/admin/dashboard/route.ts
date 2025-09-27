import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, createSuccessResponse } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || 'month'
    const batchId = searchParams.get('batchId')

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Build where clause for batch filtering
    const whereClause = batchId ? { batchId } : {}

    // Get basic statistics
    const [
      totalUsers,
      totalMentors,
      totalContests,
      activeBatches,
      recentUsers,
      recentContests,
      userGrowthData,
      contestParticipationData
    ] = await Promise.all([
      // Total users
      prisma.user.count({
        where: {
          ...whereClause,
          role: 'STUDENT'
        }
      }),

      // Total mentors
      prisma.mentor.count({
        where: { isActive: true }
      }),

      // Total contests
      prisma.contest.count({
        where: batchId ? { batchId } : {}
      }),

      // Active batches
      prisma.batch.count({
        where: { status: 'ACTIVE' }
      }),

      // Recent users (last 7 days)
      prisma.user.findMany({
        where: {
          ...whereClause,
          role: 'STUDENT',
          createdAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          batch: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),

      // Recent contests
      prisma.contest.findMany({
        where: batchId ? { batchId } : {},
        select: {
          id: true,
          name: true,
          status: true,
          startDate: true,
          endDate: true,
          _count: {
            select: {
              participants: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),

      // User growth data
      prisma.user.groupBy({
        by: ['createdAt'],
        where: {
          ...whereClause,
          role: 'STUDENT',
          createdAt: { gte: startDate }
        },
        _count: {
          id: true
        },
        orderBy: { createdAt: 'asc' }
      }),

      // Contest participation data
      prisma.contestParticipant.groupBy({
        by: ['joinedAt'],
        where: {
          joinedAt: { gte: startDate },
          contest: batchId ? { batchId } : undefined
        },
        _count: {
          id: true
        },
        orderBy: { joinedAt: 'asc' }
      })
    ])

    // Process user growth data for charts
    const userGrowthChart = {
      labels: userGrowthData.map(item => 
        new Date(item.createdAt).toLocaleDateString()
      ),
      data: userGrowthData.map(item => item._count.id)
    }

    // Process contest participation data for charts
    const contestParticipationChart = {
      labels: contestParticipationData.map(item => 
        new Date(item.joinedAt).toLocaleDateString()
      ),
      data: contestParticipationData.map(item => item._count.id)
    }

    // Get mentor activity stats
    const mentorActivity = await prisma.mentor.findMany({
      select: {
        id: true,
        name: true,
        rating: true,
        totalStudents: true,
        batches: {
          select: {
            batch: {
              select: {
                name: true,
                _count: {
                  select: {
                    students: true
                  }
                }
              }
            }
          }
        }
      },
      where: { isActive: true },
      take: 10
    })

    const dashboardData = {
      statistics: {
        totalUsers,
        totalMentors,
        totalContests,
        activeBatches,
        userGrowth: userGrowthChart.data.reduce((a, b) => a + b, 0)
      },
      recentActivity: {
        users: recentUsers,
        contests: recentContests
      },
      charts: {
        userGrowth: userGrowthChart,
        contestParticipation: contestParticipationChart
      },
      mentorActivity
    }

    return createSuccessResponse(dashboardData, 'Dashboard data retrieved successfully')

  } catch (error: any) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
})
