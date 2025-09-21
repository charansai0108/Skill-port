'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Trophy, 
  BarChart3, 
  User, 
  LogOut,
  Shield,
  GraduationCap,
  Award
} from 'lucide-react'

export function AdminHeader() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              PW IOI
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/admin/dashboard"
              className={`nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                pathname === '/admin/dashboard'
                  ? 'bg-red-50 text-red-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              <Users className="w-4 h-4" />
              Students
            </Link>
            <Link
              href="/admin/mentors"
              className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              <GraduationCap className="w-4 h-4" />
              Mentors
            </Link>
            <Link
              href="/admin/contests"
              className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              <Trophy className="w-4 h-4" />
              Contests
            </Link>
            <Link
              href="/admin/analytics"
              className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
            <Link
              href="/admin/leaderboard"
              className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              <Award className="w-4 h-4" />
              Leaderboard
            </Link>
            <Link
              href="/admin/profile"
              className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" alt="Profile" className="w-8 h-8 rounded-full object-cover shadow-lg border-2 border-white" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
