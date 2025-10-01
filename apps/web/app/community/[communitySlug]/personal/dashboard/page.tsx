'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Target,
  CheckCircle,
  BookOpen,
  Users,
  BarChart3,
  AlertCircle,
  Loader2,
  RefreshCw,
  Plus,
  Calendar,
  TrendingUp
} from 'lucide-react'

interface DashboardData {
  user: {
    id: string
    name: string
    email: string
    role: string
    profilePic?: string
  }
  stats: {
    totalTasks: number
    completedTasks: number
    taskCompletionRate: number
    totalProjects: number
    activeProjects: number
    totalSubmissions: number
    acceptedSubmissions: number
    accuracy: number
    communityMemberships: number
  }
  tasks: any[]
  projects: any[]
  submissions: any[]
  communityMemberships: any[]
  recentActivities: any[]
  notifications: any[]
}

export default function PersonalDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/dashboard/personal', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/auth/login'
          return
        }
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    )
  }

  const { user, stats, tasks, projects, submissions, communityMemberships, recentActivities, notifications } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Personal Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back, {user.name}!</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchDashboardData}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}/{stats.totalTasks}</p>
                <p className="text-xs text-green-600 mt-1">{stats.taskCompletionRate}% completion rate</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
                <p className="text-xs text-gray-600 mt-1">{stats.totalProjects} total</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.acceptedSubmissions}/{stats.totalSubmissions}</p>
                <p className="text-xs text-purple-600 mt-1">{stats.accuracy.toFixed(1)}% accuracy</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Communities</p>
                <p className="text-2xl font-bold text-gray-900">{stats.communityMemberships}</p>
                <p className="text-xs text-orange-600 mt-1">memberships</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tasks & Projects */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
                <div className="flex items-center gap-2">
                  <Link href="/personal/tasks" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View all
                  </Link>
                  <button className="p-1 text-gray-600 hover:text-gray-900">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          task.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-600">{task.platform} • {task.difficulty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.completed ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-4">No tasks yet</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Create Your First Task
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
                <div className="flex items-center gap-2">
                  <Link href="/personal/projects" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View all
                  </Link>
                  <button className="p-1 text-gray-600 hover:text-gray-900">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{project.title}</h3>
                        <p className="text-sm text-gray-600">{project.description}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-4">No projects yet</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Start Your First Project
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Communities & Notifications */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Communities</h2>
                <Link href="/personal/communities" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {communityMemberships.length > 0 ? (
                  communityMemberships.map((community) => (
                    <div key={community.id} className="p-3 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">{community.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{community.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{community.type}</span>
                        <span>{community._count.members} members</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-4">No communities yet</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Join Communities
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              </div>
              <div className="space-y-3">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No notifications</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}