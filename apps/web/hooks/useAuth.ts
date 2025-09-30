import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role: string
  profilePic?: string
}

export function useAuth(requiredRole?: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
          router.push('/auth/login')
          return
        }

        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)

        // Check if user has the required role
        if (requiredRole && parsedUser.role !== requiredRole) {
          // Redirect to appropriate dashboard based on user's actual role
          switch (parsedUser.role) {
            case 'ADMIN':
              router.push('/admin/dashboard')
              break
            case 'MENTOR':
              router.push('/mentor/dashboard')
              break
            case 'STUDENT':
              router.push('/student/dashboard')
              break
            case 'COMMUNITY_ADMIN':
              router.push('/community/dashboard')
              break
            case 'PERSONAL':
            default:
              router.push('/personal/dashboard')
              break
          }
          return
        }

        setLoading(false)
      } catch (error) {
        console.error('Auth check error:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/auth/login')
      }
    }

    checkAuth()
  }, [requiredRole, router])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/auth/login')
  }

  const redirectToDashboard = (role: string) => {
    let redirectUrl = '/personal/dashboard'
    
    switch (role) {
      case 'ADMIN':
        redirectUrl = '/admin/dashboard'
        break
      case 'MENTOR':
        redirectUrl = '/mentor/dashboard'
        break
      case 'STUDENT':
        redirectUrl = '/student/dashboard'
        break
      case 'COMMUNITY_ADMIN':
        redirectUrl = '/community/dashboard'
        break
      case 'PERSONAL':
      default:
        redirectUrl = '/personal/dashboard'
        break
    }
    
    try {
      router.push(redirectUrl)
    } catch (error) {
      console.error('Redirect error:', error)
      window.location.href = redirectUrl
    }
  }

  return { user, loading, logout, redirectToDashboard }
}
