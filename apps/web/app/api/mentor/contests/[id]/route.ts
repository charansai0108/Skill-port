import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withMentorAuth, MentorAuthRequest } from '@/lib/mentor-middleware'
import { validateData, updateContestSchema } from '@/lib/mentor-validation'

const prisma = new PrismaClient()

export const GET = withMentorAuth(async (request: MentorAuthRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const mentorId = request.mentor!.id
    const { id: contestId } = await params

    const contest = await prisma.contest.findFirst({
      where: {
        id: contestId,
        createdBy: mentorId
      },
      include: {
        batch: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        contestParticipants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePic: true
              }
            }
          }
        },
        problems: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            points: true,
            timeLimit: true,
            memoryLimit: true
          }
        }
      }
    })

    if (!contest) {
      return NextResponse.json(
        { success: false, message: 'Contest not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: contest.id,
        title: contest.title,
        description: contest.description,
        category: contest.category,
        batch: contest.batch,
        startDate: contest.startDate.toISOString(),
        endDate: contest.endDate.toISOString(),
        status: contest.status.toLowerCase(),
        maxParticipants: contest.maxParticipants,
        difficulty: contest.difficulty,
        participants: contest.contestParticipants.map(p => ({
          id: p.id,
          user: p.user,
          status: p.status.toLowerCase(),
          score: p.score,
          rank: p.rank,
          submittedAt: p.submittedAt?.toISOString()
        })),
        problems: contest.problems,
        createdAt: contest.createdAt,
        updatedAt: contest.updatedAt
      }
    })
  } catch (error) {
    console.error('Contest fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch contest' },
      { status: 500 }
    )
  }
})

export const PUT = withMentorAuth(async (request: MentorAuthRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const mentorId = request.mentor!.id
    const { id: contestId } = await params
    const body = await request.json()

    const validation = validateData(updateContestSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.errors },
        { status: 400 }
      )
    }

    const { data } = validation

    // Check if contest exists and belongs to mentor
    const existingContest = await prisma.contest.findFirst({
      where: {
        id: contestId,
        createdBy: mentorId
      }
    })

    if (!existingContest) {
      return NextResponse.json(
        { success: false, message: 'Contest not found' },
        { status: 404 }
      )
    }

    // Check for overlapping contests if dates are being updated
    if (data.startDate || data.endDate) {
      const startDate = data.startDate ? new Date(data.startDate) : existingContest.startDate
      const endDate = data.endDate ? new Date(data.endDate) : existingContest.endDate

      const overlappingContest = await prisma.contest.findFirst({
        where: {
          id: { not: contestId },
          batchId: data.batchId || existingContest.batchId,
          status: { in: ['ACTIVE', 'UPCOMING'] },
          OR: [
            {
              AND: [
                { startDate: { lte: startDate } },
                { endDate: { gte: startDate } }
              ]
            },
            {
              AND: [
                { startDate: { lte: endDate } },
                { endDate: { gte: endDate } }
              ]
            },
            {
              AND: [
                { startDate: { gte: startDate } },
                { endDate: { lte: endDate } }
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
    }

    // Update contest
    const updateData: any = { ...data }
    if (data.startDate) updateData.startDate = new Date(data.startDate)
    if (data.endDate) updateData.endDate = new Date(data.endDate)
    
    // Update status based on new dates
    if (data.startDate || data.endDate) {
      const finalStartDate = data.startDate ? new Date(data.startDate) : existingContest.startDate
      const finalEndDate = data.endDate ? new Date(data.endDate) : existingContest.endDate
      const now = new Date()
      
      if (finalEndDate < now) {
        updateData.status = 'COMPLETED'
      } else if (finalStartDate <= now && finalEndDate >= now) {
        updateData.status = 'ACTIVE'
      } else {
        updateData.status = 'UPCOMING'
      }
    }

    const updatedContest = await prisma.contest.update({
      where: { id: contestId },
      data: {
        ...updateData,
        updatedAt: new Date()
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

    // Log contest update
    await prisma.activityLog.create({
      data: {
        userId: mentorId,
        action: 'CONTEST_UPDATED',
        details: {
          contestId: contest.id,
          contestTitle: contest.title,
          changes: Object.keys(data),
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Contest updated successfully',
      data: {
        id: updatedContest.id,
        title: updatedContest.title,
        description: updatedContest.description,
        category: updatedContest.category,
        batch: updatedContest.batch,
        startDate: updatedContest.startDate.toISOString().split('T')[0],
        endDate: updatedContest.endDate.toISOString().split('T')[0],
        status: updatedContest.status.toLowerCase(),
        maxParticipants: updatedContest.maxParticipants,
        difficulty: updatedContest.difficulty
      }
    })
  } catch (error) {
    console.error('Contest update error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update contest' },
      { status: 500 }
    )
  }
})

export const DELETE = withMentorAuth(async (request: MentorAuthRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const mentorId = request.mentor!.id
    const { id: contestId } = await params

    // Check if contest exists and belongs to mentor
    const contest = await prisma.contest.findFirst({
      where: {
        id: contestId,
        createdBy: mentorId
      }
    })

    if (!contest) {
      return NextResponse.json(
        { success: false, message: 'Contest not found' },
        { status: 404 }
      )
    }

    // Soft delete - update status to CANCELLED instead of deleting
    await prisma.contest.update({
      where: { id: contestId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    })

    // Log contest cancellation
    await prisma.activityLog.create({
      data: {
        userId: mentorId,
        action: 'CONTEST_CANCELLED',
        details: {
          contestId: contest.id,
          contestTitle: contest.title,
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Contest cancelled successfully'
    })
  } catch (error) {
    console.error('Contest deletion error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to cancel contest' },
      { status: 500 }
    )
  }
})
