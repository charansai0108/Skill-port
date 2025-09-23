import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin, generateToken, createActivityLog } from '@/lib/auth'
import { validateRequestBody } from '@/lib/admin-middleware'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    validateRequestBody(['email', 'password'])(body)
    
    const { email, password } = body

    // Authenticate admin
    const admin = await authenticateAdmin(email, password)
    
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken(admin)

    // Log login activity
    await createActivityLog(admin.id, 'LOGIN', 'ADMIN', admin.id, {
      email: admin.email,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          profilePic: admin.profilePic
        }
      }
    })

  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Login failed' },
      { status: 400 }
    )
  }
}
