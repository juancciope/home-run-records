'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get('email') as string | null)?.trim()
  if (!email) redirect('/forgot-password?sent=1') // don't reveal missing emails

  const supabase = await createClient()
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  // Supabase will email a recovery link pointing here. The existing
  // /auth/callback route exchanges the code and then redirects to
  // /reset-password where the user sets a new password.
  const redirectTo = `${origin}/auth/callback?redirect_to=/reset-password`

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  if (error) console.error('resetPasswordForEmail error:', error.message)

  // Always act like it succeeded — don't leak which emails exist.
  redirect('/forgot-password?sent=1')
}
