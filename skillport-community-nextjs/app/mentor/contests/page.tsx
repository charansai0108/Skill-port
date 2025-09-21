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
  GraduationCap
} from 'lucide-react'

interface Contest {
  id: string
  title: string
  description: string
  category: string
  batch: string
  participants: number
  startDate: string
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
      icon: 'S',
      color: 'green',
      bgColor: 'from-green-500 to-emerald-600'
    }
  ])

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
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Assigned Contests</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {contests.map((contest) => {
              const colorClasses = getColorClasses(contest.color)
              
              return (
                <div key={contest.id} className="contest-card bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${contest.bgColor} rounded-lg flex items-center justify-center text-white text-2xl font-bold`}>
                      {contest.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-slate-900">{contest.title}</h2>
                      <div className="text-sm text-slate-500 truncate">{contest.description}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    {/* Category */}
                    <div className={`bg-gradient-to-br ${colorClasses.bg} backdrop-blur-sm rounded-lg p-3 border ${colorClasses.border}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className={`w-4 h-4 ${colorClasses.icon}`} />
                        <span className={`text-xs font-medium ${colorClasses.text} uppercase tracking-wide`}>Category</span>
                      </div>
                      <span className={`text-sm font-semibold ${colorClasses.textDark}`}>{contest.category}</span>
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
                  
                  <div className="flex items-center justify-between mt-4">
                    <Link 
                      href={`/mentor/contests/${contest.id}/manage`} 
                      className={`glass-btn ${colorClasses.button} backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:scale-105 transition-all duration-300 border shadow-lg`}
                    >
                      <Settings className="w-4 h-4" />
                      Manage
                    </Link>
                    <Link 
                      href={`/mentor/contests/${contest.id}/leaderboard`} 
                      className="glass-btn p-2 rounded-lg border border-slate-200/50 hover:bg-slate-50/80 hover:scale-105 transition-all duration-300 backdrop-blur-sm shadow-md" 
                      title="View Leaderboard"
                    >
                      <BarChart3 className={`w-5 h-5 ${colorClasses.icon}`} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}