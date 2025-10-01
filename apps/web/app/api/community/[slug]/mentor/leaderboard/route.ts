import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentMentor } from '@/lib/auth'

export const GET = async (request: NextRequest, { params }: { params: { slug: string } }) => {
  try {
    const { slug } = params
    const mentor = await getCurrentMentor(request)

    if (!mentor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the community by slug
    const community = await prisma.community.findUnique({
      where: { slug },
      select: { id: true, name: true }
    })

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    // Verify mentor belongs to this community
    if (mentor.communityId !== community.id) {
      return NextResponse.json({ error: 'Forbidden: Not your community' }, { status: 403 })
    }

    // Get students in this community with their performance data
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        communityId: community.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        createdAt: true,
        lastLoginAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get feedback data for ranking (if feedback system exists)
    const feedbacks = await prisma.feedback.findMany({
      where: {
        communityId: community.id
      },
      select: {
        studentId: true,
        rating: true,
        createdAt: true
      }
    }).catch(() => []) // Handle case where feedback table doesn't exist

    // Calculate leaderboard data
    const leaderboardData = students.map((student, index) => {
      const studentFeedbacks = feedbacks.filter(f => f.studentId === student.id)
      const averageRating = studentFeedbacks.length > 0 
        ? studentFeedbacks.reduce((sum, f) => sum + f.rating, 0) / studentFeedbacks.length 
        : 0

      return {
        id: student.id,
        rank: index + 1,
        name: student.name,
        email: student.email,
        username: `@${student.email.split('@')[0]}`,
        avatar: student.profilePic || student.name.charAt(0).toUpperCase(),
        points: Math.round(averageRating * 100), // Convert rating to points
        problemsSolved: Math.floor(Math.random() * 50) + 10, // Mock data
        contestsWon: Math.floor(Math.random() * 5), // Mock data
        accuracy: Math.round(averageRating * 20), // Mock accuracy based on rating
        lastActive: student.lastLoginAt ? new Date(student.lastLoginAt).toLocaleDateString() : 'Never',
        status: student.lastLoginAt && new Date(student.lastLoginAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 'active' : 'inactive'
      }
    }).sort((a, b) => b.points - a.points) // Sort by points descending

    // Update ranks after sorting
    const rankedLeaderboard = leaderboardData.map((student, index) => ({
      ...student,
      rank: index + 1
    }))

    // Get top performers (first 3)
    const topPerformers = rankedLeaderboard.slice(0, 3)

    // Calculate stats
    const stats = {
      topPerformers: topPerformers.length,
      activeRankings: rankedLeaderboard.filter(s => s.status === 'active').length,
      averageScore: rankedLeaderboard.length > 0 
        ? Math.round(rankedLeaderboard.reduce((sum, s) => sum + s.points, 0) / rankedLeaderboard.length)
        : 0
    }

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        topPerformers,
        stats,
        community: {
          id: community.id,
          name: community.name
        }
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error fetching mentor leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard data', details: error.message }, { status: 500 })
  }
}
