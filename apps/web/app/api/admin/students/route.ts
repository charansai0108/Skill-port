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
    const batchId = searchParams.get('batchId') || ''
    const status = searchParams.get('status') || 'all'
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      role: 'STUDENT'
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (batchId) {
      where.batchId = batchId
    }

    if (status !== 'all') {
      where.isActive = status === 'active'
    }

    // Filter by community if community admin
    if (admin.role === 'COMMUNITY_ADMIN') {
      where.communityId = admin.id // Assuming admin is linked to community
    }

    // Get students with pagination
    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          batch: {
            select: {
              id: true,
              name: true
            }
          },
          submissions: {
            select: {
              id: true,
              status: true
            }
          },
          _count: {
            select: {
              submissions: true,
              contestParticipants: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    // Get all batches for filter
    const batches = await prisma.batch.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            students: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Format response
    const formattedStudents = students.map(student => ({
      id: student.id,
      firstName: student.name.split(' ')[0] || student.name,
      lastName: student.name.split(' ').slice(1).join(' ') || '',
      name: student.name,
      username: student.username || student.email.split('@')[0],
      email: student.email,
      batch: student.batch?.name || 'No Batch',
      batchId: student.batchId,
      status: student.isActive ? 'active' : 'inactive',
      joined: student.createdAt.toISOString(),
      problemsSolved: student.submissions.filter(s => s.status === 'ACCEPTED').length,
      totalSubmissions: student._count.submissions,
      contestsJoined: student._count.contestParticipants,
      isVerified: student.isVerified
    }))

    return NextResponse.json({
      success: true,
      data: {
        students: formattedStudents,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        batches: batches.map(b => ({
          id: b.id,
          name: b.name,
          studentCount: b._count.students
        }))
      }
    })

  } catch (error: any) {
    console.error('Students API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch students',
      details: error.message
    }, { status: 500 })
  }
}

