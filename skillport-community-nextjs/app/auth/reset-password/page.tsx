'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Target, Eye, EyeOff, CheckCircle, AlertCircle, LogIn, Mail, ShieldCheck, Lock, Zap, Shield } from 'lucide-react'

type PageState = 'form' | 'success' | 'error'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pageState, setPageState] = useState<PageState>('form')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [strengthText, setStrengthText] = useState('')
  const [strengthColor, setStrengthColor] = useState('')
  const [alerts, setAlerts] = useState<Array<{ id: number; message: string; type: string }>>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  const showAlert = (message: string, type: string = 'info') => {
    const id = Date.now()
    setAlerts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id))
    }, 5000)
  }

  const checkPasswordStrength = (password: string) => {
    let strength = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /[0-9]/.test(password),
      symbols: /[^a-zA-Z0-9]/.test(password)
    }

    Object.values(checks).forEach(check => {
      if (check) strength++
    })

    let color, text
    if (strength <= 2) {
      color = '#ef4444'
      text = 'Weak'
    } else if (strength <= 3) {
      color = '#f59e0b'
      text = 'Fair'
    } else if (strength <= 4) {
      color = '#10b981'
      text = 'Good'
    } else {
      color = '#059669'
      text = 'Strong'
    }

    setPasswordStrength(strength)
    setStrengthText(text)
    setStrengthColor(color)
  }

  const togglePassword = (inputId: string) => {
    if (inputId === 'password') {
      setShowPassword(!showPassword)
    } else {
      setShowConfirmPassword(!showConfirmPassword)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      showAlert('Passwords do not match', 'error')
      return
    }

    if (passwordStrength < 3) {
      showAlert('Please choose a stronger password', 'error')
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setPageState('success')
      showAlert('Password reset successfully!', 'success')
    } catch (error) {
      setPageState('error')
      showAlert('Failed to reset password. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = () => {
    router.push('/auth/forgot-password')
  }

  // Check for reset token on page load
  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setPageState('error')
    }
  }, [searchParams])

  // Monitor password strength
  useEffect(() => {
    if (password) {
      checkPasswordStrength(password)
    } else {
      setPasswordStrength(0)
      setStrengthText('')
      setStrengthColor('')
    }
  }, [password])

  // Auto-focus password input on page load
  useEffect(() => {
    if (pageState === 'form') {
      const passwordInput = document.getElementById('password') as HTMLInputElement
      if (passwordInput) {
        passwordInput.focus()
      }
    }
  }, [pageState])

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
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Reset Your Password</h2>
            <p className="text-slate-600">Create a new secure password for your account</p>
          </div>

          {/* Reset Password Form */}
          {pageState === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="password" 
                    name="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    placeholder="Enter new password" 
                    minLength={8}
                    className="form-input w-full px-4 py-3 rounded-xl pr-12"
                  />
                  <button 
                    type="button" 
                    onClick={() => togglePassword('password')}
                    className="password-toggle absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500">Minimum 8 characters with uppercase, lowercase, number, and symbol</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                    placeholder="Confirm new password" 
                    minLength={8}
                    className="form-input w-full px-4 py-3 rounded-xl pr-12"
                  />
                  <button 
                    type="button" 
                    onClick={() => togglePassword('confirmPassword')}
                    className="password-toggle absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="password-strength">
                  <div className="strength-bar rounded-full h-2 overflow-hidden">
                    <div 
                      className="strength-fill h-full rounded-full" 
                      style={{ 
                        width: `${(passwordStrength / 5) * 100}%`,
                        backgroundColor: strengthColor
                      }}
                    ></div>
                  </div>
                  <p className="strength-text text-sm mt-2" style={{ color: strengthColor }}>
                    Password strength: {strengthText}
                  </p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading || passwordStrength < 3 || password !== confirmPassword}
                className="btn-primary w-full py-3 px-6 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Success Message */}
          {pageState === 'success' && (
            <div className="success-card rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Password Reset Successfully!</h3>
              <p className="text-slate-600 mb-6">Your password has been updated. You can now sign in with your new password.</p>
              <a 
                href="/auth/login" 
                className="btn-primary inline-flex items-center gap-2 py-3 px-6 rounded-xl text-white font-semibold"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </a>
            </div>
          )}

          {/* Error Message */}
          {pageState === 'error' && (
            <div className="error-card rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Invalid or Expired Link</h3>
              <p className="text-slate-600 mb-6">The password reset link is invalid or has expired. Please request a new one.</p>
              <a 
                href="/auth/forgot-password" 
                className="btn-primary inline-flex items-center gap-2 py-3 px-6 rounded-xl text-white font-semibold"
              >
                <Mail className="w-5 h-5" />
                Request New Link
              </a>
            </div>
          )}

          {pageState === 'form' && (
            <div className="text-center mt-8">
              <p className="text-slate-600">Remember your password?{' '}
                <a href="/auth/login" className="text-red-600 hover:text-red-700 font-medium">Sign in</a>
              </p>
            </div>
          )}
        </div>

        {/* Illustration */}
        <div className="hidden lg:block">
          <div className="auth-card rounded-3xl p-8 h-full flex items-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <ShieldCheck className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Secure Your Account</h2>
              <p className="text-slate-600 mb-8">Choose a strong password to keep your account safe and protected</p>
              
              <div className="space-y-4">
                <div className="feature-item flex items-center gap-3 p-4 rounded-xl">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-800">Strong Security</h3>
                    <p className="text-sm text-slate-600">Advanced encryption protection</p>
                  </div>
                </div>
                
                <div className="feature-item flex items-center gap-3 p-4 rounded-xl">
                  <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-800">Quick Setup</h3>
                    <p className="text-sm text-slate-600">Reset password in seconds</p>
                  </div>
                </div>
                
                <div className="feature-item flex items-center gap-3 p-4 rounded-xl">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-800">Account Protection</h3>
                    <p className="text-sm text-slate-600">Keep your data safe</p>
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
