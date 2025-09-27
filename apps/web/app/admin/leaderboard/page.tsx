'use client'

import { useState } from 'react'
import { 
  Award, 
  Crown, 
  Star, 
  FileSpreadsheet, 
  RefreshCw, 
  MoreVertical,
  X,
  Shield,
  Users,
  Trophy,
  BarChart3,
  GraduationCap,
  LayoutDashboard
} from 'lucide-react'
import Link from 'next/link'

export default function AdminLeaderboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const topPerformers = [
    {
      rank: 1,
      name: 'Alex Johnson',
      username: '@alex_j',
      specialization: 'Algorithms Master',
      score: 9.8,
      problems: 156,
      contests: 12,
      accuracy: 98,
      avatar: 'A',
      color: 'from-amber-400 via-orange-500 to-red-500',
      ringColor: 'ring-amber-100',
      bgColor: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-300',
      textColor: 'text-amber-600',
      scale: 'scale-105'
    },
    {
      rank: 2,
      name: 'Sarah Chen',
      username: '@sarah_c',
      specialization: 'Data Structures Expert',
      score: 9.6,
      problems: 142,
      contests: 10,
      accuracy: 96,
      avatar: 'S',
      color: 'from-blue-400 via-blue-500 to-indigo-600',
      ringColor: 'ring-blue-100',
      bgColor: 'from-slate-50 to-slate-100',
      borderColor: 'border-slate-200/50',
      textColor: 'text-blue-600',
      scale: 'scale-95'
    },
    {
      rank: 3,
      name: 'Mike Rodriguez',
      username: '@mike_r',
      specialization: 'Dynamic Programming',
      score: 9.4,
      problems: 138,
      contests: 8,
      accuracy: 94,
      avatar: 'M',
      color: 'from-emerald-400 via-green-500 to-teal-600',
      ringColor: 'ring-emerald-100',
      bgColor: 'from-emerald-50 to-green-100',
      borderColor: 'border-emerald-200/50',
      textColor: 'text-green-600',
      scale: 'scale-95'
    }
  ]

  const leaderboardData = [
    {
      rank: 1,
      name: 'Alex Johnson',
      username: '@alex_j',
      score: 9.8,
      problems: 156,
      contests: 12,
      accuracy: 98,
      avatar: 'A',
      avatarColor: 'from-blue-400 to-indigo-500',
      rankColor: 'from-yellow-400 to-amber-500'
    },
    {
      rank: 2,
      name: 'Sarah Chen',
      username: '@sarah_c',
      score: 9.6,
      problems: 142,
      contests: 10,
      accuracy: 96,
      avatar: 'S',
      avatarColor: 'from-green-400 to-emerald-500',
      rankColor: 'from-slate-400 to-slate-500'
    },
    {
      rank: 3,
      name: 'Mike Rodriguez',
      username: '@mike_r',
      score: 9.4,
      problems: 138,
      contests: 8,
      accuracy: 94,
      avatar: 'M',
      avatarColor: 'from-purple-400 to-pink-500',
      rankColor: 'from-amber-500 to-orange-500'
    }
  ]

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                PW IOI
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/admin/dashboard" className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/admin/users" className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                <Users className="w-4 h-4" />
                Students
              </Link>
              <Link href="/admin/mentors" className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                <GraduationCap className="w-4 h-4" />
                Mentors
              </Link>
              <Link href="/admin/contests" className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                <Trophy className="w-4 h-4" />
                Contests
              </Link>
              <Link href="/admin/analytics" className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
              <Link href="/admin/leaderboard" className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 shadow-sm">
                <Award className="w-4 h-4" />
                Leaderboard
              </Link>
              <Link href="/admin/profile" className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" alt="Profile" className="w-8 h-8 rounded-full object-cover shadow-lg border-2 border-white" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-slate-200"
        >
          <MoreVertical className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-0 z-40 bg-white shadow-2xl transform transition-transform duration-200 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Admin Navigation</h3>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <nav className="space-y-3">
            <Link href="/admin/dashboard" className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/admin/users" className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
              <Users className="w-4 h-4" />
              Students
            </Link>
            <Link href="/admin/mentors" className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
              <GraduationCap className="w-4 h-4" />
              Mentors
            </Link>
            <Link href="/admin/contests" className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
              <Trophy className="w-4 h-4" />
              Contests
            </Link>
            <Link href="/admin/analytics" className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
            <Link href="/admin/leaderboard" className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200 transition-all flex items-center gap-3">
              <Award className="w-4 h-4" />
              Leaderboard
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-content">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-700">Leaderboard Management</h1>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="stat-card bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Top Performers</p>
                <p className="text-2xl font-bold text-slate-900">156</p>
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
                <p className="text-2xl font-bold text-slate-900">2,847</p>
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
                <p className="text-2xl font-bold text-slate-900">8.7</p>
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
              {topPerformers.map((performer, index) => (
                <div 
                  key={performer.rank}
                  className={`podium-card relative bg-gradient-to-br ${performer.bgColor} backdrop-blur-xl rounded-2xl shadow-xl p-6 text-center transform ${performer.scale} transition-all duration-500 hover:scale-100 hover:shadow-2xl hover:-translate-y-2 border ${performer.borderColor} overflow-hidden ${
                    index === 0 ? 'order-first md:order-none' : ''
                  }`}
                >
                  {index === 0 && (
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full opacity-20"></div>
                  )}
                  <div className="relative">
                    <div className={`w-16 h-16 bg-gradient-to-br ${
                      index === 0 ? 'from-amber-400 to-orange-600' :
                      index === 1 ? 'from-slate-400 to-slate-600' :
                      'from-emerald-500 to-green-600'
                    } rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg`}>
                      {performer.rank}
                    </div>
                    <div className={`w-20 h-20 bg-gradient-to-br ${performer.color} rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-xl ring-4 ${performer.ringColor} ${
                      index === 0 ? 'w-24 h-24 text-2xl' : ''
                    }`}>
                      {performer.avatar}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{performer.name}</h3>
                    <p className="text-slate-600 mb-3 font-medium">{performer.specialization}</p>
                    <div className={`text-2xl font-bold ${performer.textColor} mb-2 ${
                      index === 0 ? 'text-3xl' : ''
                    }`}>
                      {performer.score}
                    </div>
                    <div className="text-sm text-slate-500 mb-4 font-medium">points</div>
                    <div className="space-y-2 text-sm bg-white/60 rounded-xl p-3 backdrop-blur-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Problems:</span>
                        <span className="font-bold text-slate-800">{performer.problems}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Contests:</span>
                        <span className="font-bold text-slate-800">{performer.contests}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Accuracy:</span>
                        <span className="font-bold text-green-600">{performer.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900">Leaderboard</h3>
                  <div className="flex gap-2">
                    <button className="glass-btn bg-blue-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-blue-700/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-blue-500/20">
                      <FileSpreadsheet className="w-4 h-4 inline mr-2" />
                      Export
                    </button>
                    <button className="glass-btn bg-green-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-green-700/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-green-500/20">
                      <RefreshCw className="w-4 h-4 inline mr-2" />
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
                    {leaderboardData.map((user) => (
                      <tr key={user.rank} className="leaderboard-row hover:bg-slate-50/80 transition-all duration-200">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <div className={`w-10 h-10 bg-gradient-to-br ${user.rankColor} rounded-full flex items-center justify-center shadow-lg`}>
                              <span className="text-sm font-bold text-white">{user.rank}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-12 h-12 bg-gradient-to-br ${user.avatarColor} rounded-full flex items-center justify-center mr-4 shadow-lg`}>
                              <span className="text-lg font-bold text-white">{user.avatar}</span>
                            </div>
                            <div>
                              <div className="text-base font-semibold text-slate-900">{user.name}</div>
                              <div className="text-sm text-slate-500">{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-center">
                          <span className="text-2xl font-bold text-slate-900">{user.score}</span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-center">
                          <span className="text-lg font-semibold text-slate-800">{user.problems}</span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-center">
                          <span className="text-lg font-semibold text-slate-800">{user.contests}</span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-center">
                          <span className="inline-flex px-3 py-2 text-sm font-bold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                            {user.accuracy}%
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-center">
                          <button className="action-button bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium border border-blue-200">
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
                    Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of <span className="font-medium">156</span> results
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                      Previous
                    </button>
                    <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg">
                      1
                    </button>
                    <button className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                      2
                    </button>
                    <button className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                      3
                    </button>
                    <button className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
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