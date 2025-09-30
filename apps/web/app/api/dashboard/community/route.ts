import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentStudent } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentStudent(request)
    
    if (!user || user.role !== 'COMMUNITY_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's communities
    const communities = await prisma.community.findMany({
      where: { adminId: user.id },
      include: {
        _count: {
          select: {
            members: true,
            events: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get community members across all communities
    const communityMembers = await prisma.communityMember.findMany({
      where: {
        community: {
          adminId: user.id
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
          }
        },
        community: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { joinedAt: 'desc' },
      take: 20
    })

    // Get community events
    const events = await prisma.communityEvent.findMany({
      where: {
        community: {
          adminId: user.id
        }
      },
      include: {
        community: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { date: 'desc' },
      take: 10
    })

    // Get recent activities in communities
    const recentActivities = await prisma.activityLog.findMany({
      where: {
        user: {
          communityMembers: {
            some: {
              community: {
                adminId: user.id
              }
            }
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const totalMembers = communityMembers.length
    const totalEvents = events.length

    const dashboardData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic
      },
      stats: {
        totalCommunities: communities.length,
        totalMembers,
        totalEvents,
        activeCommunities: communities.filter(c => c._count.members > 0).length
      },
      communities,
      communityMembers,
      events,
      recentActivities,
      notifications
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Community dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
