import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withMentorAuth, MentorAuthRequest } from '@/lib/mentor-middleware'
import { validateData, validateQueryParams, createContestSchema, contestFilterSchema, paginationSchema } from '@/lib/mentor-validation'

const prisma = new PrismaClient()

export const GET = withMentorAuth(async (request: MentorAuthRequest) => {
  try {
    const mentorId = request.mentor!.id
    const { searchParams } = new URL(request.url)

    // Validate query parameters
    const filterValidation = validateQueryParams(contestFilterSchema, searchParams)
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

    // Build where clause
    const where: any = {
      createdBy: mentorId
    }

    if (filters.status) {
      where.status = filters.status.toUpperCase()
    }

    if (filters.category) {
      where.category = {
        contains: filters.category,
        mode: 'insensitive'
      }
    }

    if (filters.batchId) {
      where.batchId = filters.batchId
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { category: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    // Get total count for pagination
    const totalCount = await prisma.contest.count({ where })

    // Get contests with pagination
    const contests = await prisma.contest.findMany({
      where,
      include: {
        batch: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        contestParticipants: {
          select: {
            id: true,
            status: true
          }
        },
        _count: {
          select: {
            contestParticipants: true
          }
        }
      },
      orderBy: pagination.sortBy ? {
        [pagination.sortBy]: pagination.sortOrder || 'desc'
      } : { createdAt: 'desc' },
      skip: ((pagination.page || 1) - 1) * (pagination.limit || 10),
      take: pagination.limit || 10
    })

    // Transform data for frontend
    const transformedContests = contests.map(contest => ({
      id: contest.id,
      title: contest.title,
      description: contest.description,
      category: contest.category,
      batch: contest.batch,
      participants: contest._count.contestParticipants,
      startDate: contest.startDate.toISOString().split('T')[0],
      endDate: contest.endDate.toISOString().split('T')[0],
      status: contest.status.toLowerCase(),
      icon: contest.title.charAt(0).toUpperCase(),
      color: getContestColor(contest.category),
      bgColor: getContestBgColor(contest.category),
      createdAt: contest.createdAt,
      updatedAt: contest.updatedAt
    }))

    return NextResponse.json({
      success: true,
      data: {
        contests: transformedContests,
        pagination: {
          page: pagination.page || 1,
          limit: pagination.limit || 10,
          total: totalCount,
          pages: Math.ceil(totalCount / (pagination.limit || 10))
        }
      }
    })
  } catch (error) {
    console.error('Contests fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch contests' },
      { status: 500 }
    )
  }
})

export const POST = withMentorAuth(async (request: MentorAuthRequest) => {
  try {
    const mentorId = request.mentor!.id
    const body = await request.json()

    const validation = validateData(createContestSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.errors },
        { status: 400 }
      )
    }

    const { data } = validation

    // Check for overlapping contests in the same batch
    const overlappingContest = await prisma.contest.findFirst({
      where: {
        batchId: data.batchId,
        status: { in: ['ACTIVE', 'UPCOMING'] },
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(data.startDate) } },
              { endDate: { gte: new Date(data.startDate) } }
            ]
          },
          {
            AND: [
              { startDate: { lte: new Date(data.endDate) } },
              { endDate: { gte: new Date(data.endDate) } }
            ]
          },
          {
            AND: [
              { startDate: { gte: new Date(data.startDate) } },
              { endDate: { lte: new Date(data.endDate) } }
            ]
          }
        ]
      }
    })

    if (overlappingContest) {
      return NextResponse.json(
        { success: false, message: 'A contest already exists in this time range for the selected batch' },
        { status: 400 }
      )
    }

    // Create contest
    const contest = await prisma.contest.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        createdBy: mentorId,
        status: new Date(data.startDate) > new Date() ? 'UPCOMING' : 'ACTIVE'
      },
      include: {
        batch: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    })

    // Log contest creation
    await prisma.activityLog.create({
      data: {
        userId: mentorId,
        action: 'CONTEST_CREATED',
        details: {
          contestId: contest.id,
          contestTitle: contest.title,
          batchId: contest.batchId,
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Contest created successfully',
      data: {
        id: contest.id,
        title: contest.title,
        description: contest.description,
        category: contest.category,
        batch: contest.batch,
        startDate: contest.startDate.toISOString().split('T')[0],
        endDate: contest.endDate.toISOString().split('T')[0],
        status: contest.status.toLowerCase(),
        icon: contest.title.charAt(0).toUpperCase(),
        color: getContestColor(contest.category),
        bgColor: getContestBgColor(contest.category)
      }
    })
  } catch (error) {
    console.error('Contest creation error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create contest' },
      { status: 500 }
    )
  }
})

function getContestColor(category: string): string {
  const colors: { [key: string]: string } = {
    'Algorithms': 'blue',
    'Data Structures': 'purple',
    'Database': 'green',
    'Web Development': 'orange',
    'Mobile Development': 'pink',
    'Machine Learning': 'indigo'
  }
  return colors[category] || 'blue'
}

function getContestBgColor(category: string): string {
  const bgColors: { [key: string]: string } = {
    'Algorithms': 'from-blue-600 to-indigo-600',
    'Data Structures': 'from-purple-500 to-violet-600',
    'Database': 'from-green-500 to-emerald-600',
    'Web Development': 'from-orange-500 to-amber-600',
    'Mobile Development': 'from-pink-500 to-rose-600',
    'Machine Learning': 'from-indigo-500 to-blue-600'
  }
  return bgColors[category] || 'from-blue-600 to-indigo-600'
}
