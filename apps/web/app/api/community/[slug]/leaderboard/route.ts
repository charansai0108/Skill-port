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

    // Get community students for leaderboard
    const students = await prisma.user.findMany({
      where: {
        communityId: community.id,
        role: 'STUDENT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        batch: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // For now, return students as leaderboard (TODO: Add actual scoring system)
    const leaderboard = students.map((student, index) => ({
      ...student,
      rank: index + 1,
      score: Math.floor(Math.random() * 1000), // Placeholder score
      problemsSolved: Math.floor(Math.random() * 50) // Placeholder
    }))

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        totalParticipants: students.length
      }
    })

  } catch (error: any) {
    console.error('Community leaderboard API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch leaderboard',
      details: error.message
    }, { status: 500 })
  }
}
