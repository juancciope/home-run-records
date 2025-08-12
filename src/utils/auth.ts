import { createClient } from '@/utils/supabase/server'

export async function getUser() {
  const supabase = await createClient()
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !userProfile) {
    return null
  }

  return userProfile
}

export async function getUserWithProfile() {
  const user = await getUser()
  if (!user) return null

  const profile = await getUserProfile(user.id)
  return { user, profile }
}

export async function getUserAgencies(userId: string) {
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

  const agencies = agencyUsers?.map(au => ({
    agency_id: au.agency_id,
    role: au.role,
    is_primary: au.is_primary,
    agency: Array.isArray(au.agency) ? au.agency[0] : au.agency
  })) || []

  return agencies
}