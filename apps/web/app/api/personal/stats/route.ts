import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const GET = async (request: NextRequest) => {
  try {
    const user = await getCurrentUser(request)
    
    if (!user || user.role !== 'PERSONAL') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's tasks
    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        description: true,
        completed: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get user's projects
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        progress: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get user's submissions
    const submissions = await prisma.submission.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        status: true,
        score: true,
        createdAt: true,
        contestId: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get user's community memberships
    const communityMemberships = await prisma.communityMember.findMany({
      where: { userId: user.id },
      include: {
        community: {
          select: {
            id: true,
            name: true,
            type: true,
            _count: {
              select: {
                members: true
              }
            }
          }
        }
      }
    })

    // Calculate task statistics
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.completed).length
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const overdueTasks = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && !t.completed
    ).length

    // Calculate project statistics
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length
    const averageProgress = projects.length > 0 
      ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
      : 0

    // Calculate submission statistics
    const totalSubmissions = submissions.length
    const acceptedSubmissions = submissions.filter(s => s.status === 'ACCEPTED').length
    const accuracy = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0
    const averageScore = submissions.length > 0 
      ? Math.round(submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length)
      : 0

    // Calculate community statistics
    const totalCommunities = communityMemberships.length
    const publicCommunities = communityMemberships.filter(cm => cm.community.type === 'public').length
    const privateCommunities = communityMemberships.filter(cm => cm.community.type === 'private').length

    // Get activity over time (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentActivity = await prisma.activityLog.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        id: true,
        action: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []) // Handle case where activity log doesn't exist

    // Group activity by day for chart data
    const activityByDay = recentActivity.reduce((acc, activity) => {
      const date = activity.createdAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Generate chart data for last 30 days
    const chartData = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      chartData.push({
        date: dateStr,
        activities: activityByDay[dateStr] || 0
      })
    }

    // Get achievements
    const achievements = await prisma.achievement.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        earnedAt: true
      },
      orderBy: { earnedAt: 'desc' }
    }).catch(() => []) // Handle case where achievements table doesn't exist

    const stats = {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: taskCompletionRate,
        overdue: overdueTasks
      },
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        averageProgress
      },
      submissions: {
        total: totalSubmissions,
        accepted: acceptedSubmissions,
        accuracy,
        averageScore
      },
      communities: {
        total: totalCommunities,
        public: publicCommunities,
        private: privateCommunities
      },
      achievements: {
        total: achievements.length,
        recent: achievements.slice(0, 5)
      },
      activity: {
        last30Days: recentActivity.length,
        chartData
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error fetching personal stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats data', details: error.message }, { status: 500 })
  }
}
