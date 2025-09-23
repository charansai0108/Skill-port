import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, createSuccessResponse, createErrorResponse } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'

// POST /api/admin/batches/[id]/students - Add students to batch
export const POST = withAdminAuth(async (request: NextRequest, admin, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    const body = await request.json()
    const { studentIds } = body

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return createErrorResponse('studentIds array is required')
    }

    // Check if batch exists
    const batch = await prisma.batch.findUnique({
      where: { id }
    })

    if (!batch) {
      return createErrorResponse('Batch not found', 404)
    }

    // Check if students exist and are students
    const students = await prisma.user.findMany({
      where: { 
        id: { in: studentIds },
        role: 'STUDENT'
      },
      select: { id: true }
    })

    if (students.length !== studentIds.length) {
      return createErrorResponse('One or more students not found or invalid role', 404)
    }

    // Add students to batch
    const updatedStudents = await prisma.user.updateMany({
      where: { id: { in: studentIds } },
      data: { batchId: id }
    })

    return createSuccessResponse({
      addedCount: updatedStudents.count
    }, 'Students added to batch successfully')

  } catch (error: any) {
    console.error('Add students to batch error:', error)
    return createErrorResponse('Failed to add students to batch', 500)
  }
})

// DELETE /api/admin/batches/[id]/students/[userId] - Remove student from batch
export const DELETE = withAdminAuth(async (request: NextRequest, admin, { params }: { params: { id: string, userId: string } }) => {
  try {
    const { id, userId } = params

    // Check if batch exists
    const batch = await prisma.batch.findUnique({
      where: { id }
    })

    if (!batch) {
      return createErrorResponse('Batch not found', 404)
    }

    // Check if student exists and is in this batch
    const student = await prisma.user.findFirst({
      where: { 
        id: userId,
        batchId: id,
        role: 'STUDENT'
      }
    })

    if (!student) {
      return createErrorResponse('Student not found in this batch', 404)
    }

    // Remove student from batch
    await prisma.user.update({
      where: { id: userId },
      data: { batchId: null }
    })

    return createSuccessResponse(null, 'Student removed from batch successfully')

  } catch (error: any) {
    console.error('Remove student from batch error:', error)
    return createErrorResponse('Failed to remove student from batch', 500)
  }
})
