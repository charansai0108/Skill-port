import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withMentorAuth, MentorAuthRequest } from '@/lib/mentor-middleware'
import { validateData, changePasswordSchema } from '@/lib/mentor-validation'
import { hashPassword, comparePassword } from '@/lib/auth'

const prisma = new PrismaClient()

export const PUT = withMentorAuth(async (request: MentorAuthRequest) => {
  try {
    const mentorId = request.mentor!.id
    const body = await request.json()

    const validation = validateData(changePasswordSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.errors },
        { status: 400 }
      )
    }

    const { data } = validation

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: request.mentor!.id },
      select: { id: true, password: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(data.currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(data.newPassword)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    })

    // Log password change
    await prisma.activityLog.create({
      data: {
        userId: mentorId,
        action: 'PASSWORD_CHANGED',
        details: { timestamp: new Date().toISOString() }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to change password' },
      { status: 500 }
    )
  }
})
