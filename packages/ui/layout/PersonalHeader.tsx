'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Folder,
  Activity,
  BarChart3,
  Users,
  Target
} from 'lucide-react'

export function PersonalHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent">
              PW IOI Personal
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/personal/dashboard"
              className={`nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                pathname === '/personal/dashboard'
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/personal/projects"
              className={`nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                pathname.startsWith('/personal/projects')
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Folder className="w-4 h-4" />
              Projects
            </Link>
            <Link
              href="/personal/tracker"
              className={`nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                pathname.startsWith('/personal/tracker')
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-4 h-4" />
              Tracker
            </Link>
            <Link
              href="/personal/stats"
              className={`nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                pathname.startsWith('/personal/stats')
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Stats
            </Link>
            <Link
              href="/personal/communities"
              className={`nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                pathname.startsWith('/personal/communities')
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              Communities
            </Link>
            <Link
              href="/personal/profile"
              className={`nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                pathname === '/personal/profile'
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover shadow-lg border-2 border-white"
              />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
