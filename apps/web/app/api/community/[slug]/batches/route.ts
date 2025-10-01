import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

export const GET = async (request: NextRequest, { params }: { params: { slug: string } }) => {
  try {
    const { slug } = params
    const admin = await getCurrentAdmin(request)

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const community = await prisma.community.findUnique({
      where: { slug },
      select: { id: true }
    })

    console.log('Debug - Community lookup:', { slug, communityId: community?.id, adminCommunityId: admin.communityId })

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    if (admin.communityId !== community.id) {
      console.log('Debug - Community mismatch:', { adminCommunityId: admin.communityId, communityId: community.id })
      return NextResponse.json({ error: 'Forbidden: Not your community' }, { status: 403 })
    }

    const batches = await prisma.batch.findMany({
      where: { communityId: community.id },
      include: {
        _count: {
          select: {
            students: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      success: true, 
      data: { 
        batches: batches.map(batch => ({
          id: batch.id,
          name: batch.name,
          description: batch.description,
          studentCount: batch._count.students,
          createdAt: batch.createdAt,
          updatedAt: batch.updatedAt
        }))
      } 
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error fetching community batches:', error)
    return NextResponse.json({ error: 'Failed to fetch batches', details: error.message }, { status: 500 })
  }
}

export const POST = async (request: NextRequest, { params }: { params: { slug: string } }) => {
  console.log('POST /api/community/[slug]/batches called')
  try {
    const { slug } = params
    console.log('Slug:', slug)
    const admin = await getCurrentAdmin(request)
    console.log('Admin:', admin ? 'Found' : 'Not found')

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const community = await prisma.community.findUnique({
      where: { slug },
      select: { id: true }
    })

    console.log('Debug - Community lookup (POST):', { slug, communityId: community?.id, adminCommunityId: admin.communityId })

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    if (admin.communityId !== community.id) {
      console.log('Debug - Community mismatch (POST):', { adminCommunityId: admin.communityId, communityId: community.id })
      return NextResponse.json({ error: 'Forbidden: Not your community' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'Batch name is required' }, { status: 400 })
    }

    const batch = await prisma.batch.create({
      data: {
        name,
        description: description || '',
        communityId: community.id
      },
      include: {
        _count: {
          select: {
            students: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: { 
        batch: {
          id: batch.id,
          name: batch.name,
          description: batch.description,
          studentCount: batch._count.students,
          createdAt: batch.createdAt,
          updatedAt: batch.updatedAt
        }
      } 
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating batch:', error)
    console.error('Error details:', { 
      message: error.message, 
      stack: error.stack,
      name: error.name 
    })
    return NextResponse.json({ 
      error: 'Failed to create batch', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
