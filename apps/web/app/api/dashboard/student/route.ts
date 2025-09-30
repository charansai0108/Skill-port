import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentStudent } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentStudent(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's submissions with statistics
    const submissions = await prisma.submission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const totalSubmissions = await prisma.submission.count({
      where: { userId: user.id }
    })

    const acceptedSubmissions = await prisma.submission.count({
      where: { 
        userId: user.id,
        status: 'ACCEPTED'
      }
    })

    const accuracy = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0

    // Get user's contests
    const contestParticipations = await prisma.contestParticipant.findMany({
      where: { userId: user.id },
      include: {
        contest: true
      },
      orderBy: { joinedAt: 'desc' },
      take: 5
    })

    // Get user's tasks
    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get recent activity
    const activities = await prisma.activityLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const dashboardData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic
      },
      stats: {
        totalSubmissions,
        acceptedSubmissions,
        accuracy: Math.round(accuracy * 100) / 100,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
        activeContests: contestParticipations.length
      },
      recentSubmissions: submissions,
      recentTasks: tasks,
      recentContests: contestParticipations.map(cp => ({
        ...cp.contest,
        userScore: cp.score,
        userRank: cp.rank
      })),
      recentActivities: activities,
      notifications
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Student dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
