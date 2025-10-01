import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Verify admin authentication
    const admin = await getCurrentAdmin(request)
    if (!admin) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 401 })
    }

    // Get community by slug
    const community = await prisma.community.findUnique({
      where: { slug }
    })

    if (!community) {
      return NextResponse.json({
        error: 'Community not found'
      }, { status: 404 })
    }

    // Verify admin owns this community
    if (admin.id !== community.adminId) {
      return NextResponse.json({
        error: 'Access denied'
      }, { status: 403 })
    }

    // Get community-specific analytics
    const totalStudents = await prisma.user.count({
      where: {
        communityId: community.id,
        role: 'STUDENT'
      }
    })

    const totalMentors = await prisma.user.count({
      where: {
        communityId: community.id,
        role: 'MENTOR'
      }
    })

    const totalBatches = await prisma.batch.count({
      where: {
        communityId: community.id
      }
    })

    const totalContests = await prisma.contest.count()

    const totalSubmissions = await prisma.submission.count()

    const analytics = {
      overview: {
        totalStudents,
        totalMentors,
        totalBatches,
        totalContests,
        totalSubmissions
      },
      growth: {
        studentsGrowth: 0, // TODO: Calculate growth
        mentorsGrowth: 0,
        contestsGrowth: 0
      },
      engagement: {
        activeUsers: totalStudents + totalMentors,
        participationRate: 0 // TODO: Calculate participation
      }
    }

    return NextResponse.json({
      success: true,
      data: analytics
    })

  } catch (error: any) {
    console.error('Community analytics API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch analytics',
      details: error.message
    }, { status: 500 })
  }
}
