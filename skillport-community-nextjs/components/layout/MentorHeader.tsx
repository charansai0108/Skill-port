'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Trophy,
  MessageCircle,
  BarChart3,
  GraduationCap
} from 'lucide-react'

export function MentorHeader() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Satya Sai
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/mentor/dashboard"
              className={`nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                pathname === '/mentor/dashboard'
                  ? 'bg-orange-50 text-orange-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/mentor/contests"
              className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              <Trophy className="w-4 h-4" />
              Contests
            </Link>
            <Link
              href="/mentor/feedback"
              className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              <MessageCircle className="w-4 h-4" />
              Feedback
            </Link>
            <Link
              href="/mentor/leaderboard"
              className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              <BarChart3 className="w-4 h-4" />
              Leaderboard
            </Link>
            <Link
              href="/mentor/profile"
              className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-white font-bold text-xs">SS</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}