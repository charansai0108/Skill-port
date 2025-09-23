import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createResponse, createErrorResponse, getUserIdFromRequest, withErrorHandling, validateRequestBody } from '@/lib/api-utils'
import { UpdateTaskRequest } from '@/lib/types'

async function updateTask(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserIdFromRequest(request)
  const taskId = params.id

  if (!userId) {
    return createErrorResponse('User ID is required', 401)
  }

  const body: UpdateTaskRequest = await request.json()

  // Check if task exists and belongs to user
  const existingTask = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId
    }
  })

  if (!existingTask) {
    return createErrorResponse('Task not found', 404)
  }

  // Update the task
  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(body.description && { description: body.description }),
      ...(body.platform && { platform: body.platform }),
      ...(body.difficulty && { difficulty: body.difficulty }),
      ...(body.completed !== undefined && { completed: body.completed }),
      ...(body.priority && { priority: body.priority })
    }
  })

  return createResponse(task, 200, 'Task updated successfully')
}

async function deleteTask(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserIdFromRequest(request)
  const taskId = params.id

  if (!userId) {
    return createErrorResponse('User ID is required', 401)
  }

  // Check if task exists and belongs to user
  const existingTask = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId
    }
  })

  if (!existingTask) {
    return createErrorResponse('Task not found', 404)
  }

  // Delete the task
  await prisma.task.delete({
    where: { id: taskId }
  })

  return createResponse(null, 200, 'Task deleted successfully')
}

export const PATCH = withErrorHandling(updateTask)
export const DELETE = withErrorHandling(deleteTask)
