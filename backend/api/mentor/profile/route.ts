import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withMentorAuth, MentorAuthRequest } from '@/lib/mentor-middleware'
import { validateData, updateProfileSchema, changePasswordSchema } from '@/lib/mentor-validation'
import { hashPassword, comparePassword } from '@/lib/auth'

const prisma = new PrismaClient()

export const GET = withMentorAuth(async (request: MentorAuthRequest) => {
  try {
    const mentorId = request.mentor!.id

    const mentor = await prisma.mentor.findUnique({
      where: { id: mentorId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            location: true,
            bio: true,
            profilePic: true,
            specialization: true,
            createdAt: true,
            updatedAt: true
          }
        },
        mentorBatches: {
          include: {
            batch: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    })

    if (!mentor) {
      return NextResponse.json(
        { success: false, message: 'Mentor not found' },
        { status: 404 }
      )
    }

    // Get students assigned to mentor's batches
    const batchIds = mentor.mentorBatches.map(mb => mb.batchId)
    const students = await prisma.user.findMany({
      where: {
        batchId: { in: batchIds },
        role: 'STUDENT',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        specialization: true,
        createdAt: true
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    })

    const profileData = {
      ...mentor.user,
      mentorId: mentor.id,
      batches: mentor.mentorBatches.map(mb => mb.batch),
      students: students.map(student => ({
        id: student.id,
        name: student.name,
        initials: student.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        performance: Math.round(Math.random() * 40 + 60), // Mock performance
        status: 'Active',
        badges: student.specialization?.slice(0, 3) || [],
        avatarColor: ['from-blue-500 to-blue-600', 'from-green-500 to-green-600', 'from-purple-500 to-purple-600'][Math.floor(Math.random() * 3)]
      }))
    }

    return NextResponse.json({
      success: true,
      data: profileData
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
})

export const PUT = withMentorAuth(async (request: MentorAuthRequest) => {
  try {
    const mentorId = request.mentor!.id
    const body = await request.json()

    const validation = validateData(updateProfileSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.errors },
        { status: 400 }
      )
    }

    const { data } = validation

    // Check if email is being changed and if it's already taken
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: request.mentor!.id }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: request.mentor!.id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        bio: true,
        profilePic: true,
        specialization: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    )
  }
})
