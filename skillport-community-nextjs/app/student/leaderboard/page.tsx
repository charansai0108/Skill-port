'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Award,
  Crown,
  Star,
  FileSpreadsheet,
  RefreshCw,
  Trophy,
  TrendingUp,
  Users
} from 'lucide-react'

interface LeaderboardEntry {
  id: number
  rank: number
  name: string
  avatar: string
  avatarColor: string
  score: number
  problemsSolved: number
  contestsWon: number
  accuracy: number
  specialization: string
}

interface LeaderboardStats {
  topPerformers: number
  activeRankings: number
  avgScore: number
}

export default function StudentLeaderboardPage() {
  const [stats, setStats] = useState<LeaderboardStats>({
    topPerformers: 24,
    activeRankings: 156,
    avgScore: 8.9
  })

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    {
      id: 1,
      rank: 1,
      name: 'Munaf',
      avatar: 'A',
      avatarColor: 'from-blue-400 to-indigo-500',
      score: 9.8,
      problemsSolved: 156,
      contestsWon: 12,
      accuracy: 98,
      specialization: 'Algorithms Master'
    },
    {
      id: 2,
      rank: 2,
      name: 'Sarah Chen',
      avatar: 'S',
      avatarColor: 'from-green-400 to-emerald-500',
      score: 9.6,
      problemsSolved: 142,
      contestsWon: 10,
      accuracy: 96,
      specialization: 'Data Structures Expert'
    },
    {
      id: 3,
      rank: 3,
      name: 'Mike Rodriguez',
      avatar: 'M',
      avatarColor: 'from-purple-400 to-pink-500',
      score: 9.4,
      problemsSolved: 138,
      contestsWon: 8,
      accuracy: 94,
      specialization: 'Dynamic Programming'
    },
    {
      id: 4,
      rank: 4,
      name: 'Emma Wilson',
      avatar: 'E',
      avatarColor: 'from-red-400 to-pink-500',
      score: 9.2,
      problemsSolved: 125,
      contestsWon: 7,
      accuracy: 92,
      specialization: 'Web Development'
    },
    {
      id: 5,
      rank: 5,
      name: 'David Kim',
      avatar: 'D',
      avatarColor: 'from-indigo-400 to-purple-500',
      score: 9.0,
      problemsSolved: 118,
      contestsWon: 6,
      accuracy: 90,
      specialization: 'Machine Learning'
    }
  ])

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages] = useState(16) // 156 entries / 10 per page
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = () => {
    // Simulate export functionality
    alert('Leaderboard exported successfully!')
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    alert('Leaderboard refreshed!')
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-amber-500'
      case 2:
        return 'from-slate-400 to-slate-500'
      case 3:
        return 'from-amber-500 to-orange-500'
      default:
        return 'from-slate-400 to-slate-500'
    }
  }

  const getPodiumCardStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'scale-105 order-first md:order-none border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50'
      case 2:
        return 'scale-95 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/50'
      case 3:
        return 'scale-95 bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200/50'
      default:
        return ''
    }
  }

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-content">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-700">Student Leaderboard</h1>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="stat-card bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Top Performers</p>
                <p className="text-2xl font-bold text-slate-900">{stats.topPerformers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="stat-card bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Rankings</p>
                <p className="text-2xl font-bold text-slate-900">{stats.activeRankings}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="stat-card bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg. Score</p>
                <p className="text-2xl font-bold text-slate-900">{stats.avgScore}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 gap-8">
          {/* Top 3 Podium */}
          <div className="w-full">
            <h2 className="text-4xl font-bold text-slate-900 mb-16 text-center">Top Performers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 2nd Place */}
              <div className={`podium-card relative backdrop-blur-xl rounded-2xl shadow-xl p-6 text-center transform transition-all duration-500 hover:scale-100 hover:shadow-2xl hover:-translate-y-2 overflow-hidden ${getPodiumCardStyle(2)}`}>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg">
                    2
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-xl ring-4 ring-blue-100">
                    S
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Sarah Chen</h3>
                  <p className="text-slate-600 mb-3 font-medium">Data Structures Expert</p>
                  <div className="text-2xl font-bold text-blue-600 mb-2">9.6</div>
                  <div className="text-sm text-slate-500 mb-4 font-medium">points</div>
                  <div className="space-y-2 text-sm bg-white/60 rounded-xl p-3 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Problems:</span>
                      <span className="font-bold text-slate-800">142</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Contests:</span>
                      <span className="font-bold text-slate-800">10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Accuracy:</span>
                      <span className="font-bold text-green-600">96%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1st Place */}
              <div className={`podium-card relative backdrop-blur-xl rounded-2xl shadow-2xl p-6 text-center transform transition-all duration-500 hover:scale-110 hover:shadow-3xl hover:-translate-y-3 overflow-hidden ${getPodiumCardStyle(1)}`}>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg">
                    1
                  </div>
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-xl ring-4 ring-blue-100">
                    A
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Munaf</h3>
                  <p className="text-slate-600 mb-3 font-medium">Algorithms Master</p>
                  <div className="text-3xl font-bold text-blue-600 mb-2">9.8</div>
                  <div className="text-sm text-slate-500 mb-4 font-medium">points</div>
                  <div className="space-y-2 text-sm bg-white/70 rounded-xl p-3 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Problems:</span>
                      <span className="font-bold text-slate-800">156</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Contests:</span>
                      <span className="font-bold text-slate-800">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Accuracy:</span>
                      <span className="font-bold text-green-600">98%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className={`podium-card relative backdrop-blur-xl rounded-2xl shadow-xl p-6 text-center transform transition-all duration-500 hover:scale-100 hover:shadow-2xl hover:-translate-y-2 overflow-hidden ${getPodiumCardStyle(3)}`}>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg">
                    3
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-xl ring-4 ring-emerald-100">
                    M
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Mike Rodriguez</h3>
                  <p className="text-slate-600 mb-3 font-medium">Dynamic Programming</p>
                  <div className="text-2xl font-bold text-green-600 mb-2">9.4</div>
                  <div className="text-sm text-slate-500 mb-4 font-medium">points</div>
                  <div className="space-y-2 text-sm bg-white/60 rounded-xl p-3 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Problems:</span>
                      <span className="text-slate-800 font-bold">138</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Contests:</span>
                      <span className="text-slate-800 font-bold">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Accuracy:</span>
                      <span className="text-green-600 font-bold">94%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900">Leaderboard</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleExport}
                      className="glass-btn bg-blue-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-blue-700/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-blue-500/20 flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Export
                    </button>
                    <button
                      onClick={handleRefresh}
                      disabled={isLoading}
                      className="glass-btn bg-green-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-green-700/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-green-500/20 flex items-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <tr>
                      <th className="w-16 px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">Rank</th>
                      <th className="w-96 px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">User</th>
                      <th className="w-20 px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">Score</th>
                      <th className="w-28 px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">Problems Solved</th>
                      <th className="w-24 px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">Contests Won</th>
                      <th className="w-20 px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {leaderboard.map((entry) => (
                      <tr key={entry.id} className="leaderboard-row hover:bg-slate-50/80 transition-all duration-200">
                        <td className="w-16 px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <div className={`w-10 h-10 bg-gradient-to-br ${getRankBadgeColor(entry.rank)} rounded-full flex items-center justify-center shadow-lg`}>
                              <span className="text-sm font-bold text-white">{entry.rank}</span>
                            </div>
                          </div>
                        </td>
                        <td className="w-80 px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-12 h-12 bg-gradient-to-br ${entry.avatarColor} rounded-full flex items-center justify-center mr-4 shadow-lg`}>
                              <span className="text-lg font-bold text-white">{entry.avatar}</span>
                            </div>
                            <div className="pl-8">
                              <div className="text-base font-semibold text-slate-900">{entry.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="w-20 px-8 py-6 whitespace-nowrap text-center">
                          <span className="text-2xl font-bold text-slate-900">{entry.score}</span>
                        </td>
                        <td className="w-28 px-8 py-6 whitespace-nowrap text-center">
                          <span className="text-lg font-semibold text-slate-800">{entry.problemsSolved}</span>
                        </td>
                        <td className="w-24 px-8 py-6 whitespace-nowrap text-center">
                          <span className="text-lg font-semibold text-slate-800">{entry.contestsWon}</span>
                        </td>
                        <td className="w-20 px-8 py-6 whitespace-nowrap text-center">
                          <span className="inline-flex px-3 py-2 text-sm font-bold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                            {entry.accuracy}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of <span className="font-medium">156</span> results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg ${
                            currentPage === page
                              ? 'text-white bg-blue-600 border border-blue-600'
                              : 'text-slate-500 bg-white border border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
