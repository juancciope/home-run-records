import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export type UserRole = 'superadmin' | 'artist_manager' | 'artist'

export interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  global_role: UserRole
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface Agency {
  id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  status: 'active' | 'inactive' | 'suspended'
  subscription_tier: string
  max_artists: number
  created_at: string
  updated_at: string
}

export interface AgencyUser {
  agency_id: string
  role: UserRole
  is_primary: boolean
  agency: Agency
}

/**
 * Get the current authenticated user from server-side
 * Always use this for server-side auth validation
 */
export async function getServerUser() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  
  return user
}

/**
 * Get user profile from the users table
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient()
  
  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error getting user profile:', error)
    
    // If profile doesn't exist, try to create it
    if (error.code === 'PGRST116') {
      console.log('Profile not found, attempting to create...')
      const user = await getServerUser()
      if (user?.email) {
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: user.email,
            global_role: 'artist',
            is_active: true
          })
          .select()
          .single()
        
        if (createError) {
          console.error('Error creating user profile:', createError)
          return null
        }
        
        return newProfile
      }
    }
    
    return null
  }

  return profile
}

/**
 * Get user agencies for multi-tenant access
 */
export async function getUserAgencies(userId: string): Promise<AgencyUser[]> {
  const supabase = await createClient()
  
  const { data: agencyUsers, error } = await supabase
    .from('agency_users')
    .select(`
      agency_id,
      role,
      is_primary,
      agency:agencies(*)
    `)
    .eq('user_id', userId)

  if (error) {
    console.error('Error loading user agencies:', error)
    return []
  }

  return agencyUsers?.map(au => ({
    agency_id: au.agency_id,
    role: au.role,
    is_primary: au.is_primary,
    agency: Array.isArray(au.agency) ? au.agency[0] : au.agency
  })) || []
}

/**
 * Require authentication, redirect to login if not authenticated
 */
export async function requireAuth() {
  const user = await getServerUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

/**
 * Require specific role, redirect to dashboard if insufficient permissions
 */
export async function requireRole(role: UserRole) {
  const user = await requireAuth()
  const profile = await getUserProfile(user.id)
  
  if (!profile || profile.global_role !== role) {
    redirect('/dashboard')
  }
  
  return { user, profile }
}

/**
 * Get user with profile data for initial auth state
 */
export async function getUserWithProfile() {
  const user = await getServerUser()
  if (!user) return null
  
  const profile = await getUserProfile(user.id)
  return { user, profile }
}

/**
 * Get complete user data including agencies for dashboard
 */
export async function getUserWithFullData() {
  const user = await getServerUser()
  if (!user) return null
  
  const profile = await getUserProfile(user.id)
  if (!profile) return null
  
  const agencies = await getUserAgencies(user.id)
  
  return {
    user,
    profile,
    agencies,
    currentAgency: agencies.find(a => a.is_primary)?.agency || agencies[0]?.agency || null
  }
}