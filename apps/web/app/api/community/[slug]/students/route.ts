import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search') || ''
    const status = url.searchParams.get('status') || 'all'
    const batch = url.searchParams.get('batch') || 'all'

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

    // Build where clause for students
    const whereClause: any = {
      communityId: community.id,
      role: 'STUDENT'
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status !== 'all') {
      whereClause.isVerified = status === 'verified'
    }

    if (batch !== 'all') {
      whereClause.batchId = batch
    }

    // Get students with pagination
    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          batch: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({
        where: whereClause
      })
    ])

    // Get batches for this community
    const batches = await prisma.batch.findMany({
      where: {
        communityId: community.id
      },
      select: {
        id: true,
        name: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        students,
        batches,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error: any) {
    console.error('Community students API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch students',
      details: error.message
    }, { status: 500 })
  }
}
