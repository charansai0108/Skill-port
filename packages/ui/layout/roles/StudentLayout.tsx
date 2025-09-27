import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../../../app/globals.css'
import '../../../app/student/student.css' // Import student-specific styles
import { StudentHeader } from '../StudentHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Student Dashboard - PW IOI Community',
  description: 'Track your progress, participate in contests, and improve your coding skills',
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <StudentHeader />
      <main>{children}</main>
    </div>
  )
}
