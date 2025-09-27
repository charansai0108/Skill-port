import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, validatePaginationParams, createSuccessResponse, createErrorResponse } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// GET /api/admin/users - List users with pagination and filters
export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = validatePaginationParams({
      page: searchParams.get('page'),
      limit: searchParams.get('limit')
    })

    const search = searchParams.get('search') || ''
    const batch = searchParams.get('batch') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (batch) {
      where.batchId = batch
    }

    if (role) {
      where.role = role
    }

    if (status) {
      where.status = status
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          profilePic: true,
          createdAt: true,
          batch: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              tasks: true,
              projects: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    return createSuccessResponse({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    }, 'Users retrieved successfully')

  } catch (error: any) {
    console.error('Get users error:', error)
    return createErrorResponse('Failed to fetch users', 500)
  }
})

// POST /api/admin/users - Create new user
export const POST = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const body = await request.json()
    const { name, email, password, role, batchId, profilePic } = body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return createErrorResponse('Missing required fields: name, email, password, role')
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return createErrorResponse('User with this email already exists', 409)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        batchId: batchId || null,
        profilePic: profilePic || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        profilePic: true,
        createdAt: true,
        batch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return createSuccessResponse(user, 'User created successfully', 201)

  } catch (error: any) {
    console.error('Create user error:', error)
    return createErrorResponse('Failed to create user', 500)
  }
})
