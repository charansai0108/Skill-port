'use client'

import { useState, useRef } from 'react'
import { 
  User, 
  Lock, 
  Globe, 
  UserPlus, 
  LogOut, 
  Settings, 
  Camera, 
  Save, 
  Key, 
  AlertTriangle,
  Plus,
  X,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import Link from 'next/link'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

export default function AdminProfilePage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [showCreateBatchModal, setShowCreateBatchModal] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState('')
  const [batchStudents, setBatchStudents] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const batches = [
    { name: '2024-25', count: 24, color: 'blue' },
    { name: 'Spring 2025', count: 18, color: 'green' },
    { name: 'Batch A', count: 15, color: 'purple' },
    { name: 'Batch B', count: 12, color: 'orange' },
    { name: 'Summer 2025', count: 8, color: 'red' }
  ]

  const batchStudentsData = {
    '2024-25': [
      'student1@example.com', 'student2@example.com', 'student3@example.com',
      'student4@example.com', 'student5@example.com', 'student6@example.com',
      'student7@example.com', 'student8@example.com', 'student9@example.com',
      'student10@example.com', 'student11@example.com', 'student12@example.com',
      'student13@example.com', 'student14@example.com', 'student15@example.com',
      'student16@example.com', 'student17@example.com', 'student18@example.com',
      'student19@example.com', 'student20@example.com', 'student21@example.com',
      'student22@example.com', 'student23@example.com', 'student24@example.com'
    ],
    'Spring 2025': [
      'spring1@example.com', 'spring2@example.com', 'spring3@example.com',
      'spring4@example.com', 'spring5@example.com', 'spring6@example.com',
      'spring7@example.com', 'spring8@example.com', 'spring9@example.com',
      'spring10@example.com', 'spring11@example.com', 'spring12@example.com',
      'spring13@example.com', 'spring14@example.com', 'spring15@example.com',
      'spring16@example.com', 'spring17@example.com', 'spring18@example.com'
    ],
    'Batch A': [
      'batcha1@example.com', 'batcha2@example.com', 'batcha3@example.com',
      'batcha4@example.com', 'batcha5@example.com', 'batcha6@example.com',
      'batcha7@example.com', 'batcha8@example.com', 'batcha9@example.com',
      'batcha10@example.com', 'batcha11@example.com', 'batcha12@example.com',
      'batcha13@example.com', 'batcha14@example.com', 'batcha15@example.com'
    ],
    'Batch B': [
      'batchb1@example.com', 'batchb2@example.com', 'batchb3@example.com',
      'batchb4@example.com', 'batchb5@example.com', 'batchb6@example.com',
      'batchb7@example.com', 'batchb8@example.com', 'batchb9@example.com',
      'batchb10@example.com', 'batchb11@example.com', 'batchb12@example.com'
    ],
    'Summer 2025': [
      'summer1@example.com', 'summer2@example.com', 'summer3@example.com',
      'summer4@example.com', 'summer5@example.com', 'summer6@example.com',
      'summer7@example.com', 'summer8@example.com'
    ]
  }

  const showToast = (message: string, type: Toast['type'] = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { id, message, type }
    
    setToasts(prev => [...prev, newToast])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, duration)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
        showToast('Profile image updated successfully!', 'success')
      }
      reader.readAsDataURL(file)
    }
  }

  const saveProfileInfo = () => {
    showToast('Profile information saved successfully!', 'success')
  }

  const saveCommunitySettings = () => {
    showToast('Community settings saved successfully!', 'success')
  }

  const changePassword = () => {
    showToast('Password changed successfully!', 'success')
  }

  const logout = () => {
    if (confirm('Are you sure you want to logout? All unsaved changes will be lost.')) {
      showToast('Logging out...', 'info')
      // In a real app, you would clear tokens and redirect
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    }
  }

  const addStudent = () => {
    showToast('Student added successfully!', 'success')
  }

  const showBatchStudents = (batchName: string) => {
    setSelectedBatch(batchName)
    setBatchStudents(batchStudentsData[batchName as keyof typeof batchStudentsData] || [])
    setShowBatchModal(true)
  }

  const closeBatchStudentsModal = () => {
    setShowBatchModal(false)
    setSelectedBatch('')
    setBatchStudents([])
  }

  const openCreateBatchModal = () => {
    setShowCreateBatchModal(true)
  }

  const closeCreateBatchModal = () => {
    setShowCreateBatchModal(false)
  }

  const createNewBatch = () => {
    showToast('New batch created successfully!', 'success')
    closeCreateBatchModal()
  }

  const removeStudent = (email: string, batchName: string) => {
    if (confirm(`Are you sure you want to remove ${email} from ${batchName}?`)) {
      showToast(`Student ${email} removed from ${batchName}`, 'success')
      // In a real app, you would update the data
    }
  }

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getToastIcon = (type: Toast['type']) => {
    const icons = {
      success: CheckCircle,
      error: XCircle,
      warning: AlertCircle,
      info: Info
    }
    const Icon = icons[type]
    return <Icon className="w-5 h-5" />
  }

  const getToastColors = (type: Toast['type']) => {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    }
    return colors[type]
  }

  return (
    <div>
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${getToastColors(toast.type)} text-white px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 flex items-center gap-3`}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Profile</h1>
          <p className="text-slate-600">Manage your profile and platform settings</p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Settings
              </h3>
              
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection('profile')}
                  className={`nav-item w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium transition-all duration-300 rounded-xl ${
                    activeSection === 'profile'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                      : 'text-slate-600 hover:bg-blue-50 hover:text-slate-900'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                
                <button
                  onClick={() => setActiveSection('password')}
                  className={`nav-item w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium transition-all duration-300 rounded-xl ${
                    activeSection === 'password'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                      : 'text-slate-600 hover:bg-blue-50 hover:text-slate-900'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Password
                </button>
                
                <button
                  onClick={() => setActiveSection('community')}
                  className={`nav-item w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium transition-all duration-300 rounded-xl ${
                    activeSection === 'community'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                      : 'text-slate-600 hover:bg-blue-50 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Community
                </button>
                
                <button
                  onClick={() => setActiveSection('add-students')}
                  className={`nav-item w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium transition-all duration-300 rounded-xl ${
                    activeSection === 'add-students'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                      : 'text-slate-600 hover:bg-blue-50 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  Add Students
                </button>
                
                <div className="pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setActiveSection('logout')}
                    className={`nav-item w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium transition-all duration-300 rounded-xl ${
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
              <div className="content-section bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-blue-600" />
                  Profile Information
                </h2>
                
                {/* Profile Image */}
                <div className="text-center mb-8">
                  <div className="profile-image-container relative inline-block mb-4">
                    <img
                      src={profileImage}
                      alt="Admin Profile"
                      className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-white"
                    />
                    <div className="profile-image-overlay absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <label htmlFor="imageUpload" className="cursor-pointer text-white">
                        <Camera className="w-8 h-8" />
                      </label>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <p className="text-sm text-slate-500">Click on the image to change profile picture</p>
                </div>
                
                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Admin Name</label>
                    <input
                      type="text"
                      defaultValue="Rishav Upadhyay"
                      className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Admin Email</label>
                    <input
                      type="email"
                      defaultValue="admin@skillport.com"
                      className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={saveProfileInfo}
                    className="btn-primary bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg"
                  >
                    <Save className="w-5 h-5 inline mr-2" />
                    Save Profile
                  </button>
                </div>
              </div>
            )}

            {/* Password Section */}
            {activeSection === 'password' && (
              <div className="content-section bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-purple-600" />
                  Change Password
                </h2>
                
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={changePassword}
                    className="btn-primary bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg"
                  >
                    <Key className="w-5 h-5 inline mr-2" />
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {/* Community Section */}
            {activeSection === 'community' && (
              <div className="content-section bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                  <Globe className="w-6 h-6 text-green-600" />
                  Community Settings
                </h2>
                
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Community Name</label>
                  <input
                    type="text"
                    defaultValue="PW IOI"
                    className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                  />
                  <p className="text-sm text-slate-500 mt-2">This name will appear in the navbar and throughout the platform</p>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={saveCommunitySettings}
                    className="btn-primary bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg"
                  >
                    <Save className="w-5 h-5 inline mr-2" />
                    Save Community Settings
                  </button>
                </div>
              </div>
            )}

            {/* Add Students Section */}
            {activeSection === 'add-students' && (
              <div className="content-section bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                  <UserPlus className="w-6 h-6 text-indigo-600" />
                  Student Management
                </h2>
                
                {/* Add New Student Form */}
                <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Add New Student</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Student Email</label>
                      <input
                        type="email"
                        placeholder="Enter student email address"
                        className="form-input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Select Batch</label>
                      <select className="form-input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none transition-all">
                        <option value="">Choose a batch...</option>
                        <option value="2024-25">2024-25</option>
                        <option value="Spring 2025">Spring 2025</option>
                        <option value="Batch A">Batch A</option>
                        <option value="Batch B">Batch B</option>
                        <option value="Summer 2025">Summer 2025</option>
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        onClick={addStudent}
                        className="btn-primary bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-2 rounded-lg font-semibold w-full transition-all duration-300 hover:translate-y-[-1px] hover:shadow-lg"
                      >
                        <UserPlus className="w-4 h-4 inline mr-2" />
                        Add Student
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Existing Batches */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Existing Batches</h3>
                    <button
                      onClick={openCreateBatchModal}
                      className="btn-primary bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 hover:translate-y-[-1px] hover:shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Create New Batch
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {batches.map((batch) => (
                      <div
                        key={batch.name}
                        onClick={() => showBatchStudents(batch.name)}
                        className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-800">{batch.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getColorClasses(batch.color)}`}>
                            {batch.count} students
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">Click to view students</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Logout Section */}
            {activeSection === 'logout' && (
              <div className="content-section bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8">
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
                      <h4 className="text-lg font-semibold text-red-900 mb-2">Logout from Admin Panel</h4>
                      <p className="text-red-700">You will be logged out and redirected to the home page. All unsaved changes will be lost.</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={logout}
                    className="btn-primary bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg"
                  >
                    <LogOut className="w-6 h-6 inline mr-2" />
                    Logout from Admin Panel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Batch Students Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">
                  {selectedBatch} - Students
                </h3>
                <button
                  onClick={closeBatchStudentsModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-3">
                  {batchStudents.map((email) => (
                    <div key={email} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{email}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => removeStudent(email, selectedBatch)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-200 bg-slate-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">
                    {batchStudents.length} students
                  </span>
                  <button
                    onClick={closeBatchStudentsModal}
                    className="btn-primary bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:translate-y-[-1px] hover:shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Batch Modal */}
      {showCreateBatchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Create New Batch</h3>
                <button
                  onClick={closeCreateBatchModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Batch Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Fall 2025, Batch C"
                    className="form-input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none transition-all"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description (Optional)</label>
                  <textarea
                    placeholder="Brief description of this batch..."
                    rows={3}
                    className="form-input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-200 bg-slate-50">
                <div className="flex gap-3">
                  <button
                    onClick={closeCreateBatchModal}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createNewBatch}
                    className="flex-1 btn-primary bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:translate-y-[-1px] hover:shadow-lg"
                  >
                    Create Batch
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}