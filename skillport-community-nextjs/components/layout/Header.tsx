'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Zap } from 'lucide-react'

export function Header() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              SkillPort
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-4">
            <Link href="/features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Features
            </Link>
            <Link href="/community" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Community
            </Link>
            <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Contact
            </Link>
            <Link href="/auth/login">
              <Button variant="secondary" size="sm">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
