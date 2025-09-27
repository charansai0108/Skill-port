import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createResponse, createErrorResponse, getUserIdFromRequest, withErrorHandling } from '@/lib/api-utils'
import { DailyTasksData, TaskData } from '@/lib/types'
import { DayOfWeek } from '@prisma/client'

async function getTodayTasks(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  
  if (!userId) {
    return createErrorResponse('User ID is required', 401)
  }

  const today = new Date()
  const startOfDay = new Date(today)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)

  // Get tasks for today
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    orderBy: { createdAt: 'asc' }
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

  const completedCount = tasks.filter(task => task.completed).length
  const totalCount = tasks.length
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const todayName = getTodayName()

  const dailyTasksData: DailyTasksData = {
    day: todayName,
    tasks: taskData,
    completedCount,
    totalCount,
    progressPercentage
  }

  return createResponse(dailyTasksData)
}

function getTodayName(): DayOfWeek {
  const today = new Date().getDay()
  const days: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  return days[today]
}

export const GET = withErrorHandling(getTodayTasks)
