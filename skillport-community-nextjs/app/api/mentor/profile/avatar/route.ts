import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withMentorAuth, MentorAuthRequest } from '@/lib/mentor-middleware'
import formidable from 'formidable'
import { promises as fs } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export const POST = withMentorAuth(async (request: MentorAuthRequest) => {
  try {
    const mentorId = request.mentor!.id

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size too large. Maximum 5MB allowed' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name)
    const fileName = `mentor_${mentorId}_${Date.now()}${fileExtension}`
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'avatars', fileName)

    // Ensure upload directory exists
    await fs.mkdir(path.dirname(uploadPath), { recursive: true })

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await fs.writeFile(uploadPath, buffer)

    // Update user profile with new avatar URL
    const avatarUrl = `/uploads/avatars/${fileName}`
    await prisma.user.update({
      where: { id: request.mentor!.id },
      data: {
        profilePic: avatarUrl,
        updatedAt: new Date()
      }
    })

    // Log avatar upload
    await prisma.activityLog.create({
      data: {
        userId: mentorId,
        action: 'AVATAR_UPLOADED',
        details: { 
          fileName,
          fileSize: file.size,
          fileType: file.type,
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatarUrl }
    })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
})
