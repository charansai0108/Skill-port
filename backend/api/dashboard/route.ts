import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-utils'
import { calculateUserStats, getTopPerformances, getRecentActivities, getActiveContests } from '@/lib/student-utils'
import { StudentDashboardData } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // Authenticate student
    const student = await getCurrentStudent(request)
    if (!student) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Get all dashboard data in parallel
    const [userStats, topPerformances, activeContests, recentActivities] = await Promise.all([
      calculateUserStats(student.id),
      getTopPerformances(student.id, 5),
      getActiveContests(student.id, 5),
      getRecentActivities(student.id, 10)
    ])

    const dashboardData: StudentDashboardData = {
      userStats,
      topPerformances,
      activeContests,
      recentActivities
    }

    return createResponse(dashboardData, 200, 'Dashboard data retrieved successfully')
  } catch (error) {
    console.error('Dashboard API error:', error)
    return createErrorResponse('Failed to retrieve dashboard data', 500)
  }
}
