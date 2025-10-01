import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentMentor } from '@/lib/auth'

export const GET = async (request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
  try {
    const { slug } = await params
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

    return NextResponse.json({
      success: true,
      data: {
        contests,
        community: {
          id: community.id,
          name: community.name
        }
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error fetching mentor contests:', error)
    return NextResponse.json({ error: 'Failed to fetch contests', details: error.message }, { status: 500 })
  }
}

export const POST = async (request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
  try {
    const { slug } = await params
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

    const body = await request.json()
    const { title, description, category, startDate, endDate } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    // Create new contest
    const contest = await prisma.contest.create({
      data: {
        title,
        description,
        category: category || 'General',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: 'draft',
        participants: 0,
        communityId: community.id,
        createdBy: mentor.id
      }
    }).catch(() => {
      throw new Error('Failed to create contest - contest table may not exist')
    })

    return NextResponse.json({
      success: true,
      data: {
        contest: {
          id: contest.id,
          title: contest.title,
          description: contest.description,
          category: contest.category,
          startDate: contest.startDate,
          endDate: contest.endDate,
          status: contest.status,
          participants: contest.participants,
          createdAt: contest.createdAt
        }
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating contest:', error)
    return NextResponse.json({ error: 'Failed to create contest', details: error.message }, { status: 500 })
  }
}
