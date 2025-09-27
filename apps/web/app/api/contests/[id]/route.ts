import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import { calculateContestLeaderboard, getContestProblemsSolved } from '@/lib/student-utils'
import { ContestDetails, ProblemSummary, LeaderboardEntry } from '@/lib/types'

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

    // Get contest details
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        problems: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            points: true
          }
        },
        participants: {
          where: { userId: student.id },
          select: { id: true, status: true, score: true, rank: true }
        },
        _count: {
          select: { participants: true }
        }
      }
    })

    if (!contest) {
      return createErrorResponse('Contest not found', 404)
    }

    // Check if user is registered
    const isRegistered = contest.participants.length > 0
    const userParticipation = contest.participants[0]

    // Get problems with solved status for the user
    const problems: ProblemSummary[] = await Promise.all(
      contest.problems.map(async (problem) => {
        const solved = await prisma.submission.findFirst({
          where: {
            problemId: problem.id,
            userId: student.id,
            status: 'ACCEPTED'
          }
        })

        return {
          id: problem.id,
          title: problem.title,
          difficulty: problem.difficulty,
          points: problem.points,
          solved: !!solved
        }
      })
    )

    // Get leaderboard
    const leaderboard = await calculateContestLeaderboard(contestId)

    // Enhanced leaderboard with problems solved count
    const enhancedLeaderboard: LeaderboardEntry[] = await Promise.all(
      leaderboard.map(async (entry) => {
        const problemsSolved = await getContestProblemsSolved(entry.userId, contestId)
        return {
          ...entry,
          problemsSolved
        }
      })
    )

    const contestDetails: ContestDetails = {
      id: contest.id,
      title: contest.title,
      status: contest.status as 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED',
      startDate: contest.startDate.toISOString(),
      endDate: contest.endDate.toISOString(),
      description: contest.description,
      difficulty: contest.difficulty,
      maxParticipants: contest.maxParticipants,
      currentParticipants: contest._count.participants,
      problems,
      leaderboard: enhancedLeaderboard,
      isRegistered,
      userRank: userParticipation?.rank || undefined,
      userScore: userParticipation?.score || undefined
    }

    return createResponse(contestDetails, 200, 'Contest details retrieved successfully')

  } catch (error) {
    console.error('Contest details API error:', error)
    return createErrorResponse('Failed to retrieve contest details', 500)
  }
}
