'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Award,
  Target,
  LayoutDashboard,
  GraduationCap,
  Trophy,
  BarChart3,
  Shield,
  X,
  Loader,
  Award as AwardIcon,
  Eye,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'
import { AdminCard } from '@/components/ui/AdminCard'
import { AdminButton } from '@/components/ui/AdminButton'
import { AdminInput } from '@/components/ui/AdminInput'
import { AdminTable, AdminTableHeader, AdminTableBody, AdminTableRow, AdminTableCell, AdminTableHeaderCell } from '@/components/ui/AdminTable'
import { AdminModal } from '@/components/ui/AdminModal'
import { AdminAvatar } from '@/components/ui/AdminAvatar'

export default function CommunityStudentsPage() {
  const params = useParams()
  const communitySlug = params.communitySlug as string
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [batchFilter, setBatchFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [communityData, setCommunityData] = useState<any>(null)
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    avgRating: 0,
    monthlyGrowth: {
      total: 0,
      active: 0,
      inactive: 0,
      rating: 0
    }
  })

  const usersPerPage = 10

  // Pagination calculations
  const startIndex = (currentPage - 1) * usersPerPage
  const endIndex = startIndex + usersPerPage

  // Fetch community data and stats
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

  // Fetch students from API
  useEffect(() => {
    fetchStudents()
    fetchCommunityData()
  }, [currentPage, searchTerm, statusFilter, batchFilter])

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: usersPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(batchFilter !== 'all' && { batchId: batchFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/community/${communitySlug}/students?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch students')
      }

      const result = await response.json()
      const students = result.data.students || []
      setUsers(students)
      setBatches(result.data.batches || [])
      setTotalPages(result.data.pagination.totalPages)
      setTotal(result.data.pagination.total)
      
      // Calculate stats
      const activeStudents = students.filter((u: any) => u.status === 'active').length
      const inactiveStudents = students.filter((u: any) => u.status === 'inactive').length
      const avgRating = students.length > 0 
        ? students.reduce((sum: number, u: any) => sum + (u.rating || 0), 0) / students.length 
        : 0
      
      setStats({
        totalStudents: students.length,
        activeStudents,
        inactiveStudents,
        avgRating: Math.round(avgRating * 10) / 10,
        monthlyGrowth: {
          total: 0, // TODO: Calculate from historical data
          active: 0,
          inactive: 0,
          rating: 0
        }
      })
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // OLD hardcoded data removed - now using API
  /*
  const [oldUsers] = useState([
    {
      id: 1,
      firstName: 'Rahul',
      lastName: 'Kumar',
      username: 'rahulkumar',
      email: 'rahul.kumar@student.com',
      status: 'active',
      joined: '2024-01-15',
      problemsSolved: 45,
      rating: 4.2
    },
    {
      id: 2,
      firstName: 'Priya',
      lastName: 'Sharma',
      username: 'priyasharma',
      email: 'priya.sharma@student.com',
      status: 'active',
      joined: '2024-01-10',
      problemsSolved: 32,
      rating: 3.8
    },
    {
      id: 3,
      firstName: 'Amit',
      lastName: 'Patel',
      username: 'amitpatel',
      email: 'amit.patel@student.com',
      status: 'active',
      joined: '2024-01-05',
      problemsSolved: 67,
      rating: 4.5
    },
    {
      id: 4,
      firstName: 'Neha',
      lastName: 'Singh',
      username: 'nehasingh',
      email: 'neha.singh@student.com',
      status: 'active',
      joined: '2024-01-20',
      problemsSolved: 28,
      rating: 3.9
    },
    {
      id: 5,
      firstName: 'Vikram',
      lastName: 'Verma',
      username: 'vikramverma',
      email: 'vikram.verma@student.com',
      status: 'inactive',
      joined: '2024-01-12',
      problemsSolved: 15,
      rating: 3.2
    },
    {
      id: 6,
      firstName: 'Anjali',
      lastName: 'Gupta',
      username: 'anjaligupta',
      email: 'anjali.gupta@student.com',
      status: 'active',
      joined: '2024-01-18',
      problemsSolved: 53,
      rating: 4.1
    },
    {
      id: 7,
      firstName: 'Rajesh',
      lastName: 'Malhotra',
      username: 'rajeshmalhotra',
      email: 'rajesh.malhotra@student.com',
      status: 'inactive',
      joined: '2024-01-08',
      problemsSolved: 22,
      rating: 2.8
    },
    {
      id: 8,
      firstName: 'Sneha',
      lastName: 'Kapoor',
      username: 'snehakapoor',
      email: 'sneha.kapoor@student.com',
      status: 'active',
      joined: '2024-01-22',
      problemsSolved: 41,
      rating: 4.0
    },
    {
      id: 9,
      firstName: 'Arjun',
      lastName: 'Reddy',
      username: 'arjunreddy',
      email: 'arjun.reddy@student.com',
      status: 'active',
      joined: '2024-01-25',
      problemsSolved: 38,
      rating: 3.7
    },
    {
      id: 10,
      firstName: 'Kavya',
      lastName: 'Nair',
      username: 'kavyanair',
      email: 'kavya.nair@student.com',
      status: 'active',
      joined: '2024-01-28',
      problemsSolved: 29,
      rating: 3.6
    }
  ])
  */

  // Filtering now handled by API
  const filteredUsers = users
  const currentUsers = users
  const pageUsers = users // Pagination now handled by API

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const userData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string
    }

    const newUser = {
      id: users.length + 1,
      ...userData,
      status: 'active',
      joined: new Date().toISOString().split('T')[0],
      problemsSolved: 0,
      rating: 0
    }

    setUsers([...users, newUser])
    setCurrentUsers([...users, newUser])
    setShowAddModal(false)
    alert('User added successfully!')
  }

  const deleteUser = (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(u => u.id !== userId)
      setUsers(updatedUsers)
      setCurrentUsers(updatedUsers)
      alert('User deleted successfully!')
    }
  }

  const editUser = (userId: number) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setEditingUser(user)
      setShowAddModal(true)
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
                <Users className="w-5 h-5 text-white" />
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
            <Link href={`/community/${communitySlug}/students`} className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200 transition-all flex items-center gap-3">
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
            <Link href={`/community/${communitySlug}/analytics`} className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
            <Link href={`/community/${communitySlug}/leaderboard`} className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
              <AwardIcon className="w-4 h-4" />
              Leaderboard
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-content">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
                <p className="text-gray-600">Manage and monitor all student accounts</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AdminButton variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </AdminButton>
              <AdminButton variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </AdminButton>
              <AdminButton variant="primary" onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </AdminButton>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <AdminCard hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                <p className="text-xs text-green-600">+{stats.monthlyGrowth.total} this month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </AdminCard>
          
          <AdminCard hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeStudents}</p>
                <p className="text-xs text-green-600">+{stats.monthlyGrowth.active} this month</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </AdminCard>
          
          <AdminCard hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactiveStudents}</p>
                <p className="text-xs text-red-600">{stats.monthlyGrowth.inactive < 0 ? '' : '+'}{stats.monthlyGrowth.inactive} this month</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </AdminCard>
          
          <AdminCard hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
                <p className="text-xs text-green-600">+{stats.monthlyGrowth.rating} this month</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Search and Filters */}
        <AdminCard className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <AdminInput
                placeholder="Search students by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <AdminButton variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </AdminButton>
              <AdminButton variant="ghost" size="sm">
                <RefreshCw className="w-4 h-4" />
              </AdminButton>
            </div>
          </div>
        </AdminCard>

        {/* Users Table */}
        <AdminTable>
          <AdminTableHeader>
            <AdminTableHeaderCell>Student</AdminTableHeaderCell>
            <AdminTableHeaderCell>Email</AdminTableHeaderCell>
            <AdminTableHeaderCell align="center">Status</AdminTableHeaderCell>
            <AdminTableHeaderCell align="center">Joined</AdminTableHeaderCell>
            <AdminTableHeaderCell align="center">Rating</AdminTableHeaderCell>
            <AdminTableHeaderCell align="center">Actions</AdminTableHeaderCell>
          </AdminTableHeader>
          <AdminTableBody>
            {isLoading ? (
              <AdminTableRow>
                <AdminTableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <Loader className="w-8 h-8 text-gray-400 mb-2 animate-spin" />
                    <p className="text-gray-500">Loading students...</p>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ) : pageUsers.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <Users className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-gray-500">No students found</p>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              pageUsers.map((user) => (
                <AdminTableRow key={user.id} hover>
                  <AdminTableCell>
                    <div className="flex items-center gap-3">
                      <AdminAvatar
                        src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`}
                        size="md"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{user.email}</span>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell align="center">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </AdminTableCell>
                  <AdminTableCell align="center">
                    <div className="flex items-center gap-2 justify-center">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{user.joined}</span>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell align="center">
                    <div className="flex items-center gap-1 justify-center">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-gray-900">{user.rating}</span>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell align="center">
                    <div className="flex items-center gap-2 justify-center">
                      <AdminButton variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </AdminButton>
                      <AdminButton variant="ghost" size="sm" onClick={() => editUser(user.id)}>
                        <Edit className="w-4 h-4" />
                      </AdminButton>
                      <AdminButton variant="ghost" size="sm" onClick={() => deleteUser(user.id)}>
                        <Trash2 className="w-4 h-4" />
                      </AdminButton>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ))
            )}
          </AdminTableBody>
        </AdminTable>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-8">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} students
          </div>
          <div className="flex items-center gap-2">
            <AdminButton 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </AdminButton>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-300 ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
            <AdminButton 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </AdminButton>
          </div>
        </div>
      </main>

      {/* Add/Edit User Modal */}
      <AdminModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setEditingUser(null)
        }}
        title={editingUser ? 'Edit Student' : 'Add New Student'}
        size="md"
      >
        <form onSubmit={handleUserSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput
              label="First Name"
              name="firstName"
              defaultValue={editingUser?.firstName || ''}
              required
              helperText="Enter the student's first name"
            />
            <AdminInput
              label="Last Name"
              name="lastName"
              defaultValue={editingUser?.lastName || ''}
              required
              helperText="Enter the student's last name"
            />
          </div>
          
          <AdminInput
            label="Username"
            name="username"
            defaultValue={editingUser?.username || ''}
            required
            helperText="Choose a unique username"
          />
          
          <AdminInput
            label="Email Address"
            name="email"
            type="email"
            defaultValue={editingUser?.email || ''}
            required
            helperText="Enter a valid email address"
            icon={<Mail className="w-4 h-4" />}
          />
          
          <AdminInput
            label="Password"
            name="password"
            type="password"
            required
            helperText="Enter a secure password"
          />
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <AdminButton
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setEditingUser(null)
              }}
            >
              Cancel
            </AdminButton>
            <AdminButton
              type="submit"
              variant="primary"
            >
              {editingUser ? 'Update Student' : 'Add Student'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}