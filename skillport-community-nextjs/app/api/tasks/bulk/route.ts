import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createResponse, createErrorResponse, getUserIdFromRequest, withErrorHandling, validateRequestBody } from '@/lib/api-utils'
import { BulkTaskUpdate } from '@/lib/types'

async function bulkUpdateTasks(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  
  if (!userId) {
    return createErrorResponse('User ID is required', 401)
  }

  const body: BulkTaskUpdate = await request.json()
  
  // Validate required fields
  const validation = validateRequestBody(body, ['taskIds', 'action'])
  if (!validation.isValid) {
    return createErrorResponse(validation.errors.join(', '), 400)
  }

  const { taskIds, action, updates } = body

  // Verify all tasks belong to the user
  const tasks = await prisma.task.findMany({
    where: {
      id: { in: taskIds },
      userId
    }
  })

  if (tasks.length !== taskIds.length) {
    return createErrorResponse('Some tasks not found or do not belong to user', 400)
  }

  let result: any

  switch (action) {
    case 'complete':
      result = await prisma.task.updateMany({
        where: {
          id: { in: taskIds },
          userId
        },
        data: { completed: true }
      })
      break

    case 'delete':
      result = await prisma.task.deleteMany({
        where: {
          id: { in: taskIds },
          userId
        }
      })
      break

    case 'update':
      if (!updates) {
        return createErrorResponse('Updates required for update action', 400)
      }
      result = await prisma.task.updateMany({
        where: {
          id: { in: taskIds },
          userId
        },
        data: updates
      })
      break

    default:
      return createErrorResponse('Invalid action', 400)
  }

  return createResponse(result, 200, `Tasks ${action}d successfully`)
}

export const PATCH = withErrorHandling(bulkUpdateTasks)
