import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent } from '@/lib/auth'
import { createResponse, createErrorResponse, parseQueryParams, paginate } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import { getFeedbackStats } from '@/lib/student-utils'
import { FeedbackData, FeedbackItem } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // Authenticate student
    const student = await getCurrentStudent(request)
    if (!student) {
      return createErrorResponse('Unauthorized', 401)
    }

    const params = parseQueryParams(request)
    
    // Parse query parameters
    const {
      type,
      mentorId,
      rating,
      sortBy = 'createdAt',
      order = 'desc',
      page = '1',
      limit = '10'
    } = params

    // Build where clause
    const where: any = {
      studentId: student.id
    }

    if (type) {
      where.category = type
    }

    if (mentorId) {
      where.mentorId = mentorId
    }

    if (rating) {
      where.rating = parseInt(rating)
    }

    // Build order by clause
    const orderBy: any = {}
    orderBy[sortBy] = order

    // Get total count
    const totalCount = await prisma.feedback.count({ where })

    // Get feedbacks with pagination
    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        mentor: {
          select: { id: true, name: true }
        },
        contest: {
          select: { id: true, title: true }
        }
      },
      orderBy,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    })

    // Get feedback statistics
    const feedbackStats = await getFeedbackStats(student.id)

    // Format feedbacks
    const formattedFeedbacks: FeedbackItem[] = feedbacks.map(feedback => ({
      id: feedback.id,
      mentor: feedback.mentor.name,
      type: feedback.category || 'General',
      rating: feedback.rating,
      content: feedback.comment,
      category: feedback.category,
      createdAt: feedback.createdAt.toISOString(),
      contestId: feedback.contestId
    }))

    const feedbackData: FeedbackData = {
      feedbackStats,
      feedbacks: formattedFeedbacks
    }

    // Add pagination info
    const paginatedResult = paginate(formattedFeedbacks, parseInt(page), parseInt(limit))
    paginatedResult.pagination.total = totalCount
    paginatedResult.pagination.totalPages = Math.ceil(totalCount / parseInt(limit))

    return createResponse({
      ...feedbackData,
      pagination: paginatedResult.pagination
    }, 200, 'Feedbacks retrieved successfully')

  } catch (error) {
    console.error('Feedbacks API error:', error)
    return createErrorResponse('Failed to retrieve feedbacks', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate student
    const student = await getCurrentStudent(request)
    if (!student) {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { mentorId, type, message } = body

    // Validate required fields
    if (!type) {
      return createErrorResponse('Type is required', 400)
    }

    // Create feedback request as a notification to mentor
    const notification = await prisma.notification.create({
      data: {
        userId: mentorId || '', // This would need mentor assignment logic
        type: 'FEEDBACK_REQUEST',
        title: 'New Feedback Request',
        message: `${student.name} has requested feedback for ${type}`,
        data: {
          studentId: student.id,
          studentName: student.name,
          type,
          message
        }
      }
    })

    return createResponse(
      { requestId: notification.id },
      201,
      'Feedback request submitted successfully'
    )

  } catch (error) {
    console.error('Feedback request API error:', error)
    return createErrorResponse('Failed to submit feedback request', 500)
  }
}
