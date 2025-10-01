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
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status !== 'all') {
      where.status = status.toUpperCase()
    }

    // Get contests
    const contests = await prisma.contest.findMany({
      where,
      orderBy: { startDate: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            participants: true,
            submissions: true
          }
        }
      }
    })

    // Format response
    const formattedContests = contests.map(contest => ({
      id: contest.id,
      name: contest.title,
      title: contest.title,
      description: contest.description,
      category: 'Programming', // Default category
      batch: '2024-25', // Can be linked to batch if needed
      status: contest.status.toLowerCase(),
      participants: contest._count.participants,
      submissions: contest._count.submissions,
      startDate: contest.startDate.toISOString(),
      endDate: contest.endDate.toISOString(),
      mentor: contest.creator.name,
      mentorEmail: contest.creator.email,
      icon: 'code',
      color: contest.status === 'ACTIVE' ? 'blue' : contest.status === 'UPCOMING' ? 'green' : 'gray',
      rules: contest.rules,
      prizes: contest.prizes
    }))

    // Get summary stats
    const stats = {
      total: contests.length,
      active: contests.filter(c => c.status === 'ACTIVE').length,
      upcoming: contests.filter(c => c.status === 'UPCOMING').length,
      ended: contests.filter(c => c.status === 'ENDED').length
    }

    return NextResponse.json({
      success: true,
      data: {
        contests: formattedContests,
        stats
      }
    })

  } catch (error: any) {
    console.error('Contests API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch contests',
      details: error.message
    }, { status: 500 })
  }
}
