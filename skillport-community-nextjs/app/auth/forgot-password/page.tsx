'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Target, MailCheck, RefreshCw, LogIn, HelpCircle, Lock, Mail, Zap } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
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
    
    if (!email) {
      showAlert('Please enter your email address', 'error')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      showAlert('Please enter a valid email address', 'error')
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsSubmitted(true)
      showAlert('Password reset email sent successfully!', 'success')
    } catch (error) {
      showAlert('Failed to send reset email. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const showForgotPasswordForm = () => {
    setIsSubmitted(false)
    setEmail('')
  }

  const handleResend = async () => {
    if (!email) return
    
    setIsLoading(true)
    try {
      // Simulate resend API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      showAlert('Password reset email sent again!', 'success')
    } catch (error) {
      showAlert('Failed to resend email. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-focus email input on page load
  useEffect(() => {
    if (!isSubmitted) {
      const emailInput = document.getElementById('email') as HTMLInputElement
      if (emailInput) {
        emailInput.focus()
      }
    }
  }, [isSubmitted])

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
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Forgot Your Password?</h2>
            <p className="text-slate-600">No worries! We&apos;ll send you reset instructions</p>
          </div>

          {/* Forgot Password Form */}
          {!isSubmitted ? (
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
                  placeholder="Enter your email address"
                  className="form-input w-full px-4 py-3 rounded-xl"
                />
                <p className="text-xs text-slate-500">We&apos;ll send you a password reset link</p>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-primary w-full py-3 px-6 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success Message */
            <div className="success-card rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MailCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Check Your Email</h3>
              <p className="text-slate-600 mb-2">We&apos;ve sent a password reset link to <span className="font-semibold text-slate-800">{email}</span></p>
              <p className="text-sm text-slate-500 mb-6">Click the link in the email to reset your password. The link will expire in 1 hour.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  type="button" 
                  onClick={handleResend}
                  disabled={isLoading}
                  className="btn-secondary py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                  Send Another Email
                </button>
                <a 
                  href="/auth/login" 
                  className="btn-primary py-3 px-6 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  Back to Login
                </a>
              </div>
            </div>
          )}

          {!isSubmitted && (
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
                <HelpCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Need Help?</h2>
              <p className="text-slate-600 mb-8">Don&apos;t worry! We&apos;ll help you get back into your account quickly and securely</p>
              
              <div className="space-y-4">
                <div className="feature-item flex items-center gap-3 p-4 rounded-xl">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-800">Secure Reset</h3>
                    <p className="text-sm text-slate-600">Encrypted password reset process</p>
                  </div>
                </div>
                
                <div className="feature-item flex items-center gap-3 p-4 rounded-xl">
                  <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-800">Email Delivery</h3>
                    <p className="text-sm text-slate-600">Instant email with reset link</p>
                  </div>
                </div>
                
                <div className="feature-item flex items-center gap-3 p-4 rounded-xl">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-800">Quick Process</h3>
                    <p className="text-sm text-slate-600">Reset password in minutes</p>
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
