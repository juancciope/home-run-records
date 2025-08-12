# Authentication System Implementation Plan

## Current Issues Identified

### CRITICAL Issues (Causing Auth Failures)
1. **Multiple Auth Systems Running Simultaneously**
   - Legacy client in `src/lib/supabaseClient.ts` 
   - Complex auth context in `src/contexts/auth-context.tsx`
   - Minimal auth provider in `src/contexts/auth-provider.tsx` 
   - Layout is using complex auth instead of minimal

2. **Multiple GoTrueClient Instances**
   - Different client creation patterns throughout app
   - No singleton pattern implemented correctly
   - Old and new client utilities mixed

3. **Auth Context Deadlocks**
   - Async Supabase calls in `onAuthStateChange` callbacks
   - Complex state management causing race conditions

### MAJOR Issues (Performance/Warnings)
4. **Session Synchronization Problems**
   - Server actions create sessions but client can't detect them
   - Improper middleware implementation
   - Missing server-side session initialization

5. **Improper Multi-tenant Implementation**
   - Auth context tries to load user agencies in auth callback
   - User data not initialized server-side

## Production-Ready Solution Architecture

### Phase 1: Clean Foundation
1. **Remove Legacy Systems**
   - Delete `src/lib/supabaseClient.ts`
   - Delete `src/contexts/auth-context.tsx` (complex one)
   - Delete `src/contexts/auth-context-backup.tsx`
   - Update all imports to use official patterns

2. **Implement Official SSR Pattern**
   - Keep only `src/utils/supabase/` utilities
   - Ensure proper middleware implementation
   - Use singleton pattern for browser client

### Phase 2: Proper Auth Context
1. **Enhanced Minimal Auth Provider**
   - Server-side user initialization
   - Multi-tenant data loading in Server Components
   - No async calls in auth state change callbacks

2. **Layout Integration**
   - Fetch user + profile data server-side
   - Pass to client as initial state
   - Remove client-side user loading in auth context

### Phase 3: Multi-Tenant Server Integration
1. **Server-Side Multi-Tenant Utils**
   - Create utilities for user profile + agencies
   - Move complex multi-tenant logic to Server Components
   - Role-based access controls server-side

2. **Dashboard Route Architecture**
   - Server Components fetch auth-dependent data
   - Client Components only handle UI interactions
   - Superadmin redirect logic in Server Components

## Implementation Steps

### Step 1: Clean Up Legacy Code

**Files to Delete:**
- `src/lib/supabaseClient.ts`
- `src/contexts/auth-context.tsx` 
- `src/contexts/auth-context-backup.tsx`
- `src/contexts/artist-context.tsx` (if exists)

**Files to Update:**
- All components importing from deleted files
- `src/app/layout.tsx` - use minimal auth provider
- Any remaining old client patterns

### Step 2: Fix Supabase Client Utilities

**Update `src/utils/supabase/client.ts`:**
```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance
  }

  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  return supabaseInstance
}
```

**Verify `src/utils/supabase/server.ts`:**
- Ensure proper cookie handling
- No caching (each call creates new instance)

**Verify `src/utils/supabase/middleware.ts`:**
- Proper session refresh
- Correct cookie management

### Step 3: Enhanced Auth Provider

**Update `src/contexts/auth-provider.tsx`:**
```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  profile: UserProfile | null
}

interface UserProfile {
  id: string
  email: string
  global_role: 'superadmin' | 'artist_manager' | 'artist'
  // ... other profile fields
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
    const supabase = createClient()

    // Initialize with server-side data
    setUser(initialUser)
    setProfile(initialProfile)
    setIsLoading(false)

    // CRITICAL: Only listen for auth changes, no async calls
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event)
        setUser(session?.user ?? null)
        
        // Clear profile if user logged out
        if (!session?.user) {
          setProfile(null)
        }
        // Note: Don't fetch profile here - let Server Components handle it
      }
    )

    return () => subscription.unsubscribe()
  }, [initialUser, initialProfile])

  return (
    <AuthContext.Provider value={{ user, isLoading, profile }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Step 4: Server-Side Multi-Tenant Utils

**Create `src/lib/auth/server-auth.ts`:**
```typescript
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function getServerUser() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  
  return user
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  
  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error getting profile:', error)
    return null
  }

  return profile
}

export async function requireAuth() {
  const user = await getServerUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function requireRole(role: string) {
  const user = await requireAuth()
  const profile = await getUserProfile(user.id)
  
  if (!profile || profile.global_role !== role) {
    redirect('/dashboard')
  }
  
  return { user, profile }
}

export async function getUserWithProfile() {
  const user = await getServerUser()
  if (!user) return null
  
  const profile = await getUserProfile(user.id)
  return { user, profile }
}
```

### Step 5: Update App Layout

**Update `src/app/layout.tsx`:**
```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-provider";
import { getUserWithProfile } from "@/lib/auth/server-auth";
import "./globals.css";

// ... font configs

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch auth data server-side for initial state
  const authData = await getUserWithProfile()

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider 
          initialUser={authData?.user ?? null}
          initialProfile={authData?.profile ?? null}
        >
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Step 6: Update Dashboard Routes

**Update `src/app/dashboard/page.tsx`:**
```typescript
import { requireAuth, getUserProfile } from '@/lib/auth/server-auth'
import { redirect } from 'next/navigation'
import { DashboardContent } from "@/components/dashboard-content"

export default async function DashboardPage() {
  const user = await requireAuth()
  const profile = await getUserProfile(user.id)

  // Redirect superadmin users to their specific dashboard
  if (profile?.global_role === 'superadmin') {
    redirect('/dashboard/superadmin')
  }

  return <DashboardContent />
}
```

**Update `src/app/dashboard/superadmin/page.tsx`:**
```typescript
import { requireRole } from '@/lib/auth/server-auth'
import { SuperadminDashboard } from '@/components/superadmin-dashboard'

export default async function SuperadminPage() {
  // Server-side role validation
  await requireRole('superadmin')

  return <SuperadminDashboard />
}
```

### Step 7: Update Components

**Remove auth loading from `src/components/dashboard-content.tsx`:**
- Remove `const { user, isLoading } = useAuth()` dependencies
- Remove superadmin redirect logic (now handled server-side)
- Use auth context only for minimal user state

**Update any components using old auth patterns:**
- Replace `useAuth` imports with new minimal version
- Remove complex multi-tenant logic from client components
- Use Server Components for auth-dependent data fetching

## Validation Checklist

After implementation, verify:

- [ ] No "Multiple GoTrueClient instances" warnings
- [ ] Login works without hanging on "Signing in..."
- [ ] Session persists across page refreshes
- [ ] Superadmin users redirect to `/dashboard/superadmin`
- [ ] Regular users can access `/dashboard`
- [ ] Protected routes properly redirect unauthenticated users
- [ ] RLS policies working correctly
- [ ] No console errors or auth context issues
- [ ] Performance is acceptable
- [ ] Multi-tenant features working (agencies, artists, etc.)

## Key Principles

1. **Single Source of Truth**: Only one auth system (the minimal provider)
2. **Server-First**: Fetch auth data server-side, pass to client as initial state
3. **No Async in Callbacks**: Auth state change callbacks only update state
4. **Singleton Pattern**: Browser client creates only one instance
5. **Proper SSR**: Follow official Supabase patterns exactly
6. **Server Components**: Use for auth-dependent data fetching
7. **Clean Separation**: Server utilities for server, client utilities for client

This architecture will provide a robust, scalable authentication system that follows Supabase best practices and eliminates all current issues.