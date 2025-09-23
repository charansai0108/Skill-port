'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Trophy,
  Tag,
  Users,
  Calendar,
  Settings,
  BarChart3,
  GraduationCap,
  Plus,
  Search,
  Filter,
  Clock,
  Award
} from 'lucide-react'
import { MentorCard } from '@/components/ui/MentorCard'
import { MentorButton } from '@/components/ui/MentorButton'
import { MentorInput } from '@/components/ui/MentorInput'
import { MentorModal } from '@/components/ui/MentorModal'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface Contest {
  id: string
  title: string
  description: string
  category: string
  batch: string
  participants: number
  startDate: string
  endDate: string
  status: 'upcoming' | 'active' | 'completed'
  icon: string
  color: string
  bgColor: string
}

export default function MentorContestsPage() {
  const [contests, setContests] = useState<Contest[]>([
    {
      id: 'ALGO',
      title: 'Weekly Algorithm Challenge',
      description: 'Weekly competitive programming contest focusing on algorithms and problem-solving skills.',
      category: 'Algorithms',
      batch: '2024-25',
      participants: 156,
      startDate: 'Jan 15, 2025',
      endDate: 'Jan 16, 2025',
      status: 'active',
      icon: 'A',
      color: 'blue',
      bgColor: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'SQLMAY',
      title: 'SQL Database Master',
      description: 'Advanced contest focusing on database design and SQL optimization.',
      category: 'Database',
      batch: 'Spring 2025',
      participants: 89,
      startDate: 'Jan 22, 2025',
      endDate: 'Jan 23, 2025',
      status: 'upcoming',
      icon: 'S',
      color: 'green',
      bgColor: 'from-green-500 to-emerald-600'
    },
    {
      id: 'DATA',
      title: 'Data Structures Master',
      description: 'Contest focusing on advanced data structures and algorithms.',
      category: 'Data Structures',
      batch: '2024-25',
      participants: 203,
      startDate: 'Jan 8, 2025',
      endDate: 'Jan 9, 2025',
      status: 'completed',
      icon: 'D',
      color: 'purple',
      bgColor: 'from-purple-500 to-violet-600'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddContestModalOpen, setIsAddContestModalOpen] = useState(false)

  const filteredContests = contests.filter(contest => {
    const matchesSearch = contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contest.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || contest.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'from-blue-50/80 to-blue-100/60',
        border: 'border-blue-200/30',
        text: 'text-blue-700',
        textDark: 'text-blue-900',
        icon: 'text-blue-600',
        button: 'bg-blue-600/90 hover:bg-blue-700/90 border-blue-500/30'
      },
      yellow: {
        bg: 'from-yellow-50/80 to-yellow-100/60',
        border: 'border-yellow-200/30',
        text: 'text-yellow-700',
        textDark: 'text-yellow-900',
        icon: 'text-yellow-600',
        button: 'bg-yellow-600/90 hover:bg-yellow-700/90 border-yellow-500/30'
      },
      green: {
        bg: 'from-green-50/80 to-green-100/60',
        border: 'border-green-200/30',
        text: 'text-green-700',
        textDark: 'text-green-900',
        icon: 'text-green-600',
        button: 'bg-green-600/90 hover:bg-green-700/90 border-green-500/30'
      },
      purple: {
        bg: 'from-purple-50/80 to-purple-100/60',
        border: 'border-purple-200/30',
        text: 'text-purple-700',
        textDark: 'text-purple-900',
        icon: 'text-purple-600',
        button: 'bg-purple-600/90 hover:bg-purple-700/90 border-purple-500/30'
      }
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-content">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-700 leading-snug">Contests</h1>
            </div>
          </div>
        </div>

        {/* Contests Content */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold text-slate-900">Assigned Contests</h2>
            <MentorButton
              onClick={() => setIsAddContestModalOpen(true)}
              variant="gradient-orange"
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Contest
            </MentorButton>
          </div>

          {/* Search and Filter */}
          <MentorCard className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <MentorInput
                  placeholder="Search contests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-5 h-5" />}
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-orange-500 focus:shadow-lg transition-all duration-300"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </MentorCard>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map((contest) => {
              const colorClasses = getColorClasses(contest.color)
              
              return (
                <MentorCard key={contest.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${contest.bgColor} rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                      {contest.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-slate-900 truncate">{contest.title}</h2>
                        <StatusBadge status={contest.status} />
                      </div>
                      <div className="text-sm text-slate-500 line-clamp-2">{contest.description}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Category */}
                    <div className={`bg-gradient-to-br ${colorClasses.bg} rounded-xl p-3 border ${colorClasses.border} hover:shadow-md transition-all duration-200`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className={`w-4 h-4 ${colorClasses.icon}`} />
                        <span className={`text-xs font-medium ${colorClasses.text} uppercase tracking-wide`}>Category</span>
                      </div>
                      <span className={`text-sm font-semibold ${colorClasses.textDark}`}>{contest.category}</span>
                    </div>
                    
                    {/* Batch */}
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 border border-yellow-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-2 mb-1">
                        <GraduationCap className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-700 uppercase tracking-wide">Batch</span>
                      </div>
                      <span className="text-sm font-semibold text-yellow-900">{contest.batch}</span>
                    </div>
                    
                    {/* Participants */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Participants</span>
                      </div>
                      <span className="text-sm font-semibold text-green-900">{contest.participants}</span>
                    </div>
                    
                    {/* Start Date */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">Start Date</span>
                      </div>
                      <span className="text-sm font-semibold text-purple-900">{contest.startDate}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <MentorButton
                      asChild
                      href={`/mentor/contests/${contest.id}/manage`}
                      variant="gradient-orange"
                      className="flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Manage
                    </MentorButton>
                    <MentorButton
                      asChild
                      href={`/mentor/contests/${contest.id}/leaderboard`}
                      variant="outline"
                      className="p-2"
                      title="View Leaderboard"
                    >
                      <BarChart3 className="w-5 h-5" />
                    </MentorButton>
                  </div>
                </MentorCard>
              )
            })}
          </div>
        </div>

        {/* Add Contest Modal */}
        <MentorModal
          isOpen={isAddContestModalOpen}
          onClose={() => setIsAddContestModalOpen(false)}
          title="Add New Contest"
          size="lg"
        >
          <div className="space-y-4">
            <MentorInput
              label="Contest Title"
              placeholder="Enter contest title"
              icon={<Trophy className="w-5 h-5" />}
            />
            <MentorInput
              label="Description"
              placeholder="Enter contest description"
              icon={<Award className="w-5 h-5" />}
            />
            <div className="grid grid-cols-2 gap-4">
              <MentorInput
                label="Category"
                placeholder="e.g., Algorithms"
                icon={<Tag className="w-5 h-5" />}
              />
              <MentorInput
                label="Batch"
                placeholder="e.g., 2024-25"
                icon={<GraduationCap className="w-5 h-5" />}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <MentorInput
                label="Start Date"
                type="datetime-local"
                icon={<Calendar className="w-5 h-5" />}
              />
              <MentorInput
                label="End Date"
                type="datetime-local"
                icon={<Clock className="w-5 h-5" />}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <MentorButton
                variant="outline"
                onClick={() => setIsAddContestModalOpen(false)}
              >
                Cancel
              </MentorButton>
              <MentorButton
                variant="gradient-orange"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Contest
              </MentorButton>
            </div>
          </div>
        </MentorModal>
      </main>
    </div>
  )
}