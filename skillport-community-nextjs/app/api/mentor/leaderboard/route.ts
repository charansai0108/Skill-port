import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withMentorAuth, MentorAuthRequest } from '@/lib/mentor-middleware'
import { validateData, validateQueryParams, leaderboardFilterSchema, paginationSchema } from '@/lib/mentor-validation'

const prisma = new PrismaClient()

// Cache for leaderboard data
const leaderboardCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

export const GET = withMentorAuth(async (request: MentorAuthRequest) => {
  try {
    const mentorId = request.mentor!.id
    const { searchParams } = new URL(request.url)

    // Validate query parameters
    const filterValidation = validateQueryParams(leaderboardFilterSchema, searchParams)
    const paginationValidation = validateQueryParams(paginationSchema, searchParams)

    if (!filterValidation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid filter parameters', errors: filterValidation.errors },
        { status: 400 }
      )
    }

    if (!paginationValidation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid pagination parameters', errors: paginationValidation.errors },
        { status: 400 }
      )
    }

    const filters = filterValidation.data
    const pagination = paginationValidation.data

    // Create cache key
    const cacheKey = `leaderboard_${mentorId}_${JSON.stringify(filters)}_${JSON.stringify(pagination)}`
    const cached = leaderboardCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cached.data
      })
    }

    // Get mentor's assigned batches
    const mentorBatches = await prisma.mentorBatch.findMany({
      where: { mentorId },
      include: { batch: true }
    })
    const batchIds = mentorBatches.map(mb => mb.batchId)

    // Build where clause for contest participants
    const where: any = {
      contest: {
        createdBy: mentorId
      }
    }

    if (filters.contestId) {
      where.contestId = filters.contestId
    }

    if (filters.batchId) {
      where.user = {
        batchId: filters.batchId
      }
    }

    // Apply time range filter
    if (filters.timeRange && filters.timeRange !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (filters.timeRange) {
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
          startDate = new Date(0)
      }

      where.createdAt = { gte: startDate }
    }

    // Get leaderboard data
    const leaderboardData = await prisma.contestParticipant.groupBy({
      by: ['userId'],
      where,
      _sum: {
        score: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          score: 'desc'
        }
      }
    })

    // Get user details for top performers
    const userIds = leaderboardData.map(item => item.userId)
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        batchId: { in: batchIds },
        role: 'STUDENT',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        batch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Combine data and calculate ranks
    const leaderboard = leaderboardData.map((item, index) => {
      const user = users.find(u => u.id === item.userId)
      if (!user) return null

      return {
        id: item.userId,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profilePic: user.profilePic,
          batch: user.batch
        },
        totalScore: item._sum.score || 0,
        contestCount: item._count.id,
        averageScore: item._count.id > 0 ? Math.round((item._sum.score || 0) / item._count.id) : 0,
        rank: index + 1,
        medal: getMedalForRank(index + 1),
        color: getColorForRank(index + 1)
      }
    }).filter(Boolean)

    // Apply pagination
    const startIndex = ((pagination.page || 1) - 1) * (pagination.limit || 20)
    const endIndex = startIndex + (pagination.limit || 20)
    const paginatedLeaderboard = leaderboard.slice(startIndex, endIndex)

    // Get total count
    const totalCount = leaderboard.length

    const result = {
      leaderboard: paginatedLeaderboard,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 20,
        total: totalCount,
        pages: Math.ceil(totalCount / (pagination.limit || 20))
      },
      topPerformers: leaderboard.slice(0, 3), // Top 3 for highlights
      statistics: {
        totalParticipants: totalCount,
        averageScore: leaderboard.length > 0 ? Math.round(leaderboard.reduce((sum, item) => sum + item.averageScore, 0) / leaderboard.length) : 0,
        highestScore: leaderboard.length > 0 ? leaderboard[0].totalScore : 0
      }
    }

    // Cache the result
    leaderboardCache.set(cacheKey, { data: result, timestamp: Date.now() })

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
})

function getMedalForRank(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return ''
}

function getColorForRank(rank: number): string {
  if (rank === 1) return 'from-yellow-400 to-yellow-600'
  if (rank === 2) return 'from-gray-300 to-gray-500'
  if (rank === 3) return 'from-orange-400 to-orange-600'
  return 'from-blue-500 to-blue-600'
}
