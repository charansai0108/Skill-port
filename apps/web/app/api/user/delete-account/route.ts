import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const deleteAccountSchema = z.object({
  confirmationText: z.string().refine(
    (text) => text === 'DELETE MY ACCOUNT',
    'Confirmation text must be exactly "DELETE MY ACCOUNT"'
  ),
  reason: z.string().optional(),
  feedback: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentStudent(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const userId = user.id
    const body = await request.json()

    // Validate request
    const validation = deleteAccountSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(
        validation.error.errors.map(e => e.message).join(', '),
        400
      )
    }

    const { confirmationText, reason, feedback } = validation.data

    // Check if user has active subscription
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ['ACTIVE', 'TRIALING']
        }
      }
    })

    if (activeSubscription) {
      return createErrorResponse(
        'Cannot delete account with active subscription. Please cancel your subscription first.',
        400
      )
    }

    // Check if user has pending payments
    const pendingPayments = await prisma.payment.findFirst({
      where: {
        userId,
        status: 'PENDING'
      }
    })

    if (pendingPayments) {
      return createErrorResponse(
        'Cannot delete account with pending payments. Please wait for payment processing to complete.',
        400
      )
    }

    // Create deletion request record
    const deletionRequest = await prisma.userDeletionRequest.create({
      data: {
        userId,
        reason: reason || 'No reason provided',
        feedback: feedback || 'No feedback provided',
        status: 'PENDING',
        requestedAt: new Date()
      }
    })

    // Schedule account deletion (30 days grace period)
    const deletionDate = new Date()
    deletionDate.setDate(deletionDate.getDate() + 30)

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'ACCOUNT_DELETION_REQUESTED',
        details: {
          deletionRequestId: deletionRequest.id,
          scheduledDeletionDate: deletionDate.toISOString(),
          reason,
          feedback
        }
      }
    })

    // Send confirmation email (placeholder)
    // await sendAccountDeletionConfirmationEmail(user.email, user.name, deletionDate)

    return createResponse(
      {
        message: 'Account deletion request submitted successfully',
        deletionRequestId: deletionRequest.id,
        scheduledDeletionDate: deletionDate.toISOString(),
        gracePeriod: '30 days'
      },
      200,
      'Account deletion request submitted'
    )

  } catch (error) {
    console.error('Account deletion error:', error)
    return createErrorResponse('Failed to process account deletion request', 500)
  }
}

// Immediate deletion (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = await getCurrentAdmin(request)
    if (!admin) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return createErrorResponse('User ID is required', 400)
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return createErrorResponse('User not found', 404)
    }

    // Perform cascading deletion
    await prisma.$transaction(async (tx) => {
      // Delete user and all related data (cascading deletes)
      await tx.user.delete({
        where: { id: userId }
      })
    })

    // Create admin activity log
    await prisma.activityLog.create({
      data: {
        userId: admin.id,
        action: 'ADMIN_ACCOUNT_DELETION',
        details: {
          deletedUserId: userId,
          deletedUserName: user.name,
          deletedUserEmail: user.email,
          deletedAt: new Date().toISOString()
        }
      }
    })

    return createResponse(
      { message: 'Account deleted successfully' },
      200,
      'Account deleted'
    )

  } catch (error) {
    console.error('Admin account deletion error:', error)
    return createErrorResponse('Failed to delete account', 500)
  }
}
