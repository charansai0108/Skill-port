import { prisma } from './prisma'
import { StudentStats, TopPerformance, StudentActivity } from './types'

/**
 * Calculate user statistics for dashboard
 */
export async function calculateUserStats(userId: string): Promise<StudentStats> {
  // Get total score from contest participations
  const participations = await prisma.contestParticipant.findMany({
    where: { userId },
    include: { contest: true }
  })

  const totalScore = participations.reduce((sum, p) => sum + p.score, 0)

  // Get problems solved from submissions
  const solvedProblems = await prisma.submission.count({
    where: { 
      userId,
      status: 'ACCEPTED'
    },
    distinct: ['problemId']
  })

  // Get contests won (rank 1)
  const contestsWon = participations.filter(p => p.rank === 1).length

  // Calculate accuracy from submissions
  const totalSubmissions = await prisma.submission.count({
    where: { userId }
  })

  const acceptedSubmissions = await prisma.submission.count({
    where: { 
      userId,
      status: 'ACCEPTED'
    }
  })

  const accuracy = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0

  return {
    score: totalScore,
    problemsSolved: solvedProblems,
    contestsWon,
    accuracy
  }
}

/**
 * Get top performances from contest participations
 */
export async function getTopPerformances(userId: string, limit: number = 5): Promise<TopPerformance[]> {
  const participations = await prisma.contestParticipant.findMany({
    where: { userId },
    include: { contest: true },
    orderBy: [
      { rank: 'asc' },
      { score: 'desc' }
    ],
    take: limit
  })

  return participations
    .filter(p => p.rank !== null)
    .map(p => ({
      contestName: p.contest.title,
      rank: p.rank!,
      score: p.score,
      date: p.completedAt?.toISOString() || p.joinedAt.toISOString()
    }))
}

/**
 * Get recent activities for dashboard
 */
export async function getRecentActivities(userId: string, limit: number = 10): Promise<StudentActivity[]> {
  const activities: StudentActivity[] = []

  // Get recent problem solutions
  const recentSubmissions = await prisma.submission.findMany({
    where: { 
      userId,
      status: 'ACCEPTED'
    },
    include: { problem: true },
    orderBy: { submittedAt: 'desc' },
    take: 5
  })

  recentSubmissions.forEach(submission => {
    activities.push({
      type: 'solved_problem',
      title: submission.problem.title,
      date: submission.submittedAt.toISOString(),
      details: `Score: ${submission.score}`
    })
  })

  // Get recent contest participations
  const recentContests = await prisma.contestParticipant.findMany({
    where: { userId },
    include: { contest: true },
    orderBy: { joinedAt: 'desc' },
    take: 3
  })

  recentContests.forEach(participation => {
    activities.push({
      type: 'joined_contest',
      title: participation.contest.title,
      date: participation.joinedAt.toISOString(),
      details: `Status: ${participation.status}`
    })
  })

  // Get recent feedback
  const recentFeedback = await prisma.feedback.findMany({
    where: { studentId: userId },
    include: { mentor: true },
    orderBy: { createdAt: 'desc' },
    take: 2
  })

  recentFeedback.forEach(feedback => {
    activities.push({
      type: 'feedback_received',
      title: `Feedback from ${feedback.mentor.name}`,
      date: feedback.createdAt.toISOString(),
      details: `Rating: ${feedback.rating}/5`
    })
  })

  // Get recent badges
  const recentBadges = await prisma.badge.findMany({
    where: { userId },
    orderBy: { earnedAt: 'desc' },
    take: 2
  })

  recentBadges.forEach(badge => {
    activities.push({
      type: 'badge_earned',
      title: badge.name,
      date: badge.earnedAt.toISOString(),
      details: badge.description
    })
  })

  // Sort all activities by date and limit
  return activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

/**
 * Calculate contest leaderboard with ranks
 */
export async function calculateContestLeaderboard(contestId: string) {
  const participants = await prisma.contestParticipant.findMany({
    where: { contestId },
    include: { user: true },
    orderBy: [
      { score: 'desc' },
      { completedAt: 'asc' }
    ]
  })

  // Update ranks in database
  const updatePromises = participants.map((participant, index) => {
    const rank = index + 1
    return prisma.contestParticipant.update({
      where: { id: participant.id },
      data: { rank }
    })
  })

  await Promise.all(updatePromises)

  return participants.map((participant, index) => ({
    rank: index + 1,
    userId: participant.userId,
    name: participant.user.name,
    score: participant.score,
    problemsSolved: 0, // This would need to be calculated from submissions
    lastSubmission: participant.submittedAt?.toISOString()
  }))
}

/**
 * Get feedback statistics for a student
 */
export async function getFeedbackStats(userId: string) {
  const feedbacks = await prisma.feedback.findMany({
    where: { studentId: userId },
    include: { mentor: true }
  })

  const total = feedbacks.length
  const averageRating = total > 0 
    ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / total 
    : 0

  const uniqueMentors = new Set(feedbacks.map(f => f.mentorId)).size
  
  // Get feedback from current month
  const currentMonth = new Date()
  currentMonth.setDate(1)
  const monthlyFeedback = feedbacks.filter(f => f.createdAt >= currentMonth).length

  return {
    total,
    averageRating: Math.round(averageRating * 10) / 10,
    activeMentors: uniqueMentors,
    monthlyFeedback
  }
}

/**
 * Get active contests for a user
 */
export async function getActiveContests(userId?: string, limit: number = 5) {
  const now = new Date()
  
  const contests = await prisma.contest.findMany({
    where: {
      OR: [
        { status: 'UPCOMING' },
        { status: 'ACTIVE' }
      ],
      endDate: { gte: now }
    },
    orderBy: { startDate: 'asc' },
    take: limit
  })

  return contests.map(contest => ({
    contestId: contest.id,
    title: contest.title,
    deadline: contest.endDate.toISOString(),
    status: contest.status,
    description: contest.description
  }))
}

/**
 * Calculate problems solved for a user in a contest
 */
export async function getContestProblemsSolved(userId: string, contestId: string): Promise<number> {
  return await prisma.submission.count({
    where: {
      userId,
      contestId,
      status: 'ACCEPTED'
    },
    distinct: ['problemId']
  })
}
