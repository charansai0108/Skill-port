'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  MessageCircle,
  Search,
  Filter,
  X,
  Star,
  Send,
  User
} from 'lucide-react'

interface Student {
  id: string
  name: string
  email: string
  avatar: string
  points: number
  lastActive: string
  status: 'active' | 'inactive'
  needsFeedback: boolean
}

interface FeedbackForm {
  type: string
  rating: number
  strengths: string
  improvements: string
  specificFeedback: string
  recommendations: string
}

export default function MentorFeedbackPage() {
  const params = useParams()
  const communitySlug = params.communitySlug as string
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      avatar: 'A',
      points: 850,
      lastActive: '2 hours ago',
      status: 'active',
      needsFeedback: true
    },
    {
      id: '2',
      name: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      avatar: 'S',
      points: 720,
      lastActive: '1 day ago',
      status: 'active',
      needsFeedback: false
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      email: 'mike.rodriguez@email.com',
      avatar: 'M',
      points: 680,
      lastActive: '3 hours ago',
      status: 'active',
      needsFeedback: true
    },
    {
      id: '4',
      name: 'Emma Wilson',
      email: 'emma.wilson@email.com',
      avatar: 'E',
      points: 590,
      lastActive: '5 hours ago',
      status: 'active',
      needsFeedback: false
    }
  ])

  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>({
    type: 'General Feedback',
    rating: 0,
    strengths: '',
    improvements: '',
    specificFeedback: '',
    recommendations: ''
  })

  const feedbackTypes = [
    'General Feedback',
    'Code Review',
    'Performance Improvement',
    'Contest Feedback',
    'Task Feedback'
  ]

  const getAvatarColor = (avatar: string) => {
    const colors = {
      A: 'from-amber-400 to-orange-500',
      S: 'from-blue-400 to-indigo-500',
      M: 'from-green-400 to-emerald-500',
      E: 'from-purple-400 to-pink-500'
    }
    return colors[avatar as keyof typeof colors] || 'from-gray-400 to-gray-500'
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'text-green-600' : 'text-slate-500'
  }

  const getStatusTextColor = (status: string) => {
    return status === 'active' ? 'text-slate-900' : 'text-slate-500'
  }

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let filtered = students

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply type filter
    if (filterType) {
      switch (filterType) {
        case 'needs-feedback':
          filtered = filtered.filter(student => student.needsFeedback)
          break
        case 'recently-active':
          filtered = filtered.filter(student => 
            student.lastActive.includes('hour') || student.lastActive.includes('minute')
          )
          break
        default:
          break
      }
    }

    setFilteredStudents(filtered)
  }, [students, searchTerm, filterType])

  const openFeedbackModal = (student: Student) => {
    setSelectedStudent(student)
    setFeedbackForm({
      type: 'General Feedback',
      rating: 0,
      strengths: '',
      improvements: '',
      specificFeedback: '',
      recommendations: ''
    })
    setIsFeedbackModalOpen(true)
  }

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false)
    setSelectedStudent(null)
  }

  const setRating = (rating: number) => {
    setFeedbackForm(prev => ({ ...prev, rating }))
  }

  const handleInputChange = (field: keyof FeedbackForm, value: string | number) => {
    setFeedbackForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedStudent) return

    // Simulate API call
    console.log('Submitting feedback for:', selectedStudent.name, feedbackForm)
    
    // Show success message
    alert('Feedback sent successfully!')
    
    // Close modal
    closeFeedbackModal()
  }

  const renderStars = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`w-10 h-10 rounded-full border-2 transition-colors ${
              star <= feedbackForm.rating
                ? 'border-orange-400 bg-orange-50 text-orange-600'
                : 'border-slate-300 hover:border-orange-400 hover:bg-orange-50'
            }`}
          >
            <Star className="w-5 h-5 mx-auto" fill={star <= feedbackForm.rating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-content">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Give Feedback</h1>
            <p className="text-lg text-slate-600">Welcome back, Satya Sai! Provide constructive feedback to help your students grow and improve.</p>
          </div>

          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your students...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-content">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Give Feedback</h1>
          <p className="text-lg text-slate-600">Welcome back, Satya Sai! Provide constructive feedback to help your students grow and improve.</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Student Management</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Students</option>
                <option value="needs-feedback">Needs Feedback</option>
                <option value="recently-active">Recently Active</option>
              </select>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="space-y-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-lg shadow-lg p-6 dashboard-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(student.avatar)} rounded-full flex items-center justify-center text-white font-semibold`}>
                    {student.avatar}
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${getStatusTextColor(student.status)}`}>
                      {student.name}
                    </h3>
                    <p className="text-sm text-slate-500">{student.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getStatusColor(student.status)}`}>
                    {student.points} points
                  </div>
                  <div className="text-xs text-slate-500">Last active: {student.lastActive}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => openFeedbackModal(student)}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Give Feedback
                </button>
                {student.needsFeedback && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    Needs Feedback
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No Students Message */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No students found</h3>
            <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Feedback Modal */}
        {isFeedbackModalOpen && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">
                    Give Feedback to {selectedStudent.name}
                  </h2>
                  <button
                    onClick={closeFeedbackModal}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmitFeedback}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Feedback Type
                    </label>
                    <select
                      value={feedbackForm.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {feedbackTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Rating
                    </label>
                    {renderStars()}
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Strengths
                    </label>
                    <textarea
                      value={feedbackForm.strengths}
                      onChange={(e) => handleInputChange('strengths', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={3}
                      placeholder="What are the student's strengths?"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Areas for Improvement
                    </label>
                    <textarea
                      value={feedbackForm.improvements}
                      onChange={(e) => handleInputChange('improvements', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={3}
                      placeholder="What areas need improvement?"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Specific Feedback
                    </label>
                    <textarea
                      value={feedbackForm.specificFeedback}
                      onChange={(e) => handleInputChange('specificFeedback', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={4}
                      placeholder="Provide detailed, constructive feedback..."
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Recommendations
                    </label>
                    <textarea
                      value={feedbackForm.recommendations}
                      onChange={(e) => handleInputChange('recommendations', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={3}
                      placeholder="What would you recommend for improvement?"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeFeedbackModal}
                      className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send Feedback
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
