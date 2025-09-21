'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Award,
  Crown,
  Star,
  FileSpreadsheet,
  RefreshCw,
  BarChart3,
  LayoutDashboard,
  Trophy,
  MessageCircle,
  User
} from 'lucide-react'

interface LeaderboardEntry {
  id: string
  rank: number
  name: string
  username: string
  avatar: string
  score: number
  problemsSolved: number
  contestsWon: number
  accuracy: number
  specialty: string
}

interface Stats {
  topPerformers: number
  activeRankings: number
  averageScore: number
}

export default function MentorLeaderboardPage() {
  const [stats, setStats] = useState<Stats>({
    topPerformers: 24,
    activeRankings: 156,
    averageScore: 8.9
  })

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    {
      id: '1',
      rank: 1,
      name: 'Alex Johnson',
      username: '@alex_j',
      avatar: 'A',
      score: 9.8,
      problemsSolved: 156,
      contestsWon: 12,
      accuracy: 98,
      specialty: 'Algorithms Master'
    },
    {
      id: '2',
      rank: 2,
      name: 'Sarah Chen',
      username: '@sarah_c',
      avatar: 'S',
      score: 9.6,
      problemsSolved: 142,
      contestsWon: 10,
      accuracy: 96,
      specialty: 'Data Structures Expert'
    },
    {
      id: '3',
      rank: 3,
      name: 'Mike Rodriguez',
      username: '@mike_r',
      avatar: 'M',
      score: 9.4,
      problemsSolved: 138,
      contestsWon: 8,
      accuracy: 94,
      specialty: 'Dynamic Programming'
    },
    {
      id: '4',
      rank: 4,
      name: 'Emma Wilson',
      username: '@emma_w',
      avatar: 'E',
      score: 9.2,
      problemsSolved: 125,
      contestsWon: 7,
      accuracy: 92,
      specialty: 'Graph Algorithms'
    },
    {
      id: '5',
      rank: 5,
      name: 'David Kim',
      username: '@david_k',
      avatar: 'D',
      score: 9.0,
      problemsSolved: 118,
      contestsWon: 6,
      accuracy: 90,
      specialty: 'Competitive Programming'
    }
  ])

  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const itemsPerPage = 10

  const getAvatarColor = (avatar: string) => {
    const colors = {
      A: 'from-blue-400 to-indigo-500',
      S: 'from-green-400 to-emerald-500',
      M: 'from-purple-400 to-pink-500',
      E: 'from-red-400 to-pink-500',
      D: 'from-indigo-400 to-purple-500'
    }
    return colors[avatar as keyof typeof colors] || 'from-gray-400 to-gray-500'
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-amber-500'
    if (rank === 2) return 'from-slate-400 to-slate-500'
    if (rank === 3) return 'from-amber-500 to-orange-500'
    return 'from-slate-400 to-slate-500'
  }

  const getPodiumColor = (rank: number) => {
    if (rank === 1) return 'from-amber-50 to-orange-50 border-amber-300'
    if (rank === 2) return 'from-slate-50 to-slate-100 border-slate-200'
    if (rank === 3) return 'from-emerald-50 to-green-100 border-emerald-200'
    return 'from-slate-50 to-slate-100 border-slate-200'
  }

  const getPodiumRankColor = (rank: number) => {
    if (rank === 1) return 'from-amber-400 to-orange-600'
    if (rank === 2) return 'from-slate-400 to-slate-600'
    if (rank === 3) return 'from-emerald-500 to-green-600'
    return 'from-slate-400 to-slate-600'
  }

  const getPodiumAvatarColor = (rank: number) => {
    if (rank === 1) return 'from-amber-400 via-orange-500 to-red-500'
    if (rank === 2) return 'from-blue-400 via-blue-500 to-indigo-600'
    if (rank === 3) return 'from-emerald-400 via-green-500 to-teal-600'
    return 'from-gray-400 to-gray-500'
  }

  const handleExport = () => {
    // Simulate export functionality
    console.log('Exporting leaderboard data...')
    alert('Leaderboard data exported successfully!')
  }

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      alert('Leaderboard refreshed successfully!')
    }, 1000)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const totalPages = Math.ceil(leaderboard.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEntries = leaderboard.slice(startIndex, endIndex)

  const topThree = leaderboard.slice(0, 3)

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-content">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-700">Student Leaderboard Management</h1>
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
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-orange-600" />
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
                <p className="text-2xl font-bold text-slate-900">{stats.averageScore}</p>
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
              <div className={`podium-card relative bg-gradient-to-br ${getPodiumColor(2)} backdrop-blur-xl rounded-2xl shadow-xl p-6 text-center transform scale-95 transition-all duration-500 hover:scale-100 hover:shadow-2xl hover:-translate-y-2 border overflow-hidden`}>
                <div className="relative">
                  <div className={`w-16 h-16 bg-gradient-to-br ${getPodiumRankColor(2)} rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg`}>
                    2
                  </div>
                  <div className={`w-20 h-20 bg-gradient-to-br ${getPodiumAvatarColor(2)} rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-xl ring-4 ring-blue-100`}>
                    {topThree[1]?.avatar}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{topThree[1]?.name}</h3>
                  <p className="text-slate-600 mb-3 font-medium">{topThree[1]?.specialty}</p>
                  <div className="text-2xl font-bold text-blue-600 mb-2">{topThree[1]?.score}</div>
                  <div className="text-sm text-slate-500 mb-4 font-medium">points</div>
                  <div className="space-y-2 text-sm bg-white/60 rounded-xl p-3 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Problems:</span>
                      <span className="font-bold text-slate-800">{topThree[1]?.problemsSolved}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Contests:</span>
                      <span className="font-bold text-slate-800">{topThree[1]?.contestsWon}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Accuracy:</span>
                      <span className="font-bold text-green-600">{topThree[1]?.accuracy}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1st Place */}
              <div className={`podium-card relative bg-gradient-to-br ${getPodiumColor(1)} backdrop-blur-xl rounded-2xl shadow-2xl p-6 text-center transform scale-105 transition-all duration-500 hover:scale-110 hover:shadow-3xl hover:-translate-y-3 border-2 overflow-hidden order-first md:order-none`}>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full opacity-20"></div>
                <div className="relative">
                  <div className={`w-16 h-16 bg-gradient-to-br ${getPodiumRankColor(1)} rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg`}>
                    1
                  </div>
                  <div className={`w-24 h-24 bg-gradient-to-br ${getPodiumAvatarColor(1)} rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-xl ring-4 ring-amber-100`}>
                    {topThree[0]?.avatar}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{topThree[0]?.name}</h3>
                  <p className="text-slate-600 mb-3 font-medium">{topThree[0]?.specialty}</p>
                  <div className="text-3xl font-bold text-amber-600 mb-2">{topThree[0]?.score}</div>
                  <div className="text-sm text-slate-500 mb-4 font-medium">points</div>
                  <div className="space-y-2 text-sm bg-white/70 rounded-xl p-3 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Problems:</span>
                      <span className="font-bold text-slate-800">{topThree[0]?.problemsSolved}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Contests:</span>
                      <span className="font-bold text-slate-800">{topThree[0]?.contestsWon}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Accuracy:</span>
                      <span className="font-bold text-green-600">{topThree[0]?.accuracy}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className={`podium-card relative bg-gradient-to-br ${getPodiumColor(3)} backdrop-blur-xl rounded-2xl shadow-xl p-6 text-center transform scale-95 transition-all duration-500 hover:scale-100 hover:shadow-2xl hover:-translate-y-2 border overflow-hidden`}>
                <div className="relative">
                  <div className={`w-16 h-16 bg-gradient-to-br ${getPodiumRankColor(3)} rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg`}>
                    3
                  </div>
                  <div className={`w-20 h-20 bg-gradient-to-br ${getPodiumAvatarColor(3)} rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-xl ring-4 ring-emerald-100`}>
                    {topThree[2]?.avatar}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{topThree[2]?.name}</h3>
                  <p className="text-slate-600 mb-3 font-medium">{topThree[2]?.specialty}</p>
                  <div className="text-2xl font-bold text-green-600 mb-2">{topThree[2]?.score}</div>
                  <div className="text-sm text-slate-500 mb-4 font-medium">points</div>
                  <div className="space-y-2 text-sm bg-white/60 rounded-xl p-3 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Problems:</span>
                      <span className="text-slate-800 font-bold">{topThree[2]?.problemsSolved}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Contests:</span>
                      <span className="text-slate-800 font-bold">{topThree[2]?.contestsWon}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Accuracy:</span>
                      <span className="text-green-600 font-bold">{topThree[2]?.accuracy}%</span>
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
                      className="glass-btn bg-orange-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-orange-700/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-orange-500/20 flex items-center gap-2"
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
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">Problems Solved</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">Contests Won</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">Accuracy</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {currentEntries.map((entry) => (
                      <tr key={entry.id} className="leaderboard-row hover:bg-slate-50/80 transition-all duration-200">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <div className={`w-10 h-10 bg-gradient-to-br ${getRankColor(entry.rank)} rounded-full flex items-center justify-center shadow-lg`}>
                              <span className="text-sm font-bold text-white">{entry.rank}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(entry.avatar)} rounded-full flex items-center justify-center mr-4 shadow-lg`}>
                              <span className="text-lg font-bold text-white">{entry.avatar}</span>
                            </div>
                            <div>
                              <div className="text-base font-semibold text-slate-900">{entry.name}</div>
                              <div className="text-sm text-slate-500">{entry.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-center">
                          <span className="text-2xl font-bold text-slate-900">{entry.score}</span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-center">
                          <span className="text-lg font-semibold text-slate-800">{entry.problemsSolved}</span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-center">
                          <span className="text-lg font-semibold text-slate-800">{entry.contestsWon}</span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-center">
                          <span className="inline-flex px-3 py-2 text-sm font-bold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                            {entry.accuracy}%
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-center">
                          <button className="action-button bg-orange-50 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-100 transition-all duration-200 text-sm font-medium border border-orange-200">
                            View Profile
                          </button>
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
                    Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, leaderboard.length)}</span> of <span className="font-medium">{leaderboard.length}</span> results
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          page === currentPage
                            ? 'text-white bg-orange-600 border border-orange-600'
                            : 'text-slate-500 bg-white border border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
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
