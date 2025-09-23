'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, AlertCircle, Trophy, MessageSquare, User, Zap } from 'lucide-react'
import { useSocket } from '@/lib/hooks/useSocket'

interface Notification {
  type: string
  title: string
  message: string
  data?: any
  timestamp: string
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'CONTEST_START':
    case 'CONTEST_END':
      return <Trophy className="w-5 h-5 text-yellow-500" />
    case 'FEEDBACK_RECEIVED':
      return <MessageSquare className="w-5 h-5 text-blue-500" />
    case 'SUBSCRIPTION_CREATED':
    case 'SUBSCRIPTION_CANCELED':
      return <Zap className="w-5 h-5 text-green-500" />
    case 'MENTOR_ASSIGNED':
      return <User className="w-5 h-5 text-purple-500" />
    default:
      return <AlertCircle className="w-5 h-5 text-gray-500" />
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'CONTEST_START':
    case 'CONTEST_END':
      return 'bg-yellow-50 border-yellow-200'
    case 'FEEDBACK_RECEIVED':
      return 'bg-blue-50 border-blue-200'
    case 'SUBSCRIPTION_CREATED':
    case 'SUBSCRIPTION_CANCELED':
      return 'bg-green-50 border-green-200'
    case 'MENTOR_ASSIGNED':
      return 'bg-purple-50 border-purple-200'
    default:
      return 'bg-gray-50 border-gray-200'
  }
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Get notifications from socket
  const { notifications: socketNotifications } = useSocket(null) // You'll need to pass the token

  useEffect(() => {
    setNotifications(socketNotifications)
    setUnreadCount(socketNotifications.length)
  }, [socketNotifications])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = (index: number) => {
    setNotifications(prev => {
      const newNotifications = [...prev]
      newNotifications[index] = { ...newNotifications[index], read: true }
      return newNotifications
    })
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  const clearAll = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - notificationTime.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${getNotificationColor(notification.type)}`}
                    onClick={() => markAsRead(index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        {notification.data && (
                          <div className="mt-2 text-xs text-gray-500">
                            {notification.data.contestName && (
                              <span>Contest: {notification.data.contestName}</span>
                            )}
                            {notification.data.rating && (
                              <span>Rating: {notification.data.rating}/5</span>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(index)
                        }}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
