import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createResponse, createErrorResponse, getUserIdFromRequest, withErrorHandling, validateRequestBody } from '@/lib/api-utils'
import { UpdateProjectRequest } from '@/lib/types'

async function updateProject(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserIdFromRequest(request)
  const projectId = params.id

  if (!userId) {
    return createErrorResponse('User ID is required', 401)
  }

  const body: UpdateProjectRequest = await request.json()

  // Check if project exists and belongs to user
  const existingProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId
    }
  })

  if (!existingProject) {
    return createErrorResponse('Project not found', 404)
  }

  // Update the project
  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.status && { status: body.status })
    }
  })

  return createResponse(project, 200, 'Project updated successfully')
}

async function deleteProject(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserIdFromRequest(request)
  const projectId = params.id

  if (!userId) {
    return createErrorResponse('User ID is required', 401)
  }

  // Check if project exists and belongs to user
  const existingProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId
    }
  })

  if (!existingProject) {
    return createErrorResponse('Project not found', 404)
  }

  // Delete the project (tasks will be unlinked due to onDelete: SetNull)
  await prisma.project.delete({
    where: { id: projectId }
  })

  return createResponse(null, 200, 'Project deleted successfully')
}

export const PATCH = withErrorHandling(updateProject)
export const DELETE = withErrorHandling(deleteProject)
