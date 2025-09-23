import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent } from '@/lib/auth'
import { createResponse, createErrorResponse, parseQueryParams, paginate } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import { SubmissionInfo } from '@/lib/types'

export async function GET(
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
    const queryParams = parseQueryParams(request)
    
    const {
      userId = student.id, // Default to current user, but allow viewing others
      problemId,
      status,
      language,
      page = '1',
      limit = '20',
      sortBy = 'submittedAt',
      order = 'desc'
    } = queryParams

    // Check if contest exists
    const contest = await prisma.contest.findUnique({
      where: { id: contestId }
    })

    if (!contest) {
      return createErrorResponse('Contest not found', 404)
    }

    // Check if user is participant or if viewing own submissions
    const isParticipant = await prisma.contestParticipant.findFirst({
      where: {
        contestId,
        userId: student.id
      }
    })

    if (!isParticipant && userId !== student.id) {
      return createErrorResponse('Not authorized to view these submissions', 403)
    }

    // Build where clause
    const where: any = {
      contestId,
      userId: userId || student.id
    }

    if (problemId) {
      where.problemId = problemId
    }

    if (status) {
      where.status = status
    }

    if (language) {
      where.language = language
    }

    // Build order by clause
    const orderBy: any = {}
    orderBy[sortBy] = order

    // Get total count
    const totalCount = await prisma.submission.count({ where })

    // Get submissions with pagination
    const submissions = await prisma.submission.findMany({
      where,
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            points: true
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    })

    // Format submissions
    const formattedSubmissions: SubmissionInfo[] = submissions.map(submission => ({
      id: submission.id,
      problemId: submission.problemId,
      problemTitle: submission.problem.title,
      status: submission.status,
      score: submission.score,
      submittedAt: submission.submittedAt.toISOString(),
      language: submission.language,
      executionTime: submission.executionTime || undefined
    }))

    // Get user's participation info
    const participantInfo = await prisma.contestParticipant.findFirst({
      where: {
        contestId,
        userId: userId || student.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Add pagination info
    const paginatedResult = paginate(formattedSubmissions, parseInt(page), parseInt(limit))
    paginatedResult.pagination.total = totalCount
    paginatedResult.pagination.totalPages = Math.ceil(totalCount / parseInt(limit))

    return createResponse({
      participant: participantInfo ? {
        studentId: participantInfo.userId,
        name: participantInfo.user.name,
        score: participantInfo.score,
        rank: participantInfo.rank || 0,
        status: participantInfo.status,
        joinedAt: participantInfo.joinedAt.toISOString()
      } : null,
      submissions: formattedSubmissions,
      pagination: paginatedResult.pagination,
      contestInfo: {
        id: contest.id,
        title: contest.title,
        status: contest.status
      }
    }, 200, 'Contest submissions retrieved successfully')

  } catch (error) {
    console.error('Contest submissions API error:', error)
    return createErrorResponse('Failed to retrieve contest submissions', 500)
  }
}
