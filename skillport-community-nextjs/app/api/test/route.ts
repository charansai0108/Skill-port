import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    const taskCount = await prisma.task.count()
    const projectCount = await prisma.project.count()
    const communityCount = await prisma.community.count()

    return NextResponse.json({
      success: true,
      message: 'Backend is working!',
      data: {
        database: 'Connected',
        counts: {
          users: userCount,
          tasks: taskCount,
          projects: projectCount,
          communities: communityCount
        }
      }
    })
  } catch (error) {
    console.error('Test API Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
