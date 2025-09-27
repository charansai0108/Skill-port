import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, createSuccessResponse, createErrorResponse } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

// GET /api/admin/mentors/[id] - Get mentor by ID
export const GET = withAdminAuth(async (request: NextRequest, admin, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    const mentor = await prisma.mentor.findUnique({
      where: { id },
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
        updatedAt: true,
        batches: {
          select: {
            batch: {
              select: {
                id: true,
                name: true,
                status: true,
                _count: {
                  select: {
                    students: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!mentor) {
      return createErrorResponse('Mentor not found', 404)
    }

    return createSuccessResponse({
      ...mentor,
      batches: mentor.batches.map(mb => mb.batch)
    }, 'Mentor retrieved successfully')

  } catch (error: any) {
    console.error('Get mentor error:', error)
    return createErrorResponse('Failed to fetch mentor', 500)
  }
})

// PUT /api/admin/mentors/[id] - Update mentor
export const PUT = withAdminAuth(async (request: NextRequest, admin, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    const body = await request.json()
    const { name, email, specialization, bio, profilePic, isActive, batchIds } = body

    // Check if mentor exists
    const existingMentor = await prisma.mentor.findUnique({
      where: { id }
    })

    if (!existingMentor) {
      return createErrorResponse('Mentor not found', 404)
    }

    // Check if email is being changed and if it already exists
    if (email && email !== existingMentor.email) {
      const emailExists = await prisma.mentor.findUnique({
        where: { email }
      })

      if (emailExists) {
        return createErrorResponse('Email already exists', 409)
      }
    }

    // Update mentor and batches in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update mentor
      const mentor = await tx.mentor.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(specialization && { specialization }),
          ...(bio !== undefined && { bio }),
          ...(profilePic !== undefined && { profilePic }),
          ...(isActive !== undefined && { isActive })
        }
      })

      // Update batches if provided
      if (batchIds !== undefined) {
        // Remove existing batch assignments
        await tx.mentorBatch.deleteMany({
          where: { mentorId: id }
        })

        // Add new batch assignments
        if (batchIds.length > 0) {
          await tx.mentorBatch.createMany({
            data: batchIds.map((batchId: string) => ({
              mentorId: id,
              batchId
            }))
          })
        }
      }

      return mentor
    })

    // Get updated mentor with batches
    const mentor = await prisma.mentor.findUnique({
      where: { id },
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
        updatedAt: true,
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
    }, 'Mentor updated successfully')

  } catch (error: any) {
    console.error('Update mentor error:', error)
    return createErrorResponse('Failed to update mentor', 500)
  }
})

// DELETE /api/admin/mentors/[id] - Delete mentor
export const DELETE = withAdminAuth(async (request: NextRequest, admin, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    // Check if mentor exists
    const existingMentor = await prisma.mentor.findUnique({
      where: { id }
    })

    if (!existingMentor) {
      return createErrorResponse('Mentor not found', 404)
    }

    // Delete mentor (cascade will handle related records)
    await prisma.mentor.delete({
      where: { id }
    })

    return createSuccessResponse(null, 'Mentor deleted successfully')

  } catch (error: any) {
    console.error('Delete mentor error:', error)
    return createErrorResponse('Failed to delete mentor', 500)
  }
})
