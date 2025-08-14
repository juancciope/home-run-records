"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Search, 
  Music, 
  Instagram, 
  CheckCircle2, 
  Brain, 
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ExternalLink,
  Users,
  BarChart3,
  TrendingUp
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

// TikTok Icon Component
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.34 6.34 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

interface ArtistSearchResult {
  id: string;
  name: string;
  followerCount?: number;
  imageUrl?: string;
  platforms?: string[];
  verified?: boolean;
}

export default function ArtistAIOnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(1)
  const [artistSearch, setArtistSearch] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<ArtistSearchResult[]>([])
  const [selectedArtist, setSelectedArtist] = React.useState<ArtistSearchResult | null>(null)
  const [instagramHandle, setInstagramHandle] = React.useState("")
  const [tiktokHandle, setTiktokHandle] = React.useState("")
  const [isSearching, setIsSearching] = React.useState(false)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [searchError, setSearchError] = React.useState("")

  const totalSteps = 3

  const handleArtistSearch = async () => {
    if (!artistSearch.trim()) return

    setIsSearching(true)
    setSearchError("")
    
    try {
      const response = await fetch('/api/viberate/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: artistSearch })
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setSearchResults(data.results || [])
      
      if (data.results?.length === 0) {
        setSearchError("No artists found. Try a different spelling or check if you're on streaming platforms.")
      }
    } catch (error) {
      setSearchError("Search failed. Please try again.")
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleArtistSelect = (artist: ArtistSearchResult) => {
    setSelectedArtist(artist)
    setCurrentStep(2)
  }

  const handleRunAnalysis = async () => {
    if (!selectedArtist || (!instagramHandle && !tiktokHandle)) return

    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/artist-ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId: selectedArtist.id,
          instagramUsername: instagramHandle.replace('@', ''),
          tiktokUsername: tiktokHandle.replace('@', ''),
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      
      // For testing phase, pass analysis data directly via localStorage
      // TODO: Remove this when implementing proper user accounts and database storage
      if (result.analysis) {
        const analysisData = {
          id: result.analysisId,
          instagram_username: instagramHandle.replace('@', ''),
          tiktok_username: tiktokHandle.replace('@', ''),
          posts_analyzed: result.postsAnalyzed,
          analysis_result: result.analysis,
          created_at: new Date().toISOString()
        };
        localStorage.setItem(`analysis_${result.analysisId}`, JSON.stringify(analysisData));
      }
      
      // Redirect to results page with analysis ID
      router.push(`/artist-ai/results?analysis=${result.analysisId}`)
    } catch (error) {
      console.error('Analysis error:', error)
      alert('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const goToStep = (step: number) => {
    if (step < currentStep || (step === 2 && selectedArtist) || (step === 3 && selectedArtist)) {
      setCurrentStep(step)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-4">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Analysis Setup</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Let's Analyze Your Music Career</h1>
          <p className="text-muted-foreground">
            We'll extract your streaming data and analyze your social media content
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((step) => (
            <button
              key={step}
              onClick={() => goToStep(step)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                currentStep === step
                  ? 'bg-primary text-primary-foreground'
                  : currentStep > step
                  ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900'
                  : 'bg-muted text-muted-foreground cursor-default'
              }`}
            >
              {currentStep > step ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-xs">
                  {step}
                </span>
              )}
              {step === 1 && "Find Artist"}
              {step === 2 && "Social Media"}
              {step === 3 && "Analyze"}
            </button>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Find Your Artist Profile
                  </CardTitle>
                  <CardDescription>
                    Search for your artist name to connect your streaming platform data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="artist-search">Artist Name</Label>
                    <div className="flex gap-2">
                      <Input
                        id="artist-search"
                        placeholder="Enter your artist or band name..."
                        value={artistSearch}
                        onChange={(e) => setArtistSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleArtistSearch()}
                      />
                      <Button 
                        onClick={handleArtistSearch} 
                        disabled={isSearching || !artistSearch.trim()}
                      >
                        {isSearching ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {searchError && (
                      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        {searchError}
                      </div>
                    )}
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      <Label>Select Your Artist Profile</Label>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {searchResults.map((artist) => (
                          <div
                            key={artist.id}
                            onClick={() => handleArtistSelect(artist)}
                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors"
                          >
                            {artist.imageUrl ? (
                              <img 
                                src={artist.imageUrl} 
                                alt={artist.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                <Music className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{artist.name}</span>
                                {artist.verified && (
                                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                )}
                              </div>
                              {artist.followerCount && (
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {artist.followerCount.toLocaleString()} followers
                                </div>
                              )}
                              {artist.platforms && (
                                <div className="flex items-center gap-1 mt-1">
                                  {artist.platforms.map((platform) => (
                                    <Badge key={platform} variant="secondary" className="text-xs">
                                      {platform}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">
                          What data will we extract?
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Streaming numbers, follower counts, engagement rates, and audience demographics 
                          from Spotify, Apple Music, YouTube, and other platforms.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Instagram className="h-5 w-5" />
                    Social Media Handles
                  </CardTitle>
                  <CardDescription>
                    We'll analyze your recent posts to understand your content performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedArtist && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <span className="font-medium">Artist Profile Connected: {selectedArtist.name}</span>
                        <p className="text-sm text-muted-foreground">
                          Streaming platform data will be extracted automatically
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="flex items-center gap-2">
                        <Instagram className="h-4 w-4" />
                        Instagram Handle
                      </Label>
                      <Input
                        id="instagram"
                        placeholder="@yourusername"
                        value={instagramHandle}
                        onChange={(e) => setInstagramHandle(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        We'll analyze your last 30 posts for engagement patterns
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tiktok" className="flex items-center gap-2">
                        <TikTokIcon />
                        TikTok Handle
                      </Label>
                      <Input
                        id="tiktok"
                        placeholder="@yourusername"
                        value={tiktokHandle}
                        onChange={(e) => setTiktokHandle(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        We'll analyze your recent videos for performance insights
                      </p>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-900 dark:text-purple-100">
                          What will be analyzed?
                        </h4>
                        <ul className="text-sm text-purple-700 dark:text-purple-300 mt-1 space-y-1">
                          <li>• Post performance and engagement rates</li>
                          <li>• Best posting times for your audience</li>
                          <li>• Content types that perform best</li>
                          <li>• Hashtag effectiveness</li>
                          <li>• Growth trends and predictions</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(1)}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(3)}
                      disabled={!instagramHandle && !tiktokHandle}
                      className="flex-1"
                    >
                      Continue to Analysis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Ready for AI Analysis
                  </CardTitle>
                  <CardDescription>
                    Review your information and start the comprehensive analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary */}
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">Analysis Summary</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Artist Profile:</span>
                          <span className="text-sm font-medium">{selectedArtist?.name}</span>
                        </div>
                        {instagramHandle && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Instagram:</span>
                            <span className="text-sm font-medium">{instagramHandle}</span>
                          </div>
                        )}
                        {tiktokHandle && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">TikTok:</span>
                            <span className="text-sm font-medium">{tiktokHandle}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">What happens next?</h4>
                      <ul className="text-sm space-y-1">
                        <li>✓ Extract streaming platform analytics</li>
                        <li>✓ Analyze your social media posts</li>
                        <li>✓ Generate AI-powered insights</li>
                        <li>✓ Create personalized growth recommendations</li>
                      </ul>
                      <p className="text-xs text-muted-foreground mt-2">
                        This process typically takes 2-3 minutes
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(2)}
                      disabled={isAnalyzing}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button 
                      onClick={handleRunAnalysis}
                      disabled={isAnalyzing}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Running Analysis...
                        </>
                      ) : (
                        <>
                          Start AI Analysis
                          <Brain className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Your data is processed securely and never shared with third parties</p>
        </div>
      </div>
    </div>
  )
}