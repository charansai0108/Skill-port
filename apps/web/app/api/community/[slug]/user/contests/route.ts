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

    // Get contests for this community
    const contests = await prisma.contest.findMany({
      where: {
        communityId: community.id
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        startDate: true,
        endDate: true,
        status: true,
        participants: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []) // Handle case where contest table doesn't exist

    // Get user's participation in contests
    const userParticipations = await prisma.contestParticipant.findMany({
      where: {
        userId: user.id,
        communityId: community.id
      },
      select: {
        contestId: true,
        score: true,
        rank: true,
        status: true
      }
    }).catch(() => []) // Handle case where contest participant table doesn't exist

    // Add participation data to contests
    const contestsWithParticipation = contests.map(contest => {
      const participation = userParticipations.find(p => p.contestId === contest.id)
      return {
        ...contest,
        userScore: participation?.score || 0,
        userRank: participation?.rank || null,
        userStatus: participation?.status || 'not_participated'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        contests: contestsWithParticipation,
        community: {
          id: community.id,
          name: community.name
        }
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error fetching user contests:', error)
    return NextResponse.json({ error: 'Failed to fetch contests', details: error.message }, { status: 500 })
  }
}

export const POST = async (request: NextRequest, { params }: { params: { slug: string } }) => {
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

    // Verify user belongs to this community
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

    const body = await request.json()
    const { contestId } = body

    if (!contestId) {
      return NextResponse.json({ error: 'Contest ID is required' }, { status: 400 })
    }

    // Check if contest exists and is active
    const contest = await prisma.contest.findFirst({
      where: {
        id: contestId,
        communityId: community.id,
        status: 'active'
      }
    })

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found or not active' }, { status: 404 })
    }

    // Register user for contest
    const participation = await prisma.contestParticipant.create({
      data: {
        userId: user.id,
        contestId: contestId,
        communityId: community.id,
        status: 'registered',
        score: 0,
        rank: null
      }
    }).catch(() => {
      throw new Error('Failed to register for contest - contest participant table may not exist')
    })

    return NextResponse.json({
      success: true,
      data: {
        participation: {
          id: participation.id,
          userId: participation.userId,
          contestId: participation.contestId,
          status: participation.status,
          score: participation.score,
          rank: participation.rank
        }
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error registering for contest:', error)
    return NextResponse.json({ error: 'Failed to register for contest', details: error.message }, { status: 500 })
  }
}
