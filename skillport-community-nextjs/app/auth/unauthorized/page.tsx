'use client'

import { useRouter } from 'next/navigation'
import { 
  Target,
  Shield, 
  ArrowLeft, 
  Home, 
  AlertTriangle,
  Lock,
  UserX
} from 'lucide-react'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 min-h-screen flex items-center justify-center p-4">
      <div className="auth-container w-full max-w-md">
        {/* Auth Card */}
        <div className="auth-card rounded-3xl p-8 text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                SkillPort
              </h1>
            </div>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <Shield className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Access Denied</h2>
            <p className="text-lg text-slate-600 mb-2">
              You don&apos;t have permission to access this page
            </p>
            <p className="text-sm text-slate-500">
              Please contact your administrator if you believe this is an error
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center text-slate-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span className="text-sm">Error Code: 403 - Forbidden</span>
            </div>
            <div className="flex items-center justify-center text-slate-600">
              <Lock className="w-5 h-5 mr-2" />
              <span className="text-sm">Insufficient privileges</span>
            </div>
            <div className="flex items-center justify-center text-slate-600">
              <UserX className="w-5 h-5 mr-2" />
              <span className="text-sm">Account not authorized</span>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => router.push('/auth/login')}
              className="btn-primary w-full py-3 px-6 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Login
            </button>
            
            <button 
              onClick={() => router.push('/')}
              className="btn-secondary w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go to Homepage
            </button>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Need Help?</h3>
            <p className="text-xs text-yellow-700">
              If you believe you should have access to this page, please contact support at{' '}
              <a href="mailto:support@skillport.com" className="underline hover:text-yellow-900">
                support@skillport.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
