import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../../../app/globals.css'
import '../../../app/personal/personal.css' // Import personal-specific styles
import { PersonalHeader } from '../PersonalHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Personal Dashboard - PW IOI Community',
  description: 'Track your personal progress and goals on PW IOI',
}

export default function PersonalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PersonalHeader />
      <main>{children}</main>
    </div>
  )
}
