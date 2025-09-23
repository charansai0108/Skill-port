import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createResponse, createErrorResponse, getUserIdFromRequest, withErrorHandling, parseQueryParams } from '@/lib/api-utils'
import { StatsSummary, WeeklyProgress, DifficultyStats, PlatformStats, StatsFilters } from '@/lib/types'
import { Platform, Difficulty, DayOfWeek } from '@prisma/client'

async function getStatsSummary(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  
  if (!userId) {
    return createErrorResponse('User ID is required', 401)
  }

  const params = parseQueryParams(request)
  const filters = parseStatsFilters(params)

  // Get user's tasks with filters
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      ...buildTaskWhereClause(filters)
    }
  })

  // Calculate basic stats
  const totalProblems = tasks.length
  const completedTasks = tasks.filter(task => task.completed)
  const skillRating = calculateSkillRating(completedTasks)
  const dayStreak = await calculateCurrentStreak(userId)
  const achievements = await prisma.badge.count({ where: { userId } })

  // Get weekly progress
  const weeklyProgress = await getWeeklyProgress(userId)

  // Get difficulty distribution
  const difficultyDistribution = getDifficultyDistribution(completedTasks)

  // Get platform stats
  const platformStats = getPlatformStats(completedTasks)

  const summary: StatsSummary = {
    totalProblems,
    skillRating,
    dayStreak,
    achievements,
    weeklyProgress,
    difficultyDistribution,
    platformStats
  }

  return createResponse(summary)
}

function parseStatsFilters(params: Record<string, string>): StatsFilters {
  return {
    platform: params.platform as Platform | undefined,
    difficulty: params.difficulty as Difficulty | undefined,
    dateRange: params.dateRange as StatsFilters['dateRange'] || 'all'
  }
}

function buildTaskWhereClause(filters: StatsFilters) {
  const where: any = {}

  if (filters.platform) {
    where.platform = filters.platform
  }

  if (filters.difficulty) {
    where.difficulty = filters.difficulty
  }

  if (filters.dateRange && filters.dateRange !== 'all') {
    const dateRange = getDateRange(filters.dateRange)
    where.date = {
      gte: dateRange.start,
      lte: dateRange.end
    }
  }

  return where
}

function getDateRange(dateRange: string) {
  const now = new Date()
  const start = new Date()
  const end = new Date()

  switch (dateRange) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'thisWeek':
      start.setDate(now.getDate() - now.getDay())
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'thisMonth':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(now.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'lastMonth':
      start.setMonth(now.getMonth() - 1, 1)
      start.setHours(0, 0, 0, 0)
      end.setDate(0)
      end.setHours(23, 59, 59, 999)
      break
    case 'thisYear':
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(11, 31)
      end.setHours(23, 59, 59, 999)
      break
    default:
      start.setFullYear(2020)
      end.setHours(23, 59, 59, 999)
  }

  return { start, end }
}

function calculateSkillRating(completedTasks: any[]): number {
  // Simple skill rating calculation based on completed tasks
  const difficultyMultiplier = {
    EASY: 1,
    MEDIUM: 2,
    HARD: 3
  }

  const baseRating = 1000
  const rating = completedTasks.reduce((total, task) => {
    return total + (difficultyMultiplier[task.difficulty] * 10)
  }, baseRating)

  return Math.min(rating, 3000) // Cap at 3000
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

  for (let i = 0; i < 365; i++) {
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

async function getWeeklyProgress(userId: string): Promise<WeeklyProgress[]> {
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const weeklyTasks = await prisma.task.findMany({
    where: {
      userId,
      date: {
        gte: startOfWeek
      },
      completed: true
    }
  })

  const days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
  
  return days.map(day => {
    const dayTasks = weeklyTasks.filter(task => {
      const taskDate = new Date(task.date)
      const dayOfWeek = days[taskDate.getDay() === 0 ? 6 : taskDate.getDay() - 1]
      return dayOfWeek === day
    })

    return {
      day,
      problems: dayTasks.length
    }
  })
}

function getDifficultyDistribution(completedTasks: any[]): DifficultyStats[] {
  const difficultyCounts = completedTasks.reduce((acc, task) => {
    acc[task.difficulty] = (acc[task.difficulty] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const total = completedTasks.length
  const colors = {
    EASY: '#10b981',
    MEDIUM: '#f59e0b',
    HARD: '#ef4444'
  }

  return Object.entries(difficultyCounts).map(([difficulty, count]) => ({
    difficulty: difficulty as Difficulty,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    color: colors[difficulty as keyof typeof colors]
  }))
}

function getPlatformStats(completedTasks: any[]): PlatformStats[] {
  const platformCounts = completedTasks.reduce((acc, task) => {
    acc[task.platform] = (acc[task.platform] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const total = completedTasks.length

  return Object.entries(platformCounts).map(([platform, problems]) => ({
    platform: platform as Platform,
    problems,
    percentage: total > 0 ? Math.round((problems / total) * 100) : 0
  }))
}

export const GET = withErrorHandling(getStatsSummary)
