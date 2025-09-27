import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, validatePaginationParams, createSuccessResponse, createErrorResponse } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

// GET /api/admin/batches - List batches with pagination and filters
export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = validatePaginationParams({
      page: searchParams.get('page'),
      limit: searchParams.get('limit')
    })

    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    // Get batches with pagination
    const [batches, totalCount] = await Promise.all([
      prisma.batch.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              students: true,
              mentors: true,
              contests: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.batch.count({ where })
    ])

    return createSuccessResponse({
      batches,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    }, 'Batches retrieved successfully')

  } catch (error: any) {
    console.error('Get batches error:', error)
    return createErrorResponse('Failed to fetch batches', 500)
  }
})

// POST /api/admin/batches - Create new batch
export const POST = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const body = await request.json()
    const { name, description, startDate, endDate, status } = body

    // Validate required fields
    if (!name) {
      return createErrorResponse('Name is required')
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (start >= end) {
        return createErrorResponse('End date must be after start date')
      }
    }

    // Create batch
    const batch = await prisma.batch.create({
      data: {
        name,
        description: description || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        _count: {
          select: {
            students: true,
            mentors: true,
            contests: true
          }
        }
      }
    })

    return createSuccessResponse(batch, 'Batch created successfully', 201)

  } catch (error: any) {
    console.error('Create batch error:', error)
    return createErrorResponse('Failed to create batch', 500)
  }
})
