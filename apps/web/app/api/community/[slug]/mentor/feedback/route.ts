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

    // Get students in this community
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        communityId: community.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        createdAt: true,
        lastLoginAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get feedbacks for this mentor
    const feedbacks = await prisma.feedback.findMany({
      where: {
        mentorId: mentor.id,
        communityId: community.id
      },
      include: {
        student: {
          select: {
            name: true,
            email: true,
            profilePic: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []) // Handle case where feedback table doesn't exist

    return NextResponse.json({
      success: true,
      data: {
        students,
        feedbacks,
        community: {
          id: community.id,
          name: community.name
        }
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error fetching mentor feedback data:', error)
    return NextResponse.json({ error: 'Failed to fetch feedback data', details: error.message }, { status: 500 })
  }
}

export const POST = async (request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
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
    const { studentId, rating, feedback, improvements, recommendations } = body

    if (!studentId || !rating || !feedback) {
      return NextResponse.json({ error: 'Student ID, rating, and feedback are required' }, { status: 400 })
    }

    // Verify student belongs to the same community
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        role: 'STUDENT',
        communityId: community.id
      }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found in this community' }, { status: 404 })
    }

    // Create feedback
    const newFeedback = await prisma.feedback.create({
      data: {
        studentId,
        mentorId: mentor.id,
        communityId: community.id,
        rating: parseInt(rating),
        feedback,
        improvements: improvements || '',
        recommendations: recommendations || '',
        isRead: false
      }
    }).catch(() => {
      throw new Error('Failed to create feedback - feedback table may not exist')
    })

    return NextResponse.json({
      success: true,
      data: {
        feedback: {
          id: newFeedback.id,
          studentId: newFeedback.studentId,
          mentorId: newFeedback.mentorId,
          rating: newFeedback.rating,
          feedback: newFeedback.feedback,
          improvements: newFeedback.improvements,
          recommendations: newFeedback.recommendations,
          createdAt: newFeedback.createdAt
        }
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating feedback:', error)
    return NextResponse.json({ error: 'Failed to create feedback', details: error.message }, { status: 500 })
  }
}
