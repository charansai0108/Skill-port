'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle,
  Clock,
  Circle,
  Code,
  Trophy,
  Award,
  MessageSquare,
  User,
  BookOpen
} from 'lucide-react'

interface Problem {
  id: string
  name: string
  difficulty: string
  points: number
  status: 'solved' | 'attempted' | 'not-started'
  pointsEarned: number
  icon: React.ComponentType<{ className?: string }>
  bgColor: string
  textColor: string
  borderColor: string
}

interface Submission {
  id: string
  problemName: string
  status: 'accepted' | 'attempted'
  timeAgo: string
  icon: React.ComponentType<{ className?: string }>
  bgColor: string
  textColor: string
  borderColor: string
}

interface ContestStats {
  totalProblems: number
  solved: number
  attempted: number
  points: number
}

export default function ContestParticipationPage() {
  const [contestStats, setContestStats] = useState<ContestStats>({
    totalProblems: 5,
    solved: 3,
    attempted: 1,
    points: 780
  })

  const [problems, setProblems] = useState<Problem[]>([
    {
      id: '1',
      name: 'Two Sum',
      difficulty: 'Easy',
      points: 100,
      status: 'solved',
      pointsEarned: 100,
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      id: '2',
      name: 'Reverse Linked List',
      difficulty: 'Medium',
      points: 200,
      status: 'solved',
      pointsEarned: 200,
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      id: '3',
      name: 'Binary Tree Traversal',
      difficulty: 'Medium',
      points: 200,
      status: 'solved',
      pointsEarned: 200,
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      id: '4',
      name: 'Dynamic Programming',
      difficulty: 'Hard',
      points: 300,
      status: 'attempted',
      pointsEarned: 0,
      icon: Clock,
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    },
    {
      id: '5',
      name: 'Graph Algorithms',
      difficulty: 'Hard',
      points: 300,
      status: 'not-started',
      pointsEarned: 0,
      icon: Circle,
      bgColor: 'bg-slate-100',
      textColor: 'text-slate-600',
      borderColor: 'border-slate-200'
    }
  ])

  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([
    {
      id: '1',
      problemName: 'Two Sum',
      status: 'accepted',
      timeAgo: '2h ago',
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      id: '2',
      problemName: 'Reverse Linked List',
      status: 'accepted',
      timeAgo: '4h ago',
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      id: '3',
      problemName: 'Binary Tree Traversal',
      status: 'accepted',
      timeAgo: '6h ago',
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      id: '4',
      problemName: 'Dynamic Programming',
      status: 'attempted',
      timeAgo: '1d ago',
      icon: Clock,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    }
  ])

  const solveProblem = (problemName: string) => {
    // You can customize this to redirect to different platforms
    const platform = 'leetcode' as 'leetcode' | 'hackerrank' | 'codeforces' // Options: 'leetcode', 'hackerrank', 'codeforces', etc.
    
    let redirectUrl = ''
    
    switch(platform) {
      case 'leetcode':
        // Convert problem name to LeetCode URL format
        const leetcodeSlug = problemName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        redirectUrl = `https://leetcode.com/problems/${leetcodeSlug}/`
        break
      case 'hackerrank':
        redirectUrl = `https://www.hackerrank.com/challenges/${problemName.toLowerCase().replace(/\s+/g, '-')}`
        break
      case 'codeforces':
        redirectUrl = `https://codeforces.com/problemset/problem/${problemName}`
        break
      default:
        // Default to a custom coding platform
        redirectUrl = `https://your-coding-platform.com/problems/${encodeURIComponent(problemName)}`
    }
    
    // Open in new tab
    window.open(redirectUrl, '_blank')
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'solved': return 'Solved'
      case 'attempted': return 'Attempted'
      case 'not-started': return 'Not Started'
      default: return 'Unknown'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solved': return 'text-green-600'
      case 'attempted': return 'text-orange-600'
      case 'not-started': return 'text-slate-600'
      default: return 'text-slate-600'
    }
  }

  const getButtonText = (status: string) => {
    switch (status) {
      case 'solved': return 'Solve Again'
      case 'attempted': return 'Continue'
      case 'not-started': return 'Solve'
      default: return 'Solve'
    }
  }

  const getButtonColor = (status: string) => {
    switch (status) {
      case 'solved': return 'bg-blue-600 hover:bg-blue-700'
      case 'attempted': return 'bg-orange-600 hover:bg-orange-700'
      case 'not-started': return 'bg-green-600 hover:bg-green-700'
      default: return 'bg-green-600 hover:bg-green-700'
    }
  }

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-content">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Contest #1</h1>
          <p className="text-slate-600">Data Structures and Algorithms Challenge</p>
        </div>
        
        {/* Contest Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{contestStats.totalProblems}</div>
              <div className="text-sm text-slate-600">Total Problems</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{contestStats.solved}</div>
              <div className="text-sm text-slate-600">Solved</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{contestStats.attempted}</div>
              <div className="text-sm text-slate-600">Attempted</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{contestStats.points}</div>
              <div className="text-sm text-slate-600">Points</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Problems List - Left Side (75%) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Problems</h2>
              
              <div className="space-y-4">
                {problems.map((problem) => {
                  const Icon = problem.icon
                  return (
                    <div key={problem.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${problem.bgColor} rounded-full flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${problem.textColor}`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{problem.name}</h3>
                            <p className="text-slate-600">{problem.difficulty} • {problem.points} points</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm text-slate-500">{getStatusText(problem.status)}</div>
                            <div className={`text-sm font-medium ${getStatusColor(problem.status)}`}>
                              {problem.pointsEarned > 0 ? `+${problem.pointsEarned} pts` : '0 pts'}
                            </div>
                          </div>
                          <button
                            onClick={() => solveProblem(problem.name)}
                            className={`${getButtonColor(problem.status)} text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2`}
                          >
                            <Code className="w-4 h-4" />
                            {getButtonText(problem.status)}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recent Submissions - Right Side (25%) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Submissions</h2>
              
              <div className="space-y-3">
                {recentSubmissions.map((submission) => {
                  const Icon = submission.icon
                  return (
                    <div key={submission.id} className={`flex items-center gap-3 p-3 ${submission.bgColor} rounded-lg border ${submission.borderColor}`}>
                      <div className={`w-8 h-8 ${submission.bgColor.replace('50', '100')} rounded-full flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${submission.textColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-semibold ${submission.textColor.replace('600', '900')}`}>
                          {submission.problemName}
                        </div>
                        <div className={`text-xs ${submission.textColor}`}>
                          {submission.status === 'accepted' ? 'Accepted' : 'Attempted'} • {submission.timeAgo}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
