import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentMentor } from '@/lib/auth'

export const GET = async (request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
  try {
    const { slug } = await params
    const mentor = await getCurrentMentor(request)

    if (!mentor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the community by slug
    const community = await prisma.community.findUnique({
      where: { slug },
      select: { id: true, name: true }
    })

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    // Verify mentor belongs to this community
    if (mentor.communityId !== community.id) {
      return NextResponse.json({ error: 'Forbidden: Not your community' }, { status: 403 })
    }

    // Get mentor's profile data
    const profileData = {
      id: mentor.id,
      name: mentor.name,
      email: mentor.email,
      phone: mentor.phone || '',
      profilePic: mentor.profilePic || '',
      bio: mentor.bio || '',
      specialization: mentor.specialization || '',
      experience: mentor.experience || 0,
      rating: mentor.rating || 0,
      totalStudents: mentor.totalStudents || 0,
      totalFeedbacks: mentor.totalFeedbacks || 0,
      joinDate: mentor.createdAt,
      lastActive: mentor.lastLoginAt || mentor.updatedAt
    }

    // Get mentor's students count
    const studentsCount = await prisma.user.count({
      where: {
        role: 'STUDENT',
        communityId: community.id
      }
    })

    // Get mentor's feedbacks count
    const feedbacksCount = await prisma.feedback.count({
      where: {
        mentorId: mentor.id,
        communityId: community.id
      }
    }).catch(() => 0) // Handle case where feedback table doesn't exist

    // Get recent activity (if you have an activity log)
    const recentActivity = await prisma.activityLog.findMany({
      where: {
        userId: mentor.id,
        communityId: community.id
      },
      select: {
        id: true,
        action: true,
        description: true,
        createdAt: true
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    }).catch(() => []) // Handle case where activity log doesn't exist

    return NextResponse.json({
      success: true,
      data: {
        profile: profileData,
        stats: {
          totalStudents: studentsCount,
          totalFeedbacks: feedbacksCount,
          averageRating: profileData.rating,
          experience: profileData.experience
        },
        recentActivity,
        community: {
          id: community.id,
          name: community.name
        }
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error fetching mentor profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile data', details: error.message }, { status: 500 })
  }
}

export const PUT = async (request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
  try {
    const { slug } = await params
    const mentor = await getCurrentMentor(request)

    if (!mentor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the community by slug
    const community = await prisma.community.findUnique({
      where: { slug },
      select: { id: true, name: true }
    })

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    // Verify mentor belongs to this community
    if (mentor.communityId !== community.id) {
      return NextResponse.json({ error: 'Forbidden: Not your community' }, { status: 403 })
    }

    const body = await request.json()
    const { name, phone, bio, specialization, experience } = body

    // Update mentor profile
    const updatedMentor = await prisma.user.update({
      where: { id: mentor.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(bio && { bio }),
        ...(specialization && { specialization }),
        ...(experience && { experience: parseInt(experience) })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profilePic: true,
        bio: true,
        specialization: true,
        experience: true,
        rating: true,
        totalStudents: true,
        totalFeedbacks: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        profile: updatedMentor
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error updating mentor profile:', error)
    return NextResponse.json({ error: 'Failed to update profile', details: error.message }, { status: 500 })
  }
}
