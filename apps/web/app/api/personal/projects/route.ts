import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const GET = async (request: NextRequest) => {
  try {
    const user = await getCurrentUser(request)
    
    if (!user || user.role !== 'PERSONAL') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's projects
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        progress: true,
        priority: true,
        startDate: true,
        endDate: true,
        tags: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get project statistics
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length
    const onHoldProjects = projects.filter(p => p.status === 'ON_HOLD').length
    const cancelledProjects = projects.filter(p => p.status === 'CANCELLED').length

    // Calculate average progress
    const averageProgress = projects.length > 0 
      ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
      : 0

    // Get project tasks (if you have a project-task relationship)
    const projectTasks = await prisma.projectTask.findMany({
      where: {
        project: {
          userId: user.id
        }
      },
      select: {
        projectId: true,
        completed: true
      }
    }).catch(() => []) // Handle case where project tasks table doesn't exist

    // Calculate tasks per project
    const tasksPerProject = projectTasks.reduce((acc, task) => {
      acc[task.projectId] = (acc[task.projectId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const completedTasksPerProject = projectTasks.reduce((acc, task) => {
      if (task.completed) {
        acc[task.projectId] = (acc[task.projectId] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Add task counts to projects
    const projectsWithTasks = projects.map(project => ({
      ...project,
      totalTasks: tasksPerProject[project.id] || 0,
      completedTasks: completedTasksPerProject[project.id] || 0
    }))

    const stats = {
      total: totalProjects,
      active: activeProjects,
      completed: completedProjects,
      onHold: onHoldProjects,
      cancelled: cancelledProjects,
      averageProgress
    }

    return NextResponse.json({
      success: true,
      data: {
        projects: projectsWithTasks,
        stats,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error fetching personal projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects data', details: error.message }, { status: 500 })
  }
}

export const POST = async (request: NextRequest) => {
  try {
    const user = await getCurrentUser(request)
    
    if (!user || user.role !== 'PERSONAL') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, status, priority, startDate, endDate, tags } = body

    if (!title) {
      return NextResponse.json({ error: 'Project title is required' }, { status: 400 })
    }

    // Create new project
    const project = await prisma.project.create({
      data: {
        title,
        description: description || '',
        status: status || 'IN_PROGRESS',
        priority: priority || 'MEDIUM',
        progress: 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        tags: tags || [],
        userId: user.id
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        progress: true,
        startDate: true,
        endDate: true,
        tags: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        project
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project', details: error.message }, { status: 500 })
  }
}

export const PUT = async (request: NextRequest) => {
  try {
    const user = await getCurrentUser(request)
    
    if (!user || user.role !== 'PERSONAL') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, title, description, status, priority, progress, startDate, endDate, tags } = body

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Verify project belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id
      }
    })

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(progress !== undefined && { progress }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(tags && { tags })
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        progress: true,
        startDate: true,
        endDate: true,
        tags: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        project: updatedProject
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Failed to update project', details: error.message }, { status: 500 })
  }
}

export const DELETE = async (request: NextRequest) => {
  try {
    const user = await getCurrentUser(request)
    
    if (!user || user.role !== 'PERSONAL') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Verify project belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id
      }
    })

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Delete project
    await prisma.project.delete({
      where: { id: projectId }
    })

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Failed to delete project', details: error.message }, { status: 500 })
  }
}
