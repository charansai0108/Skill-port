import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, createSuccessResponse, createErrorResponse } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

// DELETE /api/admin/contests/[id]/participants/[userId] - Remove participant from contest
export const DELETE = withAdminAuth(async (request: NextRequest, admin, { params }: { params: { id: string, userId: string } }) => {
  try {
    const { id, userId } = params

    // Check if contest exists
    const contest = await prisma.contest.findUnique({
      where: { id }
    })

    if (!contest) {
      return createErrorResponse('Contest not found', 404)
    }

    // Check if participant exists
    const participant = await prisma.contestParticipant.findUnique({
      where: {
        contestId_userId: {
          contestId: id,
          userId
        }
      }
    })

    if (!participant) {
      return createErrorResponse('Participant not found in this contest', 404)
    }

    // Remove participant
    await prisma.contestParticipant.delete({
      where: {
        contestId_userId: {
          contestId: id,
          userId
        }
      }
    })

    return createSuccessResponse(null, 'Participant removed successfully')

  } catch (error: any) {
    console.error('Remove contest participant error:', error)
    return createErrorResponse('Failed to remove participant', 500)
  }
})

// PUT /api/admin/contests/[id]/participants/[userId] - Update participant score
export const PUT = withAdminAuth(async (request: NextRequest, admin, { params }: { params: { id: string, userId: string } }) => {
  try {
    const { id, userId } = params
    const body = await request.json()
    const { score, completedAt } = body

    // Check if contest exists
    const contest = await prisma.contest.findUnique({
      where: { id }
    })

    if (!contest) {
      return createErrorResponse('Contest not found', 404)
    }

    // Update participant
    const participant = await prisma.contestParticipant.update({
      where: {
        contestId_userId: {
          contestId: id,
          userId
        }
      },
      data: {
        ...(score !== undefined && { score }),
        ...(completedAt && { completedAt: new Date(completedAt) })
      },
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
      }
    })

    return createSuccessResponse(participant, 'Participant updated successfully')

  } catch (error: any) {
    console.error('Update contest participant error:', error)
    return createErrorResponse('Failed to update participant', 500)
  }
})
