'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  BarChart3,
  Target,
  Trophy,
  Star,
  Users,
  Flame,
  Edit3,
  BookOpen,
  TrendingUp,
  Code,
  Globe,
  Layout,
  Database,
  Clock,
  CheckCircle,
  Calendar,
  Zap,
  Award,
  Lightbulb,
  Book,
  Plus,
  Bell,
  X,
  MoreVertical,
  Eye,
  EyeOff
} from 'lucide-react'

interface DashboardData {
  firstName: string
  lastName: string
  email: string
  progress: number
  skills: string[]
  recentActivity: Array<{
    type: string
    title: string
    date: string
  }>
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'task' | 'community' | 'achievement' | 'reminder'
  time: string
  read: boolean
  icon: React.ReactNode
}

interface QuickTask {
  id: string
  title: string
  platform: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  dueDate: string
  completed: boolean
}

interface Goal {
  id: string
  title: string
  icon: React.ReactNode
  progress: number
  total: number
  color: string
  bgColor: string
  borderColor: string
}

interface Skill {
  id: string
  name: string
  level: string
  icon: React.ReactNode
  count: number
  color: string
  bgColor: string
  borderColor: string
}

interface Activity {
  id: string
  type: string
  title: string
  description: string
  time: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

interface Contest {
  id: string
  title: string
  description: string
  time: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}

interface QuickAction {
  id: string
  title: string
  description: string
  href: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

interface Recommendation {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}

export default function PersonalDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  
  // Enhanced state for new features
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Task Available',
      message: 'Binary Tree Traversal problem added to your queue',
      type: 'task',
      time: '5 min ago',
      read: false,
      icon: <Target className="w-4 h-4" />
    },
    {
      id: '2',
      title: 'Community Post',
      message: 'Someone answered your question in React Community',
      type: 'community',
      time: '1 hour ago',
      read: false,
      icon: <Users className="w-4 h-4" />
    },
    {
      id: '3',
      title: 'Achievement Unlocked',
      message: 'You completed 10 problems this week!',
      type: 'achievement',
      time: '2 hours ago',
      read: true,
      icon: <Trophy className="w-4 h-4" />
    }
  ])

  const [quickTask, setQuickTask] = useState<QuickTask>({
    id: '',
    title: '',
    platform: 'LeetCode',
    difficulty: 'Medium',
    dueDate: new Date().toISOString().split('T')[0],
    completed: false
  })

  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  // Enhanced functionality methods
  const handleQuickTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (quickTask.title.trim()) {
      // Add task logic here
      console.log('Adding quick task:', quickTask)
      setQuickTask({
        id: '',
        title: '',
        platform: 'LeetCode',
        difficulty: 'Medium',
        dueDate: new Date().toISOString().split('T')[0],
        completed: false
      })
      setShowQuickAdd(false)
    }
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      try {
        const sampleData: DashboardData = {
          firstName: 'Munaf',
          lastName: '',
          email: 'munaf@example.com',
          progress: 75,
          skills: ['JavaScript', 'Python', 'React'],
          recentActivity: [
            { type: 'Problem Solved', title: 'Two Sum', date: '2024-01-15' },
            { type: 'Contest Joined', title: 'Weekly Challenge', date: '2024-01-14' },
            { type: 'Skill Updated', title: 'React', date: '2024-01-13' }
          ]
        }
        
        setDashboardData(sampleData)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      }
    }

    loadDashboardData()
  }, [])

  const goals: Goal[] = [
    {
      id: '1',
      title: 'Solve Problems',
      icon: <Edit3 className="w-4 h-4 text-blue-600" />,
      progress: 3,
      total: 5,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: '2',
      title: 'Learn New Topic',
      icon: <BookOpen className="w-4 h-4 text-green-600" />,
      progress: 1,
      total: 1,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: '3',
      title: 'Join Contest',
      icon: <Users className="w-4 h-4 text-purple-600" />,
      progress: 0,
      total: 1,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ]

  const skills: Skill[] = [
    {
      id: '1',
      name: 'Algorithms',
      level: 'Intermediate',
      icon: <Code className="w-5 h-5 text-blue-600" />,
      count: 156,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: '2',
      name: 'Web Dev',
      level: 'Advanced',
      icon: <Globe className="w-5 h-5 text-green-600" />,
      count: 12,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: '3',
      name: 'System Design',
      level: 'Beginner',
      icon: <Layout className="w-5 h-5 text-amber-600" />,
      count: 8,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      id: '4',
      name: 'Database',
      level: 'Intermediate',
      icon: <Database className="w-5 h-5 text-purple-600" />,
      count: 45,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ]

  const activities: Activity[] = [
    {
      id: '1',
      type: 'Solved LeetCode Problem',
      title: 'Two Sum - Easy',
      description: '2 hours ago',
      time: '2 hours ago',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: '2',
      type: 'Won Weekly Contest',
      title: 'Ranked #15 out of 200',
      description: '1 day ago',
      time: '1 day ago',
      icon: <Trophy className="w-5 h-5 text-amber-600" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    },
    {
      id: '3',
      type: 'Joined Community',
      title: 'Data Structures Masters',
      description: '2 days ago',
      time: '2 days ago',
      icon: <Users className="w-5 h-5 text-purple-600" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: '4',
      type: 'Completed Course',
      title: 'Advanced JavaScript',
      description: '3 days ago',
      time: '3 days ago',
      icon: <BookOpen className="w-5 h-5 text-blue-600" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ]

  const contests: Contest[] = [
    {
      id: '1',
      title: 'Weekly Algorithm Challenge',
      description: 'Test your problem-solving skills',
      time: 'Tomorrow at 2:00 PM',
      icon: <Zap className="w-4 h-4 text-blue-600" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: '2',
      title: 'Code Sprint',
      description: 'Fast-paced coding competition',
      time: 'Saturday at 10:00 AM',
      icon: <Code className="w-4 h-4 text-green-600" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ]

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Start Practice',
      description: 'Solve problems',
      href: '/personal/tracker',
      icon: <Edit3 className="w-5 h-5 text-blue-600" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: '2',
      title: 'Join Contest',
      description: 'Compete with others',
      href: '/personal/communities',
      icon: <Users className="w-5 h-5 text-purple-600" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: '3',
      title: 'View Projects',
      description: 'Showcase your work',
      href: '/personal/projects',
      icon: <Globe className="w-5 h-5 text-green-600" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: '4',
      title: 'View Analytics',
      description: 'Track progress',
      href: '/personal/stats',
      icon: <BarChart3 className="w-5 h-5 text-amber-600" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ]

  const recommendations: Recommendation[] = [
    {
      id: '1',
      title: 'Dynamic Programming',
      description: 'Master advanced algorithms',
      icon: <Book className="w-4 h-4 text-indigo-600" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      id: '2',
      title: 'System Design',
      description: 'Build scalable applications',
      icon: <Globe className="w-4 h-4 text-pink-600" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      id: '3',
      title: 'Database Optimization',
      description: 'Improve query performance',
      icon: <Database className="w-4 h-4 text-cyan-600" />,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200'
    }
  ]

  const achievements = [
    '🏆 Problem Solver',
    '🔥 7-Day Streak',
    '⭐ Top 10%',
    '🚀 Speed Demon',
    '📚 Course Master',
    '👥 Community Leader'
  ]

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg page-header-icon">
          <LayoutDashboard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 mb-1">Dashboard</h1>
          <p className="text-sm text-slate-600">Welcome back, Munaf! Here&apos;s your learning overview</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Learning Overview</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            className="stat-card rounded-xl p-4 text-center relative group cursor-pointer"
            onMouseEnter={() => setHoveredCard('problems')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">247</span>
            </div>
            <div className="text-sm text-slate-600">Problems Solved</div>
            <div className="text-xs text-blue-600 mt-1">+12 this week</div>
            
            {/* Hover Details */}
            {hoveredCard === 'problems' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-10">
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 mb-2">Recent Completions</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Two Sum</span>
                      <span className="text-green-600">2h ago</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Binary Search</span>
                      <span className="text-green-600">1d ago</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Linked List Cycle</span>
                      <span className="text-green-600">2d ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div 
            className="stat-card rounded-xl p-4 text-center relative group cursor-pointer"
            onMouseEnter={() => setHoveredCard('rating')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">1,850</span>
            </div>
            <div className="text-sm text-slate-600">Skill Rating</div>
            <div className="text-xs text-green-600 mt-1">+45 this month</div>
            
            {/* Hover Details */}
            {hoveredCard === 'rating' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-10">
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 mb-2">Rating Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Algorithms</span>
                      <span className="text-green-600">1,920</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Data Structures</span>
                      <span className="text-green-600">1,780</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">System Design</span>
                      <span className="text-green-600">1,650</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div 
            className="stat-card rounded-xl p-4 text-center relative group cursor-pointer"
            onMouseEnter={() => setHoveredCard('communities')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">8</span>
            </div>
            <div className="text-sm text-slate-600">Communities</div>
            <div className="text-xs text-purple-600 mt-1">Active member</div>
            
            {/* Hover Details */}
            {hoveredCard === 'communities' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-10">
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 mb-2">Active Communities</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">React Developers</span>
                      <span className="text-purple-600">5 posts</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Algorithm Masters</span>
                      <span className="text-purple-600">12 posts</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">System Design</span>
                      <span className="text-purple-600">3 posts</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div 
            className="stat-card rounded-xl p-4 text-center relative group cursor-pointer"
            onMouseEnter={() => setHoveredCard('streak')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">23</span>
            </div>
            <div className="text-sm text-slate-600">Day Streak</div>
            <div className="text-xs text-orange-600 mt-1">Keep it up!</div>
            
            {/* Hover Details */}
            {hoveredCard === 'streak' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-10">
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 mb-2">Streak History</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Streak</span>
                      <span className="text-orange-600">23 days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Best Streak</span>
                      <span className="text-orange-600">45 days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Days Active</span>
                      <span className="text-orange-600">156 days</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Goals Section */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Today&apos;s Goals</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <div key={goal.id} className={`goal-card p-4 ${goal.bgColor} rounded-xl border ${goal.borderColor}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 ${goal.bgColor.replace('50', '100')} rounded-lg flex items-center justify-center`}>
                  {goal.icon}
                </div>
                <span className="font-semibold text-slate-800">{goal.title}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Progress</span>
                <span className={`text-sm font-semibold ${goal.color}`}>{goal.progress}/{goal.total}</span>
              </div>
              <div className="progress-bar rounded-full h-2 overflow-hidden">
                <div 
                  className="progress-fill h-full rounded-full" 
                  style={{ width: `${(goal.progress / goal.total) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Progress Section */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Skill Progress</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {skills.map((skill) => (
            <div key={skill.id} className={`p-4 ${skill.bgColor} rounded-xl border ${skill.borderColor}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${skill.bgColor.replace('50', '100')} rounded-xl flex items-center justify-center`}>
                  {skill.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{skill.name}</h3>
                  <p className={`text-sm ${skill.color}`}>{skill.level}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">
                  {skill.name === 'Web Dev' ? 'Projects Built' : 
                   skill.name === 'System Design' ? 'Concepts Learned' :
                   skill.name === 'Database' ? 'Queries Mastered' : 'Problems Solved'}
                </span>
                <span className={`text-sm font-bold ${skill.color}`}>{skill.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Recent Activity</h3>
          </div>
          
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="activity-item flex items-center gap-3 p-3 hover:bg-green-50/50 rounded-xl transition-colors">
                <div className={`w-10 h-10 ${activity.bgColor} rounded-xl flex items-center justify-center`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 text-sm">{activity.title}</h4>
                  <p className="text-xs text-slate-600">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Contests */}
        <div className="card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Upcoming Contests</h3>
          </div>
          
          <div className="space-y-4">
            {contests.map((contest) => (
              <div key={contest.id} className={`p-4 ${contest.bgColor} rounded-xl border ${contest.borderColor}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 ${contest.bgColor.replace('50', '100')} rounded-lg flex items-center justify-center`}>
                    {contest.icon}
                  </div>
                  <span className="font-semibold text-slate-800 text-sm">{contest.title}</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">{contest.description}</p>
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <Clock className="w-3 h-3" />
                  <span>{contest.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Quick Actions</h3>
          </div>
          
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link key={action.id} href={action.href}>
                <button className={`action-button w-full p-4 ${action.bgColor} hover:${action.bgColor.replace('50', '100')} rounded-xl text-left flex items-center gap-3 transition-colors`}>
                  <div className={`w-10 h-10 ${action.bgColor.replace('50', '100')} rounded-xl flex items-center justify-center`}>
                    {action.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{action.title}</div>
                    <div className="text-xs text-slate-600">{action.description}</div>
                  </div>
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Achievements Section */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <Award className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Recent Achievements</h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {achievements.map((achievement, index) => (
            <span key={index} className="achievement-badge">{achievement}</span>
          ))}
        </div>
      </div>

      {/* Learning Recommendations */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Recommended for You</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className={`p-4 ${rec.bgColor} rounded-xl border ${rec.borderColor}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 ${rec.bgColor.replace('50', '100')} rounded-lg flex items-center justify-center`}>
                  {rec.icon}
                </div>
                <span className="font-semibold text-slate-800 text-sm">{rec.title}</span>
              </div>
              <p className="text-xs text-slate-600 mb-2">{rec.description}</p>
              <Link href="/personal/tracker">
                <button className={`text-xs ${rec.color} font-medium hover:${rec.color.replace('600', '700')}`}>
                  Start Learning →
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced UI Components */}
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowQuickAdd(true)}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Notifications Widget */}
      <div className="fixed top-6 right-6 z-50">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-12 h-12 bg-white hover:bg-gray-50 text-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-16 right-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        notification.type === 'task' ? 'bg-green-100 text-green-600' :
                        notification.type === 'community' ? 'bg-blue-100 text-blue-600' :
                        notification.type === 'achievement' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {notification.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Task Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Quick Task</h3>
              <button
                onClick={() => setShowQuickAdd(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleQuickTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={quickTask.title}
                  onChange={(e) => setQuickTask({...quickTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform
                  </label>
                  <select
                    value={quickTask.platform}
                    onChange={(e) => setQuickTask({...quickTask, platform: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="HackerRank">HackerRank</option>
                    <option value="GeeksforGeeks">GeeksforGeeks</option>
                    <option value="CodeForces">CodeForces</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={quickTask.difficulty}
                    onChange={(e) => setQuickTask({...quickTask, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={quickTask.dueDate}
                  onChange={(e) => setQuickTask({...quickTask, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}