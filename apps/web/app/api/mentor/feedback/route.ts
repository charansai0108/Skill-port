import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withMentorAuth, MentorAuthRequest } from '@/lib/mentor-middleware'
import { validateData, validateQueryParams, createFeedbackSchema, updateFeedbackSchema, paginationSchema } from '@/lib/mentor-validation'

const prisma = new PrismaClient()

export const GET = withMentorAuth(async (request: MentorAuthRequest) => {
  try {
    const mentorId = request.mentor!.id
    const { searchParams } = new URL(request.url)

    // Validate pagination parameters
    const paginationValidation = validateQueryParams(paginationSchema, searchParams)
    if (!paginationValidation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid pagination parameters', errors: paginationValidation.errors },
        { status: 400 }
      )
    }

    const pagination = paginationValidation.data

    // Get filters from query params
    const studentId = searchParams.get('studentId')
    const contestId = searchParams.get('contestId')
    const rating = searchParams.get('rating')
    const category = searchParams.get('category')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Build where clause
    const where: any = {
      mentorId
    }

    if (studentId) {
      where.studentId = studentId
    }

    if (contestId) {
      where.contestId = contestId
    }

    if (rating) {
      where.rating = parseInt(rating)
    }

    if (category) {
      where.category = category.toUpperCase()
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }

    // Get feedback with pagination
    const feedback = await prisma.feedback.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' },
      skip: ((pagination.page || 1) - 1) * (pagination.limit || 20),
      take: pagination.limit || 20
    })

    // Get total count
    const totalCount = await prisma.feedback.count({ where })

    // Transform data for frontend
    const transformedFeedback = feedback.map(item => ({
      id: item.id,
      student: item.student,
      contest: item.contest,
      rating: item.rating,
      comment: item.comment,
      category: item.category?.toLowerCase(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: {
        feedback: transformedFeedback,
        pagination: {
          page: pagination.page || 1,
          limit: pagination.limit || 20,
          total: totalCount,
          pages: Math.ceil(totalCount / (pagination.limit || 20))
        }
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

export const POST = withMentorAuth(async (request: MentorAuthRequest) => {
  try {
    const mentorId = request.mentor!.id
    const body = await request.json()

    const validation = validateData(createFeedbackSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.errors },
        { status: 400 }
      )
    }

    const { data } = validation

    // Verify student exists and is in mentor's batches
    const mentorBatches = await prisma.mentorBatch.findMany({
      where: { mentorId },
      select: { batchId: true }
    })
    const batchIds = mentorBatches.map(mb => mb.batchId)

    const student = await prisma.user.findFirst({
      where: {
        id: data.studentId,
        batchId: { in: batchIds },
        role: 'STUDENT',
        status: 'ACTIVE'
      }
    })

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found or not in your batches' },
        { status: 404 }
      )
    }

    // Verify contest belongs to mentor if provided
    if (data.contestId) {
      const contest = await prisma.contest.findFirst({
        where: {
          id: data.contestId,
          createdBy: mentorId
        }
      })

      if (!contest) {
        return NextResponse.json(
          { success: false, message: 'Contest not found or not created by you' },
          { status: 404 }
        )
      }
    }

    // Check if feedback already exists for this student and contest combination
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        mentorId,
        studentId: data.studentId,
        contestId: data.contestId || null
      }
    })

    if (existingFeedback) {
      return NextResponse.json(
        { success: false, message: 'Feedback already exists for this student and contest combination' },
        { status: 400 }
      )
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        ...data,
        mentorId,
        category: data.category || 'GENERAL'
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

    // Log feedback creation
    await prisma.activityLog.create({
      data: {
        userId: mentorId,
        action: 'FEEDBACK_GIVEN',
        details: {
          feedbackId: feedback.id,
          studentId: data.studentId,
          studentName: student.name,
          contestId: data.contestId,
          rating: data.rating,
          timestamp: new Date().toISOString()
        }
      }
    })

    // Create notification for student (if notification system exists)
    // This would typically be handled by a notification service
    await prisma.notification.create({
      data: {
        userId: data.studentId,
        type: 'FEEDBACK_RECEIVED',
        title: 'New Feedback Received',
        message: `You received feedback from your mentor with a rating of ${data.rating}/5`,
        data: {
          feedbackId: feedback.id,
          mentorId,
          rating: data.rating
        }
      }
    }).catch(() => {
      // Ignore notification creation errors
    })

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        id: feedback.id,
        student: feedback.student,
        contest: feedback.contest,
        rating: feedback.rating,
        comment: feedback.comment,
        category: feedback.category?.toLowerCase(),
        createdAt: feedback.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Feedback creation error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
})
