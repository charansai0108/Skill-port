// app/admin/dashboard/page.tsx
import { 
  Users, 
  UserCheck, 
  Trophy, 
  CheckCircle, 
  UserPlus, 
  MessageCircle, 
  Flag, 
  TrendingUp,
  BarChart3,
  LayoutDashboard,
  User,
  LogOut,
  Shield,
  GraduationCap,
  Award,
  PlusCircle,
  Target,
  Clock,
  AlertCircle,
  FileText,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'
import { AdminCard } from '@/components/ui/AdminCard'
import { AdminButton } from '@/components/ui/AdminButton'

export default function AdminDashboardPage() {
  return (
    <div>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-content">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-700 leading-snug">Dashboard</h1>
            </div>
          </div>
        </div>

        {/* System Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AdminCard hover className="group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+12 this week</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">1,247</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-3/4 transition-all duration-500"></div>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </AdminCard>

          <AdminCard hover className="group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-medium text-gray-600">Active Mentors</p>
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+3 this month</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">23</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full w-5/6 transition-all duration-500"></div>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
            </div>
          </AdminCard>

          <AdminCard hover className="group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-medium text-gray-600">Active Contests</p>
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+2 this month</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">8</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full w-1/2 transition-all duration-500"></div>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-7 h-7 text-white" />
              </div>
            </div>
          </AdminCard>

          <AdminCard hover className="group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-medium text-gray-600">Problems Solved</p>
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+89 this week</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">3,456</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full w-11/12 transition-all duration-500"></div>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="w-7 h-7 text-white" />
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Recent Activity & Community Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <AdminCard className="h-96">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <AdminButton variant="ghost" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View All
              </AdminButton>
            </div>
            <div className="space-y-4 h-64 overflow-y-auto">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">New student registered</p>
                  <p className="text-xs text-gray-600 mt-1">John Doe joined the platform</p>
                  <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Contest completed</p>
                  <p className="text-xs text-gray-600 mt-1">Weekly Challenge #3 finished</p>
                  <p className="text-xs text-gray-500 mt-1">15 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">New community post</p>
                  <p className="text-xs text-gray-600 mt-1">Algorithm discussion started</p>
                  <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                </div>
              </div>
            </div>
          </AdminCard>

          {/* Community Insights */}
          <AdminCard className="h-96">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Community Insights</h2>
              <AdminButton variant="ghost" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </AdminButton>
            </div>
            <div className="space-y-4 h-64 overflow-y-auto">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Active Users Today</span>
                    <p className="text-xs text-gray-600">Online right now</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-600">24</span>
                  <p className="text-xs text-green-600">+12% from yesterday</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">New Registrations</span>
                    <p className="text-xs text-gray-600">This week</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-green-600">8</span>
                  <p className="text-xs text-green-600">+3 from last week</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Community Posts</span>
                    <p className="text-xs text-gray-600">Today</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-amber-600">12</span>
                  <p className="text-xs text-green-600">+5 from yesterday</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Contest Submissions</span>
                    <p className="text-xs text-gray-600">This week</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-purple-600">45</span>
                  <p className="text-xs text-green-600">+18 from last week</p>
                </div>
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Recent Users & Mentors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Users */}
          <AdminCard className="h-96">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
              <AdminButton variant="ghost" size="sm" asChild>
                <Link href="/admin/users">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Link>
              </AdminButton>
            </div>
            <div className="space-y-3 h-64 overflow-y-auto">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-600">john.doe@example.com</p>
                  <p className="text-xs text-gray-500 mt-1">Joined 2 hours ago</p>
                </div>
                <div className="flex items-center gap-2">
                  <AdminButton variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </AdminButton>
                  <AdminButton variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </AdminButton>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Sarah Wilson</p>
                  <p className="text-xs text-gray-600">sarah.wilson@example.com</p>
                  <p className="text-xs text-gray-500 mt-1">Joined 1 day ago</p>
                </div>
                <div className="flex items-center gap-2">
                  <AdminButton variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </AdminButton>
                  <AdminButton variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </AdminButton>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Mike Johnson</p>
                  <p className="text-xs text-gray-600">mike.johnson@example.com</p>
                  <p className="text-xs text-gray-500 mt-1">Joined 3 days ago</p>
                </div>
                <div className="flex items-center gap-2">
                  <AdminButton variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </AdminButton>
                  <AdminButton variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </AdminButton>
                </div>
              </div>
            </div>
          </AdminCard>

          {/* Recent Mentors */}
          <AdminCard className="h-96">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Mentors</h2>
              <AdminButton variant="ghost" size="sm" asChild>
                <Link href="/admin/mentors">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Link>
              </AdminButton>
            </div>
            <div className="space-y-3 h-64 overflow-y-auto">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Dr. Emily Chen</p>
                  <p className="text-xs text-gray-600">Algorithms Expert</p>
                  <p className="text-xs text-gray-500 mt-1">Joined 1 week ago</p>
                </div>
                <div className="flex items-center gap-2">
                  <AdminButton variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </AdminButton>
                  <AdminButton variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </AdminButton>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Prof. David Kim</p>
                  <p className="text-xs text-gray-600">Data Structures Specialist</p>
                  <p className="text-xs text-gray-500 mt-1">Joined 2 weeks ago</p>
                </div>
                <div className="flex items-center gap-2">
                  <AdminButton variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </AdminButton>
                  <AdminButton variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </AdminButton>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Lisa Rodriguez</p>
                  <p className="text-xs text-gray-600">System Design Expert</p>
                  <p className="text-xs text-gray-500 mt-1">Joined 3 weeks ago</p>
                </div>
                <div className="flex items-center gap-2">
                  <AdminButton variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </AdminButton>
                  <AdminButton variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </AdminButton>
                </div>
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <Link href="/admin/users" className="group">
              <AdminCard hover className="text-center h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Add New User</h3>
                <p className="text-sm text-gray-600">Create user account with credentials</p>
              </AdminCard>
            </Link>
            
            <Link href="/admin/mentors" className="group">
              <AdminCard hover className="text-center h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Add New Mentor</h3>
                <p className="text-sm text-gray-600">Create mentor account and assign</p>
              </AdminCard>
            </Link>
            
            <Link href="/admin/contests" className="group">
              <AdminCard hover className="text-center h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <PlusCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Create Contest</h3>
                <p className="text-sm text-gray-600">Set up new contest and assign mentor</p>
              </AdminCard>
            </Link>
            
            <Link href="/admin/analytics" className="group">
              <AdminCard hover className="text-center h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">View Analytics</h3>
                <p className="text-sm text-gray-600">System-wide performance reports</p>
              </AdminCard>
            </Link>
            
            <Link href="/admin/leaderboard" className="group">
              <AdminCard hover className="text-center h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">View Leaderboard</h3>
                <p className="text-sm text-gray-600">Overall system rankings</p>
              </AdminCard>
            </Link>
          </div>
        </div>

        {/* Alerts & Contest Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Alerts & Notifications */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Alerts & Notifications</h2>
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">3</span>
            </div>
            <div className="space-y-3 h-64 overflow-y-auto">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                <Flag className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Flagged Submission</p>
                  <p className="text-xs text-red-600">Contest: &ldquo;Array Problems&rdquo; - User: john_doe</p>
                </div>
                <button className="text-red-600 hover:text-red-800 text-xs">Review</button>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <UserCheck className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">Pending Mentor</p>
                  <p className="text-xs text-yellow-600">Sarah Wilson - Algorithms Expert</p>
                </div>
                <button className="text-yellow-600 hover:text-yellow-800 text-xs">Approve</button>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">System Alert</p>
                  <p className="text-xs text-blue-600">High contest participation detected</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-xs">View</button>
              </div>
            </div>
          </div>

          {/* Contest Management */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Contest Management</h2>
              <Link href="/admin/contests" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</Link>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">5</div>
                  <div className="text-xs text-green-600">Active Contests</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">2</div>
                  <div className="text-xs text-blue-600">Pending Start</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-medium text-amber-900">Contests needing mentors</span>
                  </div>
                  <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">1</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-900">Total participants today</span>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">127</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-900">Submissions pending review</span>
                  </div>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm font-bold">23</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance & Community Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Performance Metrics</h2>
              <Link href="/admin/analytics" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details</Link>
            </div>
            <div className="space-y-4 h-64 overflow-y-auto">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-slate-900">Contest Success Rate</span>
                </div>
                <span className="text-sm font-semibold text-green-600">87%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-900">Avg Mentor Response</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">2.3 hrs</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-slate-900">User Engagement</span>
                </div>
                <span className="text-sm font-semibold text-purple-600">73%</span>
              </div>
            </div>
          </div>

          {/* Community Health */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Community Health</h2>
              <Link href="/admin/analytics" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details</Link>
            </div>
            <div className="space-y-4 h-64 overflow-y-auto">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-slate-900">Weekly Growth</span>
                </div>
                <span className="text-sm font-semibold text-green-600">+12%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-900">Active Discussions</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">18</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-slate-900">Top Contributors</span>
                </div>
                <span className="text-sm font-semibold text-amber-600">24</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}