import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentStudent } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentStudent(request)
    
    if (!user || user.role !== 'PERSONAL') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's personal tasks
    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Get user's personal projects
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get user's submissions
    const submissions = await prisma.submission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get user's communities (as member)
    const communityMemberships = await prisma.communityMember.findMany({
      where: { userId: user.id },
      include: {
        community: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            isPublic: true,
            _count: {
              select: {
                members: true
              }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    })

    // Get recent activity
    const activities = await prisma.activityLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Calculate statistics
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.completed).length
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length
    const totalSubmissions = submissions.length
    const acceptedSubmissions = submissions.filter(s => s.status === 'ACCEPTED').length
    const accuracy = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0

    const dashboardData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic
      },
      stats: {
        totalTasks,
        completedTasks,
        taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalProjects,
        activeProjects,
        totalSubmissions,
        acceptedSubmissions,
        accuracy: Math.round(accuracy * 100) / 100,
        communityMemberships: communityMemberships.length
      },
      tasks,
      projects,
      submissions,
      communityMemberships: communityMemberships.map(cm => cm.community),
      recentActivities: activities,
      notifications
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Personal dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
