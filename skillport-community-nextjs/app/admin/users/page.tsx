'use client'

import { useState, useEffect } from 'react'
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
  X,
  Loader,
  Shield,
  GraduationCap,
  Trophy,
  BarChart3,
  Award as AwardIcon
} from 'lucide-react'
import Link from 'next/link'

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState<{
    id: number
    firstName: string
    lastName: string
    username: string
    email: string
    status: string
    joined: string
    problemsSolved: number
    rating: number
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const usersPerPage = 10

  // Sample student data
  const [users, setUsers] = useState([
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

  const [currentUsers, setCurrentUsers] = useState([...users])

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredUsers = currentUsers.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const endIndex = startIndex + usersPerPage
  const pageUsers = filteredUsers.slice(startIndex, endIndex)

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
            <Link href="/admin/users" className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200 transition-all flex items-center gap-3">
              <Users className="w-4 h-4" />
              Students
            </Link>
            <Link href="/admin/mentors" className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3">
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
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-700 leading-snug">
                Student Management
              </h1>
            </div>
          </div>
        </div>

        {/* Students Section Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">All Students</h2>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200 w-1/5">Student</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200 w-1/5">Email</th>
                  <th className="px-8 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200 w-1/5">Status</th>
                  <th className="px-8 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200 w-1/5">Joined</th>
                  <th className="px-8 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200 w-1/5">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Loader className="w-8 h-8 text-slate-400 mb-2 animate-spin loading-pulse" />
                        <p className="text-slate-500">Loading users...</p>
                      </div>
                    </td>
                  </tr>
                ) : pageUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Users className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-slate-500">No students found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-900">{user.email}</td>
                      <td className="px-8 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-500 text-center">{user.joined}</td>
                      <td className="px-8 py-4 whitespace-nowrap text-center">
                        <button 
                          onClick={() => deleteUser(user.id)}
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
      </main>

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button 
                onClick={() => {
                  setShowAddModal(false)
                  setEditingUser(null)
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  defaultValue={editingUser?.firstName || ''}
                  required
                  className="form-input w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  defaultValue={editingUser?.lastName || ''}
                  required
                  className="form-input w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  defaultValue={editingUser?.username || ''}
                  required
                  className="form-input w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingUser?.email || ''}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Save User
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingUser(null)
                  }}
                  className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}