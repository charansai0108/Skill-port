'use client'

import { useParams } from 'next/navigation'
import '../../../app/globals.css'
import '../../../app/community/[communitySlug]/user/user.css' // Import user-specific styles
import { UserHeader } from '../UserHeader'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const communitySlug = params.communitySlug as string

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <UserHeader communitySlug={communitySlug} />
      <main>{children}</main>
    </div>
  )
}
