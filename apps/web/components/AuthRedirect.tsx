'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AuthRedirectProps {
  requiredRole: string
  currentPath: string
}

export function AuthRedirect({ requiredRole, currentPath }: AuthRedirectProps) {
  const router = useRouter()

  useEffect(() => {
    const checkAndRedirect = () => {
      try {
        const userData = localStorage.getItem('user')
        if (!userData) {
          router.push('/auth/login')
          return
        }

        const user = JSON.parse(userData)
        
        // If user doesn't have the required role, redirect to their appropriate dashboard
        if (user.role !== requiredRole) {
          let redirectUrl = '/personal/dashboard'
          
          switch (user.role) {
            case 'ADMIN':
              redirectUrl = '/admin/dashboard'
              break
            case 'MENTOR':
              redirectUrl = '/mentor/dashboard'
              break
            case 'STUDENT':
              redirectUrl = '/student/dashboard'
              break
            case 'PERSONAL':
            default:
              redirectUrl = '/personal/dashboard'
              break
          }

          // Only redirect if not already on the correct page
          if (currentPath !== redirectUrl) {
            console.log(`Redirecting ${user.role} user from ${currentPath} to ${redirectUrl}`)
            router.push(redirectUrl)
          }
        }
      } catch (error) {
        console.error('Auth redirect error:', error)
        router.push('/auth/login')
      }
    }

    checkAndRedirect()
  }, [requiredRole, currentPath, router])

  return null
}
