import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createResponse, createErrorResponse, getUserIdFromRequest, withErrorHandling } from '@/lib/api-utils'

async function joinCommunity(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserIdFromRequest(request)
  const communityId = params.id

  if (!userId) {
    return createErrorResponse('User ID is required', 401)
  }

  // Check if community exists
  const community = await prisma.community.findUnique({
    where: { id: communityId }
  })

  if (!community) {
    return createErrorResponse('Community not found', 404)
  }

  // In a real app, you would have a UserCommunity table to track memberships
  // For now, we'll just return success
  // You could also create a post or activity log entry here

  return createResponse(
    { communityId, joined: true },
    200,
    `Successfully joined ${community.name}`
  )
}

export const POST = withErrorHandling(joinCommunity)
