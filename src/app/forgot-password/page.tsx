import Link from 'next/link'
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
import { requestPasswordReset } from './actions'

export const dynamic = 'force-dynamic'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>
}) {
  const { sent } = await searchParams
  const isSent = sent === '1'

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
              <CardTitle className="text-2xl text-white">
                {isSent ? 'Check your inbox' : 'Reset your password'}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {isSent
                  ? "If an account exists for that email, we've sent a reset link. The link expires in 1 hour."
                  : "Enter the email for your account. We'll send you a link to set a new password."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSent ? (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-gray-300">
                    Didn&apos;t receive it? Check your spam folder, or{' '}
                    <Link href="/forgot-password" className="text-violet-400 underline underline-offset-4 hover:text-violet-300">
                      try again
                    </Link>
                    .
                  </p>
                  <Button asChild className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                    <Link href="/login">Back to login</Link>
                  </Button>
                </div>
              ) : (
                <form action={requestPasswordReset}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="m@example.com"
                        autoComplete="email"
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                      Send reset link
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-400">
                    Remembered it?{' '}
                    <Link href="/login" className="text-violet-400 underline underline-offset-4 hover:text-violet-300">
                      Back to login
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
