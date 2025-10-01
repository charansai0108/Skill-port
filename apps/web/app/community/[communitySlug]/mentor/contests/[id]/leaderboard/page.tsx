'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Trophy,
  BarChart3,
  X,
  Check,
  MessageCircle,
  Flag,
  FileCode2,
  GraduationCap,
  LayoutDashboard,
  MessageCircle as FeedbackIcon
} from 'lucide-react'

interface LeaderboardEntry {
  id: number
  rank: number
  name: string
  username: string
  avatar: string
  problemsSolved: string
  flagged: number
  flaggedColor: string
  successRate: string
  score: number
  status: string
  statusColor: string
}

interface UserProblem {
  id: number
  title: string
  platform: string
  topic: string
  status: string
  flagged: boolean
  color: string
}

interface FlaggedQuestion {
  id: number
  name: string
  problemNo: number
  topic: string
  submitted: string
  code: string
}

export default function MentorContestLeaderboardPage() {
  const params = useParams()
  const communitySlug = params.communitySlug as string
  const contestId = params.id as string

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    {
      id: 1,
      rank: 1,
      name: 'Alex Smith',
      username: '@alexsmith',
      avatar: 'AS',
      problemsSolved: '11/12',
      flagged: 2,
      flaggedColor: 'red',
      successRate: '91.7%',
      score: 1180,
      status: 'Active',
      statusColor: 'green'
    },
    {
      id: 2,
      rank: 2,
      name: 'Maria Johnson',
      username: '@mariajohnson',
      avatar: 'MJ',
      problemsSolved: '10/12',
      flagged: 1,
      flaggedColor: 'orange',
      successRate: '83.3%',
      score: 1145,
      status: 'Active',
      statusColor: 'green'
    },
    {
      id: 3,
      rank: 3,
      name: 'Robert Kim',
      username: '@robertkim',
      avatar: 'RK',
      problemsSolved: '10/12',
      flagged: 0,
      flaggedColor: 'green',
      successRate: '83.3%',
      score: 1120,
      status: 'Active',
      statusColor: 'green'
    },
    {
      id: 4,
      rank: 4,
      name: 'Sarah Lee',
      username: '@sarahlee',
      avatar: 'SL',
      problemsSolved: '8/12',
      flagged: 0,
      flaggedColor: 'green',
      successRate: '66.7%',
      score: 950,
      status: 'Inactive',
      statusColor: 'slate'
    }
  ])

  const [userProblems, setUserProblems] = useState<UserProblem[]>([
    {
      id: 1,
      title: 'Two Sum',
      platform: 'LeetCode',
      topic: 'Arrays',
      status: 'Solved',
      flagged: true,
      color: 'orange'
    },
    {
      id: 2,
      title: 'Reverse Linked List',
      platform: 'Codeforces',
      topic: 'Linked List',
      status: 'Solved',
      flagged: false,
      color: 'blue'
    },
    {
      id: 3,
      title: 'Binary Tree Traversal',
      platform: 'HackerRank',
      topic: 'Trees',
      status: 'Solved',
      flagged: false,
      color: 'green'
    }
  ])

  const [isUserProblemsModalOpen, setIsUserProblemsModalOpen] = useState(false)
  const [isFlaggedSummaryModalOpen, setIsFlaggedSummaryModalOpen] = useState(false)
  const [isFlaggedDetailModalOpen, setIsFlaggedDetailModalOpen] = useState(false)
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedQuestion, setSelectedQuestion] = useState<FlaggedQuestion | null>(null)
  const [codeModalData, setCodeModalData] = useState({ userName: '', problem: '', code: '' })

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-amber-500'
    if (rank === 2) return 'bg-gradient-to-br from-slate-400 to-gray-500'
    if (rank === 3) return 'bg-orange-600'
    return 'bg-slate-600'
  }

  const getRowColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 hover:bg-yellow-100'
    if (rank === 2) return 'bg-gradient-to-r from-slate-50 to-gray-50 hover:bg-slate-100'
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 hover:bg-orange-100'
    return 'hover:bg-slate-50'
  }

  const getFlaggedColor = (color: string) => {
    const colors = {
      red: 'bg-red-100 text-red-700',
      orange: 'bg-orange-100 text-orange-700',
      green: 'bg-green-100 text-green-700'
    }
    return colors[color as keyof typeof colors] || colors.red
  }

  const getStatusColor = (color: string) => {
    const colors = {
      green: 'bg-green-100 text-green-700',
      slate: 'bg-slate-100 text-slate-700'
    }
    return colors[color as keyof typeof colors] || colors.green
  }

  const getProblemColor = (color: string) => {
    const colors = {
      orange: 'from-orange-50 to-amber-50 border-orange-200',
      blue: 'from-blue-50 to-indigo-50 border-blue-200',
      green: 'from-green-50 to-emerald-50 border-green-200'
    }
    return colors[color as keyof typeof colors] || colors.orange
  }

  const showUserProblemsModal = (userName: string) => {
    setSelectedUser(userName)
    setIsUserProblemsModalOpen(true)
  }

  const showFlaggedModal = (userName: string) => {
    setSelectedUser(userName)
    setIsFlaggedSummaryModalOpen(true)
  }

  const openFlaggedDetailModal = (questionId: number) => {
    const questionData = getQuestionData(questionId)
    setSelectedQuestion(questionData)
    setIsFlaggedSummaryModalOpen(false)
    setTimeout(() => {
      setIsFlaggedDetailModalOpen(true)
    }, 200)
  }

  const showCodeModal = (userName: string, problemTitle: string, code: string) => {
    setCodeModalData({ userName, problem: problemTitle, code })
    setIsCodeModalOpen(true)
  }

  const getQuestionData = (questionId: number): FlaggedQuestion => {
    const questions = {
      1: {
        id: 1,
        name: 'Reverse Linked List',
        problemNo: 2,
        topic: 'Linked List',
        submitted: '2 hours ago',
        code: `function reverseList(head) {
    let prev = null;
    let current = head;
    
    while (current !== null) {
        let next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }
    
    return prev;
}`
      },
      2: {
        id: 2,
        name: 'Two Sum',
        problemNo: 1,
        topic: 'Arrays',
        submitted: '1 hour ago',
        code: `function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    
    return [];
}`
      }
    }
    return questions[questionId as keyof typeof questions] || questions[1]
  }

  return (
    <div>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-content">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Weekly Algorithm Challenge - Leaderboard</h1>
              <p className="text-lg text-slate-600">Track your students&apos; progress and manage contest performance.</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">156</div>
              <div className="text-sm text-slate-600">Participants</div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden dashboard-card">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Problems Solved</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Flagged</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Success Rate</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Score</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {leaderboard.map((entry) => (
                    <tr key={entry.id} className={`${getRowColor(entry.rank)} table-row-hover`}>
                      <td className="px-6 py-4">
                        <div className={`w-8 h-8 ${getRankColor(entry.rank)} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                          {entry.rank}
                        </div>
                      </td>
                      <td className="px-6 py-4 cursor-pointer" onClick={() => showUserProblemsModal(entry.name)}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {entry.avatar}
                          </div>
                          <div className="font-semibold text-slate-900">{entry.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{entry.problemsSolved}</td>
                      <td className="px-6 py-4">
                        <span 
                          className={`${getFlaggedColor(entry.flaggedColor)} px-2 py-1 rounded text-xs cursor-pointer`}
                          onClick={() => showFlaggedModal(entry.name)}
                        >
                          {entry.flagged}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-green-700 font-semibold">{entry.successRate}</td>
                      <td className="px-6 py-4 font-bold text-amber-600">{entry.score}</td>
                      <td className="px-6 py-4">
                        <span className={`${getStatusColor(entry.statusColor)} px-2 py-1 rounded text-sm`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* User Problems Modal */}
        {isUserProblemsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center modal-bg">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative">
              <button 
                onClick={() => setIsUserProblemsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedUser.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">User Problems</h3>
                    <p className="text-slate-600">
                      <span className="font-semibold text-orange-600">{selectedUser}</span> - All problems in this contest
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {userProblems.map((problem) => (
                  <div key={problem.id} className={`bg-gradient-to-r ${getProblemColor(problem.color)} rounded-lg p-4 border`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {problem.status}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900">{problem.title}</div>
                          <div className="text-sm text-slate-600">{problem.platform} • {problem.topic}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${problem.flagged ? 'text-red-600' : 'text-green-600'}`}>
                        {problem.flagged ? 'Flagged' : 'Clean'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Flagged Summary Modal */}
        {isFlaggedSummaryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center modal-bg">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full relative">
              <button 
                onClick={() => setIsFlaggedSummaryModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    <Flag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Flagged Questions Summary</h3>
                    <p className="text-slate-600">Review flagged problems for <span className="font-semibold text-orange-600">{selectedUser}</span></p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">2</div>
                    <div className="text-slate-600">Total Flagged Questions</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-slate-900 mb-3">Flagged Questions:</h4>
                
                <div 
                  className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200 hover:bg-orange-100 cursor-pointer transition-colors" 
                  onClick={() => openFlaggedDetailModal(1)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">#1</span>
                      <div>
                        <div className="font-semibold text-slate-900">Reverse Linked List</div>
                        <div className="text-sm text-slate-600">Problem 2 • Linked List</div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">2 hours ago</div>
                  </div>
                </div>
                
                <div 
                  className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200 hover:bg-orange-100 cursor-pointer transition-colors" 
                  onClick={() => openFlaggedDetailModal(2)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">#2</span>
                      <div>
                        <div className="font-semibold text-slate-900">Two Sum</div>
                        <div className="text-sm text-slate-600">Problem 1 • Arrays</div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">1 hour ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flagged Detail Modal */}
        {isFlaggedDetailModalOpen && selectedQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center modal-bg">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full relative">
              <button 
                onClick={() => setIsFlaggedDetailModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    <Flag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Flagged Question Details</h3>
                    <p className="text-slate-600">Reviewing <span className="font-semibold text-orange-600">{selectedQuestion.name}</span> for <span className="font-semibold text-orange-600">{selectedUser}</span></p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">Flagged #1</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-600">Problem {selectedQuestion.problemNo}</span>
                    </div>
                    <div className="text-sm text-slate-500">Submitted {selectedQuestion.submitted}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{selectedQuestion.problemNo}</div>
                      <div className="text-sm text-slate-600">Problem No</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-slate-900">{selectedQuestion.name}</div>
                      <div className="text-sm text-slate-600">Problem Name</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-700">{selectedQuestion.topic}</div>
                      <div className="text-sm text-slate-600">Topic</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Submitted Code:</label>
                    <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm font-mono">{selectedQuestion.code}</pre>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                      <Check className="w-4 h-4 inline mr-2" />
                      Approve
                    </button>
                    <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                      <X className="w-4 h-4 inline mr-2" />
                      Reject
                    </button>
                    <button className="flex-1 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                      <MessageCircle className="w-4 h-4 inline mr-2" />
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code Modal */}
        {isCodeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center modal-bg">
            <div className="bg-white rounded-xl shadow-2xl p-0 max-w-lg w-full relative overflow-hidden">
              <div className="bg-gradient-to-r from-orange-700 to-amber-700 p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  <FileCode2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <FileCode2 className="w-5 h-5" />
                    User Code - <span className="ml-1">{codeModalData.userName}</span>
                  </h3>
                  <div className="text-sm text-orange-100">Problem: {codeModalData.problem}</div>
                </div>
                <button 
                  onClick={() => setIsCodeModalOpen(false)}
                  className="ml-auto text-white hover:text-orange-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <pre className="bg-slate-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto">
                  {codeModalData.code}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
