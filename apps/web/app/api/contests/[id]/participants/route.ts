import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent } from '@/lib/auth'
import { createResponse, createErrorResponse, parseQueryParams, paginate } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import { getContestProblemsSolved } from '@/lib/student-utils'
import { LeaderboardEntry } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate student
    const student = await getCurrentStudent(request)
    if (!student) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { id: contestId } = await params
    const queryParams = parseQueryParams(request)
    
    const {
      page = '1',
      limit = '50',
      sortBy = 'rank',
      order = 'asc'
    } = queryParams

    // Check if contest exists
    const contest = await prisma.contest.findUnique({
      where: { id: contestId }
    })

    if (!contest) {
      return createErrorResponse('Contest not found', 404)
    }

    // Build order by clause
    const orderBy: any = {}
    if (sortBy === 'rank') {
      orderBy.rank = order
    } else if (sortBy === 'score') {
      orderBy.score = order
    } else if (sortBy === 'name') {
      orderBy.user = { name: order }
    } else {
      orderBy.joinedAt = order
    }

    // Get total count
    const totalCount = await prisma.contestParticipant.count({
      where: { contestId }
    })

    // Get participants with pagination
    const participants = await prisma.contestParticipant.findMany({
      where: { contestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePic: true
          }
        }
      },
      orderBy,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    })

    // Enhanced participants with problems solved count
    const enhancedParticipants: LeaderboardEntry[] = await Promise.all(
      participants.map(async (participant) => {
        const problemsSolved = await getContestProblemsSolved(participant.userId, contestId)
        
        return {
          rank: participant.rank || 0,
          userId: participant.userId,
          name: participant.user.name,
          score: participant.score,
          problemsSolved,
          lastSubmission: participant.submittedAt?.toISOString()
        }
      })
    )

    // Add pagination info
    const paginatedResult = paginate(enhancedParticipants, parseInt(page), parseInt(limit))
    paginatedResult.pagination.total = totalCount
    paginatedResult.pagination.totalPages = Math.ceil(totalCount / parseInt(limit))

    return createResponse({
      participants: enhancedParticipants,
      pagination: paginatedResult.pagination,
      contestInfo: {
        id: contest.id,
        title: contest.title,
        status: contest.status,
        totalParticipants: totalCount
      }
    }, 200, 'Contest participants retrieved successfully')

  } catch (error) {
    console.error('Contest participants API error:', error)
    return createErrorResponse('Failed to retrieve contest participants', 500)
  }
}
