import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentStudent(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const userId = user.id

    // Get user's submissions from all platforms
    const submissions = await prisma.submission.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      take: 100 // Limit to recent 100 submissions
    })

    // Calculate stats
    const totalSubmissions = submissions.length
    const acceptedSubmissions = submissions.filter(s => s.status === 'accepted').length
    const accuracy = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0

    // Calculate average execution time
    const validTimes = submissions.filter(s => s.executionTime && s.executionTime > 0)
    const averageTime = validTimes.length > 0 
      ? validTimes.reduce((sum, s) => sum + (s.executionTime || 0), 0) / validTimes.length
      : 0

    // Group by platform
    const platformStats = submissions.reduce((acc, submission) => {
      if (!acc[submission.platform]) {
        acc[submission.platform] = {
          total: 0,
          accepted: 0,
          averageTime: 0,
          languages: new Set(),
          difficulties: { easy: 0, medium: 0, hard: 0 }
        }
      }
      
      acc[submission.platform].total++
      if (submission.status === 'accepted') {
        acc[submission.platform].accepted++
      }
      
      if (submission.language) {
        acc[submission.platform].languages.add(submission.language)
      }
      
      if (submission.difficulty) {
        acc[submission.platform].difficulties[submission.difficulty]++
      }
      
      return acc
    }, {} as Record<string, any>)

    // Calculate average time for each platform
    Object.keys(platformStats).forEach(platform => {
      const platformSubmissions = submissions.filter(s => s.platform === platform)
      const validTimes = platformSubmissions.filter(s => s.executionTime && s.executionTime > 0)
      platformStats[platform].averageTime = validTimes.length > 0 
        ? validTimes.reduce((sum, s) => sum + (s.executionTime || 0), 0) / validTimes.length
        : 0
      
      // Convert Set to Array for languages
      platformStats[platform].languages = Array.from(platformStats[platform].languages)
    })

    // Get recent submissions (last 10)
    const recentSubmissions = submissions.slice(0, 10).map(submission => ({
      id: submission.id,
      platform: submission.platform,
      problemTitle: submission.problemTitle,
      difficulty: submission.difficulty,
      language: submission.language,
      status: submission.status,
      executionTime: submission.executionTime,
      memoryUsage: submission.memoryUsage,
      score: submission.score,
      submittedAt: submission.submittedAt
    }))

    // Get difficulty distribution
    const difficultyStats = submissions.reduce((acc, submission) => {
      if (submission.difficulty) {
        acc[submission.difficulty] = (acc[submission.difficulty] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Get language distribution
    const languageStats = submissions.reduce((acc, submission) => {
      if (submission.language) {
        acc[submission.language] = (acc[submission.language] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Get monthly submission trends (last 12 months)
    const monthlyTrends = submissions.reduce((acc, submission) => {
      const month = submission.submittedAt.toISOString().substring(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { total: 0, accepted: 0 }
      }
      acc[month].total++
      if (submission.status === 'accepted') {
        acc[month].accepted++
      }
      return acc
    }, {} as Record<string, { total: number; accepted: number }>)

    // Convert to array and sort by month
    const monthlyTrendsArray = Object.entries(monthlyTrends)
      .map(([month, stats]) => ({
        month,
        total: stats.total,
        accepted: stats.accepted,
        accuracy: stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    return createResponse(
      {
        totalSubmissions,
        acceptedSubmissions,
        accuracy: parseFloat(accuracy.toFixed(2)),
        averageTime: parseFloat(averageTime.toFixed(2)),
        platformStats,
        recentSubmissions,
        difficultyStats,
        languageStats,
        monthlyTrends: monthlyTrendsArray,
        lastSync: new Date().toISOString()
      },
      200,
      'Extension data retrieved successfully'
    )

  } catch (error) {
    console.error('Get extension data error:', error)
    return createErrorResponse('Failed to retrieve extension data', 500)
  }
}
