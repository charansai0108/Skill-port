import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withMentorAuth, MentorAuthRequest } from '@/lib/mentor-middleware'
import { validateData, leaderboardFilterSchema } from '@/lib/mentor-validation'

const prisma = new PrismaClient()

export const GET = withMentorAuth(async (request: MentorAuthRequest) => {
  try {
    const mentorId = request.mentor!.id
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'

    // Validate filter parameters
    const filterValidation = validateData(leaderboardFilterSchema, Object.fromEntries(searchParams.entries()))
    if (!filterValidation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid filter parameters', errors: filterValidation.errors },
        { status: 400 }
      )
    }

    const filters = filterValidation.data

    // Get mentor's assigned batches
    const mentorBatches = await prisma.mentorBatch.findMany({
      where: { mentorId },
      include: { batch: true }
    })
    const batchIds = mentorBatches.map(mb => mb.batchId)

    // Build where clause
    const where: any = {
      contest: {
        createdBy: mentorId
      }
    }

    if (filters.contestId) {
      where.contestId = filters.contestId
    }

    if (filters.batchId) {
      where.user = {
        batchId: filters.batchId
      }
    }

    // Apply time range filter
    if (filters.timeRange && filters.timeRange !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (filters.timeRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(0)
      }

      where.createdAt = { gte: startDate }
    }

    // Get leaderboard data
    const leaderboardData = await prisma.contestParticipant.groupBy({
      by: ['userId'],
      where,
      _sum: {
        score: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          score: 'desc'
        }
      }
    })

    // Get user details
    const userIds = leaderboardData.map(item => item.userId)
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        batchId: { in: batchIds },
        role: 'STUDENT',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        batch: {
          select: {
            name: true
          }
        }
      }
    })

    // Prepare data for export
    const exportData = leaderboardData.map((item, index) => {
      const user = users.find(u => u.id === item.userId)
      return {
        rank: index + 1,
        name: user?.name || 'Unknown',
        email: user?.email || 'Unknown',
        batch: user?.batch?.name || 'Unknown',
        totalScore: item._sum.score || 0,
        contestCount: item._count.id,
        averageScore: item._count.id > 0 ? Math.round((item._sum.score || 0) / item._count.id) : 0
      }
    })

    if (format === 'csv') {
      return exportAsCSV(exportData)
    } else if (format === 'pdf') {
      return exportAsPDF(exportData)
    } else {
      return NextResponse.json(
        { success: false, message: 'Unsupported export format' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Leaderboard export error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to export leaderboard' },
      { status: 500 }
    )
  }
})

function exportAsCSV(data: any[]) {
  const headers = ['Rank', 'Name', 'Email', 'Batch', 'Total Score', 'Contest Count', 'Average Score']
  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.rank,
      `"${row.name}"`,
      `"${row.email}"`,
      `"${row.batch}"`,
      row.totalScore,
      row.contestCount,
      row.averageScore
    ].join(','))
  ].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="leaderboard_${new Date().toISOString().split('T')[0]}.csv"`
    }
  })
}

function exportAsPDF(data: any[]) {
  // For PDF export, we would use a library like puppeteer or jsPDF
  // For now, return a simple text representation
  const pdfContent = `
LEADERBOARD EXPORT
Generated: ${new Date().toLocaleString()}

${data.map(row => 
  `${row.rank}. ${row.name} (${row.email}) - Batch: ${row.batch} - Score: ${row.totalScore} (${row.contestCount} contests, Avg: ${row.averageScore})`
).join('\n')}
  `.trim()

  return new NextResponse(pdfContent, {
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="leaderboard_${new Date().toISOString().split('T')[0]}.txt"`
    }
  })
}
