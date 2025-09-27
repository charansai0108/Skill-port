import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createResponse, createErrorResponse, getUserIdFromRequest, withErrorHandling, parseQueryParams } from '@/lib/api-utils'
import { CommunityData, CommunityFilters } from '@/lib/types'

async function getCommunities(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  const params = parseQueryParams(request)
  const filters = parseCommunityFilters(params)

  // Get all communities
  let communities = await prisma.community.findMany({
    include: {
      posts: {
        select: {
          id: true
        }
      }
    },
    orderBy: getSortOrder(filters.sortBy)
  })

  // Apply filters
  if (filters.category && filters.category !== 'all') {
    communities = communities.filter(community => community.category === filters.category)
  }

  // Get user's joined communities (in a real app, you'd have a UserCommunity table)
  const userPosts = await prisma.post.findMany({
    where: { userId },
    select: { communityId: true }
  })
  const joinedCommunityIds = new Set(userPosts.map(post => post.communityId))

  // Filter by joined status if requested
  if (filters.showJoined) {
    communities = communities.filter(community => joinedCommunityIds.has(community.id))
  }

  const communityData: CommunityData[] = communities.map(community => ({
    id: community.id,
    name: community.name,
    category: community.category,
    description: community.description || '',
    members: Math.floor(Math.random() * 5000) + 100, // Mock member count
    discussions: community.posts.length,
    isJoined: joinedCommunityIds.has(community.id)
  }))

  return createResponse(communityData)
}

function parseCommunityFilters(params: Record<string, string>): CommunityFilters {
  return {
    category: params.category,
    sortBy: (params.sortBy as CommunityFilters['sortBy']) || 'popular',
    showJoined: params.showJoined === 'true'
  }
}

function getSortOrder(sortBy?: string) {
  switch (sortBy) {
    case 'recent':
      return { createdAt: 'desc' as const }
    case 'members':
      return { name: 'asc' as const } // Mock sorting
    case 'discussions':
      return { name: 'asc' as const } // Mock sorting
    case 'popular':
    default:
      return { name: 'asc' as const }
  }
}

export const GET = withErrorHandling(getCommunities)
