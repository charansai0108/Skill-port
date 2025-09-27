'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Trophy,
  Plus,
  BarChart3,
  X,
  Check,
  MessageCircle,
  Flag,
  Settings
} from 'lucide-react'

interface Task {
  id: number
  title: string
  description: string
  topic: string
  platform: string
  platformIcon: string
  link: string
  difficulty: string
  points: number
  color: string
}

interface LeaderboardEntry {
  id: number
  rank: number
  name: string
  username: string
  avatar: string
  problemsSolved: string
  flagged: number
  flaggedColor: string
}

export default function MentorContestManagePage() {
  const params = useParams()
  const contestId = params.id as string

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Two Sum',
      description: 'Find indices of two numbers that add up to a target.',
      topic: 'Arrays',
      platform: 'LeetCode',
      platformIcon: 'LC',
      link: '#',
      difficulty: 'Easy',
      points: 100,
      color: 'orange'
    },
    {
      id: 2,
      title: 'Reverse Linked List',
      description: 'Reverse a singly linked list.',
      topic: 'Linked List',
      platform: 'Codeforces',
      platformIcon: 'CF',
      link: '#',
      difficulty: 'Medium',
      points: 200,
      color: 'blue'
    },
    {
      id: 3,
      title: 'Binary Tree Traversal',
      description: 'Implement inorder, preorder, and postorder traversal.',
      topic: 'Trees',
      platform: 'HackerRank',
      platformIcon: 'HR',
      link: '#',
      difficulty: 'Hard',
      points: 300,
      color: 'green'
    }
  ])

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    {
      id: 1,
      rank: 1,
      name: 'Priya Sharma',
      username: '@priyasharma',
      avatar: 'P',
      problemsSolved: '3/3',
      flagged: 2,
      flaggedColor: 'red'
    },
    {
      id: 2,
      rank: 2,
      name: 'Rahul Kumar',
      username: '@rahulkumar',
      avatar: 'R',
      problemsSolved: '3/3',
      flagged: 1,
      flaggedColor: 'orange'
    },
    {
      id: 3,
      rank: 3,
      name: 'Amit Patel',
      username: '@amitpatel',
      avatar: 'A',
      problemsSolved: '2/3',
      flagged: 0,
      flaggedColor: 'green'
    },
    {
      id: 4,
      rank: 4,
      name: 'Neha Singh',
      username: '@nehasingh',
      avatar: 'N',
      problemsSolved: '1/3',
      flagged: 1,
      flaggedColor: 'red'
    }
  ])

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false)
  const [isFlaggedSummaryModalOpen, setIsFlaggedSummaryModalOpen] = useState(false)
  const [isFlaggedDetailModalOpen, setIsFlaggedDetailModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedQuestion, setSelectedQuestion] = useState<{
    name: string
    problemNo: number
    topic: string
    submitted: string
    code: string
  } | null>(null)

  const getColorClasses = (color: string) => {
    const colors = {
      orange: 'from-orange-50 to-amber-50 hover:bg-orange-100',
      blue: 'from-blue-50 to-indigo-50 hover:bg-blue-100',
      green: 'from-green-50 to-emerald-50 hover:bg-green-100'
    }
    return colors[color as keyof typeof colors] || colors.orange
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      Easy: 'bg-green-100 text-green-700',
      Medium: 'bg-yellow-100 text-yellow-700',
      Hard: 'bg-red-100 text-red-700'
    }
    return colors[difficulty as keyof typeof colors] || colors.Easy
  }

  const getPlatformColor = (platform: string) => {
    const colors = {
      LeetCode: 'from-orange-400 to-yellow-500',
      Codeforces: 'from-blue-500 to-indigo-600',
      HackerRank: 'from-green-400 to-emerald-500'
    }
    return colors[platform as keyof typeof colors] || colors.LeetCode
  }

  const getFlaggedColor = (color: string) => {
    const colors = {
      red: 'bg-red-100 text-red-700',
      orange: 'bg-orange-100 text-orange-700',
      green: 'bg-green-100 text-green-700'
    }
    return colors[color as keyof typeof colors] || colors.red
  }

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newTask: Task = {
      id: tasks.length + 1,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      topic: formData.get('topic') as string,
      platform: formData.get('platform') as string,
      platformIcon: (formData.get('platform') as string).substring(0, 2).toUpperCase(),
      link: formData.get('link') as string,
      difficulty: formData.get('difficulty') as string,
      points: parseInt(formData.get('points') as string),
      color: 'orange'
    }
    setTasks([...tasks, newTask])
    setIsAddTaskModalOpen(false)
    // Reset form
    e.currentTarget.reset()
  }

  const showFlaggedModal = (userName: string) => {
    setSelectedUser(userName)
    setIsLeaderboardModalOpen(false)
    setTimeout(() => {
      setIsFlaggedSummaryModalOpen(true)
    }, 200)
  }

  const openFlaggedDetailModal = (questionId: number) => {
    const questionData = getQuestionData(questionId)
    setSelectedQuestion(questionData)
    setIsFlaggedSummaryModalOpen(false)
    setTimeout(() => {
      setIsFlaggedDetailModalOpen(true)
    }, 200)
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
    return questions[questionId as keyof typeof questions] || {}
  }

  return (
    <div>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-content">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Weekly Algorithm Challenge</h1>
          <p className="text-lg text-slate-600">Manage problems and view leaderboard for this contest.</p>
        </div>

        {/* Tasks Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 dashboard-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Tasks</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsLeaderboardModalOpen(true)}
                  className="glass-btn p-2 rounded-lg border border-slate-200 hover:bg-orange-50 hover:border-orange-200" 
                  title="View Leaderboard"
                >
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </button>
                <button 
                  onClick={() => setIsAddTaskModalOpen(true)}
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
                  {tasks.map((task) => (
                    <tr key={task.id} className={`bg-gradient-to-r ${getColorClasses(task.color)} table-row-hover`}>
                      <td className="px-6 py-4 font-semibold text-slate-900">{task.title}</td>
                      <td className="px-6 py-4 text-slate-700">{task.description}</td>
                      <td className="px-6 py-4 text-orange-700 font-medium">{task.topic}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 bg-gradient-to-br ${getPlatformColor(task.platform)} rounded-full flex items-center justify-center text-white font-bold`}>
                            {task.platformIcon}
                          </div>
                          <span className="text-slate-700">{task.platform}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-orange-600 underline">
                        <a href={task.link} target="_blank" rel="noopener noreferrer">View</a>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`${getDifficultyColor(task.difficulty)} px-2 py-1 rounded text-xs font-semibold`}>
                          {task.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-orange-600">{task.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Task Modal */}
        {isAddTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center modal-bg">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative">
              <button 
                onClick={() => setIsAddTaskModalOpen(false)}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                <Plus className="w-6 h-6 text-orange-600" />
                Add New Task
              </h3>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    required 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea 
                    name="description" 
                    required 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                    <input 
                      type="text" 
                      name="topic" 
                      required 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
                    <input 
                      type="text" 
                      name="platform" 
                      required 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Link</label>
                    <input 
                      type="url" 
                      name="link" 
                      required 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                    <select 
                      name="difficulty" 
                      required 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Points</label>
                  <input 
                    type="number" 
                    name="points" 
                    min="0" 
                    required 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none" 
                  />
                </div>
                <div className="flex justify-end mt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsAddTaskModalOpen(false)}
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
        {isLeaderboardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center modal-bg">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full relative">
              <button 
                onClick={() => setIsLeaderboardModalOpen(false)}
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
                  href={`/mentor/contests/${contestId}/leaderboard`}
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
                    {leaderboard.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50 table-row-hover">
                        <td className="px-6 py-4">
                          <div className={`w-8 h-8 ${
                            entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                            entry.rank === 2 ? 'bg-gradient-to-br from-slate-400 to-gray-500' :
                            entry.rank === 3 ? 'bg-orange-600' :
                            'bg-slate-300'
                          } rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                            {entry.rank}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {entry.avatar}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{entry.name}</div>
                              <div className="text-xs text-slate-500">{entry.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{entry.problemsSolved}</td>
                        <td className="px-6 py-4">
                          <span 
                            className={`${getFlaggedColor(entry.flaggedColor)} px-2 py-1 rounded text-xs cursor-pointer`}
                            onClick={() => showFlaggedModal(entry.name)}
                          >
                            {entry.flagged}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Flagged Summary Modal */}
        {isFlaggedSummaryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center modal-bg">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full relative">
              <button 
                onClick={() => setIsFlaggedSummaryModalOpen(false)}
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
        {isFlaggedDetailModalOpen && selectedQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center modal-bg">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full relative">
              <button 
                onClick={() => setIsFlaggedDetailModalOpen(false)}
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
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">Flagged #1</span>
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
