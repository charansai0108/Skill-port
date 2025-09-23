import { NextRequest } from 'next/server'
import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { initializeSocket } from '@/lib/socket'

let io: SocketIOServer | null = null

export async function GET(request: NextRequest) {
  if (!io) {
    // Initialize Socket.IO server
    const httpServer = new NetServer()
    io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      path: '/api/socket'
    })

    // Initialize socket manager
    initializeSocket(io)
    
    console.log('Socket.IO server initialized')
  }

  return new Response('Socket.IO server is running', { status: 200 })
}

export async function POST(request: NextRequest) {
  try {
    const { action, userId, notification } = await request.json()

    if (action === 'send_notification' && userId && notification) {
      const socketManager = require('@/lib/socket').getSocketManager()
      if (socketManager) {
        await socketManager.sendNotification(userId, notification)
        return new Response('Notification sent', { status: 200 })
      }
    }

    return new Response('Invalid action', { status: 400 })
  } catch (error) {
    console.error('Socket API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
