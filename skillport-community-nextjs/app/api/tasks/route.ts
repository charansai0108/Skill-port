import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createResponse, createErrorResponse, getUserIdFromRequest, withErrorHandling, parseQueryParams, validateRequestBody } from '@/lib/api-utils'
import { TaskData, CreateTaskRequest, TaskFilters, BulkTaskUpdate } from '@/lib/types'
import { Platform, Difficulty, Priority } from '@prisma/client'

async function getTasks(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  
  if (!userId) {
    return createErrorResponse('User ID is required', 401)
  }

  const params = parseQueryParams(request)
  const filters = parseTaskFilters(params)

  // Build where clause
  const where = {
    userId,
    ...buildTaskWhereClause(filters)
  }

  // Get tasks
  const tasks = await prisma.task.findMany({
    where,
    orderBy: { date: 'desc' }
  })

  const taskData: TaskData[] = tasks.map(task => ({
    id: task.id,
    description: task.description,
    platform: task.platform,
    difficulty: task.difficulty,
    completed: task.completed,
    date: task.date.toISOString(),
    projectId: task.projectId || undefined,
    priority: task.priority,
    createdAt: task.createdAt.toISOString()
  }))

  return createResponse(taskData)
}

async function createTask(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  
  if (!userId) {
    return createErrorResponse('User ID is required', 401)
  }

  const body: CreateTaskRequest = await request.json()
  
  // Validate required fields
  const validation = validateRequestBody(body, ['description', 'platform', 'difficulty', 'date'])
  if (!validation.isValid) {
    return createErrorResponse(validation.errors.join(', '), 400)
  }

  // Create the task
  const task = await prisma.task.create({
    data: {
      userId,
      description: body.description,
      platform: body.platform,
      difficulty: body.difficulty,
      date: new Date(body.date),
      projectId: body.projectId || null,
      priority: body.priority || Priority.MEDIUM
    }
  })

  const taskData: TaskData = {
    id: task.id,
    description: task.description,
    platform: task.platform,
    difficulty: task.difficulty,
    completed: task.completed,
    date: task.date.toISOString(),
    projectId: task.projectId || undefined,
    priority: task.priority,
    createdAt: task.createdAt.toISOString()
  }

  return createResponse(taskData, 201, 'Task created successfully')
}

function parseTaskFilters(params: Record<string, string>): TaskFilters {
  return {
    platform: params.platform as Platform | undefined,
    difficulty: params.difficulty as Difficulty | undefined,
    priority: params.priority as Priority | undefined,
    completed: params.completed ? params.completed === 'true' : undefined,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    projectId: params.projectId
  }
}

function buildTaskWhereClause(filters: TaskFilters) {
  const where: any = {}

  if (filters.platform) {
    where.platform = filters.platform
  }

  if (filters.difficulty) {
    where.difficulty = filters.difficulty
  }

  if (filters.priority) {
    where.priority = filters.priority
  }

  if (filters.completed !== undefined) {
    where.completed = filters.completed
  }

  if (filters.projectId) {
    where.projectId = filters.projectId
  }

  if (filters.dateFrom || filters.dateTo) {
    where.date = {}
    if (filters.dateFrom) {
      where.date.gte = new Date(filters.dateFrom)
    }
    if (filters.dateTo) {
      where.date.lte = new Date(filters.dateTo)
    }
  }

  return where
}

export const GET = withErrorHandling(getTasks)
export const POST = withErrorHandling(createTask)
