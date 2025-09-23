import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent, createActivityLog } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate student
    const student = await getCurrentStudent(request)
    if (!student) {
      return createErrorResponse('Unauthorized', 401)
    }

    const contestId = params.id

    // Check if contest exists and is open for registration
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    })

    if (!contest) {
      return createErrorResponse('Contest not found', 404)
    }

    // Check if contest is open for registration
    const now = new Date()
    if (contest.status === 'COMPLETED' || contest.status === 'CANCELLED') {
      return createErrorResponse('Contest is not open for registration', 400)
    }

    if (contest.endDate < now) {
      return createErrorResponse('Contest has already ended', 400)
    }

    // Check if user is already registered
    const existingParticipation = await prisma.contestParticipant.findUnique({
      where: {
        contestId_userId: {
          contestId,
          userId: student.id
        }
      }
    })

    if (existingParticipation) {
      return createErrorResponse('Already registered for this contest', 400)
    }

    // Check if contest is full
    if (contest.maxParticipants && contest._count.participants >= contest.maxParticipants) {
      return createErrorResponse('Contest is full', 400)
    }

    // Register user for contest
    const participation = await prisma.contestParticipant.create({
      data: {
        contestId,
        userId: student.id,
        status: 'REGISTERED'
      }
    })

    // Create activity log
    await createActivityLog(
      student.id,
      'contest_registration',
      {
        contestId,
        contestTitle: contest.title,
        action: 'registered'
      }
    )

    // Create notification
    await prisma.notification.create({
      data: {
        userId: student.id,
        type: 'CONTEST_REGISTRATION',
        title: 'Contest Registration Successful',
        message: `You have successfully registered for ${contest.title}`,
        data: {
          contestId,
          contestTitle: contest.title
        }
      }
    })

    return createResponse(
      {
        participationId: participation.id,
        status: participation.status,
        message: 'Successfully registered for contest'
      },
      201,
      'Contest registration successful'
    )

  } catch (error) {
    console.error('Contest registration API error:', error)
    return createErrorResponse('Failed to register for contest', 500)
  }
}
