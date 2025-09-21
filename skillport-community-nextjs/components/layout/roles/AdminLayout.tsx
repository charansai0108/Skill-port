import type { Metadata } from 'next'
import '../../../app/admin/admin.css'
import { AdminHeader } from '../AdminHeader'

export const metadata: Metadata = {
  title: 'Admin Dashboard - SkillPort Community',
  description: 'Manage and oversee the SkillPort Community platform',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <AdminHeader />
      <main>{children}</main>
    </div>
  )
}
