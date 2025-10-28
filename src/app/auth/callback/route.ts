import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token = requestUrl.searchParams.get('token')
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/'

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
    }

    // If we have a token, associate the analysis with the user
    if (token && data.user) {
      try {
        const serviceClient = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Update the analysis to associate it with the authenticated user
        const { error: updateError } = await serviceClient
          .from('ai_analyses')
          .update({ user_id: data.user.id })
          .eq('analysis_token', token)

        if (updateError) {
          console.error('Error associating analysis with user:', updateError)
        } else {
          console.log('✅ Analysis claimed by user:', data.user.id)
        }
      } catch (error) {
        console.error('Error claiming analysis:', error)
      }
    }
  }

  // Redirect to the intended destination
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
}
