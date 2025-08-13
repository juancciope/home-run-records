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
  
  // Try multiple methods to get session
  let session = null
  
  // Method 1: Get current session
  const { data: { session: currentSession } } = await supabase.auth.getSession()
  session = currentSession
  
  // Method 2: If no session, try to refresh
  if (!session) {
    const { data: { session: refreshedSession } } = await supabase.auth.refreshSession()
    session = refreshedSession
  }
  
  // Method 3: Wait for session state change (for async auth)
  if (!session) {
    await new Promise((resolve) => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          subscription.unsubscribe()
          resolve(session)
        }
      })
      
      // Timeout after 5 seconds
      setTimeout(() => {
        subscription.unsubscribe()
        resolve(null)
      }, 5000)
    })
    
    // Try one more time after state change
    const { data: { session: finalSession } } = await supabase.auth.getSession()
    session = finalSession
  }
  
  if (!session) {
    console.error('Authentication failed: No session found after multiple attempts')
    throw new Error('User must be authenticated to perform this action. Please sign in again.')
  }
  
  console.log('✅ Authenticated session found:', { 
    userId: session.user?.id, 
    email: session.user?.email,
    expiresAt: session.expires_at 
  })
  
  return supabase
}