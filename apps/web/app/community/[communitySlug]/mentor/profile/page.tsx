'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  User,
  Lock,
  Award,
  Users,
  LogOut,
  Settings,
  Camera,
  Save,
  Key,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertTriangle as Warning,
  Info,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Trophy,
  Target
} from 'lucide-react'
import { MentorCard } from '@/components/ui/MentorCard'
import { MentorButton } from '@/components/ui/MentorButton'
import { MentorInput } from '@/components/ui/MentorInput'
import { MentorToast } from '@/components/ui/MentorToast'
import { MentorAvatar } from '@/components/ui/MentorAvatar'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface Student {
  id: string
  name: string
  initials: string
  performance: number
  status: 'Active' | 'Inactive'
  badges: string[]
  avatarColor: string
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

export default function MentorProfilePage() {
  const params = useParams()
  const communitySlug = params.communitySlug as string
  const [activeSection, setActiveSection] = useState('profile')
  const [profileImage, setProfileImage] = useState('/api/placeholder/128/128')
  const [toasts, setToasts] = useState<Toast[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profileData, setProfileData] = useState({
    name: 'Satya Sai',
    email: 'satya.sai@pwioi.edu',
    phone: '+91 98765 43210',
    location: 'Mumbai, India',
    bio: 'Experienced Computer Science mentor with 5+ years of teaching experience. Passionate about helping students master algorithms, data structures, and problem-solving skills. Specialized in competitive programming and software development.'
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [specializationData, setSpecializationData] = useState({
    primarySpecialization: 'Computer Science & Algorithms',
    secondaryAreas: 'Data Structures, Dynamic Programming, Graph Theory',
    experienceYears: 5,
    certifications: '• Google Certified Educator\n• Microsoft Certified: Azure Developer Associate\n• AWS Certified Solutions Architect'
  })


  const navigationItems = [
    { id: 'profile', label: 'Profile', icon: User, color: 'text-orange-600' },
    { id: 'password', label: 'Password', icon: Lock, color: 'text-purple-600' },
    { id: 'specialization', label: 'Specialization', icon: Award, color: 'text-amber-600' },
    { id: 'logout', label: 'Logout', icon: LogOut, color: 'text-red-600' }
  ]

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

  const handleProfileSave = () => {
    if (!profileData.name || !profileData.email) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    
    showToast('Profile information saved successfully!', 'success')
  }

  const handlePasswordChange = () => {
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
    
    showToast('Password changed successfully!', 'success')
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  const handleSpecializationSave = () => {
    if (!specializationData.primarySpecialization) {
      showToast('Please enter your primary specialization', 'error')
      return
    }
    
    showToast('Specialization information saved successfully!', 'success')
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout? All unsaved changes will be lost.')) {
      showToast('Logging out...', 'info')
      // In a real app, you would clear tokens and redirect
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    }
  }

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success': return CheckCircle
      case 'error': return XCircle
      case 'warning': return Warning
      case 'info': return Info
      default: return CheckCircle
    }
  }

  const getToastColor = (type: Toast['type']) => {
    switch (type) {
      case 'success': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      case 'info': return 'bg-blue-500'
      default: return 'bg-green-500'
    }
  }

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Mentor Profile</h1>
          <p className="text-slate-600">Manage your profile and mentoring settings</p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <MentorCard>
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-600" />
                Settings
              </h3>
              
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`nav-item w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium transition-all duration-300 rounded-xl hover:-translate-y-0.5 hover:shadow-md ${
                        activeSection === item.id
                          ? 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-l-4 border-orange-500 shadow-sm'
                          : 'text-slate-600 hover:bg-orange-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${activeSection === item.id ? item.color : ''}`} />
                      {item.label}
                    </button>
                  )
                })}
              </nav>
            </MentorCard>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <MentorCard className="p-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-orange-600" />
                  Profile Information
                </h2>
                
                {/* Profile Image */}
                <div className="text-center mb-8">
                  <MentorAvatar
                    src={profileImage}
                    alt="Profile Picture"
                    size="xl"
                    onImageChange={() => fileInputRef.current?.click()}
                    className="mx-auto mb-4"
                  />
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
                  <MentorInput
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    icon={<User className="w-5 h-5" />}
                  />
                  
                  <MentorInput
                    label="Email Address"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    icon={<Mail className="w-5 h-5" />}
                  />
                  
                  <MentorInput
                    label="Phone Number"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    icon={<Phone className="w-5 h-5" />}
                  />
                  
                  <MentorInput
                    label="Location"
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    icon={<MapPin className="w-5 h-5" />}
                  />
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-orange-500 focus:shadow-lg transition-all duration-300 resize-none"
                      placeholder="Tell us about your background, expertise, and mentoring philosophy..."
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <MentorButton
                    onClick={handleProfileSave}
                    variant="gradient-orange"
                    className="flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Profile
                  </MentorButton>
                </div>
              </MentorCard>
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
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                      className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all duration-200 focus:border-purple-500 focus:shadow-lg focus:-translate-y-1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                      className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all duration-200 focus:border-purple-500 focus:shadow-lg focus:-translate-y-1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all duration-200 focus:border-purple-500 focus:shadow-lg focus:-translate-y-1"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={handlePasswordChange}
                    className="btn-primary bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
                  >
                    <Key className="w-5 h-5" />
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {/* Specialization Section */}
            {activeSection === 'specialization' && (
              <div className="content-section bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                  <Award className="w-6 h-6 text-amber-600" />
                  Specialization & Expertise
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Primary Specialization</label>
                    <input
                      type="text"
                      value={specializationData.primarySpecialization}
                      onChange={(e) => setSpecializationData(prev => ({ ...prev, primarySpecialization: e.target.value }))}
                      className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all duration-200 focus:border-amber-500 focus:shadow-lg focus:-translate-y-1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Secondary Areas</label>
                    <input
                      type="text"
                      value={specializationData.secondaryAreas}
                      onChange={(e) => setSpecializationData(prev => ({ ...prev, secondaryAreas: e.target.value }))}
                      className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all duration-200 focus:border-amber-500 focus:shadow-lg focus:-translate-y-1"
                    />
                    <p className="text-sm text-slate-500 mt-2">Separate multiple areas with commas</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Years of Experience</label>
                    <input
                      type="number"
                      value={specializationData.experienceYears}
                      onChange={(e) => setSpecializationData(prev => ({ ...prev, experienceYears: parseInt(e.target.value) }))}
                      min="0"
                      max="50"
                      className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all duration-200 focus:border-amber-500 focus:shadow-lg focus:-translate-y-1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Certifications</label>
                    <textarea
                      value={specializationData.certifications}
                      onChange={(e) => setSpecializationData(prev => ({ ...prev, certifications: e.target.value }))}
                      rows={3}
                      className="form-input w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none transition-all duration-200 focus:border-amber-500 focus:shadow-lg focus:-translate-y-1 resize-none"
                      placeholder="List your relevant certifications..."
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={handleSpecializationSave}
                    className="btn-primary bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Specialization
                  </button>
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
                      <h4 className="text-lg font-semibold text-red-900 mb-2">Logout from Mentor Panel</h4>
                      <p className="text-red-700">You will be logged out and redirected to the home page. All unsaved changes will be lost.</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={handleLogout}
                    className="btn-primary bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center gap-2 mx-auto"
                  >
                    <LogOut className="w-6 h-6" />
                    Logout from Mentor Panel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Toast Notification System */}
      {toasts.map((toast) => (
        <MentorToast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
        />
      ))}
    </div>
  )
}