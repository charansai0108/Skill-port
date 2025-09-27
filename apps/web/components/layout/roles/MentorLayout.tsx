import type { Metadata } from 'next'
import '../../../app/mentor/mentor.css'
import { MentorHeader } from '../MentorHeader'

export const metadata: Metadata = {
  title: 'Mentor Dashboard - PW IOI Community',
  description: 'Manage your students, contests, and mentorship activities',
}

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <MentorHeader />
      <main>{children}</main>
    </div>
  )
}
