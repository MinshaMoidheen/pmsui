'use client'

// React Imports
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

// Next Imports
import { usePathname, useRouter } from 'next/navigation'

// Public routes - accessible without authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/error', '/under-maintenance']

// Routes that should redirect to home if user is already authenticated
const AUTH_ROUTES = ['/login', '/register']

export interface AuthUser {
  id: string
  mobileNumber: string
  role: string
  isMobileVerified: boolean
  profile: {
    firstName: string
    lastName: string
    profilePicture?: string
  }
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  const isAuthenticated = !!user

  const loadUserFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return null
    try {
      const userStr = localStorage.getItem('user')
      const accessToken = localStorage.getItem('accessToken')
      if (userStr && accessToken) {
        return JSON.parse(userStr) as AuthUser
      }
    } catch {
      // Invalid JSON or missing data
    }
    return null
  }, [])

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
    setUser(null)
    router.push('/login')
  }, [router])

  // Listen for token expiration event from apiSlice
  useEffect(() => {
    const handleTokenExpired = () => {
      setUser(null)
    }
    window.addEventListener('tokenExpired', handleTokenExpired)
    return () => window.removeEventListener('tokenExpired', handleTokenExpired)
  }, [])

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = loadUserFromStorage()
    setUser(storedUser)
    setIsLoading(false)
  }, [loadUserFromStorage])

  // Route protection logic
  useEffect(() => {
    if (isLoading) return

    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route))
    const isAuthRoute = AUTH_ROUTES.some(route => pathname?.startsWith(route))

    if (isAuthRoute && isAuthenticated) {
      // User is logged in and trying to access login/register - redirect to home
      router.replace('/')
      return
    }

    if (!isPublicRoute && !isAuthenticated) {
      // User is not logged in and trying to access protected route - redirect to login
      router.replace('/login')
    }
  }, [pathname, isAuthenticated, isLoading, router])

  const handleSetUser = useCallback((newUser: AuthUser | null) => {
    setUser(newUser)
  }, [])

  // Show loading spinner when checking auth on protected routes
  const isPublicRoute = pathname ? PUBLIC_ROUTES.some(route => pathname.startsWith(route)) : false
  const showLoading = isLoading && !isPublicRoute

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        setUser: handleSetUser,
        logout
      }}
    >
      {showLoading ? (
        <div className='flex items-center justify-center min-bs-[100dvh]'>
          <div className='animate-spin rounded-full border-2 border-primary border-t-transparent bs-12 is-12' />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}
