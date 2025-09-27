import { Server as NetServer } from 'http'
import { NextApiResponse } from 'next'
import { Server as SocketIOServer } from 'socket.io'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

export class SocketManager {
  private io: SocketIOServer
  private connectedUsers: Map<string, string> = new Map() // userId -> socketId

  constructor(io: SocketIOServer) {
    this.io = io
    this.setupMiddleware()
    this.setupEventHandlers()
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token
        if (!token) {
          return next(new Error('Authentication error: No token provided'))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        const user = await prisma.user.findUnique({
          where: { id: decoded.student?.id || decoded.admin?.id },
          select: { id: true, name: true, email: true, role: true }
        })

        if (!user) {
          return next(new Error('Authentication error: User not found'))
        }

        socket.data.user = user
        this.connectedUsers.set(user.id, socket.id)
        next()
      } catch (error) {
        next(new Error('Authentication error: Invalid token'))
      }
    })
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const user = socket.data.user
      console.log(`User ${user.name} (${user.id}) connected`)

      // Join user to their personal room
      socket.join(`user:${user.id}`)

      // Join user to role-based rooms
      socket.join(`role:${user.role}`)

      // Handle joining contest rooms
      socket.on('join_contest', (contestId: string) => {
        socket.join(`contest:${contestId}`)
        console.log(`User ${user.name} joined contest ${contestId}`)
        
        // Notify other participants
        socket.to(`contest:${contestId}`).emit('user_joined_contest', {
          userId: user.id,
          userName: user.name,
          timestamp: new Date().toISOString()
        })
      })

      // Handle leaving contest rooms
      socket.on('leave_contest', (contestId: string) => {
        socket.leave(`contest:${contestId}`)
        console.log(`User ${user.name} left contest ${contestId}`)
      })

      // Handle joining community rooms
      socket.on('join_community', (communityId: string) => {
        socket.join(`community:${communityId}`)
        console.log(`User ${user.name} joined community ${communityId}`)
      })

      // Handle real-time submission updates
      socket.on('submission_update', async (data: {
        contestId: string
        problemId: string
        status: string
        score: number
      }) => {
        // Broadcast to contest participants
        this.io.to(`contest:${data.contestId}`).emit('submission_received', {
          userId: user.id,
          userName: user.name,
          problemId: data.problemId,
          status: data.status,
          score: data.score,
          timestamp: new Date().toISOString()
        })

        // Update leaderboard in real-time
        await this.updateContestLeaderboard(data.contestId)
      })

      // Handle real-time feedback
      socket.on('feedback_submitted', (data: {
        studentId: string
        mentorId: string
        rating: number
        contestId?: string
      }) => {
        // Notify the student
        this.io.to(`user:${data.studentId}`).emit('feedback_received', {
          mentorId: data.mentorId,
          rating: data.rating,
          contestId: data.contestId,
          timestamp: new Date().toISOString()
        })
      })

      // Handle live chat messages
      socket.on('chat_message', (data: {
        room: string
        message: string
        type: 'contest' | 'community'
      }) => {
        const roomName = data.type === 'contest' ? `contest:${data.room}` : `community:${data.room}`
        
        this.io.to(roomName).emit('chat_message', {
          userId: user.id,
          userName: user.name,
          message: data.message,
          timestamp: new Date().toISOString()
        })
      })

      // Handle typing indicators
      socket.on('typing_start', (data: { room: string, type: 'contest' | 'community' }) => {
        const roomName = data.type === 'contest' ? `contest:${data.room}` : `community:${data.room}`
        socket.to(roomName).emit('user_typing', {
          userId: user.id,
          userName: user.name,
          isTyping: true
        })
      })

      socket.on('typing_stop', (data: { room: string, type: 'contest' | 'community' }) => {
        const roomName = data.type === 'contest' ? `contest:${data.room}` : `community:${data.room}`
        socket.to(roomName).emit('user_typing', {
          userId: user.id,
          userName: user.name,
          isTyping: false
        })
      })

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User ${user.name} disconnected`)
        this.connectedUsers.delete(user.id)
        
        // Notify all rooms that user left
        this.io.emit('user_disconnected', {
          userId: user.id,
          userName: user.name,
          timestamp: new Date().toISOString()
        })
      })
    })
  }

  // Public methods for sending notifications
  async sendNotification(userId: string, notification: {
    type: string
    title: string
    message: string
    data?: any
  }) {
    const socketId = this.connectedUsers.get(userId)
    if (socketId) {
      this.io.to(socketId).emit('notification', notification)
    }

    // Also save to database
    await prisma.notification.create({
      data: {
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {}
      }
    })
  }

  async broadcastToContest(contestId: string, event: string, data: any) {
    this.io.to(`contest:${contestId}`).emit(event, data)
  }

  async broadcastToCommunity(communityId: string, event: string, data: any) {
    this.io.to(`community:${communityId}`).emit(event, data)
  }

  async broadcastToRole(role: string, event: string, data: any) {
    this.io.to(`role:${role}`).emit(event, data)
  }

  async updateContestLeaderboard(contestId: string) {
    try {
      // Get updated leaderboard data
      const participants = await prisma.contestParticipant.findMany({
        where: { contestId },
        include: { user: { select: { name: true } } },
        orderBy: { score: 'desc' }
      })

      const leaderboard = participants.map((p, index) => ({
        rank: index + 1,
        userId: p.userId,
        userName: p.user.name,
        score: p.score,
        problemsSolved: 0 // You might want to calculate this
      }))

      // Broadcast to contest participants
      this.broadcastToContest(contestId, 'leaderboard_updated', {
        contestId,
        leaderboard,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating leaderboard:', error)
    }
  }

  getConnectedUsersCount(): number {
    return this.connectedUsers.size
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId)
  }
}

// Global socket manager instance
let socketManager: SocketManager | null = null

export function getSocketManager(): SocketManager | null {
  return socketManager
}

export function initializeSocket(io: SocketIOServer): SocketManager {
  socketManager = new SocketManager(io)
  return socketManager
}
