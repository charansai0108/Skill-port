'use client'

import { useState, useEffect } from 'react'
import { 
  Trophy, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical,
  ChevronDown,
  X,
  Loader,
  Shield,
  Users,
  BarChart3,
  Award,
  Code,
  Database,
  Target,
  Tag,
  Calendar,
  Play,
  Eye,
  LayoutDashboard,
  GraduationCap,
  EyeOff,
  AlertTriangle,
  UserPlus
} from 'lucide-react'
import Link from 'next/link'

interface Contest {
  id: number
  name: string
  description: string
  category: string
  batch: string
  status: string
  participants: number
  startDate: string
  endDate: string
  mentor: string
  icon: string
  color: string
}

interface DeletingContest {
  id: number
  name: string
}

export default function AdminContestsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingContest, setEditingContest] = useState<Contest | null>(null)
  const [deletingContest, setDeletingContest] = useState<DeletingContest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Sample contest data
  const [contests, setContests] = useState([
    {
      id: 1,
      name: 'Weekly Algorithm Challenge',
      description: 'Weekly competitive programming contest focusing on algorithms and problem-solving skills.',
      category: 'Algorithms',
      batch: '2024-25',
      status: 'active',
      participants: 156,
      startDate: '2025-01-15',
      endDate: '2025-01-22',
      mentor: 'Dr. Sarah Wilson',
      icon: 'code',
      color: 'blue'
    },
    {
      id: 2,
      name: 'Data Structures Master',
      description: 'Advanced contest focusing on data structure implementation and optimization.',
      category: 'Data Structures',
      batch: 'Spring 2025',
      status: 'upcoming',
      participants: 89,
      startDate: '2025-01-22',
      endDate: '2025-01-29',
      mentor: 'Prof. Michael Chen',
      icon: 'database',
      color: 'purple'
    },
    {
      id: 3,
      name: 'Dynamic Programming Contest',
      description: 'Expert-level contest covering advanced dynamic programming techniques.',
      category: 'Dynamic Programming',
      batch: 'Batch A',
      status: 'completed',
      participants: 203,
      startDate: '2025-01-08',
      endDate: '2025-01-15',
      mentor: 'Dr. Emily Rodriguez',
      icon: 'target',
      color: 'green'
    },
    {
      id: 4,
      name: 'Graph Theory Challenge',
      description: 'Comprehensive contest covering graph algorithms and network analysis.',
      category: 'Graph Theory',
      batch: '2024-25',
      status: 'active',
      participants: 134,
      startDate: '2025-01-20',
      endDate: '2025-01-27',
      mentor: 'Prof. David Kim',
      icon: 'target',
      color: 'indigo'
    },
    {
      id: 5,
      name: 'Mathematics Olympiad',
      description: 'Mathematical problem-solving contest with advanced mathematical concepts.',
      category: 'Mathematics',
      batch: 'Spring 2025',
      status: 'upcoming',
      participants: 67,
      startDate: '2025-02-01',
      endDate: '2025-02-08',
      mentor: 'Dr. Lisa Thompson',
      icon: 'target',
      color: 'yellow'
    },
    {
      id: 6,
      name: 'String Algorithms Contest',
      description: 'Specialized contest focusing on string manipulation and pattern matching.',
      category: 'String Algorithms',
      batch: 'Batch B',
      status: 'completed',
      participants: 98,
      startDate: '2025-01-10',
      endDate: '2025-01-17',
      mentor: 'Dr. Rajesh Kumar',
      icon: 'code',
      color: 'pink'
    }
  ])

  const [currentContests, setCurrentContests] = useState([...contests])

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredContests = currentContests.filter(contest => {
    const matchesSearch = contest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contest.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contest.batch.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || contest.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100/80 backdrop-blur-sm text-green-800 border border-green-200/50'
      case 'upcoming':
        return 'bg-blue-100/80 backdrop-blur-sm text-blue-800 border border-blue-200/50'
      case 'completed':
        return 'bg-gray-100/80 backdrop-blur-sm text-gray-800 border border-gray-200/50'
      default:
        return 'bg-yellow-100/80 backdrop-blur-sm text-yellow-800 border border-yellow-200/50'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'upcoming':
        return 'Upcoming'
      case 'completed':
        return 'Completed'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case 'code':
        return Code
      case 'database':
        return Database
      case 'target':
        return Target
      default:
        return Trophy
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'from-blue-500/90 to-blue-600/90'
      case 'purple':
        return 'from-purple-500/90 to-purple-600/90'
      case 'green':
        return 'from-green-500/90 to-green-600/90'
      case 'indigo':
        return 'from-indigo-500/90 to-indigo-600/90'
      case 'yellow':
        return 'from-yellow-500/90 to-yellow-600/90'
      case 'pink':
        return 'from-pink-500/90 to-pink-600/90'
      default:
        return 'from-blue-500/90 to-blue-600/90'
    }
  }

  const handleContestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const contestData = {
      name: formData.get('contestName') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      batch: formData.get('batch') as string,
      mentor: formData.get('mentor') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string
    }

    const newContest = {
      id: contests.length + 1,
      ...contestData,
      status: 'upcoming',
      participants: 0,
      icon: 'trophy',
      color: 'blue'
    }

    setContests([...contests, newContest])
    setCurrentContests([...contests, newContest])
    setShowCreateModal(false)
    alert('Contest created successfully!')
  }

  const handleContestUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const contestData = {
      name: formData.get('contestName') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      batch: formData.get('batch') as string,
      mentor: formData.get('mentor') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string
    }

    const updatedContests = contests.map(contest => 
      contest.id === editingContest?.id 
        ? { ...contest, ...contestData }
        : contest
    )
    
    setContests(updatedContests)
    setCurrentContests(updatedContests)
    setShowEditModal(false)
    setEditingContest(null)
    alert('Contest updated successfully!')
  }

  const deleteContest = (contestId: number, contestName: string) => {
    setDeletingContest({ id: contestId, name: contestName })
    setShowDeleteModal(true)
  }

  const confirmDeleteContest = () => {
    if (deletingContest) {
      const updatedContests = contests.filter(c => c.id !== deletingContest.id)
      setContests(updatedContests)
      setCurrentContests(updatedContests)
      setShowDeleteModal(false)
      setDeletingContest(null)
      alert('Contest deleted successfully!')
    }
  }

         const editContest = (contest: Contest) => {
    setEditingContest(contest)
    setShowEditModal(true)
  }

  const viewContest = (contest: Contest) => {
    alert(`Viewing contest: ${contest.name}`)
  }

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                PW IOI
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/admin/dashboard" className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/admin/users" className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                <Users className="w-4 h-4" />
                Students
              </Link>
              <Link href="/admin/mentors" className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                <GraduationCap className="w-4 h-4" />
                Mentors
              </Link>
              <Link href="/admin/contests" className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 shadow-sm">
                <Trophy className="w-4 h-4" />
                Contests
              </Link>
              <Link href="/admin/analytics" className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
              <Link href="/admin/leaderboard" className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                <Award className="w-4 h-4" />
                Leaderboard
              </Link>
              <Link href="/admin/profile" className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
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
            <Link href="/admin/dashboard" className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/admin/users" className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
              <Users className="w-4 h-4" />
              Students
            </Link>
            <Link href="/admin/mentors" className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
              <Users className="w-4 h-4" />
              Mentors
            </Link>
            <Link href="/admin/contests" className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200 transition-all flex items-center gap-3">
              <Trophy className="w-4 h-4" />
              Contests
            </Link>
            <Link href="/admin/analytics" className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
            <Link href="/admin/leaderboard" className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
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
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-700">Contest Management</h1>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card bg-white rounded-lg shadow-lg p-6 border border-slate-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Contests</p>
                <p className="text-2xl font-bold text-slate-900">24</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-white rounded-lg shadow-lg p-6 border border-slate-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Contests</p>
                <p className="text-2xl font-bold text-slate-900">8</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Play className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-white rounded-lg shadow-lg p-6 border border-slate-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Participants</p>
                <p className="text-2xl font-bold text-slate-900">1,247</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Contest Cards Section */}
        <div className="space-y-6">
          {/* Header with Search and Filters */}
          <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-900">Recent Contests</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search contests..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/80 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 w-64 transition-all hover:bg-white/90"
                  />
                </div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white/80 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all hover:bg-white/90"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-red-500/90 to-orange-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:from-red-600/90 hover:to-orange-600/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Create Contest
                </button>
              </div>
            </div>
          </div>

          {/* Contest Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-2 flex justify-center items-center py-12">
                <div className="flex flex-col items-center">
                  <Loader className="w-8 h-8 text-slate-400 mb-2 animate-spin loading-pulse" />
                  <p className="text-slate-500">Loading contests...</p>
                </div>
              </div>
            ) : filteredContests.length === 0 ? (
              <div className="col-span-2 flex justify-center items-center py-12">
                <div className="flex flex-col items-center">
                  <Trophy className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-slate-500">No contests found</p>
                  <p className="text-sm text-slate-400 mt-1">Create your first contest to get started</p>
                </div>
              </div>
            ) : (
              filteredContests.map((contest) => {
                const IconComponent = getIconComponent(contest.icon)
                const colorClasses = getColorClasses(contest.color)
                
                return (
                  <div key={contest.id} className="contest-card bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20 hover:shadow-xl hover:bg-white/80 transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses} backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(contest.status)}`}>
                        {getStatusLabel(contest.status)}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">{contest.name}</h4>
                    <p className="text-sm text-slate-600 mb-5 leading-relaxed">{contest.description}</p>
                    
                    {/* Contest Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      {/* Category */}
                      <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/60 backdrop-blur-sm rounded-lg p-3 border border-blue-200/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Tag className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Category</span>
                        </div>
                        <span className="text-sm font-semibold text-blue-900">{contest.category}</span>
                      </div>
                      
                      {/* Batch */}
                      <div className="bg-gradient-to-br from-yellow-50/80 to-yellow-100/60 backdrop-blur-sm rounded-lg p-3 border border-yellow-200/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-yellow-600" />
                          <span className="text-xs font-medium text-yellow-700 uppercase tracking-wide">Batch</span>
                        </div>
                        <span className="text-sm font-semibold text-yellow-900">{contest.batch}</span>
                      </div>
                      
                      {/* Participants */}
                      <div className="bg-gradient-to-br from-green-50/80 to-green-100/60 backdrop-blur-sm rounded-lg p-3 border border-green-200/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Participants</span>
                        </div>
                        <span className="text-sm font-semibold text-green-900">{contest.participants}</span>
                      </div>
                      
                      {/* Start Date */}
                      <div className="bg-gradient-to-br from-purple-50/80 to-purple-100/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">Start Date</span>
                        </div>
                        <span className="text-sm font-semibold text-purple-900">{contest.startDate}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 w-full">
                      <button 
                        onClick={() => editContest(contest)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500/90 to-blue-600/90 backdrop-blur-sm text-white rounded-lg text-sm hover:from-blue-600/90 hover:to-blue-700/90 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => viewContest(contest)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500/90 to-green-600/90 backdrop-blur-sm text-white rounded-lg text-sm hover:from-green-600/90 hover:to-green-700/90 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        {contest.status === 'completed' ? 'View Results' : 'View'}
                      </button>
                      <button 
                        onClick={() => deleteContest(contest.id, contest.name)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500/90 to-red-600/90 backdrop-blur-sm text-white rounded-lg text-sm hover:from-red-600/90 hover:to-red-700/90 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Load More Button */}
          <div className="text-center pt-4">
            <button className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm text-slate-700 border border-white/30 rounded-lg hover:bg-white/90 hover:border-white/50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              <ChevronDown className="w-4 h-4 mr-2" />
              Load More Contests
            </button>
          </div>
        </div>
      </main>

      {/* Create Contest Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="modal-content bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[75vh] overflow-y-auto scrollbar-hide">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">Create New Contest</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleContestSubmit} className="p-6 space-y-6">
              {/* Contest Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contest Name *</label>
                <input 
                  type="text" 
                  name="contestName" 
                  className="form-input w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-300 hover:shadow-md" 
                  placeholder="Enter contest name" 
                  required 
                />
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
                <textarea 
                  name="description" 
                  rows={3} 
                  className="form-input w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-300 hover:shadow-md resize-none" 
                  placeholder="Describe the contest..." 
                  required 
                />
              </div>
              
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
                <input 
                  type="text" 
                  name="category" 
                  className="form-input w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-300 hover:shadow-md" 
                  placeholder="e.g., Algorithms, Data Structures" 
                  required 
                />
              </div>
              
              {/* Batch */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Batch *</label>
                <input 
                  type="text" 
                  name="batch" 
                  className="form-input w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-300 hover:shadow-md" 
                  placeholder="e.g., 2024-25, Spring 2025, Batch A" 
                  required 
                />
              </div>
              
              {/* Mentor Assignment */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Assign Mentor *</label>
                <select 
                  name="mentor" 
                  className="form-input w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-300 hover:shadow-md" 
                  required
                >
                  <option value="">Select a mentor</option>
                  <option value="mentor1">Dr. Sarah Wilson - Algorithms Expert</option>
                  <option value="mentor2">Prof. Michael Chen - Data Structures</option>
                  <option value="mentor3">Dr. Emily Rodriguez - Dynamic Programming</option>
                  <option value="mentor4">Prof. David Kim - Graph Theory</option>
                  <option value="mentor5">Dr. Lisa Thompson - Mathematics</option>
                </select>
              </div>
              
              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date *</label>
                <input 
                  type="date" 
                  name="startDate" 
                  className="form-input w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-300 hover:shadow-md" 
                  required 
                />
              </div>
              
              {/* End Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">End Date *</label>
                <input 
                  type="date" 
                  name="endDate" 
                  className="form-input w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-300 hover:shadow-md" 
                  required 
                />
              </div>
              
              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Create Contest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contest Modal */}
      {showEditModal && editingContest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="modal-content bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[75vh] overflow-y-auto scrollbar-hide">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">Edit Contest</h3>
                <button 
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingContest(null)
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleContestUpdate} className="p-6 space-y-6">
              {/* Contest Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contest Name *</label>
                <input 
                  type="text" 
                  name="contestName" 
                  defaultValue={editingContest.name}
                  className="form-input w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-300 hover:shadow-md" 
                  placeholder="Enter contest name" 
                  required 
                />
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
                <textarea 
                  name="description" 
                  rows={3} 
                  defaultValue={editingContest.description}
                  className="form-input w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-300 hover:shadow-md resize-none" 
                  placeholder="Describe the contest..." 
                  required 
                />
              </div>
              
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
                <input 
                  type="text" 
                  name="category" 
                  defaultValue={editingContest.category}
                  className="form-input w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-300 hover:shadow-md" 
                  placeholder="e.g., Algorithms, Data Structures" 
                  required 
                />
              </div>
              
              {/* Batch */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Batch *</label>
                <input 
                  type="text" 
                  name="batch" 
                  defaultValue={editingContest.batch}
                  className="form-input w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-300 hover:shadow-md" 
                  placeholder="e.g., 2024-25, Spring 2025, Batch A" 
                  required 
                />
              </div>
              
              {/* Mentor Assignment */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Assign Mentor *</label>
                <select 
                  name="mentor" 
                  defaultValue={editingContest.mentor}
                  className="form-input w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-300 hover:shadow-md" 
                  required
                >
                  <option value="">Select a mentor</option>
                  <option value="mentor1">Dr. Sarah Wilson - Algorithms Expert</option>
                  <option value="mentor2">Prof. Michael Chen - Data Structures</option>
                  <option value="mentor3">Dr. Emily Rodriguez - Dynamic Programming</option>
                  <option value="mentor4">Prof. David Kim - Graph Theory</option>
                  <option value="mentor5">Dr. Lisa Thompson - Mathematics</option>
                </select>
              </div>
              
              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date *</label>
                <input 
                  type="date" 
                  name="startDate" 
                  defaultValue={editingContest.startDate}
                  className="form-input w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-300 hover:shadow-md" 
                  required 
                />
              </div>
              
              {/* End Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">End Date *</label>
                <input 
                  type="date" 
                  name="endDate" 
                  defaultValue={editingContest.endDate}
                  className="form-input w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-300 hover:shadow-md" 
                  required 
                />
              </div>
              
              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingContest(null)
                  }}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Update Contest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingContest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Delete Contest</h3>
                  <p className="text-sm text-slate-600">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">{deletingContest.name}</span>? 
                This will permanently remove the contest and all associated data.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletingContest(null)
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteContest}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Contest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}