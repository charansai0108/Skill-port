'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  User,
  Settings,
  BookOpen,
  Lock,
  Sliders,
  Download,
  LogOut,
  Camera,
  Save,
  Plus,
  Key,
  Info,
  BarChart3,
  Award,
  History,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

interface LearningGoal {
  id: string
  title: string
  category: string
  progress: number
  target: string
}

export default function PersonalProfilePage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    profileImage: ''
  })
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [communityMemberships, setCommunityMemberships] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLocation: false,
    allowMentorProgress: true,
    publicProfile: true,
    theme: 'light'
  })

  // Toast functions
  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 5000)
  }

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No authentication token found')
        }

        const response = await fetch('/api/personal/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch profile data')
        }

        const result = await response.json()
        if (result.success) {
          const { profile, learningGoals: goals, achievements: userAchievements, communityMemberships: memberships, recentActivity: activity, privacySettings: settings } = result.data
          
          setProfileData({
            firstName: profile.firstName,
            lastName: profile.lastName,
            username: profile.username,
            email: profile.email,
            phone: profile.phone,
            bio: profile.bio,
            location: profile.location,
            profileImage: profile.profileImage
          })
          setLearningGoals(goals || [])
          setAchievements(userAchievements || [])
          setCommunityMemberships(memberships || [])
          setRecentActivity(activity || [])
          setPrivacySettings(settings || privacySettings)
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
        addToast('Failed to load profile data', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  // Mock learning goals for now (will be replaced by API data)
  const mockLearningGoals: LearningGoal[] = [
    {
      id: '1',
      title: 'Master Data Structures',
      category: 'algorithms',
      progress: 75,
      target: 'Complete 50 problems by end of month'
    },
    {
      id: '2',
      title: 'Web Development',
      category: 'web-development',
      progress: 60,
      target: 'Build 3 full-stack projects'
    }
  ])
  const [preferences, setPreferences] = useState({
    difficulty: 'beginner',
    learningStyle: ['visual', 'practical'],
    dailyGoal: 5
  })

  const showToast = (message: string, type: Toast['type'] = 'success', duration: number = 4000) => {
    const id = Date.now().toString()
    const newToast: Toast = { id, message, type }
    
    setToasts(prev => [...prev, newToast])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, duration)
  }

  const showSection = (sectionName: string) => {
    setActiveSection(sectionName)
  }

  const updateProfileImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          profileImage: e.target?.result as string
        }))
        showToast('Profile image updated successfully!', 'success')
      }
      reader.readAsDataURL(file)
    }
  }

  const saveProfileInfo = () => {
    const { firstName, lastName, username } = profileData
    
    if (!firstName || !lastName || !username) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    
    // Simulate API call
    setTimeout(() => {
      showToast('Profile information saved successfully!', 'success')
    }, 1000)
  }

  const addNewGoal = () => {
    const title = (document.getElementById('newGoalTitle') as HTMLInputElement)?.value.trim()
    const category = (document.getElementById('newGoalCategory') as HTMLSelectElement)?.value
    
    if (!title || !category) {
      showToast('Please fill in all fields', 'error')
      return
    }
    
    const newGoal: LearningGoal = {
      id: Date.now().toString(),
      title,
      category,
      progress: 0,
      target: 'Set your target'
    }
    
    setLearningGoals(prev => [...prev, newGoal])
    showToast(`Learning goal "${title}" added successfully!`, 'success')
    
    // Clear form
    const titleInput = document.getElementById('newGoalTitle') as HTMLInputElement
    const categorySelect = document.getElementById('newGoalCategory') as HTMLSelectElement
    if (titleInput) titleInput.value = ''
    if (categorySelect) categorySelect.value = ''
  }

  const changePassword = () => {
    const currentPassword = (document.getElementById('currentPassword') as HTMLInputElement)?.value
    const newPassword = (document.getElementById('newPassword') as HTMLInputElement)?.value
    const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement)?.value
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields', 'error')
      return
    }
    
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error')
      return
    }
    
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error')
      return
    }
    
    // Simulate API call
    setTimeout(() => {
      showToast('Password changed successfully!', 'success')
      // Clear password fields
      const inputs = ['currentPassword', 'newPassword', 'confirmPassword']
      inputs.forEach(id => {
        const input = document.getElementById(id) as HTMLInputElement
        if (input) input.value = ''
      })
    }, 1000)
  }

  const savePreferences = () => {
    const dailyGoal = (document.getElementById('dailyGoal') as HTMLInputElement)?.value
    
    if (!dailyGoal || parseInt(dailyGoal) < 1 || parseInt(dailyGoal) > 20) {
      showToast('Please set a valid daily goal (1-20)', 'error')
      return
    }
    
    // Simulate API call
    setTimeout(() => {
      showToast('Preferences saved successfully!', 'success')
    }, 1000)
  }

  const exportData = (type: string) => {
    showToast(`Exporting ${type} data...`, 'info')
    // Simulate export
    setTimeout(() => {
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} data exported successfully!`, 'success')
    }, 2000)
  }

  const exportAllData = () => {
    showToast('Preparing complete data export...', 'info')
    // Simulate export
    setTimeout(() => {
      showToast('All data exported successfully! Check your downloads.', 'success')
    }, 3000)
  }

  const logout = () => {
    if (confirm('Are you sure you want to logout? All unsaved changes will be lost.')) {
      // Clear any stored data
      localStorage.removeItem('userToken')
      sessionStorage.clear()
      
      // Show logout message
      showToast('Logging out...', 'info')
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    }
  }

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />
      case 'error': return <XCircle className="w-5 h-5" />
      case 'warning': return <AlertTriangle className="w-5 h-5" />
      case 'info': return <Info className="w-5 h-5" />
    }
  }

  const getToastColor = (type: Toast['type']) => {
    switch (type) {
      case 'success': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      case 'info': return 'bg-blue-500'
    }
  }

  const getGoalColor = (category: string) => {
    switch (category) {
      case 'algorithms': return 'from-blue-50 to-indigo-50 border-blue-200'
      case 'web-development': return 'from-emerald-50 to-teal-50 border-emerald-200'
      case 'mobile-development': return 'from-purple-50 to-pink-50 border-purple-200'
      case 'data-science': return 'from-orange-50 to-red-50 border-orange-200'
      case 'system-design': return 'from-cyan-50 to-blue-50 border-cyan-200'
      default: return 'from-slate-50 to-gray-50 border-slate-200'
    }
  }

  const getProgressColor = (category: string) => {
    switch (category) {
      case 'algorithms': return 'from-blue-500 to-indigo-600'
      case 'web-development': return 'from-emerald-500 to-teal-600'
      case 'mobile-development': return 'from-purple-500 to-pink-600'
      case 'data-science': return 'from-orange-500 to-red-600'
      case 'system-design': return 'from-cyan-500 to-blue-600'
      default: return 'from-slate-500 to-gray-600'
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
        <p className="text-slate-600">Manage your profile, settings, and learning preferences</p>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="glassy-card rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Settings
            </h3>
            
            <nav className="space-y-2">
              <button 
                onClick={() => showSection('profile')} 
                className={`nav-item w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium rounded-lg transition-all ${
                  activeSection === 'profile' 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                    : 'text-slate-600 hover:bg-blue-50 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              
              <button 
                onClick={() => showSection('learning')} 
                className={`nav-item w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium rounded-lg transition-all ${
                  activeSection === 'learning' 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                    : 'text-slate-600 hover:bg-blue-50 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Learning Goals
              </button>
              
              <button 
                onClick={() => showSection('password')} 
                className={`nav-item w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium rounded-lg transition-all ${
                  activeSection === 'password' 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                    : 'text-slate-600 hover:bg-blue-50 hover:text-slate-900'
                }`}
              >
                <Lock className="w-4 h-4" />
                Password
              </button>
              
              <button 
                onClick={() => showSection('preferences')} 
                className={`nav-item w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium rounded-lg transition-all ${
                  activeSection === 'preferences' 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                    : 'text-slate-600 hover:bg-blue-50 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-4 h-4" />
                Preferences
              </button>
              
              <div className="pt-4 border-t border-slate-200">
                <button 
                  onClick={() => showSection('export')} 
                  className={`nav-item w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium rounded-lg transition-all ${
                    activeSection === 'export' 
                      ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500' 
                      : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
                
                <button 
                  onClick={() => showSection('logout')} 
                  className={`nav-item w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium rounded-lg transition-all ${
                    activeSection === 'logout' 
                      ? 'bg-red-50 text-red-700 border-l-4 border-red-500' 
                      : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="content-section">
              <div className="glassy-card rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-blue-600" />
                  Profile Information
                </h2>
                
                {/* Profile Image */}
                <div className="text-center mb-8">
                  <div className="profile-image-container relative inline-block mb-4">
                    <img 
                      src={profileData.profileImage} 
                      alt="Student Profile" 
                      className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-white"
                    />
                    <div className="profile-image-overlay absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <label htmlFor="imageUpload" className="cursor-pointer text-white">
                        <Camera className="w-8 h-8" />
                      </label>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    id="imageUpload" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={updateProfileImage}
                  />
                  <p className="text-sm text-slate-500">Click on the image to change profile picture</p>
                </div>
                
                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                    <input 
                      type="text" 
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                    <input 
                      type="text" 
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                  <input 
                    type="text" 
                    value={profileData.username}
                    onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                    className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                  />
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                  <textarea 
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4} 
                    className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all resize-none"
                  />
                </div>
                
                <div className="mt-6">
                  <button 
                    onClick={saveProfileInfo}
                    className="btn-primary bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition-all hover:transform hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Save className="w-5 h-5 inline mr-2" />
                    Save Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Learning Goals Section */}
          {activeSection === 'learning' && (
            <div className="content-section">
              <div className="glassy-card rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                  Learning Goals & Progress
                </h2>
                
                {/* Current Goals */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Current Learning Goals</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {learningGoals.map((goal) => (
                      <div key={goal.id} className={`bg-gradient-to-r ${getGoalColor(goal.category)} rounded-xl p-4 border`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-800">{goal.title}</h4>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                          <div 
                            className={`bg-gradient-to-r ${getProgressColor(goal.category)} h-2 rounded-full transition-all`} 
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-slate-600">{goal.target}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Add New Goal */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Add New Learning Goal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Goal Title</label>
                      <input 
                        type="text" 
                        id="newGoalTitle" 
                        placeholder="e.g., Master React" 
                        className="form-input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                      <select 
                        id="newGoalCategory" 
                        className="form-input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none transition-all"
                      >
                        <option value="">Choose category...</option>
                        <option value="algorithms">Algorithms</option>
                        <option value="web-development">Web Development</option>
                        <option value="mobile-development">Mobile Development</option>
                        <option value="data-science">Data Science</option>
                        <option value="system-design">System Design</option>
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <button 
                        onClick={addNewGoal}
                        className="btn-primary bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-2 rounded-lg font-semibold w-full transition-all hover:transform hover:-translate-y-1 hover:shadow-lg"
                      >
                        <Plus className="w-4 h-4 inline mr-2" />
                        Add Goal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Password Section */}
          {activeSection === 'password' && (
            <div className="content-section">
              <div className="glassy-card rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-purple-600" />
                  Change Password
                </h2>
                
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                    <input 
                      type="password" 
                      id="currentPassword" 
                      placeholder="Enter current password" 
                      className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                    <input 
                      type="password" 
                      id="newPassword" 
                      placeholder="Enter new password" 
                      className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                    <input 
                      type="password" 
                      id="confirmPassword" 
                      placeholder="Confirm new password" 
                      className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button 
                    onClick={changePassword}
                    className="btn-primary bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-lg font-semibold transition-all hover:transform hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Key className="w-5 h-5 inline mr-2" />
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Section */}
          {activeSection === 'preferences' && (
            <div className="content-section">
              <div className="glassy-card rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                  <Sliders className="w-6 h-6 text-green-600" />
                  Learning Preferences
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Difficulty Level</h3>
                    <div className="space-y-3">
                      {['beginner', 'intermediate', 'advanced'].map((level) => (
                        <label key={level} className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="radio" 
                            name="difficulty" 
                            value={level} 
                            checked={preferences.difficulty === level}
                            onChange={(e) => setPreferences(prev => ({ ...prev, difficulty: e.target.value }))}
                            className="w-4 h-4 text-blue-600" 
                          />
                          <span className="text-slate-700 capitalize">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Learning Style</h3>
                    <div className="space-y-3">
                      {[
                        { value: 'visual', label: 'Visual Learning' },
                        { value: 'practical', label: 'Practical Exercises' },
                        { value: 'theory', label: 'Theory & Concepts' }
                      ].map((style) => (
                        <label key={style.value} className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="learningStyle" 
                            value={style.value}
                            checked={preferences.learningStyle.includes(style.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPreferences(prev => ({
                                  ...prev,
                                  learningStyle: [...prev.learningStyle, style.value]
                                }))
                              } else {
                                setPreferences(prev => ({
                                  ...prev,
                                  learningStyle: prev.learningStyle.filter(s => s !== style.value)
                                }))
                              }
                            }}
                            className="w-4 h-4 text-blue-600" 
                          />
                          <span className="text-slate-700">{style.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Daily Goal</h3>
                  <div className="max-w-md">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Problems to solve per day</label>
                    <input 
                      type="number" 
                      id="dailyGoal" 
                      value={preferences.dailyGoal}
                      onChange={(e) => setPreferences(prev => ({ ...prev, dailyGoal: parseInt(e.target.value) }))}
                      min="1" 
                      max="20" 
                      className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                    />
                    <p className="text-sm text-slate-500 mt-2">Set a realistic daily goal to maintain consistency</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button 
                    onClick={savePreferences}
                    className="btn-primary bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg font-semibold transition-all hover:transform hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Save className="w-5 h-5 inline mr-2" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Export Data Section */}
          {activeSection === 'export' && (
            <div className="content-section">
              <div className="glassy-card rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                  <Download className="w-6 h-6 text-emerald-600" />
                  Export Your Data
                </h2>
                
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Info className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-emerald-900 mb-2">Export Your Learning Data</h4>
                      <p className="text-emerald-700">Download your progress, achievements, and learning history in various formats for backup or analysis.</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div 
                    className="bg-white border border-slate-200 rounded-lg p-4 text-center hover:shadow-md transition-all cursor-pointer" 
                    onClick={() => exportData('progress')}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">Progress Report</h4>
                    <p className="text-sm text-slate-600">Your learning progress and statistics</p>
                  </div>
                  
                  <div 
                    className="bg-white border border-slate-200 rounded-lg p-4 text-center hover:shadow-md transition-all cursor-pointer" 
                    onClick={() => exportData('achievements')}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">Achievements</h4>
                    <p className="text-sm text-slate-600">All your badges and milestones</p>
                  </div>
                  
                  <div 
                    className="bg-white border border-slate-200 rounded-lg p-4 text-center hover:shadow-md transition-all cursor-pointer" 
                    onClick={() => exportData('history')}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <History className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">Learning History</h4>
                    <p className="text-sm text-slate-600">Complete activity timeline</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <button 
                    onClick={exportAllData}
                    className="btn-primary bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-4 rounded-lg font-semibold transition-all hover:transform hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Download className="w-6 h-6 inline mr-2" />
                    Export All Data (ZIP)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Logout Section */}
          {activeSection === 'logout' && (
            <div className="content-section">
              <div className="glassy-card rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                  <LogOut className="w-6 h-6 text-red-600" />
                  Logout
                </h2>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-red-900 mb-2">Logout from PW IOI Personal</h4>
                      <p className="text-red-700">You will be logged out and redirected to the home page. All unsaved changes will be lost.</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <button 
                    onClick={logout}
                    className="btn-primary bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-lg font-semibold transition-all hover:transform hover:-translate-y-1 hover:shadow-lg"
                  >
                    <LogOut className="w-6 h-6 inline mr-2" />
                    Logout from PW IOI Personal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification System */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${getToastColor(toast.type)} text-white px-6 py-4 rounded-lg shadow-lg transform translate-x-full transition-all duration-300 flex items-center gap-3`}
          >
            {getToastIcon(toast.type)}
            <span>{toast.message}</span>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-auto text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
