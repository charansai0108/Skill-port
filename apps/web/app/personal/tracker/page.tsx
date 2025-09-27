'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Activity,
  BarChart3,
  Target,
  CheckCircle,
  Flame,
  TrendingUp,
  Calendar,
  Award,
  Clock,
  Edit3,
  Trophy,
  Star,
  Plus,
  RefreshCw,
  Download,
  X,
  Check,
  Circle
} from 'lucide-react'

interface Task {
  id: number
  description: string
  platform: string
  difficulty: string
  completed: boolean
}

interface DailyTasks {
  [key: string]: Task[]
}

export default function PersonalTrackerPage() {
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [currentDay, setCurrentDay] = useState('')
  const [taskInput, setTaskInput] = useState('')
  const [taskPlatform, setTaskPlatform] = useState('LeetCode')
  const [taskDifficulty, setTaskDifficulty] = useState('Easy')
  const [dailyTasks, setDailyTasks] = useState<DailyTasks>({
    'Monday': [],
    'Tuesday': [],
    'Wednesday': [],
    'Thursday': [],
    'Friday': [],
    'Saturday': [],
    'Sunday': []
  })

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'Easy': return 'text-green-600'
      case 'Medium': return 'text-amber-600'
      case 'Hard': return 'text-red-600'
      default: return 'text-slate-600'
    }
  }

  const getDifficultyBg = (difficulty: string) => {
    switch(difficulty) {
      case 'Easy': return 'green-100'
      case 'Medium': return 'amber-100'
      case 'Hard': return 'red-100'
      default: return 'slate-100'
    }
  }

  const showTaskInput = (day: string) => {
    setCurrentDay(day)
    setShowTaskModal(true)
    setTaskInput('')
  }

  const closeTaskModal = () => {
    setShowTaskModal(false)
    setCurrentDay('')
    setTaskInput('')
  }

  const addTask = () => {
    if (!taskInput.trim()) {
      alert('Please enter a task description')
      return
    }

    const task: Task = {
      id: Date.now(),
      description: taskInput.trim(),
      platform: taskPlatform,
      difficulty: taskDifficulty,
      completed: false
    }

    setDailyTasks(prev => ({
      ...prev,
      [currentDay]: [...prev[currentDay], task]
    }))

    closeTaskModal()
  }

  const toggleTaskComplete = (taskId: number) => {
    setDailyTasks(prev => ({
      ...prev,
      [currentDay]: prev[currentDay].map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }))
  }

  const getTodayTasks = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    return dailyTasks[today] || []
  }

  const getDayProgress = (day: string) => {
    const tasks = dailyTasks[day] || []
    const completed = tasks.filter(t => t.completed).length
    const total = tasks.length
    return { completed, total }
  }

  const getDayBoxStyle = (day: string) => {
    const { completed, total } = getDayProgress(day)
    if (total === 0) {
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        content: '-'
      }
    }
    
    const completionRate = completed / total
    if (completionRate >= 0.8) {
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        content: `${completed}/${total}`
      }
    } else if (completionRate >= 0.6) {
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        content: `${completed}/${total}`
      }
    } else {
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        content: `${completed}/${total}`
      }
    }
  }

  const weeklyDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg page-header-icon">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 mb-1">Progress Tracker</h1>
          <p className="text-sm text-slate-600">Monitor your learning progress and stay on track</p>
        </div>
      </div>

      {/* Enhanced Stats Section */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Today&apos;s Progress</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">12</span>
            </div>
            <div className="text-sm text-slate-600">Today&apos;s Tasks</div>
            <div className="text-xs text-green-600 mt-1">+3 from yesterday</div>
          </div>
          
          <div className="stat-card rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">8</span>
            </div>
            <div className="text-sm text-slate-600">Completed</div>
            <div className="text-xs text-green-600 mt-1">67% success rate</div>
          </div>
          
          <div className="stat-card rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-600 streak-fire" />
              <span className="text-2xl font-bold text-orange-600">23</span>
            </div>
            <div className="text-sm text-slate-600">Day Streak</div>
            <div className="text-xs text-orange-600 mt-1">Personal best!</div>
          </div>
          
          <div className="stat-card rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">67%</span>
            </div>
            <div className="text-sm text-slate-600">Success Rate</div>
            <div className="text-xs text-purple-600 mt-1">+5% this week</div>
          </div>
        </div>
      </div>

      {/* Weekly Overview Section */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Weekly Overview</h2>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weeklyDays.map((day) => {
            const dayStyle = getDayBoxStyle(day)
            return (
              <div 
                key={day}
                className="text-center weekly-day cursor-pointer"
                onClick={() => showTaskInput(day)}
              >
                <div className="text-xs text-slate-500 mb-1">{day.substring(0, 3)}</div>
                <div className={`w-8 h-8 ${dayStyle.bg} day-box flex items-center justify-center mx-auto`}>
                  <span className={`text-xs font-semibold ${dayStyle.text}`}>{dayStyle.content}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Click to add tasks</div>
              </div>
            )
          })}
        </div>
        
        <div className="flex justify-between items-center text-sm mb-4">
          <span className="text-slate-600">Weekly Goal: 25 problems</span>
          <span className="text-green-600 font-semibold">25/25 completed ✓</span>
        </div>

        {/* Daily Tasks Display */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Today&apos;s Tasks</h4>
          <div className="space-y-2">
            {getTodayTasks().length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No tasks for today. Click on any day above to add tasks!</p>
            ) : (
              getTodayTasks().map((task) => (
                <div 
                  key={task.id}
                  className={`flex items-center justify-between p-3 ${task.completed ? 'bg-green-50' : 'bg-blue-50'} rounded-lg`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 ${task.completed ? 'bg-green-600' : 'bg-blue-600'} rounded-full`}></div>
                    <span className="text-sm text-slate-700">{task.description} - {task.platform}</span>
                    <span className={`text-xs ${getDifficultyColor(task.difficulty)} bg-${getDifficultyBg(task.difficulty)} px-2 py-1 rounded`}>
                      {task.difficulty}
                    </span>
                  </div>
                  <button 
                    onClick={() => toggleTaskComplete(task.id)}
                    className={`${task.completed ? 'text-green-600 hover:text-green-700' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {task.completed ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Progress Overview Section */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Progress Overview</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-xl percentage-card">
            <div className="text-3xl font-bold text-blue-600 mb-2">90%</div>
            <div className="text-sm font-semibold text-slate-700 mb-1">Easy Problems</div>
            <div className="text-xs text-slate-600">45/50 completed</div>
            <div className="text-xs text-blue-600 mt-1">5 more to complete</div>
          </div>
          
          <div className="text-center p-4 bg-amber-50 rounded-xl percentage-card">
            <div className="text-3xl font-bold text-amber-600 mb-2">58%</div>
            <div className="text-sm font-semibold text-slate-700 mb-1">Medium Problems</div>
            <div className="text-xs text-slate-600">23/40 completed</div>
            <div className="text-xs text-amber-600 mt-1">17 more to complete</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-xl percentage-card">
            <div className="text-3xl font-bold text-red-600 mb-2">40%</div>
            <div className="text-sm font-semibold text-slate-700 mb-1">Hard Problems</div>
            <div className="text-xs text-slate-600">8/20 completed</div>
            <div className="text-xs text-red-600 mt-1">12 more to complete</div>
          </div>
        </div>
      </div>

      {/* Top Skills Section */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Award className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Top Skills</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-xl skill-card">
            <div className="text-2xl font-bold text-purple-600 mb-1">95%</div>
            <div className="text-sm font-semibold text-slate-700">Algorithms</div>
            <div className="text-xs text-purple-600 mt-1">Expert Level</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-xl skill-card">
            <div className="text-2xl font-bold text-blue-600 mb-1">88%</div>
            <div className="text-sm font-semibold text-slate-700">Web Development</div>
            <div className="text-xs text-blue-600 mt-1">Advanced</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-xl skill-card">
            <div className="text-2xl font-bold text-green-600 mb-1">82%</div>
            <div className="text-sm font-semibold text-slate-700">Database</div>
            <div className="text-xs text-green-600 mt-1">Proficient</div>
          </div>
          
          <div className="text-center p-4 bg-amber-50 rounded-xl skill-card">
            <div className="text-2xl font-bold text-amber-600 mb-1">75%</div>
            <div className="text-sm font-semibold text-slate-700">Mobile Dev</div>
            <div className="text-xs text-amber-600 mt-1">Intermediate</div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Recent Achievements</h4>
          <div className="flex flex-wrap gap-2">
            <span className="skill-badge">Dynamic Programming</span>
            <span className="skill-badge">Graph Algorithms</span>
            <span className="skill-badge">React.js</span>
            <span className="skill-badge">Node.js</span>
          </div>
        </div>
      </div>

      {/* Recent Activity and Quick Actions Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Section */}
        <div className="card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 hover:bg-green-50/50 rounded-xl transition-colors activity-item">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 text-sm">Solved Two Sum</h4>
                <p className="text-xs text-slate-600">2 hours ago • LeetCode</p>
              </div>
              <div className="text-xs text-green-600 font-semibold">+10 pts</div>
            </div>
            
            <div className="flex items-center gap-3 p-3 hover:bg-blue-50/50 rounded-xl transition-colors activity-item">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 text-sm">Started Add Two Numbers</h4>
                <p className="text-xs text-slate-600">4 hours ago • HackerRank</p>
              </div>
              <div className="text-xs text-blue-600 font-semibold">In Progress</div>
            </div>
            
            <div className="flex items-center gap-3 p-3 hover:bg-amber-50/50 rounded-xl transition-colors activity-item">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 text-sm">Completed Easy Set</h4>
                <p className="text-xs text-slate-600">1 day ago • GeeksforGeeks</p>
              </div>
              <div className="text-xs text-amber-600 font-semibold">+50 pts</div>
            </div>
            
            <div className="flex items-center gap-3 p-3 hover:bg-purple-50/50 rounded-xl transition-colors activity-item">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 text-sm">Earned &quot;Speed Demon&quot; Badge</h4>
                <p className="text-xs text-slate-600">2 days ago • Solved 5 problems in 1 hour</p>
              </div>
              <div className="text-xs text-purple-600 font-semibold">New Badge</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => showTaskInput('Today')}
              className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-xl text-left flex items-center gap-3 transition-colors action-button"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">Add New Task</div>
                <div className="text-xs text-slate-600">Create a new practice task</div>
              </div>
            </button>
            
            <button className="w-full p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-left flex items-center gap-3 transition-colors action-button">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">Sync Platforms</div>
                <div className="text-xs text-slate-600">Update from LeetCode, GFG</div>
              </div>
            </button>
            
            <button className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-xl text-left flex items-center gap-3 transition-colors action-button">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">Export Progress</div>
                <div className="text-xs text-slate-600">Download progress report</div>
              </div>
            </button>
            
            <button className="w-full p-4 bg-amber-50 hover:bg-amber-100 rounded-xl text-left flex items-center gap-3 transition-colors action-button">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">Set Goals</div>
                <div className="text-xs text-slate-600">Define learning targets</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Task Input Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Add Tasks for {currentDay}</h3>
              <button 
                onClick={closeTaskModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Task Description</label>
                <input 
                  type="text" 
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="Enter task description..." 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 task-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Platform</label>
                <select 
                  value={taskPlatform}
                  onChange={(e) => setTaskPlatform(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="LeetCode">LeetCode</option>
                  <option value="HackerRank">HackerRank</option>
                  <option value="GeeksforGeeks">GeeksforGeeks</option>
                  <option value="CodeForces">CodeForces</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty</label>
                <select 
                  value={taskDifficulty}
                  onChange={(e) => setTaskDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={closeTaskModal}
                className="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={addTask}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}