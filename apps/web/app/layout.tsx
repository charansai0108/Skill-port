import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { headers } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SkillPort - Your Complete Skill Platform',
  description: 'Empowering learners, building communities, tracking progress, achieving excellence!',
  keywords: 'coding, programming, learning, contests, community, skills, development',
  authors: [{ name: 'SkillPort Team' }],
  openGraph: {
    title: 'SkillPort - Your Complete Skill Platform',
    description: 'Empowering learners, building communities, tracking progress, achieving excellence!',
    type: 'website',
    locale: 'en_US',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-invoke-path') || ''

  // Only show header and footer on the homepage
  const isHomepage = pathname === '/'

  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/tailwind.css" />
        <script
          src="https://checkout.razorpay.com/v1/checkout.js"
          async
        />
      </head>
      <body className={inter.className}>
        {isHomepage && <Header />}
        <main>{children}</main>
        {isHomepage && <Footer />}
      </body>
    </html>
  )
}
