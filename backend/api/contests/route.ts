import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent } from '@/lib/auth'
import { createResponse, createErrorResponse, parseQueryParams, paginate } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import { ContestData, ContestItem } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // Authenticate student
    const student = await getCurrentStudent(request)
    if (!student) {
      return createErrorResponse('Unauthorized', 401)
    }

    const params = parseQueryParams(request)
    
    // Parse query parameters
    const {
      status,
      difficulty,
      sortBy = 'startDate',
      order = 'desc',
      page = '1',
      limit = '10'
    } = params

    // Build where clause
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    // If no status specified, show active and upcoming contests by default
    if (!status) {
      where.OR = [
        { status: 'ACTIVE' },
        { status: 'UPCOMING' },
        { status: 'COMPLETED' }
      ]
    }

    // Build order by clause
    const orderBy: any = {}
    orderBy[sortBy] = order

    // Get total count
    const totalCount = await prisma.contest.count({ where })

    // Get contests with pagination
    const contests = await prisma.contest.findMany({
      where,
      include: {
        participants: {
          where: { userId: student.id },
          select: { id: true, status: true }
        },
        _count: {
          select: { participants: true }
        }
      },
      orderBy,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    })

    // Format contests
    const formattedContests: ContestItem[] = contests.map(contest => ({
      id: contest.id,
      title: contest.title,
      status: contest.status as 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED',
      startDate: contest.startDate.toISOString(),
      endDate: contest.endDate.toISOString(),
      description: contest.description,
      difficulty: contest.difficulty,
      maxParticipants: contest.maxParticipants,
      currentParticipants: contest._count.participants
    }))

    const contestData: ContestData = {
      contests: formattedContests
    }

    // Add pagination info
    const paginatedResult = paginate(formattedContests, parseInt(page), parseInt(limit))
    paginatedResult.pagination.total = totalCount
    paginatedResult.pagination.totalPages = Math.ceil(totalCount / parseInt(limit))

    return createResponse({
      ...contestData,
      pagination: paginatedResult.pagination
    }, 200, 'Contests retrieved successfully')

  } catch (error) {
    console.error('Contests API error:', error)
    return createErrorResponse('Failed to retrieve contests', 500)
  }
}
