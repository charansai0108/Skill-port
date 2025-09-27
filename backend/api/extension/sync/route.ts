import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const extensionSyncSchema = z.object({
  platform: z.string(),
  submissions: z.array(z.object({
    id: z.string(),
    platform: z.enum(['leetcode', 'geeksforgeeks', 'hackerrank', 'interviewbit']),
    problemTitle: z.string(),
    problemUrl: z.string().url(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    language: z.string(),
    status: z.enum(['accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error']),
    executionTime: z.number().optional(),
    memoryUsage: z.number().optional(),
    submittedAt: z.string(),
    code: z.string().optional(),
    score: z.number().optional()
  })),
  lastSync: z.string(),
  totalSubmissions: z.number(),
  acceptedSubmissions: z.number(),
  averageTime: z.number()
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
    const validation = extensionSyncSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(
        validation.error.errors.map(e => e.message).join(', '),
        400
      )
    }

    const { platform, submissions, lastSync, totalSubmissions, acceptedSubmissions, averageTime } = validation.data

    // Process submissions and create/update records
    const processedSubmissions = await Promise.all(
      submissions.map(async (submission) => {
        // Check if submission already exists
        const existingSubmission = await prisma.submission.findFirst({
          where: {
            userId,
            platform: submission.platform,
            problemTitle: submission.problemTitle,
            submittedAt: new Date(submission.submittedAt)
          }
        })

        if (existingSubmission) {
          // Update existing submission
          return prisma.submission.update({
            where: { id: existingSubmission.id },
            data: {
              status: submission.status,
              executionTime: submission.executionTime,
              memoryUsage: submission.memoryUsage,
              score: submission.score,
              code: submission.code,
              updatedAt: new Date()
            }
          })
        } else {
          // Create new submission
          return prisma.submission.create({
            data: {
              userId,
              platform: submission.platform,
              problemTitle: submission.problemTitle,
              problemUrl: submission.problemUrl,
              difficulty: submission.difficulty,
              language: submission.language,
              status: submission.status,
              executionTime: submission.executionTime,
              memoryUsage: submission.memoryUsage,
              score: submission.score,
              code: submission.code,
              submittedAt: new Date(submission.submittedAt)
            }
          })
        }
      })
    )

    // Update user stats
    const userStats = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        problemsSolved: true,
        accuracy: true
      }
    })

    if (userStats) {
      const newProblemsSolved = userStats.problemsSolved + acceptedSubmissions
      const newAccuracy = totalSubmissions > 0 
        ? ((acceptedSubmissions / totalSubmissions) * 100)
        : userStats.accuracy

      await prisma.user.update({
        where: { id: userId },
        data: {
          problemsSolved: newProblemsSolved,
          accuracy: newAccuracy
        }
      })
    }

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'EXTENSION_DATA_SYNCED',
        details: {
          platform,
          submissionsCount: submissions.length,
          acceptedSubmissions,
          totalSubmissions,
          averageTime,
          lastSync,
          processedAt: new Date().toISOString()
        }
      }
    })

    // Calculate platform-specific stats
    const platformStats = submissions.reduce((acc, submission) => {
      if (!acc[submission.platform]) {
        acc[submission.platform] = {
          total: 0,
          accepted: 0,
          averageTime: 0
        }
      }
      acc[submission.platform].total++
      if (submission.status === 'accepted') {
        acc[submission.platform].accepted++
      }
      return acc
    }, {} as Record<string, any>)

    // Calculate average time for each platform
    Object.keys(platformStats).forEach(platform => {
      const platformSubmissions = submissions.filter(s => s.platform === platform)
      const totalTime = platformSubmissions.reduce((sum, s) => sum + (s.executionTime || 0), 0)
      platformStats[platform].averageTime = platformSubmissions.length > 0 
        ? totalTime / platformSubmissions.length 
        : 0
    })

    return createResponse(
      {
        message: 'Extension data synced successfully',
        stats: {
          totalSubmissions: processedSubmissions.length,
          acceptedSubmissions,
          accuracy: totalSubmissions > 0 ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(2) : 0,
          averageTime,
          platformStats
        },
        lastSync: new Date().toISOString()
      },
      200,
      'Data synced successfully'
    )

  } catch (error) {
    console.error('Extension sync error:', error)
    return createErrorResponse('Failed to sync extension data', 500)
  }
}
