'use client'

import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  CheckCircle, 
  BarChart3, 
  Trophy, 
  MessageCircle, 
  ArrowRight, 
  Mail, 
  MapPin, 
  Clock,
  GraduationCap,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import Link from 'next/link'
import { MentorCard } from '@/components/ui/MentorCard'
import { MentorButton } from '@/components/ui/MentorButton'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { MentorToast } from '@/components/ui/MentorToast'

interface MentorStats {
  activeStudents: number
  tasksAssigned: number
  completedTasks: number
  successRate: number
}

interface TopStudent {
  id: number
  name: string
  score: number
  rank: number
  color: string
}

interface ActiveContest {
  id: number
  title: string
  participants: number
  timeLeft: string
  color: string
}

interface Activity {
  id: number
  type: string
  title: string
  description: string
  time: string
  icon: string
  color: string
}

export default function MentorDashboardPage() {
  const [mentorStats, setMentorStats] = useState<MentorStats>({
    activeStudents: 24,
    tasksAssigned: 156,
    completedTasks: 142,
    successRate: 91
  })

  const [isActivityCollapsed, setIsActivityCollapsed] = useState(false)
  const [toasts, setToasts] = useState<Array<{id: string, message: string, type: 'success' | 'error' | 'warning' | 'info'}>>([])

  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const [topStudents, setTopStudents] = useState<TopStudent[]>([
    { id: 1, name: 'Alex Johnson', score: 95, rank: 1, color: 'green' },
    { id: 2, name: 'Priya Sharma', score: 92, rank: 2, color: 'blue' },
    { id: 3, name: 'Rahul Kumar', score: 89, rank: 3, color: 'purple' }
  ])

  const [activeContests, setActiveContests] = useState<ActiveContest[]>([
    { id: 1, title: 'Weekly Algorithm Challenge', participants: 156, timeLeft: '2 days', color: 'orange' },
    { id: 2, title: 'Data Structures Master', participants: 89, timeLeft: '5 days', color: 'blue' }
  ])

  const [recentActivities, setRecentActivities] = useState<Activity[]>([
    {
      id: 1,
      type: 'feedback',
      title: 'Gave feedback to Alex Johnson',
      description: 'Algorithm contest submission review',
      time: '2 hours ago',
      icon: 'message-circle',
      color: 'green'
    },
    {
      id: 2,
      type: 'contest',
      title: 'Created new contest',
      description: '"Dynamic Programming Masterclass"',
      time: '1 day ago',
      icon: 'trophy',
      color: 'blue'
    },
    {
      id: 3,
      type: 'student',
      title: 'New student assigned',
      description: 'Rahul Kumar joined your mentorship',
      time: '3 days ago',
      icon: 'users',
      color: 'purple'
    },
    {
      id: 4,
      type: 'task',
      title: 'Task completed',
      description: 'Weekly progress review for Priya Sharma',
      time: '1 week ago',
      icon: 'check-circle',
      color: 'amber'
    }
  ])

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'from-green-50 to-emerald-50 border-green-100 text-green-600',
      blue: 'from-blue-50 to-indigo-50 border-blue-100 text-blue-600',
      purple: 'from-purple-50 to-violet-50 border-purple-100 text-purple-600',
      orange: 'from-orange-50 to-amber-50 border-orange-100 text-orange-600',
      amber: 'from-amber-50 to-orange-50 border-amber-100 text-amber-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getIconColor = (color: string) => {
    const colors = {
      green: 'from-green-500 to-emerald-600',
      blue: 'from-blue-500 to-indigo-600',
      purple: 'from-purple-500 to-violet-600',
      orange: 'from-orange-500 to-amber-600',
      amber: 'from-amber-500 to-orange-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getRankColor = (rank: number) => {
    const colors = {
      1: 'from-green-500 to-emerald-600',
      2: 'from-blue-500 to-indigo-600',
      3: 'from-purple-500 to-violet-600'
    }
    return colors[rank as keyof typeof colors] || colors[1]
  }

  return (
    <div>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-content">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-700 leading-snug">Dashboard</h1>
            </div>
          </div>
        </div>

        {/* Mentor Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MentorCard className="text-center bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:shadow-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <AnimatedCounter 
              value={mentorStats.activeStudents} 
              className="text-3xl font-bold text-green-600 mb-2"
            />
            <div className="text-sm text-slate-600 font-medium">Active Students</div>
          </MentorCard>

          <MentorCard className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <AnimatedCounter 
              value={mentorStats.tasksAssigned} 
              className="text-3xl font-bold text-blue-600 mb-2"
            />
            <div className="text-sm text-slate-600 font-medium">Tasks Assigned</div>
          </MentorCard>

          <MentorCard className="text-center bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 hover:shadow-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <AnimatedCounter 
              value={mentorStats.completedTasks} 
              className="text-3xl font-bold text-amber-600 mb-2"
            />
            <div className="text-sm text-slate-600 font-medium">Completed Tasks</div>
          </MentorCard>

          <MentorCard className="text-center bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 hover:shadow-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <AnimatedCounter 
              value={mentorStats.successRate} 
              suffix="%" 
              className="text-3xl font-bold text-purple-600 mb-2"
            />
            <div className="text-sm text-slate-600 font-medium">Success Rate</div>
          </MentorCard>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Profile Section */}
          <MentorCard className="group cursor-pointer" onClick={() => window.location.href = '/mentor/profile'}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">Profile</h2>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg border-2 border-orange-200 group-hover:border-orange-400 transition-colors">
                <span className="text-white font-bold text-xl">SS</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-orange-700 transition-colors">Satya Sai</h3>
                <p className="text-slate-600 text-sm">Computer Science Mentor</p>
                <p className="text-orange-600 text-sm font-medium">5 years experience</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">satya.sai@pwioi.edu</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">Mumbai, India</span>
              </div>
            </div>
          </MentorCard>

          {/* Top Performing Students */}
          <MentorCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Top Performing Students</h2>
              <Link href="/mentor/leaderboard" className="text-orange-600 hover:text-orange-700 text-sm font-medium">View All</Link>
            </div>
            <div className="space-y-3">
              {topStudents.map((student) => (
                <div key={student.id} className={`flex items-center justify-between p-3 bg-gradient-to-r ${getColorClasses(student.color)} rounded-xl border hover:shadow-md transition-all duration-200`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${getRankColor(student.rank)} rounded-full flex items-center justify-center shadow-sm`}>
                      <span className="text-white text-sm font-bold">{student.rank}</span>
                    </div>
                    <span className="font-medium text-slate-900">{student.name}</span>
                  </div>
                  <span className={`text-sm font-bold ${getColorClasses(student.color).split(' ')[3]}`}>{student.score}%</span>
                </div>
              ))}
            </div>
          </MentorCard>

          {/* Active Contests */}
          <MentorCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Active Contests</h2>
              <Link href="/mentor/contests" className="text-orange-600 hover:text-orange-700 text-sm font-medium">View All</Link>
            </div>
            <div className="space-y-3">
              {activeContests.map((contest) => (
                <div key={contest.id} className={`p-3 bg-gradient-to-r ${getColorClasses(contest.color)} rounded-xl border hover:shadow-md transition-all duration-200`}>
                  <h4 className="font-medium text-slate-900">{contest.title}</h4>
                  <p className="text-sm text-slate-600 mb-2">{contest.participants} participants</p>
                  <div className={`flex items-center gap-2 text-xs ${getColorClasses(contest.color).split(' ')[3]}`}>
                    <Clock className="w-3 h-3" />
                    <span>Ends in {contest.timeLeft}</span>
                  </div>
                </div>
              ))}
            </div>
          </MentorCard>
        </div>

        {/* Recent Activity Feed */}
        <MentorCard className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
            <button
              onClick={() => setIsActivityCollapsed(!isActivityCollapsed)}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
            >
              {isActivityCollapsed ? 'Show All' : 'Collapse'}
              {isActivityCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
          <div className={`space-y-4 transition-all duration-300 ${isActivityCollapsed ? 'max-h-32 overflow-hidden' : ''}`}>
            {recentActivities.slice(0, isActivityCollapsed ? 2 : recentActivities.length).map((activity) => (
              <div key={activity.id} className={`flex items-center gap-4 p-3 bg-gradient-to-r ${getColorClasses(activity.color)} rounded-xl border hover:shadow-md transition-all duration-200`}>
                <div className={`w-10 h-10 bg-gradient-to-br ${getIconColor(activity.color)} rounded-full flex items-center justify-center shadow-sm`}>
                  {activity.icon === 'message-circle' && <MessageCircle className="w-5 h-5 text-white" />}
                  {activity.icon === 'trophy' && <Trophy className="w-5 h-5 text-white" />}
                  {activity.icon === 'users' && <Users className="w-5 h-5 text-white" />}
                  {activity.icon === 'check-circle' && <CheckCircle className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                  <p className="text-xs text-slate-600">{activity.description}</p>
                </div>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </MentorCard>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MentorCard className="text-center group cursor-pointer" onClick={() => window.location.href = '/mentor/students'}>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">My Students</h3>
              <p className="text-sm text-slate-600">View and manage your students</p>
            </MentorCard>

            <MentorCard className="text-center group cursor-pointer" onClick={() => window.location.href = '/mentor/tasks'}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-green-600 transition-colors">Assign Tasks</h3>
              <p className="text-sm text-slate-600">Create and assign new tasks</p>
            </MentorCard>

            <MentorCard className="text-center group cursor-pointer" onClick={() => window.location.href = '/mentor/feedback'}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">Give Feedback</h3>
              <p className="text-sm text-slate-600">Provide feedback to students</p>
            </MentorCard>

            <MentorCard className="text-center group cursor-pointer" onClick={() => window.location.href = '/mentor/leaderboard'}>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">Leaderboard</h3>
              <p className="text-sm text-slate-600">View contest leaderboards</p>
            </MentorCard>
          </div>
        </div>

        {/* Toast Notifications */}
        {toasts.map((toast) => (
          <MentorToast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onDismiss={removeToast}
          />
        ))}
      </main>
    </div>
  )
}