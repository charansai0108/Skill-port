'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Target, User, Users, Eye, EyeOff, UserPlus, X, Mail, Check } from 'lucide-react'

type FormStep = 'role-selection' | 'personal-form' | 'community-form' | 'otp-form'

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<FormStep>('role-selection')
  const [selectedRole, setSelectedRole] = useState('')
  const [currentEmail, setCurrentEmail] = useState('')
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({})
  const [alerts, setAlerts] = useState<Array<{ id: number; message: string; type: string }>>([])
  const router = useRouter()

  const showAlert = (message: string, type: string = 'info') => {
    const id = Date.now()
    setAlerts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id))
    }, 5000)
  }

  const showForm = (role: string) => {
    setSelectedRole(role)
    if (role === 'personal') {
      setCurrentStep('personal-form')
    } else if (role === 'community') {
      setCurrentStep('community-form')
    }
  }

  const showRoleSelection = () => {
    setCurrentStep('role-selection')
  }

  const showOTPForm = (email: string) => {
    setCurrentEmail(email)
    setCurrentStep('otp-form')
  }

  const togglePassword = (inputId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [inputId]: !prev[inputId]
    }))
  }

  const handlePersonalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const userData = {
      name: `${formData.get('firstName')} ${formData.get('lastName')}`,
      email: formData.get('email'),
      password: formData.get('password'),
      role: 'PERSONAL',
      phone: '',
      bio: formData.get('bio') as string || ''
    }

    if (userData.password !== formData.get('confirmPassword')) {
      showAlert('Passwords do not match!', 'error')
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        showAlert('🎉 Registration successful! Check your email for OTP verification.', 'success')
        
        // Show OTP in console for development
        if (result.data?.otp) {
          console.log('🔐 Your OTP:', result.data.otp)
          showAlert(`Dev Mode: Your OTP is ${result.data.otp}`, 'info')
        }
        
        // Show OTP verification form
        showOTPForm(userData.email as string)
      } else {
        showAlert(result.message || result.error || 'Registration failed', 'error')
      }
    } catch (error) {
      console.error('Registration error:', error)
      showAlert('Registration failed. Please try again.', 'error')
    }
  }

  const handleCommunitySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const userData = {
      name: `${formData.get('firstName')} ${formData.get('lastName')}`,
      email: formData.get('email'),
      password: formData.get('password'),
      role: 'ADMIN',
      communityName: formData.get('organizationName') || `${formData.get('firstName')}'s Community`,
      phone: '',
      bio: `Organization: ${formData.get('organizationName')}, Position: ${formData.get('position')}`
    }

    if (userData.password !== formData.get('confirmPassword')) {
      showAlert('Passwords do not match!', 'error')
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const message = result.data?.communityCode 
          ? `🎉 Community created! Code: ${result.data.communityCode}. Check your email for OTP.`
          : '🎉 Registration successful! Check your email for OTP verification.'
        
        showAlert(message, 'success')
        
        // Show OTP in console for development
        if (result.data?.otp) {
          console.log('🔐 Your OTP:', result.data.otp)
          showAlert(`Dev Mode: Your OTP is ${result.data.otp}`, 'info')
        }
        
        // Show OTP verification form
        showOTPForm(userData.email as string)
      } else {
        showAlert(result.message || result.error || 'Registration failed', 'error')
      }
    } catch (error) {
      console.error('Registration error:', error)
      showAlert('Registration failed. Please try again.', 'error')
    }
  }

  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const otp = formData.get('otp')

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: currentEmail,
          otp
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        showAlert('🎉 Email verified successfully! Redirecting to login...', 'success')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        showAlert(result.error || 'OTP verification failed', 'error')
      }
    } catch (error) {
      showAlert('OTP verification failed: ' + (error as Error).message, 'error')
    }
  }

  const resendOTP = async () => {
    try {
      // Simulate resend OTP
      showAlert('OTP resent successfully!', 'success')
    } catch (error) {
      showAlert('Failed to resend OTP: ' + (error as Error).message, 'error')
    }
  }

  return (
    <div className="bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 min-h-screen p-4">
      <div className="auth-container max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              SkillPort
            </h1>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Create Your Account</h2>
          <p className="text-slate-600 text-lg">Join the SkillPort community and start your journey</p>
        </div>

        {/* Role Selection */}
        {currentStep === 'role-selection' && (
          <div className="max-w-4xl mx-auto mb-12">
            <h3 className="text-xl font-bold text-slate-800 text-center mb-8">Choose Your Role</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal User Card */}
              <div className="role-card auth-card rounded-3xl p-8 cursor-pointer" onClick={() => showForm('personal')}>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">Personal Learner</h3>
                  <p className="text-slate-600 mb-8 text-lg leading-relaxed">Track progress, join contests, build portfolio</p>
                  <button className="btn-primary text-white px-8 py-4 rounded-xl font-bold text-lg">
                    🚀 Start Learning Journey
                  </button>
                </div>
              </div>
              
              {/* Community User Card */}
              <div className="role-card auth-card rounded-3xl p-8 cursor-pointer" onClick={() => showForm('community')}>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Community Builder</h3>
                  <p className="text-slate-600 mb-8 text-lg leading-relaxed">Manage teams, create learning communities</p>
                  <button className="btn-primary text-white px-8 py-4 rounded-xl font-bold text-lg">
                    🌟 Build Community
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Personal Registration Form */}
        {currentStep === 'personal-form' && (
          <div className="max-w-2xl mx-auto">
            <div className="auth-card rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Personal Learner Registration</h2>
                <button onClick={showRoleSelection} className="text-slate-600 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handlePersonalSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">First Name *</label>
                    <input type="text" name="firstName" required className="form-input w-full px-4 py-3 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Last Name *</label>
                    <input type="text" name="lastName" required className="form-input w-full px-4 py-3 rounded-xl" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Username *</label>
                    <input type="text" name="username" required className="form-input w-full px-4 py-3 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Email *</label>
                    <input type="email" name="email" required className="form-input w-full px-4 py-3 rounded-xl" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Skill Level *</label>
                  <select name="skillLevel" required className="form-input w-full px-4 py-3 rounded-xl">
                    <option value="">Select skill level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Education Level</label>
                    <select name="educationLevel" className="form-input w-full px-4 py-3 rounded-xl">
                      <option value="">Select education level</option>
                      <option value="high-school">High School</option>
                      <option value="bachelor">Bachelor&apos;s Degree</option>
                      <option value="master">Master&apos;s Degree</option>
                      <option value="phd">PhD</option>
                      <option value="self-taught">Self Taught</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Field of Study</label>
                    <input type="text" name="fieldOfStudy" className="form-input w-full px-4 py-3 rounded-xl" placeholder="e.g., Computer Science" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Bio</label>
                  <textarea name="bio" rows={4} className="form-input w-full px-4 py-3 rounded-xl resize-none" placeholder="Tell us about yourself..."></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Password *</label>
                    <div className="relative">
                      <input 
                        type={showPassword['personalPassword'] ? "text" : "password"} 
                        name="password" 
                        id="personalPassword" 
                        required 
                        className="form-input w-full px-4 py-3 pr-12 rounded-xl"
                      />
                      <button 
                        type="button" 
                        onClick={() => togglePassword('personalPassword')}
                        className="password-toggle absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg"
                      >
                        {showPassword['personalPassword'] ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Confirm Password *</label>
                    <div className="relative">
                      <input 
                        type={showPassword['personalConfirmPassword'] ? "text" : "password"} 
                        name="confirmPassword" 
                        id="personalConfirmPassword" 
                        required 
                        className="form-input w-full px-4 py-3 pr-12 rounded-xl"
                      />
                      <button 
                        type="button" 
                        onClick={() => togglePassword('personalConfirmPassword')}
                        className="password-toggle absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg"
                      >
                        {showPassword['personalConfirmPassword'] ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <input type="checkbox" name="agreeTerms" required className="w-5 h-5 text-red-600 border-slate-300 rounded focus:ring-red-500 mt-1" />
                  <label className="ml-3 text-sm text-slate-600">
                    I agree to the <a href="/terms" target="_blank" className="text-red-600 hover:text-red-700 font-medium">Terms of Service</a> and <a href="/privacy" target="_blank" className="text-red-600 hover:text-red-700 font-medium">Privacy Policy</a>
                  </label>
                </div>
                
                <button type="submit" className="btn-primary w-full py-3 px-6 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Create Personal Account
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Community Registration Form */}
        {currentStep === 'community-form' && (
          <div className="max-w-2xl mx-auto">
            <div className="auth-card rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Community Builder Registration</h2>
                <button onClick={showRoleSelection} className="text-slate-600 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleCommunitySubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">First Name *</label>
                    <input type="text" name="firstName" required className="form-input w-full px-4 py-3 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Last Name *</label>
                    <input type="text" name="lastName" required className="form-input w-full px-4 py-3 rounded-xl" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Username *</label>
                    <input type="text" name="username" required className="form-input w-full px-4 py-3 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Email *</label>
                    <input type="email" name="email" required className="form-input w-full px-4 py-3 rounded-xl" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Organization Name *</label>
                    <input type="text" name="organizationName" required className="form-input w-full px-4 py-3 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Organization Type *</label>
                    <select name="organizationType" required className="form-input w-full px-4 py-3 rounded-xl">
                      <option value="">Select organization type</option>
                      <option value="university">University</option>
                      <option value="bootcamp">Bootcamp</option>
                      <option value="company">Company</option>
                      <option value="school">School</option>
                      <option value="nonprofit">Nonprofit</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Organization Size</label>
                    <select name="organizationSize" className="form-input w-full px-4 py-3 rounded-xl">
                      <option value="">Select size</option>
                      <option value="small">Small (1-50 people)</option>
                      <option value="medium">Medium (51-200 people)</option>
                      <option value="large">Large (200+ people)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Your Position</label>
                    <input type="text" name="position" className="form-input w-full px-4 py-3 rounded-xl" placeholder="e.g., Professor, Manager" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Organization Website</label>
                  <input type="url" name="organizationWebsite" className="form-input w-full px-4 py-3 rounded-xl" placeholder="https://example.com" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Password *</label>
                    <div className="relative">
                      <input 
                        type={showPassword['communityPassword'] ? "text" : "password"} 
                        name="password" 
                        id="communityPassword" 
                        required 
                        className="form-input w-full px-4 py-3 pr-12 rounded-xl"
                      />
                      <button 
                        type="button" 
                        onClick={() => togglePassword('communityPassword')}
                        className="password-toggle absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg"
                      >
                        {showPassword['communityPassword'] ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Confirm Password *</label>
                    <div className="relative">
                      <input 
                        type={showPassword['communityConfirmPassword'] ? "text" : "password"} 
                        name="confirmPassword" 
                        id="communityConfirmPassword" 
                        required 
                        className="form-input w-full px-4 py-3 pr-12 rounded-xl"
                      />
                      <button 
                        type="button" 
                        onClick={() => togglePassword('communityConfirmPassword')}
                        className="password-toggle absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg"
                      >
                        {showPassword['communityConfirmPassword'] ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <input type="checkbox" name="agreeTerms" required className="w-5 h-5 text-red-600 border-slate-300 rounded focus:ring-red-500 mt-1" />
                  <label className="ml-3 text-sm text-slate-600">
                    I agree to the <a href="/terms" target="_blank" className="text-red-600 hover:text-red-700 font-medium">Terms of Service</a> and <a href="/privacy" target="_blank" className="text-red-600 hover:text-red-700 font-medium">Privacy Policy</a>
                  </label>
                </div>
                
                <button type="submit" className="btn-primary w-full py-3 px-6 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  Create Community Account
                </button>
              </form>
            </div>
          </div>
        )}

        {/* OTP Form */}
        {currentStep === 'otp-form' && (
          <div className="max-w-md mx-auto">
            <div className="auth-card rounded-3xl p-8 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Email Verification</h2>
              <p className="text-slate-600 mb-6">We&apos;ve sent a 6-digit code to <span className="font-semibold">{currentEmail}</span></p>
              
              <form onSubmit={handleOTPSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Enter OTP</label>
                  <input type="text" name="otp" maxLength={6} placeholder="000000" required className="form-input w-full px-4 py-3 text-center text-xl font-bold rounded-xl" />
                </div>
                
                <button type="submit" className="btn-primary w-full py-3 px-6 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  Verify Email
                </button>
                
                <div className="flex items-center justify-center space-x-4">
                  <button type="button" onClick={resendOTP} className="text-red-600 hover:text-red-700 font-medium hover:underline">
                    Resend OTP
                  </button>
                  <button type="button" onClick={showRoleSelection} className="text-slate-600 hover:text-slate-700 font-medium hover:underline">
                    Back to Registration
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Back to Login */}
        <div className="text-center mt-12">
          <p className="text-slate-600">
            Already have an account?{' '}
            <a href="/auth/login" className="text-red-600 hover:text-red-700 font-semibold hover:underline">Sign in here</a>
          </p>
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
