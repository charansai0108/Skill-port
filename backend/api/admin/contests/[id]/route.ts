import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, createSuccessResponse, createErrorResponse } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

// GET /api/admin/contests/[id] - Get contest by ID
export const GET = withAdminAuth(async (request: NextRequest, admin, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    const contest = await prisma.contest.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        maxParticipants: true,
        createdAt: true,
        updatedAt: true,
        batch: {
          select: {
            id: true,
            name: true
          }
        },
        participants: {
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
                profilePic: true
              }
            }
          },
          orderBy: { score: 'desc' }
        },
        _count: {
          select: {
            participants: true
          }
        }
      }
    })

    if (!contest) {
      return createErrorResponse('Contest not found', 404)
    }

    return createSuccessResponse(contest, 'Contest retrieved successfully')

  } catch (error: any) {
    console.error('Get contest error:', error)
    return createErrorResponse('Failed to fetch contest', 500)
  }
})

// PUT /api/admin/contests/[id] - Update contest
export const PUT = withAdminAuth(async (request: NextRequest, admin, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    const body = await request.json()
    const { name, description, startDate, endDate, batchId, maxParticipants, status } = body

    // Check if contest exists
    const existingContest = await prisma.contest.findUnique({
      where: { id }
    })

    if (!existingContest) {
      return createErrorResponse('Contest not found', 404)
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (start >= end) {
        return createErrorResponse('End date must be after start date')
      }
    }

    // Update contest
    const contest = await prisma.contest.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(batchId !== undefined && { batchId: batchId || null }),
        ...(maxParticipants !== undefined && { maxParticipants }),
        ...(status && { status })
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        maxParticipants: true,
        updatedAt: true,
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

    return createSuccessResponse(contest, 'Contest updated successfully')

  } catch (error: any) {
    console.error('Update contest error:', error)
    return createErrorResponse('Failed to update contest', 500)
  }
})

// DELETE /api/admin/contests/[id] - Delete contest
export const DELETE = withAdminAuth(async (request: NextRequest, admin, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    // Check if contest exists
    const existingContest = await prisma.contest.findUnique({
      where: { id }
    })

    if (!existingContest) {
      return createErrorResponse('Contest not found', 404)
    }

    // Delete contest (cascade will handle related records)
    await prisma.contest.delete({
      where: { id }
    })

    return createSuccessResponse(null, 'Contest deleted successfully')

  } catch (error: any) {
    console.error('Delete contest error:', error)
    return createErrorResponse('Failed to delete contest', 500)
  }
})
