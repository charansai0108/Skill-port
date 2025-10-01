'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  Users,
  Trophy,
  BarChart3,
  Activity,
  AlertCircle,
  Loader2,
  RefreshCw,
  User,
  Target,
  TrendingUp,
  GraduationCap,
  UserPlus,
  PlusCircle,
  Award,
  Flag,
  UserCheck,
  Clock,
  MessageCircle,
  FileText,
  LayoutDashboard,
  Shield
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
    totalUsers: number
    totalStudents: number
    totalMentors: number
    totalContests: number
    totalSubmissions: number
    totalCommunities: number
    activeUsers: number
  }
  recentUsers: any[]
  recentMentors: any[]
  recentActivities: any[]
  notifications: any[]
}

export default function CommunityDashboardPage() {
  const pathname = usePathname()
  const params = useParams()
  const communitySlug = params.communitySlug as string
  const { user: authUser, loading: authLoading } = useAuth('ADMIN')
  const [data, setData] = useState<DashboardData | null>(null)
  const [communityData, setCommunityData] = useState<any>(null)
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

      const response = await fetch(`/api/community/${communitySlug}/dashboard`, {
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
    fetchCommunityData()
    fetchDashboardData()
  }, [communitySlug])

  const fetchCommunityData = async () => {
    try {
      const response = await fetch(`/api/community/${communitySlug}`)
      const result = await response.json()
      setCommunityData(result.data.community)
    } catch (err) {
      console.error('Failed to fetch community:', err)
    }
  }

  const { user, community, stats, recentStudents, recentMentors, recentActivities, notifications } = data || {}
  
  // Provide default values to prevent undefined errors
  const safeStats = stats || {
    totalUsers: 0,
    totalStudents: 0,
    totalMentors: 0,
    totalContests: 0,
    totalSubmissions: 0,
    totalBatches: 0,
    activeUsers: 0
  }
  
  const safeRecentStudents = recentStudents || []
  const safeRecentMentors = recentMentors || []
  const safeRecentActivities = recentActivities || []
  const safeRecentUsers = recentStudents || [] // Use recentStudents as recentUsers
  const safeNotifications = notifications || []

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                {data?.community?.name || communityData?.name || 'Loading...'}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <Link href={`/community/${communitySlug}/dashboard`} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${pathname.includes('/dashboard') ? 'bg-red-50 text-red-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link href={`/community/${communitySlug}/students`} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${pathname.includes('/students') ? 'bg-red-50 text-red-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                <Users className="w-4 h-4" /> Students
              </Link>
              <Link href={`/community/${communitySlug}/mentors`} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${pathname.includes('/mentors') ? 'bg-red-50 text-red-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                <GraduationCap className="w-4 h-4" /> Mentors
              </Link>
              <Link href={`/community/${communitySlug}/contests`} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${pathname.includes('/contests') ? 'bg-red-50 text-red-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                <Trophy className="w-4 h-4" /> Contests
              </Link>
              <Link href={`/community/${communitySlug}/analytics`} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${pathname.includes('/analytics') ? 'bg-red-50 text-red-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                <BarChart3 className="w-4 h-4" /> Analytics
              </Link>
              <Link href={`/community/${communitySlug}/leaderboard`} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${pathname.includes('/leaderboard') ? 'bg-red-50 text-red-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                <Award className="w-4 h-4" /> Leaderboard
              </Link>
              <Link href={`/community/${communitySlug}/profile`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                {authUser ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center text-white text-sm font-semibold shadow-lg border-2 border-white">
                    {authUser.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                ) : (
                  <User className="w-8 h-8" />
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {(authLoading || loading) && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-20">
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
      )}

            {!authLoading && !loading && !error && (
        <>
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-700 leading-snug">Dashboard</h1>
              </div>
            </div>
          </div>

          {/* System Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="stat-card bg-white rounded-lg shadow-lg p-6 backdrop-filter backdrop-blur-lg bg-opacity-65 border-2 border-white border-opacity-60 hover:bg-opacity-85 hover:border-blue-400 hover:shadow-xl hover:-translate-y-0.5 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900">{safeStats.totalUsers}</p>
                  <p className="text-sm text-green-600">+{safeStats.activeUsers} active</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="stat-card bg-white rounded-lg shadow-lg p-6 backdrop-filter backdrop-blur-lg bg-opacity-65 border-2 border-white border-opacity-60 hover:bg-opacity-85 hover:border-blue-400 hover:shadow-xl hover:-translate-y-0.5 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Mentors</p>
                  <p className="text-2xl font-bold text-slate-900">{safeStats.totalMentors}</p>
                  <p className="text-sm text-green-600">+2 this month</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="stat-card bg-white rounded-lg shadow-lg p-6 backdrop-filter backdrop-blur-lg bg-opacity-65 border-2 border-white border-opacity-60 hover:bg-opacity-85 hover:border-blue-400 hover:shadow-xl hover:-translate-y-0.5 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Contests</p>
                  <p className="text-2xl font-bold text-slate-900">{safeStats.totalContests}</p>
                  <p className="text-sm text-green-600">+3 this month</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="stat-card bg-white rounded-lg shadow-lg p-6 backdrop-filter backdrop-blur-lg bg-opacity-65 border-2 border-white border-opacity-60 hover:bg-opacity-85 hover:border-blue-400 hover:shadow-xl hover:-translate-y-0.5 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Problems Solved</p>
                  <p className="text-2xl font-bold text-slate-600">{safeStats.totalSubmissions}</p>
                  <p className="text-sm text-green-600">+15 this week</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity & Community Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Activity */}
            <div className="dashboard-card bg-white rounded-lg shadow-lg p-6 h-80 backdrop-filter backdrop-blur-lg bg-opacity-70 border border-white border-opacity-20 hover:bg-opacity-90 hover:shadow-2xl hover:-translate-y-0.5 hover:scale-105 transition-all duration-300">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
              <div className="space-y-4 h-64 overflow-y-auto">
                {safeRecentActivities.length > 0 ? (
                  safeRecentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                        <p className="text-xs text-slate-500">
                          {activity.user?.name || 'Unknown'} • {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-500">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Community Insights */}
            <div className="dashboard-card bg-white rounded-lg shadow-lg p-6 h-80 backdrop-filter backdrop-blur-lg bg-opacity-70 border border-white border-opacity-20 hover:bg-opacity-90 hover:shadow-2xl hover:-translate-y-0.5 hover:scale-105 transition-all duration-300">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Community Insights</h2>
              <div className="space-y-4 h-64 overflow-y-auto">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-slate-900">Active Users Today</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">{safeStats.activeUsers}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-slate-900">New Registrations</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{safeRecentUsers.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-medium text-slate-900">Community Posts</span>
                  </div>
                  <span className="text-sm font-semibold text-amber-600">{safeStats.totalBatches}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-slate-900">Contest Submissions</span>
                  </div>
                  <span className="text-sm font-semibold text-purple-600">{safeStats.totalSubmissions}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Users & Mentors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Users */}
            <div className="bg-white rounded-lg shadow-lg p-6 h-80">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Recent Users</h2>
                <Link href={`/community/${communitySlug}/students`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-3 h-64 overflow-y-auto">
                {safeRecentUsers.length > 0 ? (
                  safeRecentUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <span className="text-xs text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-500">No recent users</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Mentors */}
            <div className="bg-white rounded-lg shadow-lg p-6 h-80">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Recent Mentors</h2>
                <Link href={`/community/${communitySlug}/mentors`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-3 h-64 overflow-y-auto">
                {safeRecentUsers.filter(u => u.role === 'MENTOR').length > 0 ? (
                  safeRecentUsers.filter(u => u.role === 'MENTOR').slice(0, 5).map((mentor) => (
                    <div key={mentor.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {mentor.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{mentor.name}</p>
                        <p className="text-xs text-slate-500">Expert • 0 students</p>
                      </div>
                      <span className="text-xs text-green-600">active</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-500">No recent mentors</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <Link href={`/community/${communitySlug}/students`} className="action-card bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all group cursor-pointer backdrop-filter backdrop-blur-lg bg-opacity-65 border-2 border-white border-opacity-60 hover:bg-opacity-85 hover:border-blue-400 hover:-translate-y-0.5 hover:scale-105">
                <UserPlus className="w-12 h-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-slate-900 mb-2">Add New User</h3>
                <p className="text-sm text-slate-600">Create user account with credentials</p>
              </Link>
              <Link href={`/community/${communitySlug}/mentors`} className="action-card bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all group cursor-pointer backdrop-filter backdrop-blur-lg bg-opacity-65 border-2 border-white border-opacity-60 hover:bg-opacity-85 hover:border-blue-400 hover:-translate-y-0.5 hover:scale-105">
                <GraduationCap className="w-12 h-12 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-slate-900 mb-2">Add New Mentor</h3>
                <p className="text-sm text-slate-600">Create mentor account and assign</p>
              </Link>
              <Link href={`/community/${communitySlug}/contests`} className="action-card bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all group cursor-pointer backdrop-filter backdrop-blur-lg bg-opacity-65 border-2 border-white border-opacity-60 hover:bg-opacity-85 hover:border-blue-400 hover:-translate-y-0.5 hover:scale-105">
                <PlusCircle className="w-12 h-12 text-amber-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-slate-900 mb-2">Create Contest</h3>
                <p className="text-sm text-slate-600">Set up new contest and assign mentor</p>
              </Link>
              <Link href={`/community/${communitySlug}/analytics`} className="action-card bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all group cursor-pointer backdrop-filter backdrop-blur-lg bg-opacity-65 border-2 border-white border-opacity-60 hover:bg-opacity-85 hover:border-blue-400 hover:-translate-y-0.5 hover:scale-105">
                <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-slate-900 mb-2">View Analytics</h3>
                <p className="text-sm text-slate-600">System-wide performance reports</p>
              </Link>
              <Link href={`/community/${communitySlug}/leaderboard`} className="action-card bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all group cursor-pointer backdrop-filter backdrop-blur-lg bg-opacity-65 border-2 border-white border-opacity-60 hover:bg-opacity-85 hover:border-blue-400 hover:-translate-y-0.5 hover:scale-105">
                <Award className="w-12 h-12 text-indigo-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-slate-900 mb-2">View Leaderboard</h3>
                <p className="text-sm text-slate-600">Overall system rankings</p>
              </Link>
            </div>
          </div>

          {/* Alerts & Contest Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Alerts & Notifications */}
            <div className="bg-white rounded-lg shadow-lg p-6 h-80">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Alerts & Notifications</h2>
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                  {safeNotifications.length}
                </span>
              </div>
              <div className="space-y-3 h-64 overflow-y-auto">
                {safeNotifications.length > 0 ? (
                  safeNotifications.slice(0, 3).map((notification, index) => (
                    <div key={notification.id} className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${
                      index === 0 ? 'bg-red-50 border-red-400' :
                      index === 1 ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}>
                      <Flag className={`w-5 h-5 ${
                        index === 0 ? 'text-red-600' :
                        index === 1 ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          index === 0 ? 'text-red-900' :
                          index === 1 ? 'text-yellow-900' :
                          'text-blue-900'
                        }`}>{notification.title}</p>
                        <p className={`text-xs ${
                          index === 0 ? 'text-red-600' :
                          index === 1 ? 'text-yellow-600' :
                          'text-blue-600'
                        }`}>{notification.message}</p>
                      </div>
                      <button className={`text-xs ${
                        index === 0 ? 'text-red-600 hover:text-red-800' :
                        index === 1 ? 'text-yellow-600 hover:text-yellow-800' :
                        'text-blue-600 hover:text-blue-800'
                      }`}>Review</button>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">System Alert</p>
                      <p className="text-xs text-blue-600">All systems operational</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contest Management */}
            <div className="bg-white rounded-lg shadow-lg p-6 h-80">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Contest Management</h2>
                <Link href={`/community/${communitySlug}/contests`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{safeStats.totalContests}</div>
                    <div className="text-xs text-green-600">Active Contests</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">2</div>
                    <div className="text-xs text-blue-600">Pending Start</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-medium text-amber-900">Contests needing mentors</span>
                    </div>
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">1</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-900">Total participants today</span>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">{safeStats.totalStudents}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-900">Submissions pending review</span>
                    </div>
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm font-bold">{safeStats.totalSubmissions}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance & Community Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-lg p-6 h-80">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Performance Metrics</h2>
                <Link href={`/community/${communitySlug}/analytics`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Details
                </Link>
              </div>
              <div className="space-y-4 h-64 overflow-y-auto">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-slate-900">Contest Success Rate</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">87%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-slate-900">Avg Mentor Response</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">2.3 hrs</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-slate-900">User Engagement</span>
                  </div>
                  <span className="text-sm font-semibold text-purple-600">73%</span>
                </div>
              </div>
            </div>

            {/* Community Health */}
            <div className="bg-white rounded-lg shadow-lg p-6 h-80">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Community Health</h2>
                <Link href={`/community/${communitySlug}/analytics`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Details
                </Link>
              </div>
              <div className="space-y-4 h-64 overflow-y-auto">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-slate-900">Weekly Growth</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">+12%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-slate-900">Active Discussions</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">18</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-medium text-slate-900">Top Contributors</span>
                  </div>
                  <span className="text-sm font-semibold text-amber-600">24</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      </main>
    </>
  )
}
