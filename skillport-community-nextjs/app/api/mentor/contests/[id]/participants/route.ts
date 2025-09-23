import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withMentorAuth, MentorAuthRequest } from '@/lib/mentor-middleware'
import { validateData, contestParticipantSchema, paginationSchema } from '@/lib/mentor-validation'

const prisma = new PrismaClient()

export const GET = withMentorAuth(async (request: MentorAuthRequest, { params }: { params: { id: string } }) => {
  try {
    const mentorId = request.mentor!.id
    const contestId = params.id
    const { searchParams } = new URL(request.url)

    // Validate pagination parameters
    const paginationValidation = validateData(paginationSchema, Object.fromEntries(searchParams.entries()))
    if (!paginationValidation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid pagination parameters', errors: paginationValidation.errors },
        { status: 400 }
      )
    }

    const pagination = paginationValidation.data

    // Verify contest belongs to mentor
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

    // Get participants with pagination
    const participants = await prisma.contestParticipant.findMany({
      where: { contestId },
      include: {
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
      orderBy: [
        { rank: 'asc' },
        { score: 'desc' },
        { submittedAt: 'asc' }
      ],
      skip: ((pagination.page || 1) - 1) * (pagination.limit || 20),
      take: pagination.limit || 20
    })

    // Get total count
    const totalCount = await prisma.contestParticipant.count({
      where: { contestId }
    })

    // Transform data for frontend
    const transformedParticipants = participants.map((participant, index) => ({
      id: participant.id,
      user: participant.user,
      status: participant.status.toLowerCase(),
      score: participant.score,
      rank: participant.rank || index + 1,
      submittedAt: participant.submittedAt?.toISOString(),
      createdAt: participant.createdAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: {
        participants: transformedParticipants,
        pagination: {
          page: pagination.page || 1,
          limit: pagination.limit || 20,
          total: totalCount,
          pages: Math.ceil(totalCount / (pagination.limit || 20))
        }
      }
    })
  } catch (error) {
    console.error('Participants fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch participants' },
      { status: 500 }
    )
  }
})

export const POST = withMentorAuth(async (request: MentorAuthRequest, { params }: { params: { id: string } }) => {
  try {
    const mentorId = request.mentor!.id
    const contestId = params.id
    const body = await request.json()

    const validation = validateData(contestParticipantSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.errors },
        { status: 400 }
      )
    }

    const { data } = validation

    // Verify contest belongs to mentor
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

    // Check if user exists and is a student
    const user = await prisma.user.findFirst({
      where: {
        id: data.userId,
        role: 'STUDENT',
        status: 'ACTIVE'
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Student not found or inactive' },
        { status: 404 }
      )
    }

    // Check if user is already a participant
    const existingParticipant = await prisma.contestParticipant.findFirst({
      where: {
        contestId,
        userId: data.userId
      }
    })

    if (existingParticipant) {
      return NextResponse.json(
        { success: false, message: 'Student is already a participant in this contest' },
        { status: 400 }
      )
    }

    // Check contest capacity
    if (contest.maxParticipants) {
      const currentParticipants = await prisma.contestParticipant.count({
        where: { contestId }
      })

      if (currentParticipants >= contest.maxParticipants) {
        return NextResponse.json(
          { success: false, message: 'Contest has reached maximum participants' },
          { status: 400 }
        )
      }
    }

    // Add participant
    const participant = await prisma.contestParticipant.create({
      data: {
        contestId,
        userId: data.userId,
        status: 'REGISTERED'
      },
      include: {
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
      }
    })

    // Log participant addition
    await prisma.activityLog.create({
      data: {
        userId: mentorId,
        action: 'STUDENT_ADDED_TO_CONTEST',
        details: {
          contestId,
          studentId: data.userId,
          studentName: user.name,
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Student added to contest successfully',
      data: {
        id: participant.id,
        user: participant.user,
        status: participant.status.toLowerCase(),
        score: participant.score,
        rank: participant.rank,
        submittedAt: participant.submittedAt?.toISOString(),
        createdAt: participant.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Add participant error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to add participant' },
      { status: 500 }
    )
  }
})
