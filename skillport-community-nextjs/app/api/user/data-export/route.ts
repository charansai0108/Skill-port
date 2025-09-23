import { NextRequest, NextResponse } from 'next/server'
import { getCurrentStudent } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentStudent(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const userId = user.id

    // Get all user data
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tasks: true,
        projects: true,
        dailyTasks: true,
        posts: true,
        comments: true,
        badges: true,
        skills: true,
        projectTasks: true,
        contestParticipants: {
          include: {
            contest: {
              select: {
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                status: true
              }
            }
          }
        },
        activityLogs: true,
        mentorFeedback: {
          include: {
            mentor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            contest: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        studentFeedback: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            contest: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        notifications: true,
        submissions: {
          include: {
            problem: {
              select: {
                id: true,
                title: true,
                difficulty: true,
                points: true
              }
            },
            contest: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        subscriptions: {
          include: {
            payments: true
          }
        },
        payments: true
      }
    })

    if (!userData) {
      return createErrorResponse('User not found', 404)
    }

    // Format data for export
    const exportData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        userId: userData.id,
        dataVersion: '1.0',
        platform: 'SkillPort'
      },
      personalInfo: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        profilePic: userData.profilePic,
        bio: userData.bio,
        theme: userData.theme,
        notificationSettings: userData.notificationSettings,
        role: userData.role,
        status: userData.status,
        batchId: userData.batchId,
        emailVerified: userData.emailVerified,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      },
      learningData: {
        tasks: userData.tasks.map(task => ({
          id: task.id,
          description: task.description,
          platform: task.platform,
          difficulty: task.difficulty,
          completed: task.completed,
          date: task.date,
          priority: task.priority,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        })),
        projects: userData.projects.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description,
          status: project.status,
          startDate: project.startDate,
          endDate: project.endDate,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        })),
        submissions: userData.submissions.map(submission => ({
          id: submission.id,
          problem: submission.problem,
          contest: submission.contest,
          code: submission.code,
          language: submission.language,
          status: submission.status,
          score: submission.score,
          executionTime: submission.executionTime,
          memoryUsage: submission.memoryUsage,
          submittedAt: submission.submittedAt
        })),
        contestParticipations: userData.contestParticipants.map(participation => ({
          id: participation.id,
          contest: participation.contest,
          status: participation.status,
          score: participation.score,
          rank: participation.rank,
          joinedAt: participation.joinedAt,
          completedAt: participation.completedAt,
          submittedAt: participation.submittedAt
        }))
      },
      socialData: {
        posts: userData.posts.map(post => ({
          id: post.id,
          title: post.title,
          content: post.content,
          likes: post.likes,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
        })),
        comments: userData.comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          likes: comment.likes,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt
        })),
        badges: userData.badges.map(badge => ({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          earnedAt: badge.earnedAt
        })),
        skills: userData.skills.map(skill => ({
          id: skill.id,
          name: skill.name,
          level: skill.level,
          progress: skill.progress,
          createdAt: skill.createdAt,
          updatedAt: skill.updatedAt
        }))
      },
      feedbackData: {
        receivedFeedback: userData.mentorFeedback.map(feedback => ({
          id: feedback.id,
          mentor: feedback.mentor,
          contest: feedback.contest,
          category: feedback.category,
          rating: feedback.rating,
          comment: feedback.comment,
          createdAt: feedback.createdAt,
          updatedAt: feedback.updatedAt
        })),
        givenFeedback: userData.studentFeedback.map(feedback => ({
          id: feedback.id,
          student: feedback.student,
          contest: feedback.contest,
          category: feedback.category,
          rating: feedback.rating,
          comment: feedback.comment,
          createdAt: feedback.createdAt,
          updatedAt: feedback.updatedAt
        }))
      },
      subscriptionData: {
        subscriptions: userData.subscriptions.map(subscription => ({
          id: subscription.id,
          planId: subscription.planId,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          canceledAt: subscription.canceledAt,
          createdAt: subscription.createdAt,
          updatedAt: subscription.updatedAt
        })),
        payments: userData.payments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          description: payment.description,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt
        }))
      },
      activityData: {
        activityLogs: userData.activityLogs.map(log => ({
          id: log.id,
          action: log.action,
          details: log.details,
          createdAt: log.createdAt
        })),
        notifications: userData.notifications.map(notification => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          read: notification.read,
          createdAt: notification.createdAt,
          updatedAt: notification.updatedAt
        }))
      }
    }

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'DATA_EXPORT_REQUESTED',
        details: {
          exportDate: new Date().toISOString(),
          dataVersion: '1.0'
        }
      }
    })

    return createResponse(exportData, 200, 'Data export generated successfully')

  } catch (error) {
    console.error('Data export error:', error)
    return createErrorResponse('Failed to generate data export', 500)
  }
}
