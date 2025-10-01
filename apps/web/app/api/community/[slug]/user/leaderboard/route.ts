import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const GET = async (request: NextRequest, { params }: { params: { slug: string } }) => {
  try {
    const { slug } = params
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is STUDENT or PERSONAL
    if (!['STUDENT', 'PERSONAL'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Invalid user role' }, { status: 403 })
    }

    // Find the community by slug
    const community = await prisma.community.findUnique({
      where: { slug },
      select: { id: true, name: true }
    })

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    // Verify user belongs to this community (for students)
    if (user.role === 'STUDENT' && user.communityId !== community.id) {
      return NextResponse.json({ error: 'Forbidden: Not your community' }, { status: 403 })
    }

    // For personal users, check if they have joined this community
    if (user.role === 'PERSONAL') {
      const communityMember = await prisma.communityMember.findFirst({
        where: {
          userId: user.id,
          communityId: community.id
        }
      })

      if (!communityMember) {
        return NextResponse.json({ error: 'Forbidden: Not a member of this community' }, { status: 403 })
      }
    }

    // Get all users in this community (students and personal users who joined)
    const communityUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'STUDENT', communityId: community.id },
          { 
            role: 'PERSONAL',
            communityMembers: {
              some: {
                communityId: community.id
              }
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        role: true,
        createdAt: true,
        lastLoginAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get contest participation data for ranking
    const contestParticipations = await prisma.contestParticipant.findMany({
      where: {
        communityId: community.id
      },
      select: {
        userId: true,
        score: true,
        rank: true,
        contestId: true
      }
    }).catch(() => []) // Handle case where contest participant table doesn't exist

    // Calculate leaderboard data
    const leaderboardData = communityUsers.map((user, index) => {
      const userParticipations = contestParticipations.filter(p => p.userId === user.id)
      const totalScore = userParticipations.reduce((sum, p) => sum + (p.score || 0), 0)
      const averageScore = userParticipations.length > 0 ? totalScore / userParticipations.length : 0
      const contestsWon = userParticipations.filter(p => p.rank === 1).length
      const problemsSolved = Math.floor(Math.random() * 50) + 10 // Mock data

      return {
        id: user.id,
        rank: index + 1,
        name: user.name,
        email: user.email,
        username: `@${user.email.split('@')[0]}`,
        avatar: user.profilePic || user.name.charAt(0).toUpperCase(),
        points: Math.round(totalScore),
        problemsSolved,
        contestsWon,
        accuracy: Math.round(averageScore * 10), // Mock accuracy based on average score
        lastActive: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never',
        status: user.lastLoginAt && new Date(user.lastLoginAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 'active' : 'inactive',
        role: user.role
      }
    }).sort((a, b) => b.points - a.points) // Sort by points descending

    // Update ranks after sorting
    const rankedLeaderboard = leaderboardData.map((user, index) => ({
      ...user,
      rank: index + 1
    }))

    // Get top performers (first 3)
    const topPerformers = rankedLeaderboard.slice(0, 3)

    // Calculate stats
    const stats = {
      topPerformers: topPerformers.length,
      activeRankings: rankedLeaderboard.filter(u => u.status === 'active').length,
      avgScore: rankedLeaderboard.length > 0 
        ? Math.round(rankedLeaderboard.reduce((sum, u) => sum + u.points, 0) / rankedLeaderboard.length)
        : 0
    }

    // Find current user's rank
    const currentUserRank = rankedLeaderboard.findIndex(u => u.id === user.id) + 1

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        topPerformers,
        stats,
        currentUserRank,
        community: {
          id: community.id,
          name: community.name
        }
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error fetching user leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard data', details: error.message }, { status: 500 })
  }
}
