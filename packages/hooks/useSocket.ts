'use client'

import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface Notification {
  type: string
  title: string
  message: string
  data?: any
  timestamp: string
}

interface ChatMessage {
  userId: string
  userName: string
  message: string
  timestamp: string
}

interface UserTyping {
  userId: string
  userName: string
  isTyping: boolean
}

interface SubmissionUpdate {
  userId: string
  userName: string
  problemId: string
  status: string
  score: number
  timestamp: string
}

interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  score: number
  problemsSolved: number
}

export function useSocket(token: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!token) return

    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      auth: {
        token
      },
      path: '/api/socket'
    })

    socketRef.current = newSocket
    setSocket(newSocket)

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to server')
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setConnected(false)
    })

    // Notification handlers
    newSocket.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Keep last 50 notifications
    })

    // User activity handlers
    newSocket.on('user_joined_contest', (data: { userId: string, userName: string, timestamp: string }) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]))
    })

    newSocket.on('user_disconnected', (data: { userId: string, userName: string, timestamp: string }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(data.userId)
        return newSet
      })
    })

    // Cleanup on unmount
    return () => {
      newSocket.close()
      socketRef.current = null
    }
  }, [token])

  // Contest-specific hooks
  const joinContest = (contestId: string) => {
    if (socket) {
      socket.emit('join_contest', contestId)
    }
  }

  const leaveContest = (contestId: string) => {
    if (socket) {
      socket.emit('leave_contest', contestId)
    }
  }

  const joinCommunity = (communityId: string) => {
    if (socket) {
      socket.emit('join_community', communityId)
    }
  }

  // Chat functionality
  const sendChatMessage = (room: string, message: string, type: 'contest' | 'community') => {
    if (socket) {
      socket.emit('chat_message', { room, message, type })
    }
  }

  const startTyping = (room: string, type: 'contest' | 'community') => {
    if (socket) {
      socket.emit('typing_start', { room, type })
    }
  }

  const stopTyping = (room: string, type: 'contest' | 'community') => {
    if (socket) {
      socket.emit('typing_stop', { room, type })
    }
  }

  // Submission updates
  const sendSubmissionUpdate = (contestId: string, problemId: string, status: string, score: number) => {
    if (socket) {
      socket.emit('submission_update', { contestId, problemId, status, score })
    }
  }

  // Feedback updates
  const sendFeedbackUpdate = (studentId: string, mentorId: string, rating: number, contestId?: string) => {
    if (socket) {
      socket.emit('feedback_submitted', { studentId, mentorId, rating, contestId })
    }
  }

  return {
    socket,
    connected,
    notifications,
    onlineUsers,
    joinContest,
    leaveContest,
    joinCommunity,
    sendChatMessage,
    startTyping,
    stopTyping,
    sendSubmissionUpdate,
    sendFeedbackUpdate
  }
}

// Contest-specific hook
export function useContestSocket(contestId: string, token: string | null) {
  const { socket, connected, joinContest, leaveContest, sendChatMessage, startTyping, stopTyping } = useSocket(token)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<Map<string, UserTyping>>(new Map())
  const [submissionUpdates, setSubmissionUpdates] = useState<SubmissionUpdate[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    if (!socket || !contestId) return

    // Join contest room
    joinContest(contestId)

    // Chat message handler
    const handleChatMessage = (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message])
    }

    // Typing indicator handler
    const handleUserTyping = (data: UserTyping) => {
      setTypingUsers(prev => {
        const newMap = new Map(prev)
        if (data.isTyping) {
          newMap.set(data.userId, data)
        } else {
          newMap.delete(data.userId)
        }
        return newMap
      })
    }

    // Submission update handler
    const handleSubmissionUpdate = (update: SubmissionUpdate) => {
      setSubmissionUpdates(prev => [update, ...prev.slice(0, 19)]) // Keep last 20 updates
    }

    // Leaderboard update handler
    const handleLeaderboardUpdate = (data: { contestId: string, leaderboard: LeaderboardEntry[] }) => {
      if (data.contestId === contestId) {
        setLeaderboard(data.leaderboard)
      }
    }

    // Register event listeners
    socket.on('chat_message', handleChatMessage)
    socket.on('user_typing', handleUserTyping)
    socket.on('submission_received', handleSubmissionUpdate)
    socket.on('leaderboard_updated', handleLeaderboardUpdate)

    // Cleanup
    return () => {
      leaveContest(contestId)
      socket.off('chat_message', handleChatMessage)
      socket.off('user_typing', handleUserTyping)
      socket.off('submission_received', handleSubmissionUpdate)
      socket.off('leaderboard_updated', handleLeaderboardUpdate)
    }
  }, [socket, contestId, joinContest, leaveContest])

  return {
    connected,
    chatMessages,
    typingUsers,
    submissionUpdates,
    leaderboard,
    sendChatMessage: (message: string) => sendChatMessage(contestId, message, 'contest'),
    startTyping: () => startTyping(contestId, 'contest'),
    stopTyping: () => stopTyping(contestId, 'contest')
  }
}
