import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate student
    const student = await getCurrentStudent(request)
    if (!student) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { id: feedbackId } = await params

    // Get feedback details
    const feedback = await prisma.feedback.findFirst({
      where: {
        id: feedbackId,
        studentId: student.id
      },
      include: {
        mentor: {
          select: { id: true, name: true, email: true, profilePic: true }
        },
        contest: {
          select: { id: true, title: true, description: true }
        }
      }
    })

    if (!feedback) {
      return createErrorResponse('Feedback not found', 404)
    }

    const feedbackDetail = {
      id: feedback.id,
      mentor: {
        id: feedback.mentor.id,
        name: feedback.mentor.name,
        email: feedback.mentor.email,
        profilePic: feedback.mentor.profilePic
      },
      type: feedback.category || 'General',
      rating: feedback.rating,
      content: feedback.comment,
      category: feedback.category,
      createdAt: feedback.createdAt.toISOString(),
      updatedAt: feedback.updatedAt.toISOString(),
      contest: feedback.contest ? {
        id: feedback.contest.id,
        title: feedback.contest.title,
        description: feedback.contest.description
      } : null
    }

    return createResponse(feedbackDetail, 200, 'Feedback details retrieved successfully')

  } catch (error) {
    console.error('Feedback detail API error:', error)
    return createErrorResponse('Failed to retrieve feedback details', 500)
  }
}
