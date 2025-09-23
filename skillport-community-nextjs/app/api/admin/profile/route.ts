import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, createSuccessResponse, createErrorResponse } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/auth'

// GET /api/admin/profile - Get admin profile
export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const adminProfile = await prisma.admin.findUnique({
      where: { id: admin.id },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!adminProfile) {
      return createErrorResponse('Admin profile not found', 404)
    }

    return createSuccessResponse(adminProfile, 'Admin profile retrieved successfully')

  } catch (error: any) {
    console.error('Get admin profile error:', error)
    return createErrorResponse('Failed to fetch admin profile', 500)
  }
})

// PUT /api/admin/profile - Update admin profile
export const PUT = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const body = await request.json()
    const { name, email, profilePic } = body

    // Check if email is being changed and if it already exists
    if (email && email !== admin.email) {
      const emailExists = await prisma.admin.findUnique({
        where: { email }
      })

      if (emailExists) {
        return createErrorResponse('Email already exists', 409)
      }
    }

    // Update admin profile
    const updatedAdmin = await prisma.admin.update({
      where: { id: admin.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(profilePic !== undefined && { profilePic })
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        role: true,
        isActive: true,
        lastLogin: true,
        updatedAt: true
      }
    })

    return createSuccessResponse(updatedAdmin, 'Admin profile updated successfully')

  } catch (error: any) {
    console.error('Update admin profile error:', error)
    return createErrorResponse('Failed to update admin profile', 500)
  }
})
