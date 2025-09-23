import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface MentorAuthRequest extends NextRequest {
  mentor?: {
    id: string
    email: string
    name: string
    role: string
  }
}

export async function mentorAuthMiddleware(request: MentorAuthRequest): Promise<NextResponse | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded || !decoded.mentorId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    // Verify mentor exists and is active
    const mentor = await prisma.mentor.findUnique({
      where: {
        id: decoded.mentorId,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    if (!mentor) {
      return NextResponse.json(
        { success: false, message: 'Mentor not found or inactive' },
        { status: 401 }
      )
    }

    // Add mentor info to request
    request.mentor = {
      id: mentor.id,
      email: mentor.user.email,
      name: mentor.user.name,
      role: mentor.user.role
    }

    return null // Continue to next middleware/handler
  } catch (error) {
    console.error('Mentor auth middleware error:', error)
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 401 }
    )
  }
}

export function withMentorAuth(handler: (request: MentorAuthRequest) => Promise<NextResponse>) {
  return async (request: MentorAuthRequest) => {
    const authResponse = await mentorAuthMiddleware(request)
    if (authResponse) {
      return authResponse
    }
    return handler(request)
  }
}
