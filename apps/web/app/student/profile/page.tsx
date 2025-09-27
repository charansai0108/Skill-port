'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  User,
  Lock,
  GraduationCap,
  Sliders,
  LogOut,
  Settings,
  Camera,
  Save,
  Key,
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

interface ProfileData {
  name: string
  email: string
  phone: string
  location: string
  bio: string
  profileImage: string
}

interface AcademicData {
  university: string
  major: string
  studyYear: string
  gpa: string
  programmingLanguages: string
}

interface Preferences {
  emailNotifications: boolean
  leaderboardUpdates: boolean
  mentorFeedback: boolean
  weeklyReports: boolean
  showOnLeaderboard: boolean
  allowMentorProgress: boolean
  publicProfile: boolean
  theme: 'light' | 'dark' | 'auto'
}

export default function StudentProfilePage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [toasts, setToasts] = useState<Toast[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'Munaf',
    email: 'munaf@email.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    bio: 'Passionate computer science student with a love for algorithms and competitive programming. Always eager to learn and solve challenging problems.',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  })

  const [academicData, setAcademicData] = useState<AcademicData>({
    university: 'MIT',
    major: 'Computer Science',
    studyYear: '3',
    gpa: '3.8',
    programmingLanguages: 'Python, Java, C++, JavaScript'
  })

  const [preferences, setPreferences] = useState<Preferences>({
    emailNotifications: true,
    leaderboardUpdates: true,
    mentorFeedback: false,
    weeklyReports: true,
    showOnLeaderboard: true,
    allowMentorProgress: true,
    publicProfile: false,
    theme: 'light'
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

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
    if (!profileData.name || !profileData.email) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    
    setTimeout(() => {
      showToast('Profile information saved successfully!', 'success')
    }, 1000)
  }

  const saveAcademicInfo = () => {
    if (!academicData.university || !academicData.major) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    
    setTimeout(() => {
      showToast('Academic information saved successfully!', 'success')
    }, 1000)
  }

  const savePreferences = () => {
    setTimeout(() => {
      showToast('Preferences saved successfully!', 'success')
    }, 1000)
  }

  const changePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast('Please fill in all password fields', 'error')
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error')
      return
    }
    
    setTimeout(() => {
      showToast('Password changed successfully!', 'success')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    }, 1000)
  }

  const logout = () => {
    if (confirm('Are you sure you want to logout? All unsaved changes will be lost.')) {
      localStorage.removeItem('studentToken')
      sessionStorage.clear()
      window.location.href = '/'
    }
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8">
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
                <div className="profile-image-overlay absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <input 
                  type="text" 
                  value={profileData.location}
                  onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                <textarea 
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3} 
                  placeholder="Tell us about yourself..."
                  className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all resize-none"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button 
                onClick={saveProfileInfo}
                className="btn-primary bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-semibold"
              >
                <Save className="w-5 h-5 inline mr-2" />
                Save Profile
              </button>
            </div>
          </div>
        )

      case 'password':
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
              <Lock className="w-6 h-6 text-purple-600" />
              Change Password
            </h2>
            
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                <input 
                  type="password" 
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password" 
                  className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                <input 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password" 
                  className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password" 
                  className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button 
                onClick={changePassword}
                className="btn-primary bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-lg font-semibold"
              >
                <Key className="w-5 h-5 inline mr-2" />
                Change Password
              </button>
            </div>
          </div>
        )

      case 'academic':
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-green-600" />
              Academic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">University</label>
                <input 
                  type="text" 
                  value={academicData.university}
                  onChange={(e) => setAcademicData(prev => ({ ...prev, university: e.target.value }))}
                  className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Major</label>
                <input 
                  type="text" 
                  value={academicData.major}
                  onChange={(e) => setAcademicData(prev => ({ ...prev, major: e.target.value }))}
                  className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Year of Study</label>
                <select 
                  value={academicData.studyYear}
                  onChange={(e) => setAcademicData(prev => ({ ...prev, studyYear: e.target.value }))}
                  className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">Graduate</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">GPA</label>
                <input 
                  type="text" 
                  value={academicData.gpa}
                  onChange={(e) => setAcademicData(prev => ({ ...prev, gpa: e.target.value }))}
                  className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Programming Languages</label>
                <input 
                  type="text" 
                  value={academicData.programmingLanguages}
                  onChange={(e) => setAcademicData(prev => ({ ...prev, programmingLanguages: e.target.value }))}
                  className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all"
                />
                <p className="text-sm text-slate-500 mt-2">Separate languages with commas</p>
              </div>
            </div>
            
            <div className="mt-6">
              <button 
                onClick={saveAcademicInfo}
                className="btn-primary bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg font-semibold"
              >
                <Save className="w-5 h-5 inline mr-2" />
                Save Academic Info
              </button>
            </div>
          </div>
        )

      case 'preferences':
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
              <Sliders className="w-6 h-6 text-indigo-600" />
              Preferences & Settings
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-4">Notification Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={preferences.emailNotifications}
                      onChange={(e) => setPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-slate-700">Email notifications for new contests</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={preferences.leaderboardUpdates}
                      onChange={(e) => setPreferences(prev => ({ ...prev, leaderboardUpdates: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-slate-700">Leaderboard updates</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={preferences.mentorFeedback}
                      onChange={(e) => setPreferences(prev => ({ ...prev, mentorFeedback: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-slate-700">Mentor feedback notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={preferences.weeklyReports}
                      onChange={(e) => setPreferences(prev => ({ ...prev, weeklyReports: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-slate-700">Weekly progress reports</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-4">Privacy Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={preferences.showOnLeaderboard}
                      onChange={(e) => setPreferences(prev => ({ ...prev, showOnLeaderboard: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-slate-700">Show my name on leaderboards</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={preferences.allowMentorProgress}
                      onChange={(e) => setPreferences(prev => ({ ...prev, allowMentorProgress: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-slate-700">Allow mentors to see my progress</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={preferences.publicProfile}
                      onChange={(e) => setPreferences(prev => ({ ...prev, publicProfile: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-slate-700">Public profile visibility</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-4">Theme Preference</h3>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setPreferences(prev => ({ ...prev, theme: 'light' }))}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      preferences.theme === 'light' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    Light
                  </button>
                  <button 
                    onClick={() => setPreferences(prev => ({ ...prev, theme: 'dark' }))}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      preferences.theme === 'dark' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    Dark
                  </button>
                  <button 
                    onClick={() => setPreferences(prev => ({ ...prev, theme: 'auto' }))}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      preferences.theme === 'auto' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    Auto
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button 
                onClick={savePreferences}
                className="btn-primary bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-3 rounded-lg font-semibold"
              >
                <Save className="w-5 h-5 inline mr-2" />
                Save Preferences
              </button>
            </div>
          </div>
        )

      case 'logout':
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8">
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
                  <h4 className="text-lg font-semibold text-red-900 mb-2">Logout from Student Portal</h4>
                  <p className="text-red-700">You will be logged out and redirected to the home page. All unsaved changes will be lost.</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <button 
                onClick={logout}
                className="btn-primary bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-lg font-semibold"
              >
                <LogOut className="w-6 h-6 inline mr-2" />
                Logout from Student Portal
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Student Profile</h1>
          <p className="text-slate-600">Manage your profile and account settings</p>
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
                  className={`nav-item w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium ${
                    activeSection === 'profile' 
                      ? 'active bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                      : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                
                <button 
                  onClick={() => setActiveSection('password')}
                  className={`nav-item w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium ${
                    activeSection === 'password' 
                      ? 'active bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                      : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Password
                </button>
                
                <button 
                  onClick={() => setActiveSection('academic')}
                  className={`nav-item w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium ${
                    activeSection === 'academic' 
                      ? 'active bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                      : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Academic
                </button>
                
                <button 
                  onClick={() => setActiveSection('preferences')}
                  className={`nav-item w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium ${
                    activeSection === 'preferences' 
                      ? 'active bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                      : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  Preferences
                </button>
                
                <div className="pt-4 border-t border-slate-200">
                  <button 
                    onClick={() => setActiveSection('logout')}
                    className="nav-item w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium text-red-600 hover:bg-red-50"
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
            <div className="content-section">
              {renderSection()}
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification System */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            } text-white px-6 py-4 rounded-lg shadow-lg transform translate-x-full transition-all duration-300 flex items-center gap-3`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
            {toast.type === 'info' && <AlertTriangle className="w-5 h-5" />}
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
    </div>
  )
}