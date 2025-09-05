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
  TrendingUp,
  Calendar,
  Users,
  ArrowLeft,
  Download,
  Lightbulb,
  CheckCircle,
  XCircle,
  Sparkles
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.34 6.34 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

export default function ArtistPreviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const artistName = searchParams.get('artist') || 'Demo Artist'
  const slug = searchParams.get('slug') || 'demoartist'

  // Mock data for demonstration
  const mockData = {
    instagram: {
      followers: 15420,
      avgLikes: 852,
      avgComments: 43,
      engagementRate: 5.8,
      posts: [
        { likes: 1203, comments: 67, views: 18450, type: 'Reel' },
        { likes: 890, comments: 34, views: 12300, type: 'Post' },
        { likes: 1456, comments: 89, views: 24600, type: 'Reel' },
        { likes: 634, comments: 21, views: 8900, type: 'Story' }
      ]
    },
    tiktok: {
      followers: 8340,
      avgViews: 12500,
      avgLikes: 623,
      avgShares: 89,
      videos: [
        { views: 18400, likes: 892, comments: 45, shares: 123 },
        { views: 9600, likes: 456, comments: 23, shares: 67 },
        { views: 15200, likes: 734, comments: 89, shares: 98 },
        { views: 7800, likes: 412, comments: 34, shares: 56 }
      ]
    }
  }

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

  return (
    <div className="min-h-screen bg-black text-white dark" style={{backgroundColor: '#000000'}}>
      {/* Header */}
      <header className="px-4 py-4 sm:py-6 border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-2 sm:mb-0">
            <Link href="/artist-ai" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Social Analytics</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold">{artistName}</h1>
            <p className="text-xs sm:text-sm text-gray-400 break-all">social.homeformusic.app/{slug}</p>
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
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl sm:text-2xl font-bold">{artistName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">{artistName}</h2>
                  <p className="text-gray-400 mb-2 sm:mb-3">Music Artist</p>
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-purple-400" />
                      <span>{mockData.instagram.followers.toLocaleString()} followers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TikTokIcon />
                      <span>{mockData.tiktok.followers.toLocaleString()} followers</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Top Performing Posts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Instagram Top Posts */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-500 rounded flex items-center justify-center">
                    <Instagram className="w-3 h-3 text-white" />
                  </div>
                  Instagram Top Posts
                </CardTitle>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800 w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  <span className="text-xs sm:text-sm">Download CSV</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {mockData.instagram.posts.map((post, index) => (
                  <div key={index} className="p-3 sm:p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">{post.type}</Badge>
                      <span className="text-xs text-gray-400">{index + 1} days ago</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                        <span className="truncate">{post.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                        <span className="truncate">{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                        <span className="truncate">{post.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                        <span className="truncate">{Math.floor(post.likes * 0.1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-500 text-center px-2">Showing top 4 posts. CSV contains all {Math.floor(Math.random() * 50) + 20} posts from last 30 days.</p>
              </CardContent>
            </Card>

            {/* TikTok Top Posts */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <div className="w-6 h-6 bg-black border border-gray-600 rounded flex items-center justify-center">
                    <TikTokIcon />
                  </div>
                  TikTok Top Videos
                </CardTitle>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800 w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  <span className="text-xs sm:text-sm">Download CSV</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {mockData.tiktok.videos.map((video, index) => (
                  <div key={index} className="p-3 sm:p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">Video</Badge>
                      <span className="text-xs text-gray-400">{index + 1} days ago</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                        <span className="truncate">{video.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                        <span className="truncate">{video.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                        <span className="truncate">{video.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                        <span className="truncate">{video.shares}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-500 text-center px-2">Showing top 4 videos. CSV contains all {Math.floor(Math.random() * 40) + 15} videos from last 30 days.</p>
              </CardContent>
            </Card>
          </div>

          {/* Section 3: Insights */}
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  AI Content Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Detailed Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* What's Working */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-green-400 flex items-center gap-2 text-lg">
                      <CheckCircle className="w-5 h-5" />
                      Top Performing Content
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-green-950/30 border-l-4 border-green-400 p-3 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">Behind-the-scenes studio content</span>
                          <Badge className="bg-green-600 text-white text-xs">+234%</Badge>
                        </div>
                        <p className="text-xs text-gray-400">Your studio sessions get 2.3x more engagement than average posts</p>
                      </div>
                      <div className="bg-green-950/30 border-l-4 border-green-400 p-3 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">Trending audio usage</span>
                          <Badge className="bg-green-600 text-white text-xs">+180%</Badge>
                        </div>
                        <p className="text-xs text-gray-400">Videos with trending sounds perform significantly better</p>
                      </div>
                      <div className="bg-green-950/30 border-l-4 border-green-400 p-3 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">Evening posts (7-9 PM)</span>
                          <Badge className="bg-green-600 text-white text-xs">+156%</Badge>
                        </div>
                        <p className="text-xs text-gray-400">Your audience is most active during evening hours</p>
                      </div>
                    </div>
                  </div>

                  {/* What Needs Improvement */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-red-400 flex items-center gap-2 text-lg">
                      <XCircle className="w-5 h-5" />
                      Content Opportunities
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-red-950/30 border-l-4 border-red-400 p-3 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">Static promotional posts</span>
                          <Badge variant="destructive" className="text-xs">-60%</Badge>
                        </div>
                        <p className="text-xs text-gray-400">Direct promotional content gets significantly less engagement</p>
                      </div>
                      <div className="bg-red-950/30 border-l-4 border-red-400 p-3 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">Long-form captions</span>
                          <Badge variant="destructive" className="text-xs">-45%</Badge>
                        </div>
                        <p className="text-xs text-gray-400">TikTok algorithm favors shorter, punchier captions</p>
                      </div>
                      <div className="bg-red-950/30 border-l-4 border-red-400 p-3 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">Over-produced content</span>
                          <Badge variant="destructive" className="text-xs">-38%</Badge>
                        </div>
                        <p className="text-xs text-gray-400">Your audience prefers authentic, raw content over polished posts</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Brand Analysis */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                  Brand Perception Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-purple-400">Your Brand Identity</h4>
                    <div className="bg-purple-950/30 border border-purple-500/30 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-3">Based on content analysis, your brand projects as:</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span className="text-xs">Authentic Musician</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-xs">Creative Storyteller</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-xs">Community Builder</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <span className="text-xs">Pop/Indie Vibes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-blue-400">Audience Connection</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                        <span className="text-sm">Relatability Score</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div className="bg-blue-400 h-2 rounded-full" style={{width: '85%'}}></div>
                          </div>
                          <span className="text-xs text-blue-400">8.5/10</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                        <span className="text-sm">Authenticity</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div className="bg-green-400 h-2 rounded-full" style={{width: '92%'}}></div>
                          </div>
                          <span className="text-xs text-green-400">9.2/10</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                        <span className="text-sm">Consistency</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div className="bg-purple-400 h-2 rounded-full" style={{width: '78%'}}></div>
                          </div>
                          <span className="text-xs text-purple-400">7.8/10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Section 4: Content Ideas */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                AI Content Ideas
              </CardTitle>
              <p className="text-gray-400 text-xs sm:text-sm">Based on trending topics and successful artists in your genre</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-400">TikTok Ideas</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <h5 className="font-medium text-sm mb-1">"Day in the Life: Recording Session"</h5>
                      <p className="text-xs text-gray-400">Show your creative process from start to finish. Trending among indie artists.</p>
                      <Badge variant="secondary" className="text-xs mt-2">Viral Potential: High</Badge>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <h5 className="font-medium text-sm mb-1">"Song vs. Real Life Situations"</h5>
                      <p className="text-xs text-gray-400">Match your lyrics to everyday moments. Format getting 2M+ views.</p>
                      <Badge variant="secondary" className="text-xs mt-2">Engagement: Very High</Badge>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <h5 className="font-medium text-sm mb-1">"Fan Covers Reaction"</h5>
                      <p className="text-xs text-gray-400">React to fan covers of your songs. Builds community connection.</p>
                      <Badge variant="secondary" className="text-xs mt-2">Community Building</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-purple-400">Instagram Ideas</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <h5 className="font-medium text-sm mb-1">"Songwriting Process Stories"</h5>
                      <p className="text-xs text-gray-400">Multi-slide posts showing how a song came together. Great for engagement.</p>
                      <Badge variant="secondary" className="text-xs mt-2">Story Format</Badge>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <h5 className="font-medium text-sm mb-1">"Acoustic Versions Carousel"</h5>
                      <p className="text-xs text-gray-400">Stripped-down versions of your songs. High save rates.</p>
                      <Badge variant="secondary" className="text-xs mt-2">High Saves</Badge>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <h5 className="font-medium text-sm mb-1">"Music Production Tips"</h5>
                      <p className="text-xs text-gray-400">Share your knowledge. Positions you as an expert in your field.</p>
                      <Badge variant="secondary" className="text-xs mt-2">Authority Building</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  )
}