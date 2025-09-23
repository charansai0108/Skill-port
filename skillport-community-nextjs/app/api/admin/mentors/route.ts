import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, validatePaginationParams, createSuccessResponse, createErrorResponse } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// GET /api/admin/mentors - List mentors with pagination and filters
export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = validatePaginationParams({
      page: searchParams.get('page'),
      limit: searchParams.get('limit')
    })

    const search = searchParams.get('search') || ''
    const batch = searchParams.get('batch') || ''
    const status = searchParams.get('status') || ''

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (batch) {
      where.batches = {
        some: {
          batchId: batch
        }
      }
    }

    if (status) {
      where.isActive = status === 'active'
    }

    // Get mentors with pagination
    const [mentors, totalCount] = await Promise.all([
      prisma.mentor.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          specialization: true,
          bio: true,
          profilePic: true,
          isActive: true,
          rating: true,
          totalStudents: true,
          createdAt: true,
          batches: {
            select: {
              batch: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.mentor.count({ where })
    ])

    // Transform mentors data
    const transformedMentors = mentors.map(mentor => ({
      ...mentor,
      batches: mentor.batches.map(mb => mb.batch)
    }))

    return createSuccessResponse({
      mentors: transformedMentors,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    }, 'Mentors retrieved successfully')

  } catch (error: any) {
    console.error('Get mentors error:', error)
    return createErrorResponse('Failed to fetch mentors', 500)
  }
})

// POST /api/admin/mentors - Create new mentor
export const POST = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const body = await request.json()
    const { name, email, password, specialization, bio, profilePic, batchIds } = body

    // Validate required fields
    if (!name || !email || !password || !specialization) {
      return createErrorResponse('Missing required fields: name, email, password, specialization')
    }

    // Check if email already exists
    const existingMentor = await prisma.mentor.findUnique({
      where: { email }
    })

    if (existingMentor) {
      return createErrorResponse('Mentor with this email already exists', 409)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create mentor with batches in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create mentor
      const mentor = await tx.mentor.create({
        data: {
          name,
          email,
          password: hashedPassword,
          specialization,
          bio: bio || null,
          profilePic: profilePic || null
        }
      })

      // Assign batches if provided
      if (batchIds && batchIds.length > 0) {
        await tx.mentorBatch.createMany({
          data: batchIds.map((batchId: string) => ({
            mentorId: mentor.id,
            batchId
          }))
        })
      }

      return mentor
    })

    // Get created mentor with batches
    const mentor = await prisma.mentor.findUnique({
      where: { id: result.id },
      select: {
        id: true,
        name: true,
        email: true,
        specialization: true,
        bio: true,
        profilePic: true,
        isActive: true,
        rating: true,
        totalStudents: true,
        createdAt: true,
        batches: {
          select: {
            batch: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    return createSuccessResponse({
      ...mentor,
      batches: mentor?.batches.map(mb => mb.batch) || []
    }, 'Mentor created successfully', 201)

  } catch (error: any) {
    console.error('Create mentor error:', error)
    return createErrorResponse('Failed to create mentor', 500)
  }
})
