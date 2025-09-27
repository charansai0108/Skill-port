import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createResponse, createErrorResponse, getUserIdFromRequest, withErrorHandling } from '@/lib/api-utils'
import { PostData } from '@/lib/types'

async function getCommunityPosts(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromRequest(request)
  const { id: communityId } = await params

  if (!userId) {
    return createErrorResponse('User ID is required', 401)
  }

  // Get posts for the community
  const posts = await prisma.post.findMany({
    where: { communityId },
    include: {
      user: {
        select: {
          name: true
        }
      },
      community: {
        select: {
          name: true
        }
      },
      comments: {
        select: {
          id: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const postData: PostData[] = posts.map(post => ({
    id: post.id,
    title: post.title,
    description: post.description,
    author: post.user.name,
    community: post.community.name,
    platform: post.platform || undefined,
    difficulty: post.difficulty || undefined,
    votes: Math.floor(Math.random() * 100), // Mock vote count
    answers: post.comments.length,
    views: Math.floor(Math.random() * 500), // Mock view count
    createdAt: post.createdAt.toISOString(),
    tags: generateTags(post.platform, post.difficulty),
    isAnswered: post.comments.length > 0
  }))

  return createResponse(postData)
}

async function createCommunityPost(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromRequest(request)
  const { id: communityId } = await params

  if (!userId) {
    return createErrorResponse('User ID is required', 401)
  }

  const body = await request.json()
  const { title, description, platform, difficulty } = body

  // Validate required fields
  if (!title || !description) {
    return createErrorResponse('Title and description are required', 400)
  }

  // Create the post
  const post = await prisma.post.create({
    data: {
      communityId,
      userId,
      title,
      description,
      platform: platform || null,
      difficulty: difficulty || null
    }
  })

  return createResponse(post, 201, 'Post created successfully')
}

function generateTags(platform?: string, difficulty?: string): string[] {
  const tags: string[] = []
  
  if (platform) {
    tags.push(platform.toLowerCase())
  }
  
  if (difficulty) {
    tags.push(difficulty.toLowerCase())
  }

  // Add some common tags based on platform
  if (platform === 'LEETCODE') {
    tags.push('algorithms', 'data-structures')
  } else if (platform === 'GEEKSFORGEEKS') {
    tags.push('practice', 'interview')
  } else if (platform === 'HACKERRANK') {
    tags.push('challenges', 'programming')
  }

  return tags.slice(0, 3) // Limit to 3 tags
}

export const GET = withErrorHandling(getCommunityPosts)
export const POST = withErrorHandling(createCommunityPost)
