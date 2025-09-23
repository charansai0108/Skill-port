'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Target, Clock, CheckCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react'
import { extensionIntegration, ExtensionSubmission } from '@/lib/extension-integration'
import { apiClient } from '@/lib/api-client'

interface TrackerStats {
  totalSubmissions: number
  acceptedSubmissions: number
  accuracy: number
  averageTime: number
  platformStats: Record<string, any>
  recentSubmissions: ExtensionSubmission[]
  difficultyStats: Record<string, number>
  languageStats: Record<string, number>
  monthlyTrends: Array<{
    month: string
    total: number
    accepted: number
    accuracy: number
  }>
}

export function EnhancedTracker() {
  const [stats, setStats] = useState<TrackerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)

  useEffect(() => {
    checkExtensionStatus()
    loadTrackerData()
    
    // Start auto-sync if extension is available
    if (isExtensionInstalled) {
      extensionIntegration.startAutoSync(5) // Sync every 5 minutes
    }

    return () => {
      extensionIntegration.stopAutoSync()
    }
  }, [isExtensionInstalled])

  const checkExtensionStatus = () => {
    const installed = extensionIntegration.isExtensionAvailable()
    setIsExtensionInstalled(installed)
    setLastSync(extensionIntegration.getLastSyncTime())
  }

  const loadTrackerData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.getExtensionData()

      if (response.success && response.data) {
        setStats(response.data)
        setLastSync(response.data.lastSync)
      } else {
        setError(response.error || 'Failed to load tracker data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    try {
      setLoading(true)
      await extensionIntegration.requestExtensionData()
      await loadTrackerData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync data')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100'
      case 'wrong_answer': return 'text-red-600 bg-red-100'
      case 'time_limit_exceeded': return 'text-yellow-600 bg-yellow-100'
      case 'runtime_error': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracker data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Tracker</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadTrackerData}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
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
            <h1 className="text-3xl font-bold text-gray-900">Learning Tracker</h1>
            <p className="text-gray-600">
              Track your progress across coding platforms
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastSync && (
              <span className="text-sm text-gray-500">
                Last sync: {new Date(lastSync).toLocaleString()}
              </span>
            )}
            <button
              onClick={handleSync}
              disabled={loading || !isExtensionInstalled}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Sync Data
            </button>
          </div>
        </div>

        {/* Extension Status */}
        {!isExtensionInstalled && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-900">Extension Not Installed</h3>
                <p className="text-sm text-yellow-800">
                  Install the SkillPort browser extension to automatically sync your coding progress.
                </p>
                <a
                  href="#"
                  className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Install Extension →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.acceptedSubmissions}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.accuracy.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageTime.toFixed(0)}ms</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Platform Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Performance</h2>
            <div className="space-y-4">
              {Object.entries(stats.platformStats).map(([platform, data]) => (
                <div key={platform} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 capitalize">{platform}</h3>
                    <span className="text-sm text-gray-500">
                      {data.accepted}/{data.total} accepted
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(data.accepted / data.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Accuracy: {((data.accepted / data.total) * 100).toFixed(1)}%</span>
                    <span>Avg. Time: {data.averageTime.toFixed(0)}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Submissions</h2>
            <div className="space-y-3">
              {stats.recentSubmissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No submissions yet</p>
                  <p className="text-sm">Start coding to see your progress here</p>
                </div>
              ) : (
                stats.recentSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{submission.problemTitle}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(submission.difficulty)}`}>
                          {submission.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">{submission.platform}</span>
                        <span className="text-xs text-gray-500">{submission.language}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {submission.status.replace('_', ' ')}
                      </span>
                      {submission.executionTime && (
                        <span className="text-xs text-gray-500">
                          {submission.executionTime}ms
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Difficulty & Language Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Difficulty Distribution</h2>
            <div className="space-y-3">
              {Object.entries(stats.difficultyStats).map(([difficulty, count]) => (
                <div key={difficulty} className="flex items-center justify-between">
                  <span className="capitalize font-medium text-gray-900">{difficulty}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getDifficultyColor(difficulty).split(' ')[1]}`}
                        style={{ width: `${(count / stats.totalSubmissions) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Language Distribution</h2>
            <div className="space-y-3">
              {Object.entries(stats.languageStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([language, count]) => (
                  <div key={language} className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{language}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(count / stats.totalSubmissions) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
