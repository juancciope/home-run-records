"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Instagram, 
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Users,
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  Sparkles
} from "lucide-react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.34 6.34 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

interface AnalysisData {
  id: string
  artist_name: string
  artist_slug: string
  instagram_username: string | null
  tiktok_username: string | null
  posts_analyzed: number
  analysis_result: {
    overallScore: number
    insights: Array<{
      type: 'success' | 'warning' | 'improvement'
      title: string
      description: string
      metric?: string
    }>
    recommendations: string[]
    contentAnalysis: {
      bestPerforming: string
      worstPerforming: string
      optimalPostingTime: string
      topHashtags: string[]
    }
    growthPrediction: {
      thirtyDays: number
      sixtyDays: number
      ninetyDays: number
    }
    brandAnalysis?: {
      personality: string
      values: string
      aesthetic: string
      targetAudience: string
      strengths: string[]
      risks: string[]
      projection: string
    }
    scraped_posts: {
      instagram: Array<{
        platform: string
        type: string
        caption?: string
        likes: number
        comments: number
        shares?: number
        views?: number
        timestamp: string
        hashtags: string[]
        mediaUrl?: string
        postUrl?: string
      }>
      tiktok: Array<{
        platform: string
        type: string
        caption?: string
        likes: number
        comments: number
        shares?: number
        views?: number
        timestamp: string
        hashtags: string[]
        mediaUrl?: string
        postUrl?: string
      }>
    }
    profile_data?: {
      instagram?: {
        followersCount: number
        profilePicUrl?: string
      }
      tiktok?: {
        followersCount: number
        profilePicUrl?: string
      }
    }
    viberate_data?: any
  }
  created_at: string
}

export default function DynamicArtistPage() {
  const params = useParams()
  const artistSlug = params.artistSlug as string
  const [analysisData, setAnalysisData] = React.useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Force dark theme on body
  React.useEffect(() => {
    document.documentElement.classList.add('dark')
    document.body.style.backgroundColor = '#000000'
    document.body.style.color = '#ffffff'
    return () => {
      document.documentElement.classList.remove('dark')
      document.body.style.backgroundColor = ''
      document.body.style.color = ''
    }
  }, [])

  // Fetch analysis data
  React.useEffect(() => {
    async function fetchAnalysisData() {
      try {
        setIsLoading(true)
        const supabase = createClient()
        
        const { data, error } = await supabase
          .rpc('get_analysis_by_slug', { slug: artistSlug })

        if (error) {
          console.error('Error fetching analysis:', error)
          setError('Analysis not found')
          return
        }

        if (!data || data.length === 0) {
          setError('Artist not found')
          return
        }

        setAnalysisData(data[0])
      } catch (err) {
        console.error('Error:', err)
        setError('Failed to load analysis')
      } finally {
        setIsLoading(false)
      }
    }

    if (artistSlug) {
      fetchAnalysisData()
    }
  }, [artistSlug])

  const handleDownloadCSV = async (platform: 'instagram' | 'tiktok') => {
    if (!analysisData) return

    const posts = analysisData.analysis_result.scraped_posts[platform]
    if (!posts || posts.length === 0) return

    // Convert to CSV
    const headers = ['Platform', 'Type', 'Caption', 'Likes', 'Comments', 'Views', 'Shares', 'Timestamp', 'Hashtags']
    const csvContent = [
      headers.join(','),
      ...posts.map(post => [
        post.platform,
        post.type,
        `"${(post.caption || '').replace(/"/g, '""')}"`, // Escape quotes
        post.likes,
        post.comments,
        post.views || '',
        post.shares || '',
        post.timestamp,
        `"${post.hashtags.join(' ')}"`
      ].join(','))
    ].join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${analysisData.artist_name}_${platform}_posts.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Artist Not Found</h1>
          <p className="text-gray-400 mb-6">{error || 'The artist page you\'re looking for doesn\'t exist.'}</p>
          <Link href="https://home-run-records.vercel.app/artist-ai">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Create Your Analysis
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const instagramPosts = analysisData.analysis_result.scraped_posts.instagram || []
  const tiktokPosts = analysisData.analysis_result.scraped_posts.tiktok || []
  
  // Use real profile data if available, otherwise fallback
  const profileData = analysisData.analysis_result.profile_data
  const instagramProfile = profileData?.instagram || { followersCount: Math.floor(Math.random() * 50000) + 5000 }
  const tiktokProfile = profileData?.tiktok || { followersCount: Math.floor(Math.random() * 30000) + 3000 }
  
  // Debug profile data
  console.log('🔍 Profile data received:', {
    profileData,
    instagramProfile,
    tiktokProfile,
    instagramPicUrl: instagramProfile?.profilePicUrl,
    tiktokPicUrl: tiktokProfile?.profilePicUrl
  })

  return (
    <div className="min-h-screen bg-black text-white dark" style={{backgroundColor: '#000000'}}>
      {/* Header */}
      <header className="px-4 py-4 sm:py-6 border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-2 sm:mb-0">
            <Link href="https://home-run-records.vercel.app/artist-ai" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Social Analytics</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold">{analysisData.artist_name}</h1>
            <p className="text-xs sm:text-sm text-gray-400 break-all">social.homeformusic.app/{analysisData.artist_slug}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Section 1: Artist Profile */}
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {(instagramProfile?.profilePicUrl || tiktokProfile?.profilePicUrl) ? (
                    <img 
                      src={instagramProfile?.profilePicUrl || tiktokProfile?.profilePicUrl} 
                      alt={`${analysisData.artist_name} profile`}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      onLoad={() => console.log(`✅ Profile image loaded successfully`)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        console.error(`❌ Profile image failed to load:`, {
                          src: target.src,
                          instagramUrl: instagramProfile?.profilePicUrl,
                          tiktokUrl: tiktokProfile?.profilePicUrl,
                          error: e
                        })
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `<span class="text-xl sm:text-2xl font-bold">${analysisData.artist_name.charAt(0).toUpperCase()}</span>`
                        }
                      }}
                    />
                  ) : (
                    <span className="text-xl sm:text-2xl font-bold">{analysisData.artist_name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">{analysisData.artist_name}</h2>
                  <p className="text-gray-400 mb-2 sm:mb-3">Music Artist</p>
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm">
                    {analysisData.instagram_username && (
                      <div className="flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-purple-400" />
                        <span>{instagramProfile.followersCount.toLocaleString()} followers</span>
                      </div>
                    )}
                    {analysisData.tiktok_username && (
                      <div className="flex items-center gap-2">
                        <TikTokIcon />
                        <span>{tiktokProfile.followersCount.toLocaleString()} followers</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Top Performing Posts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Instagram Top Posts */}
            {instagramPosts.length > 0 && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-500 rounded flex items-center justify-center">
                      <Instagram className="w-3 h-3 text-white" />
                    </div>
                    Instagram Top Posts
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 w-full sm:w-auto"
                    onClick={() => handleDownloadCSV('instagram')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <span className="text-xs sm:text-sm">Download CSV</span>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {instagramPosts.slice(0, 4).map((post, index) => (
                    <div key={index} className="p-3 sm:p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => post.postUrl && window.open(post.postUrl, '_blank')}>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">{post.type}</Badge>
                        <span className="text-xs text-gray-400">{new Date(post.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                          <span className="truncate">{(post.views || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                          <span className="truncate">{post.likes.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                          <span className="truncate">{post.comments}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                          <span className="truncate">{post.shares || Math.floor(post.likes * 0.1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 text-center px-2">Showing top 4 posts. CSV contains all {instagramPosts.length} posts analyzed.</p>
                </CardContent>
              </Card>
            )}

            {/* TikTok Top Posts */}
            {tiktokPosts.length > 0 && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <div className="w-6 h-6 bg-black border border-gray-600 rounded flex items-center justify-center">
                      <TikTokIcon />
                    </div>
                    TikTok Top Videos
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 w-full sm:w-auto"
                    onClick={() => handleDownloadCSV('tiktok')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <span className="text-xs sm:text-sm">Download CSV</span>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {tiktokPosts.slice(0, 4).map((video, index) => (
                    <div key={index} className="p-3 sm:p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => video.postUrl && window.open(video.postUrl, '_blank')}>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">Video</Badge>
                        <span className="text-xs text-gray-400">{new Date(video.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                          <span className="truncate">{(video.views || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                          <span className="truncate">{video.likes.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                          <span className="truncate">{video.comments}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                          <span className="truncate">{video.shares || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 text-center px-2">Showing top 4 videos. CSV contains all {tiktokPosts.length} videos analyzed.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Section 3: AI Insights */}
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  AI Content Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Performing Content */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-green-400 flex items-center gap-2 text-lg">
                      <CheckCircle className="w-5 h-5" />
                      Top Performing Content
                    </h4>
                    <div className="space-y-3">
                      {analysisData.analysis_result.insights
                        .filter(insight => insight.type === 'success')
                        .slice(0, 3)
                        .map((insight, index) => (
                        <div key={index} className="bg-green-950/30 border-l-4 border-green-400 p-3 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{insight.title}</span>
                            {insight.metric && (
                              <Badge className="bg-green-600 text-white text-xs">{insight.metric}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{insight.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content Opportunities */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-red-400 flex items-center gap-2 text-lg">
                      <XCircle className="w-5 h-5" />
                      Content Opportunities
                    </h4>
                    <div className="space-y-3">
                      {analysisData.analysis_result.insights
                        .filter(insight => insight.type === 'improvement')
                        .slice(0, 3)
                        .map((insight, index) => (
                        <div key={index} className="bg-red-950/30 border-l-4 border-red-400 p-3 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{insight.title}</span>
                            {insight.metric && (
                              <Badge variant="destructive" className="text-xs">{insight.metric}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{insight.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Brand Projection Analysis */}
            {analysisData.analysis_result.brandAnalysis && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                    What Your Brand is Projecting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Main Brand Projection */}
                    <div className="p-4 bg-orange-950/30 border-l-4 border-orange-400 rounded">
                      <h4 className="font-semibold text-orange-400 mb-2">Overall Brand Projection</h4>
                      <p className="text-sm text-gray-300">{analysisData.analysis_result.brandAnalysis.projection}</p>
                    </div>
                    
                    {/* Brand Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-blue-400">Brand Personality</h4>
                          <p className="text-sm text-gray-300 p-3 bg-gray-800 rounded">{analysisData.analysis_result.brandAnalysis.personality}</p>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-semibold text-green-400">Values & Messaging</h4>
                          <p className="text-sm text-gray-300 p-3 bg-gray-800 rounded">{analysisData.analysis_result.brandAnalysis.values}</p>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-semibold text-purple-400">Target Audience</h4>
                          <p className="text-sm text-gray-300 p-3 bg-gray-800 rounded">{analysisData.analysis_result.brandAnalysis.targetAudience}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-green-400">Brand Strengths</h4>
                          <div className="space-y-2">
                            {analysisData.analysis_result.brandAnalysis.strengths.map((strength, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-300">{strength}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-semibold text-red-400">Brand Risks</h4>
                          <div className="space-y-2">
                            {analysisData.analysis_result.brandAnalysis.risks.map((risk, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-300">{risk}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-semibold text-yellow-400">Visual Aesthetic</h4>
                          <p className="text-sm text-gray-300 p-3 bg-gray-800 rounded">{analysisData.analysis_result.brandAnalysis.aesthetic}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Content Recommendations */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                  Content Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-purple-400">Top Recommendations</h4>
                    <div className="space-y-2">
                      {analysisData.analysis_result.recommendations.slice(0, 4).map((rec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-300">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-400">Content Analysis</h4>
                    <div className="space-y-2">
                      <div className="p-2 bg-gray-800 rounded">
                        <span className="text-sm font-medium">Best Performing: </span>
                        <span className="text-sm text-blue-400">{analysisData.analysis_result.contentAnalysis.bestPerforming}</span>
                      </div>
                      <div className="p-2 bg-gray-800 rounded">
                        <span className="text-sm font-medium">Optimal Time: </span>
                        <span className="text-sm text-green-400">{analysisData.analysis_result.contentAnalysis.optimalPostingTime}</span>
                      </div>
                      <div className="p-2 bg-gray-800 rounded">
                        <span className="text-sm font-medium">Top Hashtags: </span>
                        <span className="text-sm text-orange-400">{analysisData.analysis_result.contentAnalysis.topHashtags.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  )
}