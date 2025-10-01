import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin(request)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get admin user details
    const user = await prisma.user.findUnique({
      where: { id: admin.id },
      include: {
        communities: {
          include: {
            _count: {
              select: {
                members: true,
                batches: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get batches managed by this admin
    const batches = await prisma.batch.findMany({
      where: {
        community: {
          adminId: admin.id
        }
      },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            isActive: true
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Format batches
    const formattedBatches = batches.map(batch => ({
      id: batch.id,
      name: batch.name,
      count: batch._count.students,
      color: ['blue', 'green', 'purple', 'orange', 'red'][batches.indexOf(batch) % 5],
      students: batch.students.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        username: s.username || s.email.split('@')[0],
        status: s.isActive ? 'active' : 'inactive'
      }))
    }))

    // Get admin stats
    const stats = {
      totalStudents: await prisma.user.count({
        where: {
          role: 'STUDENT',
          communityId: user.communityId
        }
      }),
      totalMentors: await prisma.user.count({
        where: {
          role: 'MENTOR',
          communityId: user.communityId
        }
      }),
      totalBatches: batches.length,
      totalCommunities: user.communities.length
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          phone: user.phone,
          bio: user.bio,
          profilePic: user.profilePic,
          communityId: user.communityId,
          createdAt: user.createdAt.toISOString()
        },
        batches: formattedBatches,
        stats,
        communities: user.communities.map(c => ({
          id: c.id,
          name: c.name,
          description: c.description,
          type: c.type,
          isPublic: c.isPublic,
          memberCount: c._count.members,
          batchCount: c._count.batches
        }))
      }
    })

  } catch (error: any) {
    console.error('Profile API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch profile',
      details: error.message
    }, { status: 500 })
  }
}

// Update profile
export async function PUT(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin(request)
    
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, username, phone, bio } = body

    const updatedUser = await prisma.user.update({
      where: { id: admin.id },
      data: {
        name,
        username,
        phone,
        bio
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        phone: updatedUser.phone,
        bio: updatedUser.bio
      }
    })

  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json({
      error: 'Failed to update profile',
      details: error.message
    }, { status: 500 })
  }
}
