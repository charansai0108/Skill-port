import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createResponse, createErrorResponse, getUserIdFromRequest, withErrorHandling } from '@/lib/api-utils'
import { DashboardSummary, RecentActivity } from '@/lib/types'
import { Platform, Difficulty } from '@prisma/client'

async function getDashboardSummary(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  
  if (!userId) {
    return createErrorResponse('User ID is required', 401)
  }

  // Get user's tasks
  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  // Calculate basic stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  // Calculate current streak
  const currentStreak = await calculateCurrentStreak(userId)

  // Get weekly goal and progress
  const weeklyGoal = 5 // Default weekly goal
  const weeklyProgress = await getWeeklyProgress(userId)

  // Get recent activities
  const recentActivities = await getRecentActivities(userId)

  const summary: DashboardSummary = {
    totalTasks,
    completedTasks,
    currentStreak,
    weeklyGoal,
    weeklyProgress: Math.round(weeklyProgress),
    recentActivities
  }

  return createResponse(summary)
}

async function calculateCurrentStreak(userId: string): Promise<number> {
  const tasks = await prisma.task.findMany({
    where: { 
      userId,
      completed: true
    },
    orderBy: { date: 'desc' }
  })

  if (tasks.length === 0) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 365; i++) { // Check up to 365 days back
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)
    
    const hasTaskOnDate = tasks.some(task => {
      const taskDate = new Date(task.date)
      taskDate.setHours(0, 0, 0, 0)
      return taskDate.getTime() === checkDate.getTime()
    })

    if (hasTaskOnDate) {
      streak++
    } else {
      break
    }
  }

  return streak
}

async function getWeeklyProgress(userId: string): Promise<number> {
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const weeklyTasks = await prisma.task.findMany({
    where: {
      userId,
      date: {
        gte: startOfWeek,
        lte: endOfWeek
      },
      completed: true
    }
  })

  return weeklyTasks.length
}

async function getRecentActivities(userId: string): Promise<RecentActivity[]> {
  const [recentTasks, recentProjects] = await Promise.all([
    prisma.task.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 5
    }),
    prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 3
    })
  ])

  const activities: RecentActivity[] = []

  // Add recent tasks
  recentTasks.forEach(task => {
    activities.push({
      id: task.id,
      type: 'task',
      title: task.description,
      description: `Completed ${task.platform} ${task.difficulty} problem`,
      timestamp: task.updatedAt.toISOString(),
      platform: task.platform,
      difficulty: task.difficulty
    })
  })

  // Add recent projects
  recentProjects.forEach(project => {
    activities.push({
      id: project.id,
      type: 'project',
      title: project.title,
      description: `Updated project: ${project.status}`,
      timestamp: project.updatedAt.toISOString()
    })
  })

  // Sort by timestamp and return top 5
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)
}

export const GET = withErrorHandling(getDashboardSummary)
