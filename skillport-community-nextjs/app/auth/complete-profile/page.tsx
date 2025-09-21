'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Target,
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap,
  Briefcase,
  Camera,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function CompleteProfilePage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    university: '',
    major: '',
    graduationYear: '',
    experience: '',
    bio: '',
    interests: [] as string[],
    profilePicture: null as File | null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [alerts, setAlerts] = useState<Array<{ id: number; message: string; type: string }>>([])
  const router = useRouter()

  const showAlert = (message: string, type: string = 'info') => {
    const id = Date.now()
    setAlerts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id))
    }, 5000)
  }

  const interests = [
    'Algorithms', 'Data Structures', 'System Design', 'Machine Learning',
    'Web Development', 'Mobile Development', 'DevOps', 'Cloud Computing',
    'Cybersecurity', 'Blockchain', 'AI/ML', 'Game Development'
  ]

  const experienceLevels = [
    'Beginner (0-1 years)',
    'Intermediate (1-3 years)',
    'Advanced (3-5 years)',
    'Expert (5+ years)'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in all required fields')
      showAlert('Please fill in all required fields', 'error')
      return
    }

    if (formData.interests.length === 0) {
      setError('Please select at least one interest')
      showAlert('Please select at least one interest', 'error')
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      showAlert('Profile completed successfully! Redirecting to dashboard...', 'success')
      setTimeout(() => {
        router.push('/personal/dashboard')
      }, 1500)
    }, 1000)
  }

  return (
    <div className="bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 min-h-screen flex items-center justify-center p-4">
      <div className="auth-container w-full max-w-2xl">
        {/* Auth Card */}
        <div className="auth-card rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                SkillPort
              </h1>
            </div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Profile</h2>
            <p className="text-slate-600">
              Help us personalize your learning experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  {formData.firstName[0]}{formData.lastName[0]}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 cursor-pointer">
                  <Camera className="w-4 h-4 text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-input w-full px-3 py-2 rounded-xl"
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-input w-full px-3 py-2 rounded-xl"
                  placeholder="Enter your last name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input w-full pl-10 pr-3 py-2 rounded-xl"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input w-full pl-10 pr-3 py-2 rounded-xl"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="form-input w-full pl-10 pr-3 py-2 rounded-xl"
                    placeholder="Enter your location"
                  />
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Education
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    University
                  </label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    className="form-input w-full px-3 py-2 rounded-xl"
                    placeholder="Enter university name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Major
                  </label>
                  <input
                    type="text"
                    name="major"
                    value={formData.major}
                    onChange={handleInputChange}
                    className="form-input w-full px-3 py-2 rounded-xl"
                    placeholder="Enter your major"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleInputChange}
                    className="form-input w-full px-3 py-2 rounded-xl"
                    placeholder="2024"
                    min="1950"
                    max="2030"
                  />
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Experience
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Experience Level
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="form-input w-full px-3 py-2 rounded-xl"
                >
                  <option value="">Select your experience level</option>
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interests */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Interests *
              </h3>
              <p className="text-sm text-slate-600 mb-4">Select all that apply</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interests.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      formData.interests.includes(interest)
                        ? 'bg-red-100 border-red-300 text-red-800'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Bio
              </h3>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="form-input w-full px-3 py-2 rounded-xl"
                placeholder="Tell us about yourself, your goals, and what you hope to achieve..."
              />
            </div>

            {error && (
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => router.back()}
                className="btn-secondary flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button 
                type="submit" 
                className="btn-primary flex-1 py-3 px-6 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                disabled={isLoading || !formData.firstName || !formData.lastName || !formData.email || formData.interests.length === 0}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Completing Profile...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Complete Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Alert Container */}
      <div className="fixed top-4 right-4 z-50">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`${
              alert.type === 'success' ? 'bg-green-500' : 
              alert.type === 'error' ? 'bg-red-500' : 
              alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
            } text-white px-6 py-3 rounded-lg shadow-lg mb-4 max-w-sm`}
          >
            <div className="flex items-center justify-between">
              <span>{alert.message}</span>
              <button 
                onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                className="ml-4 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
