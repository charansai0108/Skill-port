import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Verify admin authentication
    const admin = await getCurrentAdmin(request)
    if (!admin) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 401 })
    }

    // Get community by slug
    const community = await prisma.community.findUnique({
      where: { slug }
    })

    if (!community) {
      return NextResponse.json({
        error: 'Community not found'
      }, { status: 404 })
    }

    // Verify admin owns this community
    if (admin.id !== community.adminId) {
      return NextResponse.json({
        error: 'Access denied'
      }, { status: 403 })
    }

    // Get admin profile with community info
    const profile = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      username: admin.username,
      role: admin.role,
      profilePic: admin.profilePic,
      community: {
        id: community.id,
        name: community.name,
        slug: community.slug,
        description: community.description,
        type: community.type,
        communityCode: community.communityCode
      },
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    }

    return NextResponse.json({
      success: true,
      data: profile
    })

  } catch (error: any) {
    console.error('Community profile API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch profile',
      details: error.message
    }, { status: 500 })
  }
}
