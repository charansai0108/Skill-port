import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, validatePaginationParams, createSuccessResponse, createErrorResponse } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

// GET /api/admin/leaderboard - Get leaderboard data
export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'users'
    const batchId = searchParams.get('batchId')
    const contestId = searchParams.get('contestId')
    const { page, limit, skip } = validatePaginationParams({
      page: searchParams.get('page'),
      limit: searchParams.get('limit')
    })

    switch (type) {
      case 'users':
        return await getUserLeaderboard(page, limit, skip, batchId)
      case 'mentors':
        return await getMentorLeaderboard(page, limit, skip)
      case 'contest':
        if (!contestId) {
          return createErrorResponse('contestId is required for contest leaderboard')
        }
        return await getContestLeaderboard(contestId, page, limit, skip)
      default:
        return createErrorResponse('Invalid leaderboard type. Use: users, mentors, or contest')
    }

  } catch (error: any) {
    console.error('Leaderboard error:', error)
    return createErrorResponse('Failed to fetch leaderboard data', 500)
  }
})

async function getUserLeaderboard(page: number, limit: number, skip: number, batchId?: string) {
  const whereClause = batchId ? { batchId, role: 'STUDENT' } : { role: 'STUDENT' }

  // Get users with their performance metrics
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        createdAt: true,
        batch: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            tasks: {
              where: { completed: true }
            },
            projects: {
              where: { status: 'COMPLETED' }
            },
            badges: true
          }
        },
        tasks: {
          where: { completed: true },
          select: {
            difficulty: true,
            platform: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.user.count({ where: whereClause })
  ])

  // Calculate scores and ranks
  const usersWithScores = users.map((user, index) => {
    const completedTasks = user._count.tasks
    const completedProjects = user._count.projects
    const badges = user._count.badges
    
    // Calculate score based on tasks, projects, and badges
    const taskScore = completedTasks * 10
    const projectScore = completedProjects * 50
    const badgeScore = badges * 25
    const totalScore = taskScore + projectScore + badgeScore

    // Calculate difficulty distribution
    const difficultyCounts = user.tasks.reduce((acc, task) => {
      acc[task.difficulty] = (acc[task.difficulty] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      ...user,
      rank: skip + index + 1,
      score: totalScore,
      metrics: {
        completedTasks,
        completedProjects,
        badges,
        taskScore,
        projectScore,
        badgeScore,
        totalScore
      },
      difficultyBreakdown: {
        easy: difficultyCounts.EASY || 0,
        medium: difficultyCounts.MEDIUM || 0,
        hard: difficultyCounts.HARD || 0
      }
    }
  })

  // Sort by score descending
  usersWithScores.sort((a, b) => b.score - a.score)

  // Update ranks after sorting
  usersWithScores.forEach((user, index) => {
    user.rank = skip + index + 1
  })

  return createSuccessResponse({
    leaderboard: usersWithScores,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  }, 'User leaderboard retrieved successfully')
}

async function getMentorLeaderboard(page: number, limit: number, skip: number) {
  const [mentors, totalCount] = await Promise.all([
    prisma.mentor.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        specialization: true,
        profilePic: true,
        rating: true,
        totalStudents: true,
        createdAt: true,
        batches: {
          select: {
            batch: {
              select: {
                id: true,
                name: true,
                _count: {
                  select: {
                    students: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { rating: 'desc' },
      skip,
      take: limit
    }),
    prisma.mentor.count({ where: { isActive: true } })
  ])

  // Calculate mentor performance metrics
  const mentorsWithMetrics = mentors.map((mentor, index) => {
    const assignedBatches = mentor.batches.length
    const totalStudentsInBatches = mentor.batches.reduce(
      (sum, mb) => sum + mb.batch._count.students, 
      0
    )

    return {
      ...mentor,
      rank: skip + index + 1,
      metrics: {
        assignedBatches,
        totalStudentsInBatches,
        averageStudentsPerBatch: assignedBatches > 0 ? 
          Math.round((totalStudentsInBatches / assignedBatches) * 100) / 100 : 0
      },
      batches: mentor.batches.map(mb => mb.batch)
    }
  })

  return createSuccessResponse({
    leaderboard: mentorsWithMetrics,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  }, 'Mentor leaderboard retrieved successfully')
}

async function getContestLeaderboard(contestId: string, page: number, limit: number, skip: number) {
  // Check if contest exists
  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    select: {
      id: true,
      name: true,
      status: true,
      startDate: true,
      endDate: true
    }
  })

  if (!contest) {
    return createErrorResponse('Contest not found', 404)
  }

  const [participants, totalCount] = await Promise.all([
    prisma.contestParticipant.findMany({
      where: { contestId },
      select: {
        id: true,
        score: true,
        rank: true,
        joinedAt: true,
        completedAt: true,
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
      orderBy: { score: 'desc' },
      skip,
      take: limit
    }),
    prisma.contestParticipant.count({
      where: { contestId }
    })
  ])

  // Update ranks based on current page and skip
  const participantsWithRanks = participants.map((participant, index) => ({
    ...participant,
    rank: skip + index + 1
  }))

  return createSuccessResponse({
    contest,
    leaderboard: participantsWithRanks,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  }, 'Contest leaderboard retrieved successfully')
}
