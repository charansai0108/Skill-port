'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Users, Trophy, Target, Activity, AlertCircle, RefreshCw } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { useSocket } from '@/lib/hooks/useSocket'
import { AnalyticsCard } from '@/components/analytics/AnalyticsCard'

interface DashboardData {
  userStats: {
    score: number
    problemsSolved: number
    contestsWon: number
    accuracy: number
  }
  topPerformances: Array<{
    contestName: string
    rank: number
    score: number
    date: string
  }>
  activeContests: Array<{
    contestId: string
    title: string
    deadline: string
    status: string
    description?: string
  }>
  recentActivities: Array<{
    type: string
    title: string
    date: string
    details?: string
  }>
}

interface LoadingState {
  dashboard: boolean
  refresh: boolean
}

export function EnhancedDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState<LoadingState>({
    dashboard: true,
    refresh: false
  })
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Get socket connection for real-time updates
  const { connected, notifications } = useSocket(null) // You'll need to pass the token

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Refresh data when new notifications arrive
  useEffect(() => {
    if (notifications.length > 0) {
      loadDashboardData(true)
    }
  }, [notifications])

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setLoading(prev => ({ ...prev, refresh: true }))
      } else {
        setLoading(prev => ({ ...prev, dashboard: true }))
      }
      setError(null)

      const response = await apiClient.getDashboardData()

      if (response.success && response.data) {
        setDashboardData(response.data)
        setLastUpdated(new Date())
      } else {
        setError(response.error || 'Failed to load dashboard data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(prev => ({
        ...prev,
        dashboard: false,
        refresh: false
      }))
    }
  }

  const handleRefresh = () => {
    loadDashboardData(true)
  }

  if (loading.dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => loadDashboardData()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back! Here's your learning progress overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={loading.refresh}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading.refresh ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnalyticsCard
            title="Total Score"
            value={dashboardData.userStats.score.toLocaleString()}
            icon={<Trophy className="w-6 h-6" />}
            color="yellow"
            subtitle="Points earned"
          />
          <AnalyticsCard
            title="Problems Solved"
            value={dashboardData.userStats.problemsSolved}
            icon={<Target className="w-6 h-6" />}
            color="green"
            subtitle="Successfully completed"
          />
          <AnalyticsCard
            title="Contests Won"
            value={dashboardData.userStats.contestsWon}
            icon={<Trophy className="w-6 h-6" />}
            color="purple"
            subtitle="First place finishes"
          />
          <AnalyticsCard
            title="Accuracy"
            value={`${dashboardData.userStats.accuracy}%`}
            icon={<TrendingUp className="w-6 h-6" />}
            color="blue"
            subtitle="Success rate"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performances */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Top Performances</h2>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-500">
                  {connected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>
            
            {dashboardData.topPerformances.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No performances yet</p>
                <p className="text-sm">Join contests to see your achievements here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.topPerformances.map((performance, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-yellow-600">#{performance.rank}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{performance.contestName}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(performance.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{performance.score} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Contests */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Active Contests</h2>
            
            {dashboardData.activeContests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No active contests</p>
                <p className="text-sm">Check back later for new challenges</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.activeContests.map((contest) => (
                  <div key={contest.contestId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{contest.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        contest.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {contest.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {contest.description || 'Join this contest to test your skills!'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Deadline: {new Date(contest.deadline).toLocaleDateString()}
                      </span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activities</h2>
          
          {dashboardData.recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No recent activities</p>
              <p className="text-sm">Start learning to see your progress here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{activity.title}</h3>
                    <p className="text-sm text-gray-600">{activity.details}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
