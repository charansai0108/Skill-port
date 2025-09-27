import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withMentorAuth, MentorAuthRequest } from '@/lib/mentor-middleware'
import { validateData, updateFeedbackSchema } from '@/lib/mentor-validation'

const prisma = new PrismaClient()

export const GET = withMentorAuth(async (request: MentorAuthRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const mentorId = request.mentor!.id
    const { id: feedbackId } = await params

    const feedback = await prisma.feedback.findFirst({
      where: {
        id: feedbackId,
        mentorId
      },
      include: {
        student: {
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
        },
        contest: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      }
    })

    if (!feedback) {
      return NextResponse.json(
        { success: false, message: 'Feedback not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: feedback.id,
        student: feedback.student,
        contest: feedback.contest,
        rating: feedback.rating,
        comment: feedback.comment,
        category: feedback.category?.toLowerCase(),
        createdAt: feedback.createdAt.toISOString(),
        updatedAt: feedback.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Feedback fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
})

export const PUT = withMentorAuth(async (request: MentorAuthRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const mentorId = request.mentor!.id
    const { id: feedbackId } = await params
    const body = await request.json()

    const validation = validateData(updateFeedbackSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.errors },
        { status: 400 }
      )
    }

    const { data } = validation

    // Check if feedback exists and belongs to mentor
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        id: feedbackId,
        mentorId
      }
    })

    if (!existingFeedback) {
      return NextResponse.json(
        { success: false, message: 'Feedback not found' },
        { status: 404 }
      )
    }

    // Update feedback
    const updatedFeedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        student: {
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
        },
        contest: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      }
    })

    // Log feedback update
    await prisma.activityLog.create({
      data: {
        userId: mentorId,
        action: 'FEEDBACK_UPDATED',
        details: {
          feedbackId: feedbackId,
          studentId: existingFeedback.studentId,
          changes: Object.keys(data),
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Feedback updated successfully',
      data: {
        id: updatedFeedback.id,
        student: updatedFeedback.student,
        contest: updatedFeedback.contest,
        rating: updatedFeedback.rating,
        comment: updatedFeedback.comment,
        category: updatedFeedback.category?.toLowerCase(),
        createdAt: updatedFeedback.createdAt.toISOString(),
        updatedAt: updatedFeedback.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Feedback update error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update feedback' },
      { status: 500 }
    )
  }
})

export const DELETE = withMentorAuth(async (request: MentorAuthRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const mentorId = request.mentor!.id
    const { id: feedbackId } = await params

    // Check if feedback exists and belongs to mentor
    const feedback = await prisma.feedback.findFirst({
      where: {
        id: feedbackId,
        mentorId
      }
    })

    if (!feedback) {
      return NextResponse.json(
        { success: false, message: 'Feedback not found' },
        { status: 404 }
      )
    }

    // Delete feedback
    await prisma.feedback.delete({
      where: { id: feedbackId }
    })

    // Log feedback deletion
    await prisma.activityLog.create({
      data: {
        userId: mentorId,
        action: 'FEEDBACK_DELETED',
        details: {
          feedbackId: feedbackId,
          studentId: feedback.studentId,
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully'
    })
  } catch (error) {
    console.error('Feedback deletion error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete feedback' },
      { status: 500 }
    )
  }
})
