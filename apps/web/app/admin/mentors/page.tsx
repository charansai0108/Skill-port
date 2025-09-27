'use client'

import { useState, useEffect } from 'react'
import { 
  GraduationCap, 
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
  X,
  Loader,
  Shield,
  Users,
  Trophy,
  BarChart3,
  Award as AwardIcon,
  Eye,
  EyeOff,
  AlertTriangle,
  UserPlus,
  Download,
  Upload,
  RefreshCw,
  Star,
  BookOpen,
  User,
  AtSign,
  Lock,
  Save
} from 'lucide-react'
import Link from 'next/link'
import { AdminCard } from '@/components/ui/AdminCard'
import { AdminButton } from '@/components/ui/AdminButton'
import { AdminInput } from '@/components/ui/AdminInput'
import { AdminTable, AdminTableHeader, AdminTableBody, AdminTableRow, AdminTableCell, AdminTableHeaderCell } from '@/components/ui/AdminTable'
import { AdminModal } from '@/components/ui/AdminModal'
import { AdminAvatar } from '@/components/ui/AdminAvatar'

interface Mentor {
  id: number
  firstName: string
  lastName: string
  email: string
  username: string
  specialization: string
  status: string
  createdAt: string
  mentorStats: {
    totalStudents: number
    activeContests: number
    averageRating: number
  }
}

interface DeletingMentor {
  id: number
  name: string
}

export default function AdminMentorsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null)
  const [deletingMentor, setDeletingMentor] = useState<DeletingMentor | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const mentorsPerPage = 9

  // Sample mentor data
  const [mentors, setMentors] = useState([
    {
      id: 1,
      firstName: 'Dr. Rajesh',
      lastName: 'Kumar',
      email: 'rajesh.kumar@mentor.com',
      username: 'drrajeshkumar',
      specialization: 'Algorithms & Data Structures',
      status: 'active',
      createdAt: '2024-01-15',
      mentorStats: {
        totalStudents: 15,
        activeContests: 3,
        averageRating: 4.8
      }
    },
    {
      id: 2,
      firstName: 'Prof. Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@mentor.com',
      username: 'priyasharma',
      specialization: 'Mathematics & Graph Theory',
      status: 'active',
      createdAt: '2024-01-10',
      mentorStats: {
        totalStudents: 12,
        activeContests: 2,
        averageRating: 4.6
      }
    },
    {
      id: 3,
      firstName: 'Amit',
      lastName: 'Patel',
      email: 'amit.patel@mentor.com',
      username: 'amitpatel',
      specialization: 'Dynamic Programming',
      status: 'active',
      createdAt: '2024-01-05',
      mentorStats: {
        totalStudents: 18,
        activeContests: 4,
        averageRating: 4.9
      }
    },
    {
      id: 4,
      firstName: 'Neha',
      lastName: 'Singh',
      email: 'neha.singh@mentor.com',
      username: 'nehasingh',
      specialization: 'String Algorithms',
      status: 'inactive',
      createdAt: '2024-01-20',
      mentorStats: {
        totalStudents: 8,
        activeContests: 1,
        averageRating: 4.2
      }
    },
    {
      id: 5,
      firstName: 'Vikram',
      lastName: 'Verma',
      email: 'vikram.verma@mentor.com',
      username: 'vikramverma',
      specialization: 'Array & Matrix Problems',
      status: 'active',
      createdAt: '2024-01-12',
      mentorStats: {
        totalStudents: 20,
        activeContests: 5,
        averageRating: 4.7
      }
    },
    {
      id: 6,
      firstName: 'Anjali',
      lastName: 'Gupta',
      email: 'anjali.gupta@mentor.com',
      username: 'anjaligupta',
      specialization: 'Competitive Programming',
      status: 'active',
      createdAt: '2024-01-18',
      mentorStats: {
        totalStudents: 25,
        activeContests: 6,
        averageRating: 4.9
      }
    }
  ])

  const [currentMentors, setCurrentMentors] = useState([...mentors])

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredMentors = currentMentors.filter(mentor => {
    const fullName = `${mentor.firstName} ${mentor.lastName}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         mentor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization = specializationFilter === 'all' || mentor.specialization.toLowerCase().includes(specializationFilter.toLowerCase())
    const matchesStatus = statusFilter === 'all' || mentor.status === statusFilter
    
    return matchesSearch && matchesSpecialization && matchesStatus
  })

  const totalPages = Math.ceil(filteredMentors.length / mentorsPerPage)
  const startIndex = (currentPage - 1) * mentorsPerPage
  const endIndex = startIndex + mentorsPerPage
  const pageMentors = filteredMentors.slice(startIndex, endIndex)

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

  const handleMentorSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const mentorData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      username: formData.get('username') as string,
      specialization: formData.get('specialization') as string,
      password: formData.get('password') as string
    }

    const newMentor = {
      id: mentors.length + 1,
      ...mentorData,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      mentorStats: {
        totalStudents: 0,
        activeContests: 0,
        averageRating: 0
      }
    }

    setMentors([...mentors, newMentor])
    setCurrentMentors([...mentors, newMentor])
    setShowAddModal(false)
    alert('Mentor added successfully!')
  }

  const handleMentorUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const mentorData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      username: formData.get('username') as string,
      specialization: formData.get('specialization') as string
    }

    const updatedMentors = mentors.map(mentor => 
      mentor.id === editingMentor?.id 
        ? { ...mentor, ...mentorData }
        : mentor
    )
    
    setMentors(updatedMentors)
    setCurrentMentors(updatedMentors)
    setShowEditModal(false)
    setEditingMentor(null)
    alert('Mentor updated successfully!')
  }

  const deleteMentor = (mentorId: number, mentorName: string) => {
    setDeletingMentor({ id: mentorId, name: mentorName })
    setShowDeleteModal(true)
  }

  const confirmDeleteMentor = () => {
    if (deletingMentor) {
      const updatedMentors = mentors.filter(m => m.id !== deletingMentor.id)
      setMentors(updatedMentors)
      setCurrentMentors(updatedMentors)
      setShowDeleteModal(false)
      setDeletingMentor(null)
      alert('Mentor deleted successfully!')
    }
  }

         const editMentor = (mentor: Mentor) => {
    setEditingMentor(mentor)
    setShowEditModal(true)
  }

  return (
    <div>
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
            <Link href="/admin/mentors" className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200 transition-all flex items-center gap-3">
              <GraduationCap className="w-4 h-4" />
              Mentors
            </Link>
            <Link href="/admin/contests" className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
              <Trophy className="w-4 h-4" />
              Contests
            </Link>
            <Link href="/admin/analytics" className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
            <Link href="/admin/leaderboard" className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
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
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mentor Management</h1>
                <p className="text-gray-600">Manage and monitor all mentor accounts</p>
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
                <UserPlus className="w-4 h-4 mr-2" />
                Add Mentor
              </AdminButton>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <AdminCard hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Mentors</p>
                <p className="text-2xl font-bold text-gray-900">{mentors.length}</p>
                <p className="text-xs text-green-600">+3 this month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </AdminCard>
          
          <AdminCard hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Mentors</p>
                <p className="text-2xl font-bold text-gray-900">{mentors.filter(m => m.status === 'active').length}</p>
                <p className="text-xs text-green-600">+2 this month</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </AdminCard>
          
          <AdminCard hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{mentors.reduce((sum, m) => sum + m.mentorStats.totalStudents, 0)}</p>
                <p className="text-xs text-green-600">+15 this month</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </AdminCard>
          
          <AdminCard hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.2</p>
                <p className="text-xs text-green-600">+0.3 this month</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Search and Filters */}
        <AdminCard className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <AdminInput
                placeholder="Search mentors by name, email, or specialization..."
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

        {/* Mentors Table */}
        <AdminTable>
          <AdminTableHeader>
            <AdminTableHeaderCell className="w-1/5">Mentor</AdminTableHeaderCell>
            <AdminTableHeaderCell className="w-1/5">Email</AdminTableHeaderCell>
            <AdminTableHeaderCell className="w-1/5">Specialization</AdminTableHeaderCell>
            <AdminTableHeaderCell className="w-1/5" align="center">Actions</AdminTableHeaderCell>
          </AdminTableHeader>
          <AdminTableBody>
            {isLoading ? (
              <AdminTableRow>
                <AdminTableCell colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <Loader className="w-8 h-8 text-slate-400 mb-2 animate-spin loading-pulse" />
                    <p className="text-slate-500">Loading mentors...</p>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ) : pageMentors.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <GraduationCap className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-slate-500">No mentors found</p>
                    <p className="text-sm text-slate-400 mt-1">Create your first mentor to get started</p>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              pageMentors.map((mentor) => (
                <AdminTableRow key={mentor.id}>
                  <AdminTableCell>
                    <div className="flex items-center">
                      <AdminAvatar
                        src={`https://ui-avatars.com/api/?name=${mentor.firstName}+${mentor.lastName}&background=10b981&color=fff&size=40`}
                        alt={`${mentor.firstName} ${mentor.lastName}`}
                        size="sm"
                        className="mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-900">{mentor.firstName} {mentor.lastName}</div>
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>{mentor.email}</AdminTableCell>
                  <AdminTableCell>{mentor.specialization}</AdminTableCell>
                  <AdminTableCell align="center">
                    <AdminButton
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMentor(mentor.id, `${mentor.firstName} ${mentor.lastName}`)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </AdminButton>
                  </AdminTableCell>
                </AdminTableRow>
              ))
            )}
          </AdminTableBody>
        </AdminTable>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <AdminButton
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </AdminButton>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <AdminButton
                  key={page}
                  variant={page === currentPage ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-10 h-10 p-0"
                >
                  {page}
                </AdminButton>
              ))}
            </div>
            
            <AdminButton
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </AdminButton>
          </div>
        )}
      </main>

      {/* Add Mentor Modal */}
      <AdminModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Mentor"
        size="md"
      >
        <form onSubmit={handleMentorSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput
              label="First Name"
              name="firstName"
              type="text"
              required
              placeholder="Enter first name"
              icon={<User className="w-5 h-5" />}
            />
            
            <AdminInput
              label="Last Name"
              name="lastName"
              type="text"
              required
              placeholder="Enter last name"
              icon={<User className="w-5 h-5" />}
            />
          </div>
          
          <AdminInput
            label="Email"
            name="email"
            type="email"
            required
            placeholder="Enter email address"
            icon={<Mail className="w-5 h-5" />}
          />
          
          <AdminInput
            label="Username"
            name="username"
            type="text"
            required
            placeholder="Enter username"
            icon={<AtSign className="w-5 h-5" />}
          />
          
          <AdminInput
            label="Specialization"
            name="specialization"
            type="text"
            required
            placeholder="e.g., Algorithms, Data Structures, Mathematics"
            icon={<GraduationCap className="w-5 h-5" />}
            helperText="What subjects can this mentor teach?"
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pl-10 pr-12 py-2.5"
                placeholder="Enter password"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">Minimum 8 characters with letters and numbers</p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <AdminButton
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
              className="flex-1"
            >
              Cancel
            </AdminButton>
            <AdminButton
              type="submit"
              className="flex-1"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Mentor
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* Edit Mentor Modal */}
      <AdminModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingMentor(null)
        }}
        title="Edit Mentor"
        size="md"
      >
        {editingMentor && (
          <form onSubmit={handleMentorUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput
                label="First Name"
                name="firstName"
                type="text"
                defaultValue={editingMentor.firstName}
                required
                placeholder="Enter first name"
                icon={<User className="w-5 h-5" />}
              />
              
              <AdminInput
                label="Last Name"
                name="lastName"
                type="text"
                defaultValue={editingMentor.lastName}
                required
                placeholder="Enter last name"
                icon={<User className="w-5 h-5" />}
              />
            </div>
            
            <AdminInput
              label="Email"
              name="email"
              type="email"
              defaultValue={editingMentor.email}
              required
              placeholder="Enter email address"
              icon={<Mail className="w-5 h-5" />}
            />
            
            <AdminInput
              label="Username"
              name="username"
              type="text"
              defaultValue={editingMentor.username}
              required
              placeholder="Enter username"
              icon={<AtSign className="w-5 h-5" />}
            />
            
            <AdminInput
              label="Specialization"
              name="specialization"
              type="text"
              defaultValue={editingMentor.specialization}
              required
              placeholder="e.g., Algorithms, Data Structures, Mathematics"
              icon={<GraduationCap className="w-5 h-5" />}
              helperText="What subjects can this mentor teach?"
            />
            
            <div className="flex gap-3 pt-4">
              <AdminButton
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingMentor(null)
                }}
                className="flex-1"
              >
                Cancel
              </AdminButton>
              <AdminButton
                type="submit"
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Update Mentor
              </AdminButton>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Delete Mentor</h3>
                  <p className="text-sm text-slate-600">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">{deletingMentor.name}</span>? 
                This will permanently remove the mentor and all associated data.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletingMentor(null)
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteMentor}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Mentor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}