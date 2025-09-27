import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withMentorAuth, MentorAuthRequest } from '@/lib/mentor-middleware'

const prisma = new PrismaClient()

export const DELETE = withMentorAuth(async (request: MentorAuthRequest, { params }: { params: { id: string; userId: string } }) => {
  try {
    const mentorId = request.mentor!.id
    const contestId = params.id
    const userId = params.userId

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

    // Check if participant exists
    const participant = await prisma.contestParticipant.findFirst({
      where: {
        contestId,
        userId
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    })

    if (!participant) {
      return NextResponse.json(
        { success: false, message: 'Participant not found' },
        { status: 404 }
      )
    }

    // Remove participant
    await prisma.contestParticipant.delete({
      where: {
        id: participant.id
      }
    })

    // Log participant removal
    await prisma.activityLog.create({
      data: {
        userId: mentorId,
        action: 'STUDENT_REMOVED_FROM_CONTEST',
        details: {
          contestId,
          studentId: userId,
          studentName: participant.user.name,
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Student removed from contest successfully'
    })
  } catch (error) {
    console.error('Remove participant error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to remove participant' },
      { status: 500 }
    )
  }
})
