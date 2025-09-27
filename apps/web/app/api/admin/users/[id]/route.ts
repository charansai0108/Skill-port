import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, createSuccessResponse, createErrorResponse } from '@/lib/admin-middleware'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// GET /api/admin/users/[id] - Get user by ID
export const GET = withAdminAuth(async (request: NextRequest, admin, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        profilePic: true,
        bio: true,
        theme: true,
        notificationSettings: true,
        createdAt: true,
        updatedAt: true,
        batch: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            tasks: true,
            projects: true,
            posts: true,
            badges: true
          }
        }
      }
    })

    if (!user) {
      return createErrorResponse('User not found', 404)
    }

    return createSuccessResponse(user, 'User retrieved successfully')

  } catch (error: any) {
    console.error('Get user error:', error)
    return createErrorResponse('Failed to fetch user', 500)
  }
})

// PUT /api/admin/users/[id] - Update user
export const PUT = withAdminAuth(async (request: NextRequest, admin, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    const body = await request.json()
    const { name, email, role, status, batchId, profilePic, bio } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return createErrorResponse('User not found', 404)
    }

    // Check if email is being changed and if it already exists
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return createErrorResponse('Email already exists', 409)
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(status && { status }),
        ...(batchId !== undefined && { batchId: batchId || null }),
        ...(profilePic !== undefined && { profilePic }),
        ...(bio !== undefined && { bio })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        profilePic: true,
        bio: true,
        updatedAt: true,
        batch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return createSuccessResponse(user, 'User updated successfully')

  } catch (error: any) {
    console.error('Update user error:', error)
    return createErrorResponse('Failed to update user', 500)
  }
})

// DELETE /api/admin/users/[id] - Delete user
export const DELETE = withAdminAuth(async (request: NextRequest, admin, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return createErrorResponse('User not found', 404)
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id }
    })

    return createSuccessResponse(null, 'User deleted successfully')

  } catch (error: any) {
    console.error('Delete user error:', error)
    return createErrorResponse('Failed to delete user', 500)
  }
})
