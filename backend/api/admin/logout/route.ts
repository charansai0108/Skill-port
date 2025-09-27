import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-middleware'
import { createActivityLog } from '@/lib/auth'

export const POST = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    // Log logout activity
    await createActivityLog(admin.id, 'LOGOUT', 'ADMIN', admin.id, {
      email: admin.email,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    })

  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    )
  }
})
