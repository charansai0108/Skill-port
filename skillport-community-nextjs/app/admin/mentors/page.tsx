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
  UserPlus
} from 'lucide-react'
import Link from 'next/link'

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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-700">Mentor Management</h1>
              </div>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="action-button bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
            >
              <UserPlus className="w-5 h-5" />
              Add New Mentor
            </button>
          </div>
        </div>

        {/* Mentors Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200 w-1/5">Mentor</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200 w-1/5">Email</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200 w-1/5">Specialization</th>
                  <th className="px-8 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200 w-1/5">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Loader className="w-8 h-8 text-slate-400 mb-2 animate-spin loading-pulse" />
                        <p className="text-slate-500">Loading mentors...</p>
                      </div>
                    </td>
                  </tr>
                ) : pageMentors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <GraduationCap className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-slate-500">No mentors found</p>
                        <p className="text-sm text-slate-400 mt-1">Create your first mentor to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageMentors.map((mentor) => (
                    <tr key={mentor.id} className="hover:bg-slate-50">
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {mentor.firstName.charAt(0)}{mentor.lastName.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-slate-900">{mentor.firstName} {mentor.lastName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-900">{mentor.email}</td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-900">{mentor.specialization}</td>
                      <td className="px-8 py-4 whitespace-nowrap text-center">
                        <button 
                          onClick={() => deleteMentor(mentor.id, `${mentor.firstName} ${mentor.lastName}`)}
                          className="text-red-600 hover:text-red-900 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="action-button px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="px-4 py-2 text-slate-700 bg-slate-50 rounded-lg border border-slate-200">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="action-button px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* Add Mentor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Add New Mentor</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleMentorSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-slate-300 hover:shadow-md"
                    placeholder="Enter first name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-slate-300 hover:shadow-md"
                    placeholder="Enter last name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-slate-300 hover:shadow-md"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Username *</label>
                  <input
                    type="text"
                    name="username"
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-slate-300 hover:shadow-md"
                    placeholder="Enter username"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Specialization *</label>
                  <input
                    type="text"
                    name="specialization"
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-slate-300 hover:shadow-md"
                    placeholder="e.g., Algorithms, Data Structures, Mathematics"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-slate-300 hover:shadow-md"
                      placeholder="Enter password"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Minimum 8 characters</p>
                </div>
                
                <div className="flex gap-3 mt-8 justify-between">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="glass-button px-6 py-3 border border-slate-300/50 text-slate-700 rounded-xl hover:bg-slate-50/60 hover:border-slate-400/70 hover:shadow-lg transition-all duration-300 backdrop-blur-md bg-white/40"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="glass-button px-6 py-3 bg-gradient-to-r from-green-600/80 to-emerald-600/80 text-white rounded-xl hover:from-green-700/90 hover:to-emerald-700/90 hover:shadow-lg hover:scale-105 transition-all duration-300 backdrop-blur-md border border-green-500/30"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mentor Modal */}
      {showEditModal && editingMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Edit Mentor</h2>
                <button 
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingMentor(null)
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleMentorUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    defaultValue={editingMentor.firstName}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-slate-300 hover:shadow-md"
                    placeholder="Enter first name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    defaultValue={editingMentor.lastName}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-slate-300 hover:shadow-md"
                    placeholder="Enter last name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingMentor.email}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-slate-300 hover:shadow-md"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Username *</label>
                  <input
                    type="text"
                    name="username"
                    defaultValue={editingMentor.username}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-slate-300 hover:shadow-md"
                    placeholder="Enter username"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Specialization *</label>
                  <input
                    type="text"
                    name="specialization"
                    defaultValue={editingMentor.specialization}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-slate-300 hover:shadow-md"
                    placeholder="e.g., Algorithms, Data Structures, Mathematics"
                  />
                </div>
                
                <div className="flex gap-3 mt-8">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingMentor(null)
                    }}
                    className="glass-button px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-400 hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-white/80"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="glass-button px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 hover:shadow-lg hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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