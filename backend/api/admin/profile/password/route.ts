import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, createSuccessResponse, createErrorResponse } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/auth'

// PUT /api/admin/profile/password - Change admin password
export const PUT = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return createErrorResponse('Current password and new password are required')
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return createErrorResponse('New password must be at least 8 characters long')
    }

    // Get current admin data
    const adminData = await prisma.admin.findUnique({
      where: { id: admin.id },
      select: { password: true }
    })

    if (!adminData) {
      return createErrorResponse('Admin not found', 404)
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, adminData.password)
    if (!isCurrentPasswordValid) {
      return createErrorResponse('Current password is incorrect', 401)
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword)

    // Update password
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedNewPassword }
    })

    return createSuccessResponse(null, 'Password updated successfully')

  } catch (error: any) {
    console.error('Change password error:', error)
    return createErrorResponse('Failed to change password', 500)
  }
})
