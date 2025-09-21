'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MessageSquare,
  Star,
  Users,
  Calendar,
  MessageSquarePlus,
  X,
  User
} from 'lucide-react'

interface Feedback {
  id: number
  title: string
  mentor: string
  avatar: string
  avatarColor: string
  date: string
  rating: number
  type: string
  typeColor: string
  content: string
  related: string
}

interface FeedbackStats {
  totalFeedback: number
  avgRating: number
  activeMentors: number
  monthlyFeedback: number
}

export default function StudentFeedbackPage() {
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>({
    totalFeedback: 18,
    avgRating: 4.7,
    activeMentors: 6,
    monthlyFeedback: 5
  })

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: 1,
      title: "Code Review - Binary Search Tree",
      mentor: "Dr. Sarah Chen",
      avatar: "S",
      avatarColor: "from-blue-400 to-indigo-500",
      date: "2 days ago",
      rating: 5,
      type: "Code Review",
      typeColor: "bg-blue-100 text-blue-800 border-blue-200",
      content: "Excellent work on the binary search tree implementation! Your code is well-structured and follows good practices. The time complexity analysis is spot-on. Consider adding more edge case handling for better robustness.",
      related: "Binary Search Tree Assignment"
    },
    {
      id: 2,
      title: "Contest Feedback - Algorithm Challenge",
      mentor: "Prof. Rajesh Sharma",
      avatar: "R",
      avatarColor: "from-green-400 to-emerald-500",
      date: "1 week ago",
      rating: 4,
      type: "Contest Feedback",
      typeColor: "bg-green-100 text-green-800 border-green-200",
      content: "Great performance in the weekly algorithm challenge! Your solution to the dynamic programming problem was elegant. Work on optimizing space complexity - you can reduce it from O(n²) to O(n). Keep practicing!",
      related: "Weekly Algorithm Challenge"
    },
    {
      id: 3,
      title: "General Feedback - API Development",
      mentor: "Amit Kumar",
      avatar: "A",
      avatarColor: "from-purple-400 to-pink-500",
      date: "2 weeks ago",
      rating: 5,
      type: "General Feedback",
      typeColor: "bg-purple-100 text-purple-800 border-purple-200",
      content: "Your RESTful API design shows excellent understanding of HTTP principles and REST conventions. The authentication implementation is solid. Consider adding rate limiting and input validation for production use.",
      related: "API Development Project"
    },
    {
      id: 4,
      title: "Improvement - Database Optimization",
      mentor: "Priya Patel",
      avatar: "P",
      avatarColor: "from-orange-400 to-red-500",
      date: "3 weeks ago",
      rating: 4,
      type: "Improvement",
      typeColor: "bg-orange-100 text-orange-800 border-orange-200",
      content: "Good work on the database optimization project! Your query analysis skills are improving. Focus on indexing strategies and consider using EXPLAIN plans more frequently. Great progress overall!",
      related: "Database Optimization"
    }
  ])

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [filters, setFilters] = useState({
    type: 'all',
    mentor: 'all',
    rating: 'all',
    sortBy: 'date-desc'
  })

  const [requestForm, setRequestForm] = useState({
    mentor: '',
    type: 'General Feedback',
    contest: '',
    task: '',
    message: ''
  })

  const openRequestModal = () => {
    setIsRequestModalOpen(true)
  }

  const closeRequestModal = () => {
    setIsRequestModalOpen(false)
    setRequestForm({
      mentor: '',
      type: 'General Feedback',
      contest: '',
      task: '',
      message: ''
    })
  }

  const openDetailModal = (feedback: Feedback) => {
    setSelectedFeedback(feedback)
    setIsDetailModalOpen(true)
  }

  const closeDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedFeedback(null)
  }

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Feedback request submitted successfully!')
    closeRequestModal()
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-slate-300'}`}
      />
    ))
  }

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (filters.type !== 'all' && feedback.type !== filters.type) return false
    if (filters.mentor !== 'all' && feedback.mentor !== filters.mentor) return false
    if (filters.rating !== 'all' && feedback.rating < parseInt(filters.rating)) return false
    return true
  })

  const sortedFeedbacks = [...filteredFeedbacks].sort((a, b) => {
    switch (filters.sortBy) {
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case 'rating-desc':
        return b.rating - a.rating
      case 'rating-asc':
        return a.rating - b.rating
      default:
        return 0
    }
  })

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-content">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-700">Mentor Feedback</h1>
              <p className="text-slate-600">Get personalized guidance and feedback from experienced mentors</p>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={openRequestModal}
              className="glass-btn bg-blue-600/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-blue-700/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-blue-500/20 flex items-center gap-2"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Request Feedback
            </button>
          </div>
        </div>

        {/* Feedback Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card bg-white rounded-xl shadow-lg p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-500">Total Feedback</h3>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-900">{feedbackStats.totalFeedback}</span>
              <span className="text-sm text-slate-500 mb-1">reviews</span>
            </div>
          </div>

          <div className="stat-card bg-white rounded-xl shadow-lg p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-500">Average Rating</h3>
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-900">{feedbackStats.avgRating}</span>
              <span className="text-sm text-slate-500 mb-1">/5</span>
            </div>
          </div>

          <div className="stat-card bg-white rounded-xl shadow-lg p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-500">Active Mentors</h3>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-900">{feedbackStats.activeMentors}</span>
              <span className="text-sm text-slate-500 mb-1">mentors</span>
            </div>
          </div>

          <div className="stat-card bg-white rounded-xl shadow-lg p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-500">This Month</h3>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-900">{feedbackStats.monthlyFeedback}</span>
              <span className="text-sm text-slate-500 mb-1">feedback</span>
            </div>
          </div>
        </div>

        {/* Feedback Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter By Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Feedback</option>
                <option value="General Feedback">General Feedback</option>
                <option value="Code Review">Code Review</option>
                <option value="Contest Feedback">Contest Feedback</option>
                <option value="Improvement">Improvement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter By Mentor</label>
              <select
                value={filters.mentor}
                onChange={(e) => handleFilterChange('mentor', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Mentors</option>
                <option value="Dr. Sarah Chen">Dr. Sarah Chen</option>
                <option value="Prof. Rajesh Sharma">Prof. Rajesh Sharma</option>
                <option value="Amit Kumar">Amit Kumar</option>
                <option value="Priya Patel">Priya Patel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter By Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="rating-desc">Highest Rating</option>
                <option value="rating-asc">Lowest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-6">
          {sortedFeedbacks.map((feedback) => (
            <div key={feedback.id} className="feedback-card bg-white rounded-xl shadow-lg p-6 border border-slate-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feedback.avatarColor} rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-lg font-bold text-white">{feedback.avatar}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{feedback.mentor}</h3>
                    <p className="text-sm text-slate-600">Data Structures Expert • {feedback.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(feedback.rating)}
                  <span className="ml-2 text-sm font-medium text-slate-700">{feedback.rating}.0</span>
                </div>
              </div>
              <div className="mb-4">
                <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${feedback.typeColor}`}>
                  {feedback.type}
                </span>
              </div>
              <p className="text-slate-700 mb-4 leading-relaxed">
                {feedback.content}
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  Related to: <span className="font-medium text-slate-700">{feedback.related}</span>
                </div>
                <button
                  onClick={() => openDetailModal(feedback)}
                  className="glass-btn bg-blue-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-blue-700/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-blue-500/20"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-8">
          <button className="glass-btn bg-slate-600/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-slate-700/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-slate-500/20">
            Load More Feedback
          </button>
        </div>
      </main>

      {/* Request Feedback Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Request Feedback from Mentor</h3>
              <button
                onClick={closeRequestModal}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRequestSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Mentor</label>
                <select
                  value={requestForm.mentor}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, mentor: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">Select a mentor</option>
                  <option value="Dr. Sarah Chen">Dr. Sarah Chen</option>
                  <option value="Prof. Rajesh Sharma">Prof. Rajesh Sharma</option>
                  <option value="Amit Kumar">Amit Kumar</option>
                  <option value="Priya Patel">Priya Patel</option>
                  <option value="Vikram Reddy">Vikram Reddy</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Feedback Type</label>
                <select
                  value={requestForm.type}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="General Feedback">General Feedback</option>
                  <option value="Code Review">Code Review</option>
                  <option value="Performance Improvement">Performance Improvement</option>
                  <option value="Contest Feedback">Contest Feedback</option>
                  <option value="Task Feedback">Task Feedback</option>
                </select>
              </div>
              {requestForm.type === 'Contest Feedback' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Contest</label>
                  <select
                    value={requestForm.contest}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, contest: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select a contest</option>
                    <option value="Weekly Algorithm Challenge">Weekly Algorithm Challenge</option>
                    <option value="SQL Database Master">SQL Database Master</option>
                    <option value="Web Development Hackathon">Web Development Hackathon</option>
                    <option value="Python Programming Contest">Python Programming Contest</option>
                    <option value="Java Coding Challenge">Java Coding Challenge</option>
                  </select>
                </div>
              )}
              {requestForm.type === 'Task Feedback' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Task</label>
                  <select
                    value={requestForm.task}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, task: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select a task</option>
                    <option value="Binary Search Tree Implementation">Binary Search Tree Implementation</option>
                    <option value="RESTful API Development">RESTful API Development</option>
                    <option value="Authentication System">Authentication System</option>
                    <option value="Database Query Optimization">Database Query Optimization</option>
                    <option value="Responsive UI Design">Responsive UI Design</option>
                  </select>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <textarea
                  value={requestForm.message}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  rows={4}
                  placeholder="Describe what you'd like feedback on..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeRequestModal}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glass-btn bg-blue-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-blue-700/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-blue-500/20"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Detail Modal */}
      {isDetailModalOpen && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">{selectedFeedback.title}</h3>
              <button
                onClick={closeDetailModal}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br ${selectedFeedback.avatarColor}`}>
                  <span className="text-sm font-bold text-white">{selectedFeedback.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{selectedFeedback.mentor}</p>
                  <p className="text-xs text-slate-500">{selectedFeedback.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-4">
                {renderStars(selectedFeedback.rating)}
                <span className="ml-2 text-sm font-medium text-slate-700">{selectedFeedback.rating}.0</span>
              </div>
            </div>
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Feedback</h4>
              <div className="text-slate-600 bg-slate-50 rounded-lg p-4">
                {selectedFeedback.content}
              </div>
            </div>
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Related To</h4>
              <div className="text-slate-600 bg-slate-50 rounded-lg p-4">
                {selectedFeedback.related}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={closeDetailModal}
                className="glass-btn bg-slate-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-slate-700/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-slate-500/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
