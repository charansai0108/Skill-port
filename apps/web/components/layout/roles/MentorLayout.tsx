'use client'

import { useParams } from 'next/navigation'
import '../../../app/mentor/mentor.css'
import { MentorHeader } from '../MentorHeader'

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const communitySlug = params.communitySlug as string

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <MentorHeader communitySlug={communitySlug} />
      <main>{children}</main>
    </div>
  )
}
