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
  Activity
} from 'lucide-react'
import Link from 'next/link'

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="stat-card bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <p className="text-2xl font-bold text-slate-900">1,247</p>
                <p className="text-sm text-green-600">+12 this week</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="stat-card bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Mentors</p>
                <p className="text-2xl font-bold text-slate-900">23</p>
                <p className="text-sm text-green-600">+3 this month</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="stat-card bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Contests</p>
                <p className="text-2xl font-bold text-slate-900">8</p>
                <p className="text-sm text-green-600">+2 this month</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="stat-card bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Problems Solved</p>
                <p className="text-2xl font-bold text-slate-600">3,456</p>
                <p className="text-sm text-green-600">+89 this week</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Community Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="dashboard-card bg-white rounded-lg shadow-lg p-6 h-80">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
            <div className="space-y-4 h-64 overflow-y-auto">
              <div className="text-center py-8">
                <div className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-spin">⟳</div>
                <p className="text-sm text-slate-500">Loading recent activity...</p>
              </div>
            </div>
          </div>

          {/* Community Insights */}
          <div className="dashboard-card bg-white rounded-lg shadow-lg p-6 h-80">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Community Insights</h2>
            <div className="space-y-4 h-64 overflow-y-auto">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-900">Active Users Today</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">24</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-slate-900">New Registrations</span>
                </div>
                <span className="text-sm font-semibold text-green-600">8</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-slate-900">Community Posts</span>
                </div>
                <span className="text-sm font-semibold text-amber-600">12</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-slate-900">Contest Submissions</span>
                </div>
                <span className="text-sm font-semibold text-purple-600">45</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users & Mentors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Recent Users</h2>
              <Link href="/admin/users" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</Link>
            </div>
            <div className="space-y-3 h-64 overflow-y-auto">
              <div className="text-center py-8">
                <div className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-spin">⟳</div>
                <p className="text-sm text-slate-500">Loading recent users...</p>
              </div>
            </div>
          </div>

          {/* Recent Mentors */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Recent Mentors</h2>
              <Link href="/admin/mentors" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</Link>
            </div>
            <div className="space-y-3 h-64 overflow-y-auto">
              <div className="text-center py-8">
                <div className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-spin">⟳</div>
                <p className="text-sm text-slate-500">Loading recent mentors...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <Link href="/admin/users" className="action-card bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all group cursor-pointer">
              <UserPlus className="w-12 h-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-900 mb-2">Add New User</h3>
              <p className="text-sm text-slate-600">Create user account with credentials</p>
            </Link>
            <Link href="/admin/mentors" className="action-card bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all group cursor-pointer">
              <GraduationCap className="w-12 h-12 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-900 mb-2">Add New Mentor</h3>
              <p className="text-sm text-slate-600">Create mentor account and assign</p>
            </Link>
            <Link href="/admin/contests" className="action-card bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all group cursor-pointer">
              <PlusCircle className="w-12 h-12 text-amber-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-900 mb-2">Create Contest</h3>
              <p className="text-sm text-slate-600">Set up new contest and assign mentor</p>
            </Link>
            <Link href="/admin/analytics" className="action-card bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all group cursor-pointer">
              <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-900 mb-2">View Analytics</h3>
              <p className="text-sm text-slate-600">System-wide performance reports</p>
            </Link>
            <Link href="/admin/leaderboard" className="action-card bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all group cursor-pointer">
              <Award className="w-12 h-12 text-indigo-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-900 mb-2">View Leaderboard</h3>
              <p className="text-sm text-slate-600">Overall system rankings</p>
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