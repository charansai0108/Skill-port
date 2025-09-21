'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  Code,
  Globe,
  TrendingUp,
  Zap,
  Database,
  Smartphone,
  Shield,
  Gamepad2,
  Cloud,
  MessageCircle,
  Plus,
  Filter,
  ChevronDown,
  Bell,
  X,
  ThumbsUp,
  MessageSquare,
  Eye,
  Clock,
  Star
} from 'lucide-react'

interface Community {
  id: string
  name: string
  description: string
  members: number
  discussions: number
  category: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  isJoined?: boolean
  memberSince?: string
  status?: string
}

interface JoinedCommunity {
  id: string
  name: string
  memberSince: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
}

interface Question {
  id: string
  title: string
  content: string
  author: string
  community: string
  votes: number
  answers: number
  views: number
  timeAgo: string
  tags: string[]
  isAnswered: boolean
  isUnanswered?: boolean
}

interface FilterState {
  category: string
  sortBy: string
  showJoined: boolean
}

export default function PersonalCommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    sortBy: 'popular',
    showJoined: false
  })
  
  const [joinedCommunities, setJoinedCommunities] = useState<JoinedCommunity[]>([
    {
      id: 'algorithms-masters',
      name: 'Algorithms Masters',
      memberSince: '2 months',
      icon: Code,
      gradient: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'web-dev-hub',
      name: 'Web Dev Hub',
      memberSince: '1 month',
      icon: Globe,
      gradient: 'from-emerald-600 to-teal-600'
    }
  ])

  const [recentQuestions] = useState<Question[]>([
    {
      id: '1',
      title: 'How to optimize React component re-renders?',
      content: 'I have a complex React component that re-renders too frequently. What are the best practices to optimize this?',
      author: 'john_doe',
      community: 'React Developers',
      votes: 24,
      answers: 8,
      views: 156,
      timeAgo: '2 hours ago',
      tags: ['react', 'performance', 'optimization'],
      isAnswered: true
    },
    {
      id: '2',
      title: 'Binary Tree traversal algorithms comparison',
      content: 'Can someone explain the differences between inorder, preorder, and postorder traversal?',
      author: 'alice_smith',
      community: 'Algorithm Masters',
      votes: 18,
      answers: 0,
      views: 89,
      timeAgo: '4 hours ago',
      tags: ['algorithms', 'binary-tree', 'data-structures'],
      isAnswered: false,
      isUnanswered: true
    },
    {
      id: '3',
      title: 'Best practices for API error handling',
      content: 'What are the industry standards for handling API errors in a RESTful service?',
      author: 'bob_wilson',
      community: 'Backend Developers',
      votes: 31,
      answers: 12,
      views: 203,
      timeAgo: '6 hours ago',
      tags: ['api', 'error-handling', 'rest'],
      isAnswered: true
    }
  ])

  const [notifications] = useState([
    {
      id: '1',
      title: 'New Answer',
      message: 'Someone answered your question about React optimization',
      time: '5 min ago',
      read: false,
      community: 'React Developers'
    },
    {
      id: '2',
      title: 'Community Update',
      message: 'New challenge posted in Algorithm Masters',
      time: '1 hour ago',
      read: false,
      community: 'Algorithm Masters'
    },
    {
      id: '3',
      title: 'Question Trending',
      message: 'Your question about API error handling is trending',
      time: '2 hours ago',
      read: true,
      community: 'Backend Developers'
    }
  ])

  // Enhanced functionality methods
  const handleJoinCommunity = (communityId: string) => {
    // In a real app, this would make an API call
    console.log('Joining community:', communityId)
    // Update UI optimistically
  }

  const handlePostQuestion = (communityId: string) => {
    // In a real app, this would open a question posting modal
    console.log('Posting question to community:', communityId)
  }

  const handleFilterChange = (key: keyof FilterState, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const unreadNotifications = notifications.filter(n => !n.read).length

  const filteredCommunities = featuredCommunities.filter(community => {
    if (filters.showJoined && !community.isJoined) return false
    if (filters.category !== 'all' && community.category !== filters.category) return false
    if (searchQuery && !community.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const [popularCommunities] = useState([
    {
      id: 'ai-ml-hub',
      name: 'AI & ML Hub',
      members: '3.2k',
      status: 'Trending',
      icon: Zap,
      gradient: 'from-orange-500 to-red-600',
      color: 'orange'
    },
    {
      id: 'full-stack-devs',
      name: 'Full Stack Devs',
      members: '2.8k',
      status: 'Popular',
      icon: Code,
      gradient: 'from-purple-500 to-pink-600',
      color: 'purple'
    },
    {
      id: 'devops-engineers',
      name: 'DevOps Engineers',
      members: '1.9k',
      status: 'Growing',
      icon: Database,
      gradient: 'from-blue-500 to-indigo-600',
      color: 'blue'
    }
  ])

  const [featuredCommunities] = useState<Community[]>([
    {
      id: 'algorithms-masters',
      name: 'Algorithm Masters',
      description: 'Master algorithms and data structures with competitive programming enthusiasts. Daily challenges and expert guidance.',
      members: 2400,
      discussions: 156,
      category: 'Competitive Programming',
      icon: Code,
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'web-dev-hub',
      name: 'Web Dev Hub',
      description: 'Modern web development techniques, frameworks, and best practices. Build amazing web experiences together.',
      members: 1800,
      discussions: 89,
      category: 'Web Development',
      icon: Globe,
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'data-science-pro',
      name: 'Data Science Pro',
      description: 'Machine learning, data analysis, and AI development. Explore the future of technology with data enthusiasts.',
      members: 1200,
      discussions: 67,
      category: 'AI & Machine Learning',
      icon: Database,
      gradient: 'from-purple-500 to-pink-600'
    }
  ])

  const [allCommunities] = useState<Community[]>([
    {
      id: 'mobile-dev-league',
      name: 'Mobile Dev League',
      description: 'Mobile app development for iOS and Android platforms.',
      members: 950,
      discussions: 0,
      category: 'Mobile Development',
      icon: Smartphone,
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      id: 'cybersecurity-club',
      name: 'Cybersecurity Club',
      description: 'Security best practices and ethical hacking techniques.',
      members: 650,
      discussions: 0,
      category: 'Cybersecurity',
      icon: Shield,
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'game-dev-studio',
      name: 'Game Dev Studio',
      description: 'Game development using Unity, Unreal Engine, and more.',
      members: 780,
      discussions: 0,
      category: 'Game Development',
      icon: Gamepad2,
      gradient: 'from-rose-500 to-pink-600'
    },
    {
      id: 'cloud-architects',
      name: 'Cloud Architects',
      description: 'Cloud computing, AWS, Azure, and infrastructure design.',
      members: 520,
      discussions: 0,
      category: 'Cloud Computing',
      icon: Cloud,
      gradient: 'from-indigo-500 to-purple-600'
    }
  ])

  const handleJoinCommunity = (communityId: string) => {
    // In a real app, this would make an API call to join the community
    alert(`Joining community: ${communityId}`)
  }

  const handleViewCommunity = (communityId: string) => {
    // In a real app, this would navigate to the community page
    alert(`Viewing community: ${communityId}`)
  }

  const filteredCommunities = allCommunities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-content">
      {/* Header Section with Search */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12">
        {/* Left Side: Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Join Amazing Communities</h1>
            <p className="text-sm text-slate-600">Connect with developers, share knowledge, and grow together</p>
          </div>
        </div>
        
        {/* Right Side: Enhanced Search and Actions */}
        <div className="flex items-center gap-4 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 lg:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search communities..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
            />
          </div>
          
          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-300 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-12 h-12 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-300 transition-colors flex items-center justify-center relative"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-16 right-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Community Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time} • {notification.community}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Filters Panel */}
      {showFilters && (
        <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filter Communities</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Competitive Programming">Competitive Programming</option>
                <option value="Web Development">Web Development</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Game Development">Game Development</option>
                <option value="Cloud Computing">Cloud Computing</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Most Recent</option>
                <option value="members">Most Members</option>
                <option value="discussions">Most Active</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showJoined}
                  onChange={(e) => handleFilterChange('showJoined', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Show only joined communities</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Joined Communities */}
        <div className="glassy-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Joined Communities</h3>
          </div>
          
          <div className="space-y-4">
            {joinedCommunities.map((community) => {
              const IconComponent = community.icon
              return (
                <div key={community.id} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${community.gradient} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 text-sm">{community.name}</div>
                      <div className="text-xs text-slate-600">Member since {community.memberSince}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleViewCommunity(community.id)}
                    className="view-community-btn px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-medium rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    View
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Popular Communities */}
        <div className="glassy-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Popular Communities</h3>
          </div>
          
          <div className="space-y-3">
            {popularCommunities.map((community) => {
              const IconComponent = community.icon
              return (
                <div key={community.id} className="flex items-center gap-3 p-3 bg-orange-50/50 rounded-xl">
                  <div className={`w-8 h-8 bg-gradient-to-br ${community.gradient} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800 text-sm">{community.name}</div>
                    <div className="text-xs text-slate-600">{community.members} members • {community.status}</div>
                  </div>
                  <button 
                    onClick={() => handleJoinCommunity(community.id)}
                    className={`px-2 py-1 bg-${community.color}-100 text-${community.color}-700 text-xs font-medium rounded-lg hover:bg-${community.color}-200 transition-colors`}
                  >
                    Join
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Questions Section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Recent Questions</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              Ask Question
            </button>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
              View All
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recentQuestions.map((question) => (
            <div key={question.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{question.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{question.content}</p>
                </div>
                {question.isUnanswered && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    Unanswered
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{question.votes}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MessageSquare className="w-4 h-4" />
                  <span>{question.answers}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Eye className="w-4 h-4" />
                  <span>{question.views}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{question.timeAgo}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">{question.author[0].toUpperCase()}</span>
                  </div>
                  <span className="text-sm text-gray-600">{question.author}</span>
                  <span className="text-sm text-gray-400">in {question.community}</span>
                </div>
                <div className="flex gap-1">
                  {question.tags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Communities */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Featured Communities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCommunities.map((community) => {
            const IconComponent = community.icon
            return (
              <div key={community.id} className="community-card rounded-3xl p-8 flex flex-col">
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${community.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">{community.name}</h3>
                  <div className="flex items-center justify-center gap-6 text-sm text-slate-600 mb-5">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {community.members.toLocaleString()} members
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {community.discussions} discussions
                    </span>
                  </div>
                  <div className="category-badge inline-block px-3 py-1 rounded-full text-sm font-medium mb-6">
                    {community.category}
                  </div>
                </div>
                <p className="text-slate-700 text-center mb-8 leading-relaxed flex-grow">{community.description}</p>
                <div className="text-center mt-auto">
                  <button 
                    onClick={() => handleJoinCommunity(community.id)}
                    className="join-btn px-8 py-3 rounded-2xl font-semibold text-lg w-full"
                  >
                    Join Community
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* All Communities Grid */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Explore More Communities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCommunities.map((community) => {
            const IconComponent = community.icon
            return (
              <div key={community.id} className="community-card rounded-2xl p-6 text-center flex flex-col group hover:shadow-xl transition-all duration-300">
                <div className={`w-16 h-16 bg-gradient-to-br ${community.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{community.name}</h3>
                <p className="text-sm text-slate-600 mb-2">{community.members.toLocaleString()} members</p>
                <p className="text-xs text-slate-500 mb-4">{community.discussions} discussions</p>
                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => handleJoinCommunity(community.id)}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    {community.isJoined ? 'Joined' : 'Join'}
                  </button>
                  <button 
                    onClick={() => handlePostQuestion(community.id)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors"
                    title="Post Question"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}