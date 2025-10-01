'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Tag,
  Users,
  Calendar,
  Play,
  BarChart3,
  Award,
  Search,
  Download,
  X
} from 'lucide-react'

interface Contest {
  id: string
  name: string
  description: string
  category: string
  batch: string
  participants: number
  startDate: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
}

interface LeaderboardEntry {
  rank: number
  name: string
  problemsSolved: string
  percentage: string
  score: number
  time: string
}

interface ContestData {
  name: string
  description: string
  participants: number
  yourRank: number
  leaderboard: LeaderboardEntry[]
}

export default function UserContestsPage() {
  const params = useParams()
  const communitySlug = params.communitySlug as string
  const [contests, setContests] = useState<Contest[]>([
    {
      id: '1',
      name: 'Weekly Algorithm Challenge',
      description: 'Weekly competitive programming contest focusing on algorithms and problem-solving skills.',
      category: 'Algorithms',
      batch: '2024-25',
      participants: 156,
      startDate: 'Jan 15, 2025',
      icon: 'A',
      color: 'from-blue-600 to-indigo-600',
      bgColor: 'from-blue-50/80 to-blue-100/60',
      borderColor: 'border-blue-200/30'
    },
    {
      id: '2',
      name: 'SQL Database Master',
      description: 'Advanced contest focusing on database design and SQL optimization.',
      category: 'Database',
      batch: 'Spring 2025',
      participants: 89,
      startDate: 'Jan 22, 2025',
      icon: 'S',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50/80 to-green-100/60',
      borderColor: 'border-green-200/30'
    }
  ])

  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false)
  const [selectedContest, setSelectedContest] = useState<ContestData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardEntry[]>([])

  const contestData: Record<string, ContestData> = {
    'Weekly Algorithm Challenge': {
      name: 'Weekly Algorithm Challenge',
      description: 'Weekly competitive programming contest focusing on algorithms and problem-solving skills.',
      participants: 156,
      yourRank: 3,
      leaderboard: [
        { rank: 1, name: 'Priya Sharma', problemsSolved: '5/5', percentage: '100%', score: 850, time: '2h 15m' },
        { rank: 2, name: 'Rahul Kumar', problemsSolved: '5/5', percentage: '100%', score: 820, time: '2h 45m' },
        { rank: 3, name: 'Munaf', problemsSolved: '3/5', percentage: '60%', score: 780, time: '3h 20m' },
        { rank: 4, name: 'Suresh Kumar', problemsSolved: '2/5', percentage: '40%', score: 650, time: '4h 10m' },
        { rank: 5, name: 'Priya Patel', problemsSolved: '1/5', percentage: '20%', score: 450, time: '5h 30m' },
        { rank: 6, name: 'Amit Singh', problemsSolved: '1/5', percentage: '20%', score: 420, time: '5h 45m' },
        { rank: 7, name: 'Neha Gupta', problemsSolved: '0/5', percentage: '0%', score: 380, time: '6h 20m' },
        { rank: 8, name: 'Vikram Malhotra', problemsSolved: '0/5', percentage: '0%', score: 350, time: '6h 45m' },
        { rank: 9, name: 'Anjali Desai', problemsSolved: '0/5', percentage: '0%', score: 320, time: '7h 10m' },
        { rank: 10, name: 'Rajesh Verma', problemsSolved: '0/5', percentage: '0%', score: 290, time: '7h 35m' },
        { rank: 11, name: 'Meera Iyer', problemsSolved: '0/5', percentage: '0%', score: 260, time: '8h 0m' },
        { rank: 12, name: 'Arjun Reddy', problemsSolved: '0/5', percentage: '0%', score: 230, time: '8h 25m' },
        { rank: 13, name: 'Kavya Nair', problemsSolved: '0/5', percentage: '0%', score: 200, time: '8h 50m' },
        { rank: 14, name: 'Dev Patel', problemsSolved: '0/5', percentage: '0%', score: 170, time: '9h 15m' },
        { rank: 15, name: 'Zara Khan', problemsSolved: '0/5', percentage: '0%', score: 140, time: '9h 40m' },
        { rank: 16, name: 'Rohan Mehta', problemsSolved: '0/5', percentage: '0%', score: 110, time: '10h 5m' },
        { rank: 17, name: 'Ishita Sharma', problemsSolved: '0/5', percentage: '0%', score: 80, time: '10h 30m' },
        { rank: 18, name: 'Aditya Joshi', problemsSolved: '0/5', percentage: '0%', score: 50, time: '10h 55m' },
        { rank: 19, name: 'Tanvi Agarwal', problemsSolved: '0/5', percentage: '0%', score: 20, time: '11h 20m' },
        { rank: 20, name: 'Krishna Rao', problemsSolved: '0/5', percentage: '0%', score: 0, time: '12h 0m' }
      ]
    },
    'SQL Database Master': {
      name: 'SQL Database Master',
      description: 'Advanced contest focusing on database design and SQL optimization.',
      participants: 89,
      yourRank: 1,
      leaderboard: [
        { rank: 1, name: 'Munaf', problemsSolved: '6/8', percentage: '75%', score: 920, time: '1h 55m' },
        { rank: 2, name: 'Suresh Kumar', problemsSolved: '5/8', percentage: '62.5%', score: 850, time: '2h 30m' },
        { rank: 3, name: 'Priya Sharma', problemsSolved: '4/8', percentage: '50%', score: 720, time: '3h 15m' },
        { rank: 4, name: 'Rahul Kumar', problemsSolved: '3/8', percentage: '37.5%', score: 580, time: '4h 20m' },
        { rank: 5, name: 'Priya Patel', problemsSolved: '2/8', percentage: '25%', score: 420, time: '5h 45m' },
        { rank: 6, name: 'Amit Singh', problemsSolved: '2/8', percentage: '25%', score: 400, time: '6h 10m' },
        { rank: 7, name: 'Neha Gupta', problemsSolved: '1/8', percentage: '12.5%', score: 350, time: '6h 35m' },
        { rank: 8, name: 'Vikram Malhotra', problemsSolved: '1/8', percentage: '12.5%', score: 320, time: '7h 0m' },
        { rank: 9, name: 'Anjali Desai', problemsSolved: '0/8', percentage: '0%', score: 280, time: '7h 25m' },
        { rank: 10, name: 'Rajesh Verma', problemsSolved: '0/8', percentage: '0%', score: 240, time: '7h 50m' },
        { rank: 11, name: 'Meera Iyer', problemsSolved: '0/8', percentage: '0%', score: 200, time: '8h 15m' },
        { rank: 12, name: 'Arjun Reddy', problemsSolved: '0/8', percentage: '0%', score: 160, time: '8h 40m' },
        { rank: 13, name: 'Kavya Nair', problemsSolved: '0/8', percentage: '0%', score: 120, time: '9h 5m' },
        { rank: 14, name: 'Dev Patel', problemsSolved: '0/8', percentage: '0%', score: 80, time: '9h 30m' },
        { rank: 15, name: 'Zara Khan', problemsSolved: '0/8', percentage: '0%', score: 40, time: '9h 55m' },
        { rank: 16, name: 'Rohan Mehta', problemsSolved: '0/8', percentage: '0%', score: 0, time: '10h 20m' }
      ]
    }
  }

  const openLeaderboardModal = (contestName: string) => {
    const contest = contestData[contestName]
    if (contest) {
      setSelectedContest(contest)
      setFilteredLeaderboard(contest.leaderboard)
      setSearchTerm('')
      setIsLeaderboardModalOpen(true)
    }
  }

  const closeLeaderboardModal = () => {
    setIsLeaderboardModalOpen(false)
    setSelectedContest(null)
    setSearchTerm('')
    setFilteredLeaderboard([])
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (selectedContest) {
      const filtered = selectedContest.leaderboard.filter(entry =>
        entry.name.toLowerCase().includes(term.toLowerCase())
      )
      setFilteredLeaderboard(filtered)
    }
  }

  const exportLeaderboard = () => {
    // Simple export functionality - could be enhanced with actual CSV export
    alert('Leaderboard export functionality would be implemented here')
  }

  const getRankColor = (rank: number) => {
    return rank <= 3 ? 'bg-amber-500' : 'bg-slate-500'
  }

  const getScoreColor = (rank: number) => {
    return rank <= 3 ? 'text-amber-600' : 'text-slate-600'
  }

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-content">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">My Assigned Contests</h2>
        </div>

        {/* Contests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {contests.map((contest) => (
            <div key={contest.id} className="contest-card bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${contest.color} rounded-lg flex items-center justify-center text-white text-2xl font-bold`}>
                  {contest.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-slate-900">{contest.name}</h2>
                  <div className="text-sm text-slate-500 truncate">{contest.description}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                {/* Category */}
                <div className={`bg-gradient-to-br ${contest.bgColor} backdrop-blur-sm rounded-lg p-3 border ${contest.borderColor}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Category</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-900">{contest.category}</span>
                </div>

                {/* Batch */}
                <div className="bg-gradient-to-br from-yellow-50/80 to-yellow-100/60 backdrop-blur-sm rounded-lg p-3 border border-yellow-200/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs font-medium text-yellow-700 uppercase tracking-wide">Batch</span>
                  </div>
                  <span className="text-sm font-semibold text-yellow-900">{contest.batch}</span>
                </div>

                {/* Participants */}
                <div className="bg-gradient-to-br from-green-50/80 to-green-100/60 backdrop-blur-sm rounded-lg p-3 border border-green-200/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Participants</span>
                  </div>
                  <span className="text-sm font-semibold text-green-900">{contest.participants}</span>
                </div>

                {/* Start Date */}
                <div className="bg-gradient-to-br from-purple-50/80 to-purple-100/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">Start Date</span>
                  </div>
                  <span className="text-sm font-semibold text-purple-900">{contest.startDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <Link
                  href={`/community/${communitySlug}/user/contests/participate`}
                  className="glass-btn bg-blue-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700/90 hover:scale-105 transition-all duration-300 border border-blue-500/30 shadow-lg"
                >
                  <Play className="w-4 h-4" />
                  Participate
                </Link>
                <button
                  onClick={() => openLeaderboardModal(contest.name)}
                  className="glass-btn p-2 rounded-lg border border-slate-200/50 hover:bg-slate-50/80 hover:scale-105 transition-all duration-300 backdrop-blur-sm shadow-md"
                  title="View Leaderboard"
                >
                  <BarChart3 className={`w-5 h-5 ${contest.color.includes('blue') ? 'text-blue-600' : 'text-green-600'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Contest Leaderboard Modal */}
        {isLeaderboardModalOpen && selectedContest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{selectedContest.name} - Leaderboard</h3>
                  <button
                    onClick={closeLeaderboardModal}
                    className="text-white hover:text-blue-100 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Your Performance Highlight */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="w-6 h-6 text-blue-600" />
                      <span className="text-lg font-semibold text-blue-900">Your Performance</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">#{selectedContest.yourRank}</div>
                      <div className="text-sm text-blue-700">Current Rank</div>
                    </div>
                  </div>
                </div>

                {/* Contest Info */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-blue-900">{selectedContest.name}</h4>
                      <p className="text-sm text-blue-700">{selectedContest.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{selectedContest.participants}</div>
                      <div className="text-sm text-blue-700">Participants</div>
                    </div>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search students..."
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Leaderboard Table */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-16">RANK</th>
                        <th className="pl-4 pr-2 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-48">STUDENT</th>
                        <th className="pl-1 pr-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">PROBLEMS SOLVED</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-24">SCORE</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-24">TIME</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {filteredLeaderboard.map((entry, index) => {
                        const isCurrentUser = entry.name === 'Munaf'
                        const rowClass = isCurrentUser 
                          ? 'bg-blue-50 border-2 border-blue-200' 
                          : index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                        
                        return (
                          <tr key={entry.rank} className={rowClass}>
                            <td className="px-4 py-4 whitespace-nowrap w-16">
                              <div className={`w-8 h-8 ${getRankColor(entry.rank)} rounded-full flex items-center justify-center text-white font-bold`}>
                                {entry.rank}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap w-48">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {entry.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-slate-900">{entry.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap w-32">
                              <div className="text-sm font-medium text-slate-900">{entry.problemsSolved}</div>
                              <div className="text-xs text-slate-500">{entry.percentage}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap w-24">
                              <div className={`text-sm font-bold ${getScoreColor(entry.rank)}`}>
                                {entry.score}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap w-24">
                              <div className="text-xs text-slate-500">{entry.time}</div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={closeLeaderboardModal}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={exportLeaderboard}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}