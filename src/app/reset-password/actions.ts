'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function setNewPassword(formData: FormData) {
  const password = formData.get('password') as string | null
  const confirm = formData.get('confirm') as string | null

  if (!password || password.length < 8) {
    redirect('/reset-password?error=' + encodeURIComponent('Password must be at least 8 characters.'))
  }
  if (password !== confirm) {
    redirect('/reset-password?error=' + encodeURIComponent('Passwords do not match.'))
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/forgot-password?error=' + encodeURIComponent('Reset link expired. Request a new one.'))
  }

  const { error } = await supabase.auth.updateUser({ password: password as string })
  if (error) {
    redirect('/reset-password?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
