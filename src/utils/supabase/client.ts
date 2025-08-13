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
  
  // Wait for session to be available
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('User must be authenticated to perform this action')
  }
  
  return supabase
}