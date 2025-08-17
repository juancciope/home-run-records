import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton instance to prevent multiple GoTrueClient warnings
let supabaseInstance: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  // Return existing instance if already created
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Create new instance following official Supabase SSR patterns
  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  )
  
  return supabaseInstance
}

// Helper function to ensure auth context is available
export async function createAuthenticatedClient(): Promise<SupabaseClient> {
  const supabase = createClient()
  
  try {
    // Try to get current session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      console.log('✅ Authenticated session found:', { 
        userId: session.user?.id, 
        email: session.user?.email,
        expiresAt: session.expires_at
      })
      return supabase
    }
    
    // No session found - return basic client for graceful degradation
    console.warn('No authenticated session found, using basic client')
    return supabase
    
  } catch (error) {
    console.error('Error checking authentication:', error)
    // Return basic client for graceful degradation
    return supabase
  }
}