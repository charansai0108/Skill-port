'use client'

import { useState } from 'react'
import { 
  GraduationCap, 
  LayoutDashboard, 
  Trophy, 
  MessageCircle, 
  BarChart3, 
  Plus, 
  X, 
  Flag, 
  Check, 
  PlusCircle
} from 'lucide-react'
import Link from 'next/link'

export default function MentorContestManagePage() {
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false)
  const [showUserDetailModal, setShowUserDetailModal] = useState(false)
  const [showFlaggedSummaryModal, setShowFlaggedSummaryModal] = useState(false)
  const [showFlaggedDetailModal, setShowFlaggedDetailModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedQuestion, setSelectedQuestion] = useState<{
    name: string
    problemNo: number
    topic: string
    submitted: string
    code: string
  } | null>(null)

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const taskData = {
      title: formData.get('title'),
      description: formData.get('description'),
      topic: formData.get('topic'),
      platform: formData.get('platform'),
      link: formData.get('link'),
      difficulty: formData.get('difficulty'),
      points: parseInt(formData.get('points') as string)
    }
    
    console.log('Adding task:', taskData)
    setShowAddTaskModal(false)
    // TODO: Implement API call
  }

  const getQuestionData = (questionId: number) => {
    const questions = {
      1: {
        name: 'Reverse Linked List',
        problemNo: 2,
        topic: 'Linked List',
        submitted: '2 hours ago',
        code: `function reverseList(head) {
  let prev = null;
  let current = head;
  
  while (current !== null) {
      let next = current.next;
      current.next = prev;
      prev = current;
      current = next;
  }
  
  return prev;
}`
      },
      2: {
        name: 'Two Sum',
        problemNo: 1,
        topic: 'Arrays',
        submitted: '1 hour ago',
        code: `function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
      const complement = target - nums[i];
      if (map.has(complement)) {
          return [map.get(complement), i];
      }
      map.set(nums[i], i);
  }
  
  return [];
}`
      }
    }
    return questions[questionId as keyof typeof questions] || null
  }

  const openFlaggedDetailModal = (questionId: number) => {
    setShowFlaggedSummaryModal(false)
    const questionData = getQuestionData(questionId)
    setSelectedQuestion(questionData)
    setTimeout(() => {
      setShowFlaggedDetailModal(true)
    }, 200)
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-orange-50 min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Satya Sai
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/mentor/dashboard" className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/mentor/contests" className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-orange-50 text-orange-700 shadow-sm">
                <Trophy className="w-4 h-4" />
                Contests
              </Link>
              <Link href="/mentor/feedback" className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                <MessageCircle className="w-4 h-4" />
                Feedback
              </Link>
              <Link href="/mentor/leaderboard" className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                <BarChart3 className="w-4 h-4" />
                Leaderboard
              </Link>
              <Link href="/mentor/profile" className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg border-2 border-white">
                  <span className="text-white font-bold text-xs">SS</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-content">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Weekly Algorithm Challenge</h1>
          <p className="text-lg text-slate-600">Manage problems and view leaderboard for this contest.</p>
        </div>

        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 dashboard-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Tasks</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowLeaderboardModal(true)}
                  className="glass-btn p-2 rounded-lg border border-slate-200 hover:bg-orange-50 hover:border-orange-200" 
                  title="View Leaderboard"
                >
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </button>
                <button 
                  onClick={() => setShowAddTaskModal(true)}
                  className="glass-btn bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Topic</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Platform</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Link</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Difficulty</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-gradient-to-r from-orange-50 to-amber-50 hover:bg-orange-100 table-row-hover">
                    <td className="px-6 py-4 font-semibold text-slate-900">Two Sum</td>
                    <td className="px-6 py-4 text-slate-700">Find indices of two numbers that add up to a target.</td>
                    <td className="px-6 py-4 text-orange-700 font-medium">Arrays</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold">LC</div>
                        <span className="text-slate-700">LeetCode</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-orange-600 underline"><a href="#" target="_blank">View</a></td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Easy</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-orange-600">100</td>
                  </tr>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:bg-blue-100 table-row-hover">
                    <td className="px-6 py-4 font-semibold text-slate-900">Reverse Linked List</td>
                    <td className="px-6 py-4 text-slate-700">Reverse a singly linked list.</td>
                    <td className="px-6 py-4 text-blue-700 font-medium">Linked List</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">CF</div>
                        <span className="text-slate-700">Codeforces</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-blue-600 underline"><a href="#" target="_blank">View</a></td>
                    <td className="px-6 py-4">
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-semibold">Medium</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-blue-600">200</td>
                  </tr>
                  <tr className="bg-gradient-to-r from-green-50 to-emerald-50 hover:bg-green-100 table-row-hover">
                    <td className="px-6 py-4 font-semibold text-slate-900">Binary Tree Traversal</td>
                    <td className="px-6 py-4 text-slate-700">Implement inorder, preorder, and postorder traversal.</td>
                    <td className="px-6 py-4 text-green-700 font-medium">Trees</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">HR</div>
                        <span className="text-slate-700">HackerRank</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-green-600 underline"><a href="#" target="_blank">View</a></td>
                    <td className="px-6 py-4">
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">Hard</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600">300</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Task Modal */}
        {showAddTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center modal-bg">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative">
              <button 
                onClick={() => setShowAddTaskModal(false)}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-orange-600" />
                Add New Task
              </h3>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input type="text" name="title" required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea name="description" required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                    <input type="text" name="topic" required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
                    <input type="text" name="platform" required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Link</label>
                    <input type="url" name="link" required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                    <select name="difficulty" required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none">
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Points</label>
                  <input type="number" name="points" min="0" required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none" />
                </div>
                <div className="flex justify-end mt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowAddTaskModal(false)}
                    className="mr-3 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="glass-btn bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    Save Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Leaderboard Modal */}
        {showLeaderboardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center modal-bg">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full relative">
              <button 
                onClick={() => setShowLeaderboardModal(false)}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-orange-600" />
                Contest Leaderboard
              </h3>
              <div className="flex justify-end mb-4">
                <Link 
                  href="/mentor/contests/1/leaderboard" 
                  className="glass-btn bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700"
                >
                  <BarChart3 className="w-4 h-4" />
                  View Full Leaderboard
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Rank</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Problems Solved</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Flagged</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-gradient-to-r from-yellow-50 to-amber-50 hover:bg-yellow-100 table-row-hover">
                      <td className="px-6 py-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">P</div>
                          <div>
                            <div className="font-semibold text-slate-900">Priya Sharma</div>
                            <div className="text-xs text-slate-500">@priyasharma</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">3/3</td>
                      <td className="px-6 py-4">
                        <span 
                          className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs cursor-pointer" 
                          onClick={() => {
                            setSelectedUser('Priya Sharma')
                            setShowLeaderboardModal(false)
                            setTimeout(() => setShowFlaggedSummaryModal(true), 200)
                          }}
                        >
                          2
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-gradient-to-r from-slate-50 to-gray-50 hover:bg-slate-100 table-row-hover">
                      <td className="px-6 py-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-gray-500 rounded-full flex items-center justify-center text-white font-semibold">R</div>
                          <div>
                            <div className="font-semibold text-slate-900">Rahul Kumar</div>
                            <div className="text-xs text-slate-500">@rahulkumar</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">3/3</td>
                      <td className="px-6 py-4">
                        <span 
                          className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs cursor-pointer"
                          onClick={() => {
                            setSelectedUser('Rahul Kumar')
                            setShowLeaderboardModal(false)
                            setTimeout(() => setShowFlaggedSummaryModal(true), 200)
                          }}
                        >
                          1
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-gradient-to-r from-orange-50 to-amber-50 hover:bg-orange-100 table-row-hover">
                      <td className="px-6 py-4">
                        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-semibold">A</div>
                          <div>
                            <div className="font-semibold text-slate-900">Amit Patel</div>
                            <div className="text-xs text-slate-500">@amitpatel</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">2/3</td>
                      <td className="px-6 py-4">
                        <span 
                          className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs cursor-pointer"
                          onClick={() => {
                            setSelectedUser('Amit Patel')
                            setShowLeaderboardModal(false)
                            setTimeout(() => setShowFlaggedSummaryModal(true), 200)
                          }}
                        >
                          0
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Flagged Summary Modal */}
        {showFlaggedSummaryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center modal-bg">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full relative">
              <button 
                onClick={() => setShowFlaggedSummaryModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    <Flag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Flagged Questions Summary</h3>
                    <p className="text-slate-600">Review flagged problems for <span className="font-semibold text-orange-600">{selectedUser}</span></p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">2</div>
                    <div className="text-slate-600">Total Flagged Questions</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-slate-900 mb-3">Flagged Questions:</h4>
                
                <div 
                  className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200 hover:bg-orange-100 cursor-pointer transition-colors" 
                  onClick={() => openFlaggedDetailModal(1)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">#1</span>
                      <div>
                        <div className="font-semibold text-slate-900">Reverse Linked List</div>
                        <div className="text-sm text-slate-600">Problem 2 • Linked List</div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">2 hours ago</div>
                  </div>
                </div>
                
                <div 
                  className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200 hover:bg-orange-100 cursor-pointer transition-colors" 
                  onClick={() => openFlaggedDetailModal(2)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">#2</span>
                      <div>
                        <div className="font-semibold text-slate-900">Two Sum</div>
                        <div className="text-sm text-slate-600">Problem 1 • Arrays</div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">1 hour ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flagged Detail Modal */}
        {showFlaggedDetailModal && selectedQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center modal-bg">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full relative">
              <button 
                onClick={() => setShowFlaggedDetailModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    <Flag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Flagged Question Details</h3>
                    <p className="text-slate-600">Reviewing <span className="font-semibold text-orange-600">{selectedQuestion.name}</span> for <span className="font-semibold text-orange-600">{selectedUser}</span></p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">Flagged</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-600">Problem {selectedQuestion.problemNo}</span>
                    </div>
                    <div className="text-sm text-slate-500">Submitted {selectedQuestion.submitted}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{selectedQuestion.problemNo}</div>
                      <div className="text-sm text-slate-600">Problem No</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-slate-900">{selectedQuestion.name}</div>
                      <div className="text-sm text-slate-600">Problem Name</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-700">{selectedQuestion.topic}</div>
                      <div className="text-sm text-slate-600">Topic</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Submitted Code:</label>
                    <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm font-mono">{selectedQuestion.code}</pre>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                      <Check className="w-4 h-4 inline mr-2" />
                      Approve
                    </button>
                    <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                      <X className="w-4 h-4 inline mr-2" />
                      Reject
                    </button>
                    <button className="flex-1 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                      <MessageCircle className="w-4 h-4 inline mr-2" />
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}