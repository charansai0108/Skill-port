import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, validatePaginationParams, createSuccessResponse, createErrorResponse } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

// GET /api/admin/contests - List contests with pagination and filters
export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = validatePaginationParams({
      page: searchParams.get('page'),
      limit: searchParams.get('limit')
    })

    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const batchId = searchParams.get('batchId') || ''
    const dateRange = searchParams.get('dateRange') || ''

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (batchId) {
      where.batchId = batchId
    }

    if (dateRange) {
      const now = new Date()
      switch (dateRange) {
        case 'upcoming':
          where.startDate = { gt: now }
          break
        case 'active':
          where.startDate = { lte: now }
          where.endDate = { gte: now }
          break
        case 'completed':
          where.endDate = { lt: now }
          break
        case 'thisWeek':
          const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          where.startDate = { gte: weekStart }
          break
        case 'thisMonth':
          const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          where.startDate = { gte: monthStart }
          break
      }
    }

    // Get contests with pagination
    const [contests, totalCount] = await Promise.all([
      prisma.contest.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          startDate: true,
          endDate: true,
          maxParticipants: true,
          createdAt: true,
          batch: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              participants: true
            }
          }
        },
        orderBy: { startDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.contest.count({ where })
    ])

    return createSuccessResponse({
      contests,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    }, 'Contests retrieved successfully')

  } catch (error: any) {
    console.error('Get contests error:', error)
    return createErrorResponse('Failed to fetch contests', 500)
  }
})

// POST /api/admin/contests - Create new contest
export const POST = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const body = await request.json()
    const { name, description, startDate, endDate, batchId, maxParticipants, participantIds } = body

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return createErrorResponse('Missing required fields: name, startDate, endDate')
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      return createErrorResponse('End date must be after start date')
    }

    if (start < new Date()) {
      return createErrorResponse('Start date cannot be in the past')
    }

    // Create contest with participants in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create contest
      const contest = await tx.contest.create({
        data: {
          name,
          description: description || null,
          startDate: start,
          endDate: end,
          batchId: batchId || null,
          maxParticipants: maxParticipants || null
        }
      })

      // Add participants if provided
      if (participantIds && participantIds.length > 0) {
        await tx.contestParticipant.createMany({
          data: participantIds.map((userId: string) => ({
            contestId: contest.id,
            userId
          }))
        })
      }

      return contest
    })

    // Get created contest with details
    const contest = await prisma.contest.findUnique({
      where: { id: result.id },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        maxParticipants: true,
        createdAt: true,
        batch: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            participants: true
          }
        }
      }
    })

    return createSuccessResponse(contest, 'Contest created successfully', 201)

  } catch (error: any) {
    console.error('Create contest error:', error)
    return createErrorResponse('Failed to create contest', 500)
  }
})
