'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { 
  BarChart3, 
  MoreVertical,
  X,
  Loader,
  Users,
  Trophy,
  Award,
  Activity,
  Target,
  Clock,
  TrendingUp,
  Code,
  Database,
  Zap,
  Network,
  Calendar,
  CalendarDays,
  CalendarRange,
  MessageCircle,
  GraduationCap,
  LayoutDashboard
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function CommunityAnalyticsPage() {
  const params = useParams()
  const communitySlug = params.communitySlug as string
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [communityData, setCommunityData] = useState<any>(null)
  const [dynamicStats, setDynamicStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalContests: 0,
    totalSubmissions: 0,
    dailyActiveUsers: 0,
    weeklyActiveUsers: 0,
    monthlyActiveUsers: 0,
    activeMentors: 0,
    avgResponseTime: '0h',
    studentsHelped: 0,
    contestsCreated: 0,
    monthlyGrowth: {
      totalUsers: 0,
      activeUsers: 0,
      totalContests: 0,
      totalSubmissions: 0
    }
  })
  const [topCategories, setTopCategories] = useState([
    { name: 'Algorithms', percentage: 0, icon: Code, color: 'blue' },
    { name: 'Data Structures', percentage: 0, icon: Database, color: 'green' },
    { name: 'Dynamic Programming', percentage: 0, icon: Zap, color: 'purple' },
    { name: 'Graph Theory', percentage: 0, icon: Network, color: 'yellow' }
  ])
  const [contestParticipation, setContestParticipation] = useState([
    { name: 'Algorithms', value: 0, color: 'bg-blue-500' },
    { name: 'Data Structures', value: 0, color: 'bg-green-500' },
    { name: 'Dynamic Programming', value: 0, color: 'bg-purple-500' },
    { name: 'Graph Theory', value: 0, color: 'bg-yellow-500' }
  ])

  // Fetch community data
  const fetchCommunityData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/community/${communitySlug}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        setCommunityData(result.data.community)
      }
    } catch (error) {
      console.error('Failed to fetch community data:', error)
    }
  }

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`/api/community/${communitySlug}/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const result = await response.json()
      setAnalyticsData(result.data)
      
      // Calculate dynamic stats from analytics data
      const data = result.data || {}
      setDynamicStats({
        totalUsers: data.totalUsers || 0,
        activeUsers: data.activeUsers || 0,
        totalContests: data.totalContests || 0,
        totalSubmissions: data.totalSubmissions || 0,
        dailyActiveUsers: data.dailyActiveUsers || 0,
        weeklyActiveUsers: data.weeklyActiveUsers || 0,
        monthlyActiveUsers: data.monthlyActiveUsers || 0,
        activeMentors: data.activeMentors || 0,
        avgResponseTime: data.avgResponseTime || '0h',
        studentsHelped: data.studentsHelped || 0,
        contestsCreated: data.contestsCreated || 0,
        monthlyGrowth: {
          totalUsers: data.monthlyGrowth?.totalUsers || 0,
          activeUsers: data.monthlyGrowth?.activeUsers || 0,
          totalContests: data.monthlyGrowth?.totalContests || 0,
          totalSubmissions: data.monthlyGrowth?.totalSubmissions || 0
        }
      })
      
      // Update top categories with dynamic data
      if (data.topCategories) {
        setTopCategories(data.topCategories)
      } else {
        // Default categories with some sample data for now
        setTopCategories([
          { name: 'Algorithms', percentage: data.algorithmsPercentage || 0, icon: Code, color: 'blue' },
          { name: 'Data Structures', percentage: data.dataStructuresPercentage || 0, icon: Database, color: 'green' },
          { name: 'Dynamic Programming', percentage: data.dynamicProgrammingPercentage || 0, icon: Zap, color: 'purple' },
          { name: 'Graph Theory', percentage: data.graphTheoryPercentage || 0, icon: Network, color: 'yellow' }
        ])
      }
      
      // Update contest participation with dynamic data
      if (data.contestParticipation) {
        setContestParticipation(data.contestParticipation)
      } else {
        // Default contest participation with some sample data for now
        setContestParticipation([
          { name: 'Algorithms', value: data.algorithmsParticipation || 0, color: 'bg-blue-500' },
          { name: 'Data Structures', value: data.dataStructuresParticipation || 0, color: 'bg-green-500' },
          { name: 'Dynamic Programming', value: data.dynamicProgrammingParticipation || 0, color: 'bg-purple-500' },
          { name: 'Graph Theory', value: data.graphTheoryParticipation || 0, color: 'bg-yellow-500' }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
    fetchCommunityData()
  }, [communitySlug])



  // topCategories is now dynamic state

  const studentActivity = [
    { name: 'Daily Active Users', value: dynamicStats.dailyActiveUsers.toLocaleString(), icon: Calendar, color: 'blue' },
    { name: 'Weekly Active Users', value: dynamicStats.weeklyActiveUsers.toLocaleString(), icon: CalendarDays, color: 'green' },
    { name: 'Monthly Active Users', value: dynamicStats.monthlyActiveUsers.toLocaleString(), icon: CalendarRange, color: 'purple' },
    { name: 'Avg. Session Duration', value: '24m 32s', icon: Clock, color: 'yellow' }
  ]

  const mentorActivity = [
    { name: 'Active Mentors', value: dynamicStats.activeMentors.toString(), icon: Users, color: 'blue' },
    { name: 'Avg. Response Time', value: dynamicStats.avgResponseTime, icon: MessageCircle, color: 'green' },
    { name: 'Students Helped', value: dynamicStats.studentsHelped.toString(), icon: Target, color: 'purple' },
    { name: 'Contests Created', value: dynamicStats.contestsCreated.toString(), icon: Award, color: 'yellow' }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600'
      case 'green':
        return 'bg-green-100 text-green-600'
      case 'purple':
        return 'bg-purple-100 text-purple-600'
      case 'yellow':
        return 'bg-yellow-100 text-yellow-600'
      default:
        return 'bg-blue-100 text-blue-600'
    }
  }

  const getHoverClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'hover:bg-blue-50'
      case 'green':
        return 'hover:bg-green-50'
      case 'purple':
        return 'hover:bg-purple-50'
      case 'yellow':
        return 'hover:bg-yellow-50'
      default:
        return 'hover:bg-blue-50'
    }
  }

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
{communityData?.name || 'Loading...'}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <Link href={`/community/${communitySlug}/dashboard`} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${pathname.includes('/dashboard') ? 'bg-red-50 text-red-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href={`/community/${communitySlug}/students`} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${pathname.includes('/students') ? 'bg-red-50 text-red-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                <Users className="w-4 h-4" />
                Students
              </Link>
              <Link href={`/community/${communitySlug}/mentors`} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${pathname.includes('/mentors') ? 'bg-red-50 text-red-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                <GraduationCap className="w-4 h-4" />
                Mentors
              </Link>
              <Link href={`/community/${communitySlug}/contests`} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${pathname.includes('/contests') ? 'bg-red-50 text-red-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                <Trophy className="w-4 h-4" />
                Contests
              </Link>
              <Link href={`/community/${communitySlug}/analytics`} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${pathname.includes('/analytics') ? 'bg-red-50 text-red-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
              <Link href={`/community/${communitySlug}/leaderboard`} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${pathname.includes('/leaderboard') ? 'bg-red-50 text-red-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                <Award className="w-4 h-4" />
                Leaderboard
              </Link>
              <Link href={`/community/${communitySlug}/profile`} className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
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
            <Link href={`/community/${communitySlug}/dashboard`} className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href={`/community/${communitySlug}/students`} className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
              <Users className="w-4 h-4" />
              Students
            </Link>
            <Link href={`/community/${communitySlug}/mentors`} className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
              <GraduationCap className="w-4 h-4" />
              Mentors
            </Link>
            <Link href={`/community/${communitySlug}/contests`} className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
              <Trophy className="w-4 h-4" />
              Contests
            </Link>
            <Link href={`/community/${communitySlug}/analytics`} className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200 transition-all flex items-center gap-3">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
            <Link href={`/community/${communitySlug}/leaderboard`} className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
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
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-700">Analytics Dashboard</h1>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card bg-white rounded-lg shadow-lg p-6 border border-slate-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <p className="text-2xl font-bold text-slate-900">{dynamicStats.totalUsers}</p>
                <p className="text-sm text-green-600">{dynamicStats.monthlyGrowth.totalUsers > 0 ? '+' : ''}{dynamicStats.monthlyGrowth.totalUsers}% from last month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="stat-card bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Sessions</p>
                <p className="text-2xl font-bold text-slate-900">{dynamicStats.activeUsers}</p>
                <p className="text-sm text-green-600">{dynamicStats.monthlyGrowth.activeUsers > 0 ? '+' : ''}{dynamicStats.monthlyGrowth.activeUsers}% from last month</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="stat-card bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Contests</p>
                <p className="text-2xl font-bold text-slate-900">{dynamicStats.totalContests}</p>
                <p className="text-sm text-green-600">{dynamicStats.monthlyGrowth.totalContests > 0 ? '+' : ''}{dynamicStats.monthlyGrowth.totalContests}% from last month</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="stat-card bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Submissions</p>
                <p className="text-2xl font-bold text-slate-900">{dynamicStats.totalSubmissions}</p>
                <p className="text-sm text-green-600">{dynamicStats.monthlyGrowth.totalSubmissions > 0 ? '+' : ''}{dynamicStats.monthlyGrowth.totalSubmissions}% from last month</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="chart-container bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">User Growth</h3>
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="flex flex-col items-center">
                  <Loader className="w-8 h-8 text-slate-400 mb-2 animate-spin loading-pulse" />
                  <p className="text-slate-500">Loading chart...</p>
                </div>
              </div>
            ) : (
              <div className="h-48 relative">
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="flex items-end justify-between h-full space-x-2">
                    {[120, 190, 300, 500, 200, 300].map((value, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="bg-blue-500 rounded-t w-full transition-all duration-500 hover:bg-blue-600"
                          style={{ height: `${(value / 500) * 100}%` }}
                        ></div>
                        <span className="text-xs text-slate-600 mt-2">
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-2 left-2 text-sm font-medium text-slate-700">
                    User Growth Trend
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Contest Participation Chart */}
          <div className="chart-container bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Contest Participation</h3>
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="flex flex-col items-center">
                  <Loader className="w-8 h-8 text-slate-400 mb-2 animate-spin loading-pulse" />
                  <p className="text-slate-500">Loading chart...</p>
                </div>
              </div>
            ) : (
              <div className="h-48 relative">
                <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                  <div className="flex items-center justify-center h-full">
                    <div className="grid grid-cols-2 gap-4 w-full">
                      {contestParticipation.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className={`w-4 h-4 ${item.color} rounded-full`}></div>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-slate-700">{item.name}</div>
                            <div className="text-xs text-slate-500">{item.value}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 text-sm font-medium text-slate-700">
                    Contest Categories
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Performing Categories */}
          <div className="chart-container bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Top Categories</h3>
            </div>
            <div className="space-y-4">
              {topCategories.map((category, index) => {
                const IconComponent = category.icon
                return (
                  <div key={index} className={`group ${getHoverClasses(category.color)} p-3 rounded-lg transition-all duration-200 cursor-pointer`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${getColorClasses(category.color)} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-900">{category.name}</span>
                      </div>
                      <span className={`text-lg font-bold ${
                        category.color === 'blue' ? 'text-blue-600' :
                        category.color === 'green' ? 'text-green-600' :
                        category.color === 'purple' ? 'text-purple-600' :
                        'text-yellow-600'
                      }`}>{category.percentage}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Student Activity */}
          <div className="chart-container bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Student Activity</h3>
            </div>
            <div className="space-y-4">
              {studentActivity.map((activity, index) => {
                const IconComponent = activity.icon
                return (
                  <div key={index} className={`group ${getHoverClasses(activity.color)} p-3 rounded-lg transition-all duration-200 cursor-pointer`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${getColorClasses(activity.color)} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-900">{activity.name}</span>
                      </div>
                      <span className={`text-lg font-bold ${
                        activity.color === 'blue' ? 'text-blue-600' :
                        activity.color === 'green' ? 'text-green-600' :
                        activity.color === 'purple' ? 'text-purple-600' :
                        'text-yellow-600'
                      }`}>{activity.value}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mentor Activity */}
          <div className="chart-container bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Mentor Activity</h3>
            </div>
            <div className="space-y-4">
              {mentorActivity.map((activity, index) => {
                const IconComponent = activity.icon
                return (
                  <div key={index} className={`group ${getHoverClasses(activity.color)} p-3 rounded-lg transition-all duration-200 cursor-pointer`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${getColorClasses(activity.color)} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-900">{activity.name}</span>
                      </div>
                      <span className={`text-lg font-bold ${
                        activity.color === 'blue' ? 'text-blue-600' :
                        activity.color === 'green' ? 'text-green-600' :
                        activity.color === 'purple' ? 'text-purple-600' :
                        'text-yellow-600'
                      }`}>{activity.value}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}