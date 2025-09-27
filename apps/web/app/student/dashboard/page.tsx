'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Target,
  CheckCircle,
  Trophy,
  TrendingUp,
  Mail,
  MapPin,
  Clock,
  Users,
  BarChart3,
  MessageSquare,
  User,
  BookOpen
} from 'lucide-react'

interface UserStats {
  totalScore: number
  problemsSolved: number
  contestsWon: number
  accuracy: number
}

interface TopPerformance {
  id: string
  contest: string
  rank: number
  score: number
  color: string
  bgColor: string
  borderColor: string
}

interface ActiveContest {
  id: string
  name: string
  participants: number
  timeLeft: string
  color: string
  bgColor: string
  borderColor: string
}

interface RecentActivity {
  id: string
  type: 'solved' | 'won' | 'joined' | 'improved'
  title: string
  description: string
  timeAgo: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  borderColor: string
}

export default function StudentDashboardPage() {
  const [userStats, setUserStats] = useState<UserStats>({
    totalScore: 2450,
    problemsSolved: 156,
    contestsWon: 8,
    accuracy: 92
  })

  const [topPerformances, setTopPerformances] = useState<TopPerformance[]>([
    {
      id: '1',
      contest: 'Algorithm Contest',
      rank: 1,
      score: 95,
      color: 'text-green-600',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-100'
    },
    {
      id: '2',
      contest: 'Java Challenge',
      rank: 2,
      score: 92,
      color: 'text-blue-600',
      bgColor: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-100'
    },
    {
      id: '3',
      contest: 'Python Contest',
      rank: 3,
      score: 89,
      color: 'text-purple-600',
      bgColor: 'from-purple-50 to-violet-50',
      borderColor: 'border-purple-100'
    }
  ])

  const [activeContests, setActiveContests] = useState<ActiveContest[]>([
    {
      id: '1',
      name: 'Weekly Algorithm Challenge',
      participants: 156,
      timeLeft: 'Ends in 2 days',
      color: 'text-blue-600',
      bgColor: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-100'
    },
    {
      id: '2',
      name: 'Data Structures Master',
      participants: 89,
      timeLeft: 'Ends in 5 days',
      color: 'text-green-600',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-100'
    }
  ])

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'solved',
      title: 'Solved "Binary Search" problem',
      description: 'Algorithm contest submission',
      timeAgo: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-100'
    },
    {
      id: '2',
      type: 'won',
      title: 'Won Java Contest',
      description: '"Core Java Programming"',
      timeAgo: '1 day ago',
      icon: Trophy,
      color: 'text-blue-600',
      bgColor: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-100'
    },
    {
      id: '3',
      type: 'joined',
      title: 'Joined new contest',
      description: '"Dynamic Programming Masterclass"',
      timeAgo: '3 days ago',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'from-purple-50 to-violet-50',
      borderColor: 'border-purple-100'
    },
    {
      id: '4',
      type: 'improved',
      title: 'Improved ranking',
      description: 'Moved to #3 in overall leaderboard',
      timeAgo: '1 week ago',
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-100'
    }
  ])

  const quickActions = [
    {
      title: 'Join Contest',
      description: 'Participate in active contests',
      href: '/student/contests',
      icon: Trophy,
      color: 'text-blue-600'
    },
    {
      title: 'View Leaderboard',
      description: 'Check your rankings',
      href: '/student/leaderboard',
      icon: BarChart3,
      color: 'text-green-600'
    },
    {
      title: 'Get Feedback',
      description: 'Request mentor feedback',
      href: '/student/feedback',
      icon: MessageSquare,
      color: 'text-purple-600'
    },
    {
      title: 'My Profile',
      description: 'Manage your profile',
      href: '/student/profile',
      icon: User,
      color: 'text-amber-600'
    }
  ]

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-green-500 to-emerald-600'
      case 2: return 'from-blue-500 to-indigo-600'
      case 3: return 'from-purple-500 to-violet-600'
      default: return 'from-slate-500 to-slate-600'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'solved': return CheckCircle
      case 'won': return Trophy
      case 'joined': return Users
      case 'improved': return TrendingUp
      default: return CheckCircle
    }
  }

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-content">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, Munaf!</h1>
          <p className="text-lg text-slate-600">Track your progress and participate in community contests.</p>
        </div>

        {/* User Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card bg-white rounded-lg shadow-lg p-6 text-center">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{userStats.totalScore.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Total Score</div>
          </div>
          <div className="stat-card bg-white rounded-lg shadow-lg p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{userStats.problemsSolved.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Problems Solved</div>
          </div>
          <div className="stat-card bg-white rounded-lg shadow-lg p-6 text-center">
            <Trophy className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-amber-600">{userStats.contestsWon.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Contests Won</div>
          </div>
          <div className="stat-card bg-white rounded-lg shadow-lg p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{userStats.accuracy}%</div>
            <div className="text-sm text-slate-600">Accuracy</div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Profile Section */}
          <div className="dashboard-card bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Profile</h2>
            <div className="flex items-center gap-4 mb-4">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face" 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-blue-200"
              />
              <div>
                <h3 className="font-semibold text-slate-900">Munaf</h3>
                <p className="text-slate-600 text-sm">Computer Science Student</p>
                <p className="text-blue-600 text-sm font-medium">3rd Year</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">munaf@email.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">New York, NY</span>
              </div>
            </div>
          </div>

          {/* Top Performance */}
          <div className="dashboard-card bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Top Performance</h2>
              <Link href="/student/leaderboard" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {topPerformances.map((performance) => (
                <div key={performance.id} className={`flex items-center justify-between p-3 bg-gradient-to-r ${performance.bgColor} rounded-lg border ${performance.borderColor}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${getRankColor(performance.rank)} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-sm font-bold">{performance.rank}</span>
                    </div>
                    <span className="font-medium text-slate-900">{performance.contest}</span>
                  </div>
                  <span className={`text-sm font-bold ${performance.color}`}>{performance.score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Contests */}
          <div className="dashboard-card bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Active Contests</h2>
              <Link href="/student/contests" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {activeContests.map((contest) => (
                <div key={contest.id} className={`p-3 bg-gradient-to-r ${contest.bgColor} rounded-lg border ${contest.borderColor}`}>
                  <h4 className="font-medium text-slate-900">{contest.name}</h4>
                  <p className="text-sm text-slate-600 mb-2">{contest.participants} participants</p>
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <Clock className="w-3 h-3" />
                    <span>{contest.timeLeft}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="dashboard-card bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              return (
                <div key={activity.id} className={`flex items-center gap-4 p-3 bg-gradient-to-r ${activity.bgColor} rounded-lg border ${activity.borderColor}`}>
                  <div className={`w-10 h-10 bg-gradient-to-br ${activity.color.replace('text-', 'from-').replace('-600', '-500')} to-${activity.color.replace('text-', '').replace('-600', '-600')} rounded-full flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                    <p className="text-xs text-slate-600">{activity.description}</p>
                  </div>
                  <span className="text-xs text-slate-500">{activity.timeAgo}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link
                  key={index}
                  href={action.href}
                  className="action-card bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all group cursor-pointer"
                >
                  <Icon className={`w-12 h-12 ${action.color} mx-auto mb-4 group-hover:scale-110 transition-transform`} />
                  <h3 className="font-semibold text-slate-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-slate-600">{action.description}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}