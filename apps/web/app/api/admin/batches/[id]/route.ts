import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, createSuccessResponse, createErrorResponse } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

// GET /api/admin/batches/[id] - Get batch by ID
export const GET = withAdminAuth(async (request: NextRequest, admin, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params

    const batch = await prisma.batch.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
        students: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePic: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        mentors: {
          select: {
            mentor: {
              select: {
                id: true,
                name: true,
                email: true,
                specialization: true,
                profilePic: true,
                rating: true
              }
            }
          }
        },
        contests: {
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
            _count: {
              select: {
                participants: true
              }
            }
          },
          orderBy: { startDate: 'desc' }
        },
        _count: {
          select: {
            students: true,
            mentors: true,
            contests: true
          }
        }
      }
    })

    if (!batch) {
      return createErrorResponse('Batch not found', 404)
    }

    // Transform mentors data
    const transformedBatch = {
      ...batch,
      mentors: batch.mentors.map((mb: any) => mb.mentor)
    }

    return createSuccessResponse(transformedBatch, 'Batch retrieved successfully')

  } catch (error: any) {
    console.error('Get batch error:', error)
    return createErrorResponse('Failed to fetch batch', 500)
  }
})

// PUT /api/admin/batches/[id] - Update batch
export const PUT = withAdminAuth(async (request: NextRequest, admin, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, startDate, endDate, status } = body

    // Check if batch exists
    const existingBatch = await prisma.batch.findUnique({
      where: { id }
    })

    if (!existingBatch) {
      return createErrorResponse('Batch not found', 404)
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (start >= end) {
        return createErrorResponse('End date must be after start date')
      }
    }

    // Update batch
    const batch = await prisma.batch.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status && { status })
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        updatedAt: true,
        _count: {
          select: {
            students: true,
            mentors: true,
            contests: true
          }
        }
      }
    })

    return createSuccessResponse(batch, 'Batch updated successfully')

  } catch (error: any) {
    console.error('Update batch error:', error)
    return createErrorResponse('Failed to update batch', 500)
  }
})

// DELETE /api/admin/batches/[id] - Delete batch
export const DELETE = withAdminAuth(async (request: NextRequest, admin, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params

    // Check if batch exists
    const existingBatch = await prisma.batch.findUnique({
      where: { id }
    })

    if (!existingBatch) {
      return createErrorResponse('Batch not found', 404)
    }

    // Delete batch (cascade will handle related records)
    await prisma.batch.delete({
      where: { id }
    })

    return createSuccessResponse(null, 'Batch deleted successfully')

  } catch (error: any) {
    console.error('Delete batch error:', error)
    return createErrorResponse('Failed to delete batch', 500)
  }
})
