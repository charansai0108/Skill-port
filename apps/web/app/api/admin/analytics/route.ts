import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin(request)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get date ranges
    const now = new Date()
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get user growth data
    const usersByDay = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: last30Days }
      },
      _count: true
    })

    // Get submission trends
    const submissionsByDay = await prisma.submission.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: last30Days }
      },
      _count: true
    })

    // Get contest participation
    const contestParticipation = await prisma.contestParticipant.groupBy({
      by: ['contestId'],
      _count: true
    })

    // Get role distribution
    const roleDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    })

    // Get batch performance
    const batches = await prisma.batch.findMany({
      include: {
        students: {
          include: {
            submissions: {
              where: { status: 'ACCEPTED' }
            }
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      }
    })

    const batchPerformance = batches.map(batch => ({
      name: batch.name,
      studentCount: batch._count.students,
      avgSolved: batch.students.length > 0
        ? batch.students.reduce((sum, s) => sum + s.submissions.length, 0) / batch.students.length
        : 0
    }))

    // Get platform stats
    const stats = {
      totalUsers: await prisma.user.count(),
      activeUsers: await prisma.user.count({ where: { isActive: true } }),
      totalStudents: await prisma.user.count({ where: { role: 'STUDENT' } }),
      totalMentors: await prisma.user.count({ where: { role: 'MENTOR' } }),
      totalContests: await prisma.contest.count(),
      activeContests: await prisma.contest.count({ where: { status: 'ACTIVE' } }),
      totalSubmissions: await prisma.submission.count(),
      acceptedSubmissions: await prisma.submission.count({ where: { status: 'ACCEPTED' } }),
      totalBatches: await prisma.batch.count()
    }

    // User growth trend (last 7 days)
    const userGrowthData = {
      labels: [],
      data: []
    }

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))
      
      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      })

      userGrowthData.labels.push(dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      userGrowthData.data.push(count)
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        userGrowthData,
        roleDistribution: roleDistribution.map(r => ({
          role: r.role,
          count: r._count
        })),
        batchPerformance,
        submissionTrend: {
          total: stats.totalSubmissions,
          accepted: stats.acceptedSubmissions,
          rate: stats.totalSubmissions > 0 
            ? Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100) 
            : 0
        }
      }
    })

  } catch (error: any) {
    console.error('Analytics API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch analytics',
      details: error.message
    }, { status: 500 })
  }
}
