import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin(request)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'students' // students or mentors
    const limit = parseInt(searchParams.get('limit') || '50')

    if (type === 'students') {
      // Get top students by problems solved
      const students = await prisma.user.findMany({
        where: { role: 'STUDENT', isActive: true },
        include: {
          submissions: {
            where: { status: 'ACCEPTED' }
          },
          contestParticipants: {
            include: {
              contest: true
            }
          },
          batch: {
            select: {
              name: true
            }
          }
        },
        take: limit
      })

      // Calculate scores and rank
      const leaderboard = students.map(student => ({
        id: student.id,
        name: student.name,
        username: student.username || student.email.split('@')[0],
        email: student.email,
        batch: student.batch?.name || 'No Batch',
        problemsSolved: student.submissions.length,
        contestsParticipated: student.contestParticipants.length,
        totalScore: student.contestParticipants.reduce((sum, cp) => sum + cp.score, 0),
        averageScore: student.contestParticipants.length > 0
          ? Math.round(student.contestParticipants.reduce((sum, cp) => sum + cp.score, 0) / student.contestParticipants.length)
          : 0,
        profilePic: student.profilePic
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((student, index) => ({
        ...student,
        rank: index + 1
      }))

      return NextResponse.json({
        success: true,
        data: {
          leaderboard,
          type: 'students'
        }
      })

    } else {
      // Get top mentors by rating and students helped
      const mentors = await prisma.user.findMany({
        where: { role: 'MENTOR', isActive: true },
        include: {
          mentorFeedbacks: {
            select: {
              rating: true
            }
          },
          contests: {
            select: {
              id: true
            }
          },
          _count: {
            select: {
              mentorFeedbacks: true,
              contests: true
            }
          }
        },
        take: limit
      })

      // Calculate scores and rank
      const leaderboard = mentors.map(mentor => {
        const ratings = mentor.mentorFeedbacks.map(f => f.rating)
        const averageRating = ratings.length > 0 
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
          : 0

        return {
          id: mentor.id,
          name: mentor.name,
          username: mentor.username || mentor.email.split('@')[0],
          email: mentor.email,
          subject: mentor.subject || 'General',
          studentsHelped: mentor._count.mentorFeedbacks,
          contestsCreated: mentor._count.contests,
          averageRating: Math.round(averageRating * 10) / 10,
          totalScore: (mentor._count.mentorFeedbacks * 10) + (averageRating * 20),
          profilePic: mentor.profilePic
        }
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((mentor, index) => ({
        ...mentor,
        rank: index + 1
      }))

      return NextResponse.json({
        success: true,
        data: {
          leaderboard,
          type: 'mentors'
        }
      })
    }

  } catch (error: any) {
    console.error('Leaderboard API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch leaderboard',
      details: error.message
    }, { status: 500 })
  }
}
