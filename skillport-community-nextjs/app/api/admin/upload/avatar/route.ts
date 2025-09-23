import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, createSuccessResponse, createErrorResponse } from '@/lib/admin-middleware'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export const POST = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return createErrorResponse('No file provided')
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed')
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return createErrorResponse('File size too large. Maximum size is 5MB')
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${randomUUID()}.${fileExtension}`
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars')
    await mkdir(uploadsDir, { recursive: true })

    // Save file
    const filePath = join(uploadsDir, fileName)
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // Return file URL
    const fileUrl = `/uploads/avatars/${fileName}`

    return createSuccessResponse({
      url: fileUrl,
      fileName,
      size: file.size,
      type: file.type
    }, 'File uploaded successfully')

  } catch (error: any) {
    console.error('File upload error:', error)
    return createErrorResponse('Failed to upload file', 500)
  }
})
