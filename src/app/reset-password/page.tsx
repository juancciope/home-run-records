import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/server'
import { setNewPassword } from './actions'

export const dynamic = 'force-dynamic'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  // User should be authenticated via the recovery code exchange that happened
  // in /auth/callback. If not, bounce to forgot-password.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/forgot-password?error=expired')

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10" style={{ backgroundColor: '#0a0e27' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 font-medium text-white">
            <div className="bg-violet-600 text-white flex size-8 items-center justify-center rounded-md">
              <Music className="size-4" />
            </div>
            <span className="text-xl font-bold">Artist OS</span>
          </div>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Set a new password</CardTitle>
              <CardDescription className="text-gray-400">
                Signed in as {user.email}. Choose a password with at least 8 characters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}
              <form action={setNewPassword}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-white">New password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm" className="text-white">Confirm password</Label>
                    <Input
                      id="confirm"
                      name="confirm"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                    Update password
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-gray-400">
                  <Link href="/login" className="text-violet-400 underline underline-offset-4 hover:text-violet-300">
                    Back to login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
