import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, createSuccessResponse, createErrorResponse } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

// GET /api/admin/contests/[id]/participants - Get contest participants
export const GET = withAdminAuth(async (request: NextRequest, admin, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const skip = (page - 1) * limit

    // Check if contest exists
    const contest = await prisma.contest.findUnique({
      where: { id }
    })

    if (!contest) {
      return createErrorResponse('Contest not found', 404)
    }

    // Get participants with pagination
    const [participants, totalCount] = await Promise.all([
      prisma.contestParticipant.findMany({
        where: { contestId: id },
        select: {
          id: true,
          score: true,
          rank: true,
          joinedAt: true,
          completedAt: true,
          user: {
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
          }
        },
        orderBy: { score: 'desc' },
        skip,
        take: limit
      }),
      prisma.contestParticipant.count({
        where: { contestId: id }
      })
    ])

    return createSuccessResponse({
      participants,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    }, 'Contest participants retrieved successfully')

  } catch (error: any) {
    console.error('Get contest participants error:', error)
    return createErrorResponse('Failed to fetch contest participants', 500)
  }
})

// POST /api/admin/contests/[id]/participants - Add participants to contest
export const POST = withAdminAuth(async (request: NextRequest, admin, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const body = await request.json()
    const { userIds } = body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return createErrorResponse('userIds array is required')
    }

    // Check if contest exists
    const contest = await prisma.contest.findUnique({
      where: { id }
    })

    if (!contest) {
      return createErrorResponse('Contest not found', 404)
    }

    // Check if users exist
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true }
    })

    if (users.length !== userIds.length) {
      return createErrorResponse('One or more users not found', 404)
    }

    // Add participants (ignore duplicates)
    const participants = await prisma.contestParticipant.createMany({
      data: userIds.map((userId: string) => ({
        contestId: id,
        userId
      })),
      skipDuplicates: true
    })

    return createSuccessResponse({
      addedCount: participants.count
    }, 'Participants added successfully')

  } catch (error: any) {
    console.error('Add contest participants error:', error)
    return createErrorResponse('Failed to add participants', 500)
  }
})
