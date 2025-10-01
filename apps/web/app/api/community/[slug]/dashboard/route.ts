import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Verify admin authentication
    const admin = await getCurrentAdmin(request)
    if (!admin) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 401 })
    }

    // Get community by slug
    const community = await prisma.community.findUnique({
      where: { slug },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePic: true
          }
        },
        batches: {
          include: {
            _count: {
              select: {
                students: true
              }
            }
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
              }
            }
          }
        }
      }
    })

    if (!community) {
      return NextResponse.json({
        error: 'Community not found'
      }, { status: 404 })
    }

    // Verify admin owns this community
    if (admin.id !== community.adminId) {
      return NextResponse.json({
        error: 'Access denied'
      }, { status: 403 })
    }

    // Get community-specific stats
    const totalStudents = await prisma.user.count({
      where: {
        communityId: community.id,
        role: 'STUDENT'
      }
    })

    const totalMentors = await prisma.user.count({
      where: {
        communityId: community.id,
        role: 'MENTOR'
      }
    })

    // For now, get all contests (since Contest model doesn't have communityId)
    const totalContests = await prisma.contest.count()

    const totalSubmissions = await prisma.submission.count()

    // Get recent students
    const recentStudents = await prisma.user.findMany({
      where: {
        communityId: community.id,
        role: 'STUDENT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        batch: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    // Get recent mentors
    const recentMentors = await prisma.user.findMany({
      where: {
        communityId: community.id,
        role: 'MENTOR'
      },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    // Get recent activities (simplified for now)
    const recentActivities = await prisma.activityLog.findMany({
      select: {
        id: true,
        action: true,
        details: true,
        createdAt: true,
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    const dashboardData = {
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        profilePic: admin.profilePic
      },
      community: {
        id: community.id,
        name: community.name,
        slug: community.slug,
        description: community.description,
        memberCount: community.members.length,
        batchCount: community.batches.length
      },
      stats: {
        totalUsers: community.members.length,
        totalStudents,
        totalMentors,
        totalContests,
        totalSubmissions,
        totalBatches: community.batches.length,
        activeUsers: community.members.length // Simplified for now
      },
      recentStudents,
      recentMentors,
      recentActivities,
      notifications: [] // TODO: Implement notifications
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    })

  } catch (error: any) {
    console.error('Community dashboard API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch dashboard data',
      details: error.message
    }, { status: 500 })
  }
}
