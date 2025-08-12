'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import type { UserProfile } from '@/lib/auth/server-auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  profile: UserProfile | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  profile: null,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({
  children,
  initialUser,
  initialProfile,
}: {
  children: React.ReactNode
  initialUser: User | null
  initialProfile: UserProfile | null
}) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Initialize with server-side data
    setUser(initialUser)
    setProfile(initialProfile)
    setIsLoading(false)

    const supabase = createClient()

    // CRITICAL: Only listen for auth changes, NO async calls to prevent deadlocks
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth event:', event, 'User:', session?.user?.email || 'none')
      
      // Simply update the user state - no async Supabase calls
      setUser(session?.user ?? null)
      
      // Clear profile if user logged out - Server Components will handle profile loading
      if (!session?.user) {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [initialUser, initialProfile])

  return (
    <AuthContext.Provider value={{ user, isLoading, profile }}>
      {children}
    </AuthContext.Provider>
  )
}