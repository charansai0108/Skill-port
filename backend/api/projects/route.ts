import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createResponse, createErrorResponse, getUserIdFromRequest, withErrorHandling, validateRequestBody } from '@/lib/api-utils'
import { ProjectData, CreateProjectRequest } from '@/lib/types'

async function getProjects(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  
  if (!userId) {
    return createErrorResponse('User ID is required', 401)
  }

  // Get projects with task counts
  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      tasks: {
        select: {
          id: true,
          completed: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  const projectData: ProjectData[] = projects.map(project => {
    const taskCount = project.tasks.length
    const completedTasks = project.tasks.filter(task => task.completed).length
    const progressPercentage = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0

    return {
      id: project.id,
      title: project.title,
      description: project.description || '',
      status: project.status,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      taskCount,
      completedTasks,
      progressPercentage
    }
  })

  return createResponse(projectData)
}

async function createProject(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  
  if (!userId) {
    return createErrorResponse('User ID is required', 401)
  }

  const body: CreateProjectRequest = await request.json()
  
  // Validate required fields
  const validation = validateRequestBody(body, ['title'])
  if (!validation.isValid) {
    return createErrorResponse(validation.errors.join(', '), 400)
  }

  // Create the project
  const project = await prisma.project.create({
    data: {
      userId,
      title: body.title,
      description: body.description || null
    }
  })

  const projectData: ProjectData = {
    id: project.id,
    title: project.title,
    description: project.description || '',
    status: project.status,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    taskCount: 0,
    completedTasks: 0,
    progressPercentage: 0
  }

  return createResponse(projectData, 201, 'Project created successfully')
}

export const GET = withErrorHandling(getProjects)
export const POST = withErrorHandling(createProject)
