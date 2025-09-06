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
    
    try {
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

      if (data.success) {
        // Redirect to the unique artist page
        window.location.href = `/${data.artistSlug}`
      } else {
        alert('Analysis failed: ' + (data.error || 'Unknown error'))
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Analysis error:', error)
      alert('Analysis failed. Please try again.')
      setIsLoading(false)
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
                Understand your fanbase and grow your music career. Get insights on what content works, 
                download detailed reports, and discover what your posts say about your artist brand.
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
            <p className="text-gray-400 text-sm sm:text-base">Everything you need to grow your fanbase and music career</p>
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
                  <h3 className="font-semibold mb-2 text-white">Complete Fan Insights</h3>
                  <p className="text-sm text-gray-300">Deep dive into your music content performance with downloadable data files</p>
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
                  <h3 className="font-semibold mb-2 text-white">Artist Brand Analysis</h3>
                  <p className="text-sm text-gray-300">Discover what your content says about you as an artist and what resonates with fans</p>
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
                  <h3 className="font-semibold mb-2 text-white">Music Content Ideas</h3>
                  <p className="text-sm text-gray-300">AI-powered suggestions based on what's working for other artists in your genre</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}