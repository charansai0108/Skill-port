import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const consentSchema = z.object({
  consentType: z.enum([
    'COOKIES_ANALYTICS',
    'COOKIES_MARKETING', 
    'COOKIES_FUNCTIONAL',
    'EMAIL_NOTIFICATIONS',
    'SMS_NOTIFICATIONS',
    'DATA_PROCESSING',
    'MARKETING_COMMUNICATIONS'
  ]),
  granted: z.boolean()
})

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentStudent(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const userId = user.id

    // Get user's consent records
    const consentRecords = await prisma.consentRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    // Group by consent type and get latest status
    const consentStatus = consentRecords.reduce((acc, record) => {
      if (!acc[record.consentType] || record.grantedAt > acc[record.consentType].grantedAt) {
        acc[record.consentType] = {
          granted: record.granted,
          grantedAt: record.grantedAt,
          revokedAt: record.revokedAt
        }
      }
      return acc
    }, {} as Record<string, any>)

    return createResponse(
      { consentStatus },
      200,
      'Consent status retrieved successfully'
    )

  } catch (error) {
    console.error('Get consent error:', error)
    return createErrorResponse('Failed to retrieve consent status', 500)
  }
}

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
    const validation = consentSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(
        validation.error.errors.map(e => e.message).join(', '),
        400
      )
    }

    const { consentType, granted } = validation.data

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create consent record
    const consentRecord = await prisma.consentRecord.create({
      data: {
        userId,
        consentType,
        granted,
        grantedAt: new Date(),
        ipAddress,
        userAgent
      }
    })

    // If revoking consent, set revokedAt
    if (!granted) {
      await prisma.consentRecord.update({
        where: { id: consentRecord.id },
        data: { revokedAt: new Date() }
      })
    }

    // Create compliance audit log
    await prisma.complianceAuditLog.create({
      data: {
        userId,
        action: granted ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
        entityType: 'CONSENT_RECORD',
        entityId: consentRecord.id,
        details: {
          consentType,
          granted,
          ipAddress,
          userAgent
        },
        ipAddress,
        userAgent
      }
    })

    // Update user notification settings based on consent
    if (consentType === 'EMAIL_NOTIFICATIONS') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          notificationSettings: {
            emailNotifications: granted
          }
        }
      })
    }

    return createResponse(
      { 
        message: granted ? 'Consent granted successfully' : 'Consent revoked successfully',
        consentRecord 
      },
      200,
      'Consent updated successfully'
    )

  } catch (error) {
    console.error('Update consent error:', error)
    return createErrorResponse('Failed to update consent', 500)
  }
}
