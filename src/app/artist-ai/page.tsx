"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Instagram, 
  ArrowRight,
  Sparkles
} from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

// Social platform icons component
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.34 6.34 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

export default function ArtistSocialPage() {
  const router = useRouter()
  const [step, setStep] = React.useState(1)
  const [artistName, setArtistName] = React.useState("")
  const [instagramUsername, setInstagramUsername] = React.useState("")
  const [tiktokUsername, setTiktokUsername] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [progressMessage, setProgressMessage] = React.useState("")
  const [timeRemaining, setTimeRemaining] = React.useState("")

  const handleNextStep = () => {
    if (step === 1 && artistName.trim()) {
      setStep(2)
    }
  }

  const handleAnalyze = async () => {
    if (!artistName.trim() || (!instagramUsername.trim() && !tiktokUsername.trim())) {
      return
    }
    
    setIsLoading(true)
    setProgress(0)
    setProgressMessage("Starting analysis...")
    setTimeRemaining("Estimating time...")
    
    try {
      // Start the analysis
      const response = await fetch('/api/artist-ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistName: artistName.trim(),
          instagramUsername: instagramUsername.trim() || null,
          tiktokUsername: tiktokUsername.trim() || null,
        }),
      })

      const data = await response.json()

      if (!data.analysisId) {
        throw new Error('No analysis ID returned')
      }

      // Poll for progress updates
      const startTime = Date.now()
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/artist-ai/status/${data.analysisId}`)
          const status = await statusResponse.json()
          
          if (status.progress !== undefined) {
            // Prevent progress from going backwards (unless it's a reset to 0)
            setProgress(prevProgress => {
              if (status.progress === 0 && prevProgress > 0) {
                console.warn('⚠️ Progress reset to 0, this might indicate an issue')
              }
              return Math.max(prevProgress, status.progress)
            })
            setProgressMessage(status.message || "Processing...")
            
            // Calculate time remaining
            const elapsed = Date.now() - startTime
            const estimatedTotal = status.estimatedTime || 120000 // Default 2 minutes
            const remaining = Math.max(0, estimatedTotal - elapsed)
            const seconds = Math.ceil(remaining / 1000)
            
            if (seconds > 60) {
              setTimeRemaining(`About ${Math.ceil(seconds / 60)} minutes remaining`)
            } else if (seconds > 0) {
              setTimeRemaining(`About ${seconds} seconds remaining`)
            } else {
              setTimeRemaining("Almost done...")
            }
          }
          
          if (status.complete) {
            clearInterval(pollInterval)
            if (status.success) {
              window.location.href = `/${status.artistSlug}`
            } else {
              alert('Analysis failed: ' + (status.error || 'Unknown error'))
              setIsLoading(false)
              setProgress(0)
            }
          }
        } catch (error) {
          console.error('Error polling status:', error)
        }
      }, 2000) // Poll every 2 seconds

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
        if (isLoading) {
          alert('Analysis is taking longer than expected. Please try again.')
          setIsLoading(false)
          setProgress(0)
        }
      }, 300000)

    } catch (error) {
      console.error('Analysis error:', error)
      alert('Analysis failed. Please try again.')
      setIsLoading(false)
      setProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white dark" style={{backgroundColor: '#000000'}}>
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-12 sm:py-16 lg:py-20">        
        <div className="relative mx-auto max-w-4xl">
          <div className="text-center space-y-6 sm:space-y-8">
            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 sm:space-y-6"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Social Media
                </span>
                <br />
                <span className="text-white">Analysis Tool</span>
              </h1>
              <p className="mx-auto max-w-2xl text-base sm:text-lg lg:text-xl text-gray-300 px-4">
                Get all your TikTok and Instagram post data in one place. Download everything as CSV files, 
                see your top performing content, and get AI insights for better posts.
              </p>
            </motion.div>

            {/* Input Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-sm sm:max-w-md mx-auto space-y-4 px-4"
            >
              {step === 1 ? (
                <>
                  <div className="relative">
                    <Input 
                      type="text"
                      placeholder="Enter your artist name"
                      value={artistName}
                      onChange={(e) => setArtistName(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 text-center text-base sm:text-lg py-4 sm:py-6"
                      onKeyPress={(e) => e.key === 'Enter' && handleNextStep()}
                    />
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full text-base sm:text-lg py-4 sm:py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={handleNextStep}
                    disabled={!artistName.trim()}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  {artistName && (
                    <p className="text-xs sm:text-sm text-gray-400 break-all px-2">
                      Your URL will be: social.homeformusic.app/{artistName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '')}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Hello, {artistName}!</h2>
                    <p className="text-gray-400 text-sm">Enter your social media usernames to analyze your content</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <Input 
                        type="text"
                        placeholder="Instagram username (e.g., @username)"
                        value={instagramUsername}
                        onChange={(e) => setInstagramUsername(e.target.value.replace('@', ''))}
                        className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 text-base sm:text-lg py-4 sm:py-6"
                      />
                    </div>
                    
                    <div className="relative">
                      <Input 
                        type="text"
                        placeholder="TikTok username (e.g., @username)"
                        value={tiktokUsername}
                        onChange={(e) => setTiktokUsername(e.target.value.replace('@', ''))}
                        className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 text-base sm:text-lg py-4 sm:py-6"
                      />
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center px-2">
                      Enter at least one username to continue. We'll analyze your posts and create insights.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      size="lg"
                      className="flex-1 text-base py-4 border-gray-600 text-gray-300 hover:bg-gray-800"
                      onClick={() => setStep(1)}
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button 
                      size="lg" 
                      className="flex-1 text-base py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={handleAnalyze}
                      disabled={isLoading || (!instagramUsername.trim() && !tiktokUsername.trim())}
                    >
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Analyze Content
                          <Sparkles className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>

            {/* Modern Loading Experience - Full Screen Overlay */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-lg w-full space-y-6"
                >
                {/* Main Progress Card */}
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm">
                  {/* Floating Animation Background */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
                    <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
                  </div>
                  
                  <div className="relative space-y-6">
                    {/* Status Header */}
                    <div className="text-center">
                      <div className="inline-flex items-center space-x-2 mb-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-400 uppercase tracking-wider">Processing</span>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">{progressMessage}</h3>
                      <p className="text-gray-400">{timeRemaining}</p>
                    </div>
                    
                    {/* Elegant Progress Ring */}
                    <div className="flex justify-center">
                      <div className="relative w-24 h-24">
                        {/* Background Circle */}
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="rgb(55, 65, 81)"
                            strokeWidth="6"
                            fill="none"
                            className="opacity-30"
                          />
                          {/* Progress Circle */}
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="url(#progressGradient)"
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: progress / 100 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            style={{
                              pathLength: progress / 100,
                            }}
                            strokeDasharray="264"
                            strokeDashoffset={264 - (264 * progress) / 100}
                          />
                          <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="rgb(168, 85, 247)" />
                              <stop offset="100%" stopColor="rgb(236, 72, 153)" />
                            </linearGradient>
                          </defs>
                        </svg>
                        {/* Percentage Text */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Workflow Steps */}
                    <div className="space-y-4">
                      {[
                        { step: 'Connecting to Instagram', complete: progress >= 5, active: progress >= 5 && progress < 25 },
                        { step: 'Collecting Instagram posts', complete: progress >= 25, active: progress >= 25 && progress < 40 },
                        { step: 'Connecting to TikTok', complete: progress >= 40, active: progress >= 40 && progress < 50 },
                        { step: 'Collecting TikTok videos', complete: progress >= 50, active: progress >= 50 && progress < 65 },
                        { step: 'Analyzing engagement patterns', complete: progress >= 65, active: progress >= 65 && progress < 80 },
                        { step: 'Generating AI insights', complete: progress >= 80, active: progress >= 80 && progress < 95 },
                        { step: 'Creating your report', complete: progress >= 95, active: progress >= 95 }
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center space-x-3 ${
                            item.active ? 'text-white' : item.complete ? 'text-green-400' : 'text-gray-500'
                          }`}
                        >
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            item.complete 
                              ? 'border-green-400 bg-green-400' 
                              : item.active 
                                ? 'border-purple-400 bg-purple-400/20' 
                                : 'border-gray-600'
                          }`}>
                            {item.complete ? (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : item.active ? (
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                            ) : (
                              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                            )}
                          </div>
                          <span className={`text-sm font-medium ${
                            item.active ? 'animate-pulse' : ''
                          }`}>
                            {item.step}
                          </span>
                          {item.active && (
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Bottom Message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center space-x-2 text-gray-400">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs">Please keep this tab open while we analyze your content</span>
                  </div>
                </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* Platform Icons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-8 pt-8"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <span className="text-gray-300">Instagram</span>
              </div>
              <div className="w-px h-8 bg-gray-700" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black border border-gray-600 rounded-lg flex items-center justify-center">
                  <TikTokIcon />
                </div>
                <span className="text-gray-300">TikTok</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-12 sm:py-16 bg-gray-900/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white">What you get</h2>
            <p className="text-gray-400 text-sm sm:text-base">All your social media data and insights in one simple report</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gray-800 border-gray-700 h-full">
                <CardContent className="p-6">
                  <Sparkles className="h-8 w-8 text-purple-400 mb-4" />
                  <h3 className="font-semibold mb-2 text-white">All Your Post Data</h3>
                  <p className="text-sm text-gray-300">Every post from both platforms with likes, comments, views - downloadable as CSV</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gray-800 border-gray-700 h-full">
                <CardContent className="p-6">
                  <div className="w-8 h-8 bg-orange-600 rounded mb-4 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <h3 className="font-semibold mb-2 text-white">Top Performing Posts</h3>
                  <p className="text-sm text-gray-300">See which posts got the most engagement and what made them successful</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gray-800 border-gray-700 h-full">
                <CardContent className="p-6">
                  <div className="w-8 h-8 bg-green-600 rounded mb-4 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-white">Content Tips</h3>
                  <p className="text-sm text-gray-300">AI analysis of your posts with practical suggestions for better content</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}