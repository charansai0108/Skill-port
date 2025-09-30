'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Target, Eye, EyeOff, LogIn, Github, Mail, UserCheck, Users, Trophy } from 'lucide-react'
import { DEMO_CREDENTIALS, ROUTES } from '@/lib/constants'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [alerts, setAlerts] = useState<Array<{ id: number; message: string; type: string }>>([])
  const router = useRouter()

  const showAlert = (message: string, type: string = 'info') => {
    const id = Date.now()
    setAlerts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id))
    }, 5000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

        const result = await response.json()

        if (response.ok && result.success) {
          // Store token and user data
          localStorage.setItem('token', result.data.token)
          localStorage.setItem('user', JSON.stringify(result.data.user))
          
          showAlert('🎉 Login successful! Redirecting...', 'success')
          setTimeout(() => {
            // Determine redirect URL based on user role
            let redirectUrl: string = '/personal/dashboard'
            switch (result.data.user.role) {
              case 'ADMIN':
                redirectUrl = '/admin/dashboard'
                break
              case 'MENTOR':
                redirectUrl = '/mentor/dashboard'
                break
              case 'STUDENT':
                redirectUrl = '/student/dashboard'
                break
              case 'COMMUNITY_ADMIN':
                redirectUrl = '/community/dashboard'
                break
              case 'PERSONAL':
              default:
                redirectUrl = '/personal/dashboard'
                break
            }
            
            console.log(`🔄 Redirecting ${result.data.user.role} user to: ${redirectUrl}`)
            
            try {
              router.push(redirectUrl)
            } catch (error) {
              console.error('Redirect error:', error)
              // Fallback to window.location if router.push fails
              console.log(`🔄 Fallback redirect to: ${redirectUrl}`)
              window.location.href = redirectUrl
            }
          }, 1500)
        } else {
          showAlert(result.message || result.error || 'Login failed', 'error')
        }
    } catch (error) {
      console.error('Login error:', error)
      showAlert('Login failed. Please try again.', 'error')
    }
  }

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 min-h-screen flex items-center justify-center p-4">
      <div className="auth-container w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Auth Card */}
        <div className="auth-card rounded-3xl p-8 lg:p-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                SkillPort
              </h1>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Welcome Back</h2>
            <p className="text-slate-600">Sign in to your SkillPort account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="form-input w-full px-4 py-3 rounded-xl"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  name="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="form-input w-full px-4 py-3 pr-12 rounded-xl"
                  placeholder="Enter your password"
                />
                <button 
                  type="button" 
                  onClick={togglePassword}
                  className="password-toggle absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500" />
                <span className="ml-2 text-sm text-slate-600">Remember me</span>
              </label>
              <a href="/auth/forgot-password" className="text-sm text-red-600 hover:text-red-700 font-medium">Forgot password?</a>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full py-3 px-6 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-4 text-sm text-slate-500">or</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button 
              className="btn-secondary w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2" 
              onClick={() => showAlert('OAuth login via GitHub coming soon', 'info')}
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </button>
            <button 
              className="btn-secondary w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2" 
              onClick={() => showAlert('OAuth login via Google coming soon', 'info')}
            >
              <Mail className="w-5 h-5" />
              Continue with Google
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Demo Credentials:</h3>
            <div className="text-xs text-slate-600 space-y-1">
              <div><strong>Admin:</strong> {DEMO_CREDENTIALS.admin.email} / {DEMO_CREDENTIALS.admin.password}</div>
              <div><strong>Mentor:</strong> {DEMO_CREDENTIALS.mentor.email} / {DEMO_CREDENTIALS.mentor.password}</div>
              <div><strong>Student:</strong> {DEMO_CREDENTIALS.student.email} / {DEMO_CREDENTIALS.student.password}</div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-8">
            <p className="text-slate-600">
              Don&apos;t have an account?{' '}
              <a href="/auth/register" className="text-red-600 hover:text-red-700 font-medium">Sign up</a>
            </p>
          </div>
        </div>

        {/* Illustration */}
        <div className="hidden lg:block">
          <div className="auth-card rounded-3xl p-8 h-full flex items-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <UserCheck className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Welcome to SkillPort</h2>
              <p className="text-slate-600 mb-8">Join our community of learners and developers. Access your personalized learning dashboard and track your progress.</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-800">Personalized Learning</h3>
                    <p className="text-sm text-slate-600">Track your progress and goals</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 rounded-xl">
                  <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-800">Join Communities</h3>
                    <p className="text-sm text-slate-600">Connect with fellow developers</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 rounded-xl">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-800">Earn Achievements</h3>
                    <p className="text-sm text-slate-600">Complete challenges and win rewards</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
