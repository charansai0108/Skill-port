'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Trophy,
  BarChart3,
  User,
  MessageCircle,
  BookOpen,
  Award
} from 'lucide-react'

export function StudentHeader() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Alex Johnson
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/student/dashboard"
              className={`nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                pathname === '/student/dashboard'
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/student/contests"
              className={`nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                pathname.startsWith('/student/contests')
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Contests
            </Link>
            <Link
              href="/student/leaderboard"
              className={`nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                pathname === '/student/leaderboard'
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Leaderboard
            </Link>
            <Link
              href="/student/feedback"
              className={`nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                pathname === '/student/feedback'
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Feedback
            </Link>
            <Link
              href="/student/profile"
              className={`nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                pathname === '/student/profile'
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-white font-bold text-xs">AJ</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}