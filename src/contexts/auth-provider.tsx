'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

type AuthContextType = {
  user: User | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
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
  initialUser
}: {
  children: React.ReactNode
  initialUser: User | null
}) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Initialize with server-side data
    setUser(initialUser)
    setIsLoading(false)

    // IMPORTANT: Only listen for auth changes, don't make async Supabase calls
    // in the callback to avoid deadlocks
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event)
      // Simply update the user state without additional async calls
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase, initialUser])

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}