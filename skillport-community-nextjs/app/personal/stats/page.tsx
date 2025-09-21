'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  Target,
  TrendingUp,
  Calendar,
  Award,
  PieChart,
  CalendarDays,
  Star,
  Code,
  Globe,
  Database,
  Smartphone,
  Zap,
  Download,
  Share2,
  Filter,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  X
} from 'lucide-react'

interface StatsData {
  problemsSolved: number
  skillRating: number
  dayStreak: number
  achievements: number
  weeklyProgress: {
    monday: number
    tuesday: number
    wednesday: number
    thursday: number
    friday: number
  }
  topSkills: Array<{
    name: string
    percentage: number
  }>
}

interface FilterState {
  platform: string
  difficulty: string
  dateRange: string
}

interface ChartData {
  difficultyDistribution: Array<{
    name: string
    value: number
    color: string
  }>
  weeklyTrend: Array<{
    day: string
    problems: number
  }>
  platformStats: Array<{
    platform: string
    problems: number
    percentage: number
  }>
}

export default function PersonalStatsPage() {
  const [statsData, setStatsData] = useState<StatsData>({
    problemsSolved: 247,
    skillRating: 1850,
    dayStreak: 23,
    achievements: 8,
    weeklyProgress: {
      monday: 5,
      tuesday: 4,
      wednesday: 3,
      thursday: 5,
      friday: 2
    },
    topSkills: [
      { name: 'Algorithms', percentage: 95 },
      { name: 'Web Development', percentage: 88 },
      { name: 'Database', percentage: 82 },
      { name: 'Mobile Development', percentage: 75 }
    ]
  })

  // Enhanced state for filters and charts
  const [filters, setFilters] = useState<FilterState>({
    platform: 'all',
    difficulty: 'all',
    dateRange: 'thisMonth'
  })

  const [showFilters, setShowFilters] = useState(false)
  const [chartData, setChartData] = useState<ChartData>({
    difficultyDistribution: [
      { name: 'Easy', value: 120, color: '#10b981' },
      { name: 'Medium', value: 95, color: '#f59e0b' },
      { name: 'Hard', value: 32, color: '#ef4444' }
    ],
    weeklyTrend: [
      { day: 'Mon', problems: 5 },
      { day: 'Tue', problems: 4 },
      { day: 'Wed', problems: 3 },
      { day: 'Thu', problems: 5 },
      { day: 'Fri', problems: 2 },
      { day: 'Sat', problems: 6 },
      { day: 'Sun', problems: 4 }
    ],
    platformStats: [
      { platform: 'LeetCode', problems: 150, percentage: 60.7 },
      { platform: 'HackerRank', problems: 45, percentage: 18.2 },
      { platform: 'GeeksforGeeks', problems: 35, percentage: 14.2 },
      { platform: 'CodeForces', problems: 17, percentage: 6.9 }
    ]
  })

  useEffect(() => {
    loadStatsData()
  }, [])

  const loadStatsData = async () => {
    try {
      // Load sample stats data for development
      const sampleData: StatsData = {
        problemsSolved: 247,
        skillRating: 1850,
        dayStreak: 23,
        achievements: 8,
        weeklyProgress: {
          monday: 5,
          tuesday: 4,
          wednesday: 3,
          thursday: 5,
          friday: 2
        },
        topSkills: [
          { name: 'Algorithms', percentage: 95 },
          { name: 'Web Development', percentage: 88 },
          { name: 'Database', percentage: 82 },
          { name: 'Mobile Development', percentage: 75 }
        ]
      }
      
      setStatsData(sampleData)
    } catch (error) {
      console.error('Failed to load stats data:', error)
    }
  }

  const exportStats = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      // Generate CSV data
      const csvData = [
        ['Metric', 'Value'],
        ['Problems Solved', statsData.problemsSolved.toString()],
        ['Skill Rating', statsData.skillRating.toString()],
        ['Day Streak', statsData.dayStreak.toString()],
        ['Achievements', statsData.achievements.toString()],
        ['', ''],
        ['Day', 'Problems'],
        ...chartData.weeklyTrend.map(item => [item.day, item.problems.toString()])
      ].map(row => row.join(',')).join('\n')
      
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'skillport-stats.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    } else {
      // PDF export would be implemented with a library like jsPDF
      alert('PDF export will be implemented with jsPDF library')
    }
  }

  const shareStats = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My SkillPort Stats',
        text: `I've solved ${statsData.problemsSolved} problems with a ${statsData.skillRating} rating!`,
        url: window.location.href
      })
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`Check out my coding progress: ${statsData.problemsSolved} problems solved!`)
      alert('Stats copied to clipboard!')
    }
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    // In a real app, this would trigger a data refetch
  }

  const clearFilters = () => {
    setFilters({
      platform: 'all',
      difficulty: 'all',
      dateRange: 'thisMonth'
    })
  }

  const setGoals = () => {
    alert('Goal setting functionality will be implemented here')
  }

  const getSkillIcon = (skillName: string) => {
    switch(skillName) {
      case 'Algorithms': return <Code className="w-3 h-3 text-blue-600" />
      case 'Web Development': return <Globe className="w-3 h-3 text-emerald-600" />
      case 'Database': return <Database className="w-3 h-3 text-purple-600" />
      case 'Mobile Development': return <Smartphone className="w-3 h-3 text-amber-600" />
      default: return <Star className="w-3 h-3 text-slate-600" />
    }
  }

  const getSkillColor = (skillName: string) => {
    switch(skillName) {
      case 'Algorithms': return 'blue'
      case 'Web Development': return 'emerald'
      case 'Database': return 'purple'
      case 'Mobile Development': return 'amber'
      default: return 'slate'
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-content">
      {/* Stats Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Statistics</h1>
              <p className="text-base text-slate-600">Track your learning progress and performance metrics</p>
            </div>
          </div>
          
          {/* Enhanced Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-300 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <div className="relative">
              <button
                onClick={() => exportStats('csv')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {/* Export Dropdown */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
                <button
                  onClick={() => exportStats('csv')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  Export as CSV
                </button>
                <button
                  onClick={() => exportStats('pdf')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-red-600" />
                  Export as PDF
                </button>
              </div>
            </div>
            
            <button
              onClick={shareStats}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
        
        {/* Enhanced Filters Panel */}
        {showFilters && (
          <div className="mt-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filter Statistics</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                <select
                  value={filters.platform}
                  onChange={(e) => handleFilterChange('platform', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Platforms</option>
                  <option value="leetcode">LeetCode</option>
                  <option value="hackerrank">HackerRank</option>
                  <option value="geeksforgeeks">GeeksforGeeks</option>
                  <option value="codeforces">CodeForces</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="thisYear">This Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="stat-card rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-1">{statsData.problemsSolved}</div>
          <div className="text-sm text-slate-600 font-medium">Problems Solved</div>
        </div>
        
        <div className="stat-card rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mb-1">{statsData.skillRating.toLocaleString()}</div>
          <div className="text-sm text-slate-600 font-medium">Skill Rating</div>
        </div>
        
        <div className="stat-card rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-purple-600 mb-1">{statsData.dayStreak}</div>
          <div className="text-sm text-slate-600 font-medium">Day Streak</div>
        </div>
        
        <div className="stat-card rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mb-1">{statsData.achievements}</div>
          <div className="text-sm text-slate-600 font-medium">Achievements</div>
        </div>
      </div>

      {/* Main Stats Section */}
      <div className="space-y-6 mb-10">
        {/* Performance Chart */}
        <div className="glassy-card rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Weekly Completion Trend</h2>
          </div>
          
          <div className="h-72 p-4">
            <div className="flex items-end justify-between h-full gap-2">
              {chartData.weeklyTrend.map((item, index) => {
                const maxProblems = Math.max(...chartData.weeklyTrend.map(d => d.problems))
                const height = (item.problems / maxProblems) * 100
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1 group">
                    <div className="relative">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 group-hover:from-blue-600 group-hover:to-blue-500"
                        style={{ height: `${height}%`, minHeight: '20px' }}
                      ></div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.problems} problems
                      </div>
                    </div>
                    <div className="mt-2 text-sm font-medium text-slate-600">{item.day}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Difficulty Distribution */}
        <div className="glassy-card rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Problem Difficulty Distribution</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {chartData.difficultyDistribution.map((item, index) => {
              const total = chartData.difficultyDistribution.reduce((sum, d) => sum + d.value, 0)
              const percentage = ((item.value / total) * 100).toFixed(1)
              
              return (
                <div key={index} className="text-center group cursor-pointer">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <span className="text-xl font-bold" style={{ color: item.color }}>
                      {item.value}
                    </span>
                  </div>
                  <div className="text-base font-semibold text-slate-800 mb-1">{item.name}</div>
                  <div className="text-sm text-slate-600 mb-2">{percentage}% of total</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Platform Statistics */}
        <div className="glassy-card rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Platform Statistics</h2>
          </div>
          
          <div className="space-y-4">
            {chartData.platformStats.map((platform, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">{platform.platform}</span>
                  <span className="text-sm text-slate-600">{platform.problems} problems</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-500 group-hover:shadow-lg"
                    style={{ 
                      width: `${platform.percentage}%`,
                      background: `linear-gradient(90deg, #8b5cf6, #ec4899)`
                    }}
                  ></div>
                </div>
                <div className="text-xs text-slate-500 mt-1">{platform.percentage}% of total</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weekly Progress */}
        <div className="glassy-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <CalendarDays className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Weekly Progress</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700">Monday</span>
                <span className="text-sm text-slate-600">{statsData.weeklyProgress.monday}/5</span>
              </div>
              <div className="progress-bar rounded-full h-2 overflow-hidden">
                <div 
                  className="progress-fill h-full rounded-full" 
                  style={{ width: `${(statsData.weeklyProgress.monday / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700">Tuesday</span>
                <span className="text-sm text-slate-600">{statsData.weeklyProgress.tuesday}/5</span>
              </div>
              <div className="progress-bar rounded-full h-2 overflow-hidden">
                <div 
                  className="progress-fill h-full rounded-full" 
                  style={{ width: `${(statsData.weeklyProgress.tuesday / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700">Wednesday</span>
                <span className="text-sm text-slate-600">{statsData.weeklyProgress.wednesday}/5</span>
              </div>
              <div className="progress-bar rounded-full h-2 overflow-hidden">
                <div 
                  className="progress-fill h-full rounded-full" 
                  style={{ width: `${(statsData.weeklyProgress.wednesday / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700">Thursday</span>
                <span className="text-sm text-slate-600">{statsData.weeklyProgress.thursday}/5</span>
              </div>
              <div className="progress-bar rounded-full h-2 overflow-hidden">
                <div 
                  className="progress-fill h-full rounded-full" 
                  style={{ width: `${(statsData.weeklyProgress.thursday / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700">Friday</span>
                <span className="text-sm text-slate-600">{statsData.weeklyProgress.friday}/5</span>
              </div>
              <div className="progress-bar rounded-full h-2 overflow-hidden">
                <div 
                  className="progress-fill h-full rounded-full" 
                  style={{ width: `${(statsData.weeklyProgress.friday / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Skills */}
        <div className="glassy-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Top Skills</h3>
          </div>
          
          <div className="space-y-3">
            {statsData.topSkills.map((skill, index) => {
              const color = getSkillColor(skill.name)
              return (
                <div key={index} className="skill-badge flex items-center justify-between p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                      {getSkillIcon(skill.name)}
                    </div>
                    <span className="font-medium text-slate-800 text-sm">{skill.name}</span>
                  </div>
                  <span className={`text-sm font-semibold text-${color}-600`}>{skill.percentage}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glassy-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={exportStats}
              className="quick-action-btn w-full p-3 rounded-xl text-left flex items-center gap-3 group"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Download className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 text-sm">Export Stats</div>
                <div className="text-xs text-slate-600">Download detailed report</div>
              </div>
            </button>
            
            <button 
              onClick={shareStats}
              className="quick-action-btn w-full p-3 rounded-xl text-left flex items-center gap-3 group"
            >
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Share2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 text-sm">Share Progress</div>
                <div className="text-xs text-slate-600">Share with friends</div>
              </div>
            </button>
            
            <button 
              onClick={setGoals}
              className="quick-action-btn w-full p-3 rounded-xl text-left flex items-center gap-3 group"
            >
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 text-sm">Set Goals</div>
                <div className="text-xs text-slate-600">Define new targets</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}