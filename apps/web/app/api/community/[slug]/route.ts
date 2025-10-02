import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const community = await prisma.community.findUnique({
      where: { slug },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        batches: {
          include: {
            _count: {
              select: {
                students: true
              }
            }
          }
        },
        members: {
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
        },
        _count: {
          select: {
            members: true,
            batches: true
          }
        }
      }
    })

    if (!community) {
      return NextResponse.json({
        error: 'Community not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        community: {
          id: community.id,
          name: community.name,
          slug: community.slug,
          description: community.description,
          type: community.type,
          isPublic: community.isPublic,
          communityCode: community.communityCode,
          admin: community.admin,
          memberCount: community._count.members,
          batchCount: community._count.batches,
          batches: community.batches.map(b => ({
            id: b.id,
            name: b.name,
            studentCount: b._count.students
          })),
          createdAt: community.createdAt
        }
      }
    })

  } catch (error: any) {
    console.error('Community API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch community',
      details: error.message
    }, { status: 500 })
  }
}

