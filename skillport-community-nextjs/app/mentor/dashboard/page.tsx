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
  GraduationCap
} from 'lucide-react'
import Link from 'next/link'

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card bg-white rounded-lg shadow-lg p-6 text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{mentorStats.activeStudents}</div>
            <div className="text-sm text-slate-600">Active Students</div>
          </div>
          <div className="stat-card bg-white rounded-lg shadow-lg p-6 text-center">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{mentorStats.tasksAssigned}</div>
            <div className="text-sm text-slate-600">Tasks Assigned</div>
          </div>
          <div className="stat-card bg-white rounded-lg shadow-lg p-6 text-center">
            <CheckCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-amber-600">{mentorStats.completedTasks}</div>
            <div className="text-sm text-slate-600">Completed Tasks</div>
          </div>
          <div className="stat-card bg-white rounded-lg shadow-lg p-6 text-center">
            <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{mentorStats.successRate}%</div>
            <div className="text-sm text-slate-600">Success Rate</div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Profile Section */}
          <Link href="/mentor/profile" className="dashboard-card bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group">
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
          </Link>

          {/* Top Performing Students */}
          <div className="dashboard-card bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Top Performing Students</h2>
              <Link href="/mentor/students" className="text-orange-600 hover:text-orange-700 text-sm font-medium">View All</Link>
            </div>
            <div className="space-y-3">
              {topStudents.map((student) => (
                <div key={student.id} className={`flex items-center justify-between p-3 bg-gradient-to-r ${getColorClasses(student.color)} rounded-lg border`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${getRankColor(student.rank)} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-sm font-bold">{student.rank}</span>
                    </div>
                    <span className="font-medium text-slate-900">{student.name}</span>
                  </div>
                  <span className={`text-sm font-bold ${getColorClasses(student.color).split(' ')[3]}`}>{student.score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Contests */}
          <div className="dashboard-card bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Active Contests</h2>
              <Link href="/mentor/contests" className="text-orange-600 hover:text-orange-700 text-sm font-medium">View All</Link>
            </div>
            <div className="space-y-3">
              {activeContests.map((contest) => (
                <div key={contest.id} className={`p-3 bg-gradient-to-r ${getColorClasses(contest.color)} rounded-lg border`}>
                  <h4 className="font-medium text-slate-900">{contest.title}</h4>
                  <p className="text-sm text-slate-600 mb-2">{contest.participants} participants</p>
                  <div className={`flex items-center gap-2 text-xs ${getColorClasses(contest.color).split(' ')[3]}`}>
                    <Clock className="w-3 h-3" />
                    <span>Ends in {contest.timeLeft}</span>
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
            {recentActivities.map((activity) => (
              <div key={activity.id} className={`flex items-center gap-4 p-3 bg-gradient-to-r ${getColorClasses(activity.color)} rounded-lg border`}>
                <div className={`w-10 h-10 bg-gradient-to-br ${getIconColor(activity.color)} rounded-full flex items-center justify-center`}>
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
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link href="/mentor/students" className="action-card bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all group cursor-pointer">
              <Users className="w-12 h-12 text-orange-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-900 mb-2">My Students</h3>
              <p className="text-sm text-slate-600">View and manage your students</p>
            </Link>
            <Link href="/mentor/tasks" className="action-card bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all group cursor-pointer">
              <Target className="w-12 h-12 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-900 mb-2">Assign Tasks</h3>
              <p className="text-sm text-slate-600">Create and assign new tasks</p>
            </Link>
            <Link href="/mentor/feedback" className="action-card bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all group cursor-pointer">
              <MessageCircle className="w-12 h-12 text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-900 mb-2">Give Feedback</h3>
              <p className="text-sm text-slate-600">Provide feedback to students</p>
            </Link>
            <Link href="/mentor/leaderboard" className="action-card bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all group cursor-pointer">
              <BarChart3 className="w-12 h-12 text-amber-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-900 mb-2">Leaderboard</h3>
              <p className="text-sm text-slate-600">View contest leaderboards</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}