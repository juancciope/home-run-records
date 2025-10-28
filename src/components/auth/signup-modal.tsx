"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Check } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { motion } from "framer-motion"

interface SignupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  artistSlug: string
  analysisToken: string
}

export function SignupModal({ open, onOpenChange, artistSlug, analysisToken }: SignupModalProps) {
  const [email, setEmail] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [emailSent, setEmailSent] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSendMagicLink = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // Store analysis token in cookie before sending magic link
      document.cookie = `analysis_token=${analysisToken}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect_to=/${artistSlug}&token=${analysisToken}`,
        },
      })

      if (error) throw error

      setEmailSent(true)
    } catch (error) {
      console.error('Error sending magic link:', error)
      setError('Failed to send magic link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700 text-white">
        {!emailSent ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Save Your Results
                </span>
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-center pt-2">
                Create a free account to access your analysis. We'll send you a magic link - no password needed!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMagicLink()}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 text-center text-lg py-6"
                  disabled={isLoading}
                />
                {error && (
                  <p className="text-sm text-red-400 text-center">{error}</p>
                )}
              </div>

              <Button
                onClick={handleSendMagicLink}
                disabled={isLoading || !email.trim()}
                className="w-full text-lg py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending Magic Link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Send Magic Link
                  </>
                )}
              </Button>

              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3 text-sm text-gray-400">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Access your results anytime, anywhere</span>
                </div>
                <div className="flex items-start space-x-3 text-sm text-gray-400">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Download CSV files of all your posts</span>
                </div>
                <div className="flex items-start space-x-3 text-sm text-gray-400">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Get AI-powered insights and recommendations</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-8"
          >
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Check your email!</h3>
              <p className="text-gray-300">
                We sent a magic link to<br />
                <span className="font-semibold text-purple-400">{email}</span>
              </p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-400">
                Click the link in the email to sign in and access your results.
              </p>
              <p className="text-xs text-gray-500">
                The link expires in 1 hour. Check your spam folder if you don't see it.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setEmailSent(false)}
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Try a different email
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}
