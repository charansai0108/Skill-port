'use client'

import { useState, useEffect } from 'react'
import { 
  Trophy, 
  MessageSquare, 
  CheckCircle, 
  User, 
  Zap, 
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react'
import { useSocket } from '@/lib/hooks/useSocket'

interface ActivityItem {
  id: string
  type: 'submission' | 'feedback' | 'contest' | 'subscription' | 'general'
  title: string
  description: string
  timestamp: string
  data?: any
  userId?: string
  userName?: string
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'submission':
      return <CheckCircle className="w-5 h-5 text-green-500" />
    case 'feedback':
      return <MessageSquare className="w-5 h-5 text-blue-500" />
    case 'contest':
      return <Trophy className="w-5 h-5 text-yellow-500" />
    case 'subscription':
      return <Zap className="w-5 h-5 text-purple-500" />
    default:
      return <AlertCircle className="w-5 h-5 text-gray-500" />
  }
}

const getActivityColor = (type: string) => {
  switch (type) {
    case 'submission':
      return 'bg-green-50 border-green-200'
    case 'feedback':
      return 'bg-blue-50 border-blue-200'
    case 'contest':
      return 'bg-yellow-50 border-yellow-200'
    case 'subscription':
      return 'bg-purple-50 border-purple-200'
    default:
      return 'bg-gray-50 border-gray-200'
  }
}

export function ActivityFeed({ token }: { token: string | null }) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const { connected, submissionUpdates } = useSocket(token)

  useEffect(() => {
    fetchActivities()
  }, [])

  useEffect(() => {
    // Convert submission updates to activity items
    if (submissionUpdates.length > 0) {
      const newActivities = submissionUpdates.map(update => ({
        id: `submission-${update.timestamp}`,
        type: 'submission' as const,
        title: 'New Submission',
        description: `${update.userName} submitted a solution for problem ${update.problemId}`,
        timestamp: update.timestamp,
        data: update,
        userId: update.userId,
        userName: update.userName
      }))

      setActivities(prev => [...newActivities, ...prev].slice(0, 50)) // Keep last 50 activities
    }
  }, [submissionUpdates])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/activity/feed')
      const data = await response.json()

      if (response.ok) {
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - activityTime.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const getStatusBadge = (data: any) => {
    if (data?.status) {
      const statusColors = {
        'ACCEPTED': 'bg-green-100 text-green-800',
        'WRONG_ANSWER': 'bg-red-100 text-red-800',
        'TIME_LIMIT_EXCEEDED': 'bg-yellow-100 text-yellow-800',
        'RUNTIME_ERROR': 'bg-orange-100 text-orange-800'
      }
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[data.status] || 'bg-gray-100 text-gray-800'}`}>
          {data.status}
        </span>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Live Activity Feed</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{connected ? 'Live updates' : 'Offline'}</span>
              <span>•</span>
              <span>{activities.length} activities</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={fetchActivities}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Activities */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex gap-3 p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${getActivityColor(activity.type)}`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {activity.title}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  {activity.description}
                </p>

                {/* Additional Info */}
                <div className="flex items-center gap-2">
                  {activity.userName && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      <span>{activity.userName}</span>
                    </div>
                  )}
                  
                  {getStatusBadge(activity.data)}
                  
                  {activity.data?.score && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {activity.data.score} points
                    </span>
                  )}
                  
                  {activity.data?.rating && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      {activity.data.rating}/5 stars
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Live Indicator */}
      {connected && activities.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live updates enabled</span>
          </div>
        </div>
      )}
    </div>
  )
}
