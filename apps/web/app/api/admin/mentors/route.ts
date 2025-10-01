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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const specialization = searchParams.get('specialization') || ''
    const status = searchParams.get('status') || 'all'
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      role: 'MENTOR'
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (specialization) {
      where.subject = { contains: specialization, mode: 'insensitive' }
    }

    if (status !== 'all') {
      where.isActive = status === 'active'
    }

    // Get mentors with pagination
    const [mentors, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contests: {
            select: {
              id: true,
              status: true
            }
          },
          mentorFeedbacks: {
            select: {
              id: true,
              rating: true
            }
          },
          _count: {
            select: {
              mentorFeedbacks: true,
              contests: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    // Format response
    const formattedMentors = mentors.map(mentor => {
      const ratings = mentor.mentorFeedbacks.map(f => f.rating)
      const averageRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0

      return {
        id: mentor.id,
        firstName: mentor.name.split(' ')[0] || mentor.name,
        lastName: mentor.name.split(' ').slice(1).join(' ') || '',
        name: mentor.name,
        email: mentor.email,
        username: mentor.username || mentor.email.split('@')[0],
        specialization: mentor.subject || 'General',
        status: mentor.isActive ? 'active' : 'inactive',
        createdAt: mentor.createdAt.toISOString(),
        mentorStats: {
          totalStudents: mentor._count.mentorFeedbacks, // Students who received feedback
          activeContests: mentor.contests.filter(c => c.status === 'ACTIVE').length,
          averageRating: Math.round(averageRating * 10) / 10
        }
      }
    })

    // Get unique specializations
    const specializations = await prisma.user.findMany({
      where: { role: 'MENTOR', subject: { not: null } },
      select: { subject: true },
      distinct: ['subject']
    })

    return NextResponse.json({
      success: true,
      data: {
        mentors: formattedMentors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        specializations: specializations.map(s => s.subject).filter(Boolean)
      }
    })

  } catch (error: any) {
    console.error('Mentors API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch mentors',
      details: error.message
    }, { status: 500 })
  }
}
