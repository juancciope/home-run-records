"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Zap, 
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowRight,
  Instagram,
  Calendar,
  Hash,
  BarChart3,
  Download,
  Share2,
  Sparkles,
  PlayCircle,
  MessageSquare,
  Heart,
  Eye,
  Loader2,
  Music,
  Globe,
  Award,
  Headphones
} from "lucide-react"
import { motion } from "framer-motion"
import { useSearchParams, useRouter } from "next/navigation"
import { createAuthenticatedClient } from '@/utils/supabase/client'

// TikTok Icon Component
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.34 6.34 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

interface AnalysisData {
  id: string;
  instagram_username?: string;
  tiktok_username?: string;
  posts_analyzed: number;
  analysis_result: {
    overallScore: number;
    insights: Array<{
      type: 'success' | 'warning' | 'improvement';
      title: string;
      description: string;
      metric?: string;
    }>;
    recommendations: string[];
    contentAnalysis: {
      bestPerforming: string;
      worstPerforming: string;
      optimalPostingTime: string;
      topHashtags: string[];
    };
    growthPrediction: {
      thirtyDays: number;
      sixtyDays: number;
      ninetyDays: number;
    };
    contentGuide?: {
      contentTypeMix: {
        reels: string;
        posts: string;
        carousels: string;
        stories: string;
      };
      captionStrategy: {
        idealLength: string;
        structure: string;
        callToAction: string;
      };
      hashtagStrategy: {
        optimalCount: string;
        mix: string;
        examples: string[];
      };
      postingFrequency: string;
    };
    topPerformers?: Array<{
      platform: string;
      type: string;
      engagement: string;
      whyItWorked: string;
    }>;
  };
  platforms?: {
    viberate?: {
      totalFollowers: number;
      totalReach: number;
      engagedAudience: number;
      platforms: {
        spotify: { followers: number; streams: number };
        youtube: { subscribers: number; views: number };
        instagram: { followers: number; engagement: number };
        tiktok: { followers: number; views: number };
        [key: string]: any;
      };
    };
    instagram?: boolean;
    tiktok?: boolean;
  };
  scraped_posts?: {
    instagram: Array<{
      platform: 'instagram';
      type: string;
      caption: string;
      likes: number;
      comments: number;
      views?: number;
      timestamp: string;
      hashtags: string[];
      mediaUrl?: string;
    }>;
    tiktok: Array<{
      platform: 'tiktok';
      type: 'video';
      caption: string;
      likes: number;
      comments: number;
      shares: number;
      views: number;
      timestamp: string;
      hashtags: string[];
      mediaUrl?: string;
    }>;
  };
  created_at: string;
}

export default function AnalysisResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const analysisId = searchParams.get('analysis')

  const [analysisData, setAnalysisData] = React.useState<AnalysisData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!analysisId) {
      setError('No analysis ID provided')
      setLoading(false)
      return
    }

    fetchAnalysisData()
  }, [analysisId])

  const fetchAnalysisData = async () => {
    try {
      // For testing phase, try localStorage first (free analyses)
      // TODO: Remove localStorage fallback when implementing proper user accounts
      const localData = localStorage.getItem(`analysis_${analysisId}`);
      if (localData) {
        console.log('📱 Loading analysis from localStorage (free testing mode)');
        const analysisData = JSON.parse(localData);
        setAnalysisData(analysisData);
        setLoading(false);
        return;
      }

      // Try database if localStorage doesn't have the analysis
      console.log('🔍 Trying to fetch from database...');
      const supabase = await createAuthenticatedClient()
      
      const { data, error } = await supabase
        .from('ai_analyses')
        .select('*')
        .eq('id', analysisId)
        .single()

      if (error) {
        console.error('Error fetching analysis:', error)
        setError('Analysis not found. This may be a free analysis that has expired.')
        return
      }

      setAnalysisData(data)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to load analysis')
    } finally {
      setLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'improvement':
        return <ArrowUp className="h-4 w-4 text-blue-500" />
      default:
        return <Zap className="h-4 w-4 text-primary" />
    }
  }

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
      case 'improvement':
        return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
      default:
        return 'bg-muted/50'
    }
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your AI analysis...</p>
        </div>
      </div>
    )
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto" />
          <h1 className="text-xl font-semibold">Analysis Not Found</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => router.push('/artist-ai')}>
            Start New Analysis
          </Button>
        </div>
      </div>
    )
  }

  const analysis = analysisData.analysis_result
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-4">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Analysis Complete</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Your Personalized Report</h1>
          <p className="text-muted-foreground">
            Based on {analysisData.posts_analyzed} posts analyzed from{' '}
            {analysisData.instagram_username && 'Instagram'}{' '}
            {analysisData.instagram_username && analysisData.tiktok_username && '& '}{' '}
            {analysisData.tiktok_username && 'TikTok'}
          </p>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Overall Engagement Score</h2>
                  <p className="text-blue-100">Your content performance rating</p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold">{analysis.overallScore}/10</div>
                  <div className="w-32 h-2 bg-white/20 rounded-full mt-2">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-1000"
                      style={{ width: `${analysis.overallScore * 10}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Post Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Content Analysis Summary
              </CardTitle>
              <CardDescription>
                Data extracted and analyzed from your social media accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Instagram Stats */}
                {analysisData.scraped_posts?.instagram && (
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
                    <Instagram className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-3xl font-bold">{analysisData.scraped_posts.instagram.length}</div>
                    <div className="text-sm text-muted-foreground">Instagram Posts</div>
                    <div className="text-xs mt-2">
                      {(() => {
                        const totalEngagement = analysisData.scraped_posts.instagram.reduce((sum, post) => 
                          sum + post.likes + post.comments + (post.views || 0), 0);
                        const avgEngagement = Math.round(totalEngagement / analysisData.scraped_posts.instagram.length);
                        return `Avg. ${avgEngagement.toLocaleString()} engagements`;
                      })()}
                    </div>
                  </div>
                )}
                
                {/* TikTok Stats */}
                {analysisData.scraped_posts?.tiktok && (
                  <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-black/5 dark:from-gray-950/20 dark:to-black/20 rounded-lg">
                    <TikTokIcon />
                    <div className="text-3xl font-bold mt-2">{analysisData.scraped_posts.tiktok.length}</div>
                    <div className="text-sm text-muted-foreground">TikTok Videos</div>
                    <div className="text-xs mt-2">
                      {(() => {
                        const totalViews = analysisData.scraped_posts.tiktok.reduce((sum, post) => sum + post.views, 0);
                        const avgViews = Math.round(totalViews / analysisData.scraped_posts.tiktok.length);
                        return `Avg. ${avgViews.toLocaleString()} views`;
                      })()}
                    </div>
                  </div>
                )}
                
                {/* Total Stats */}
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg">
                  <Brain className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-3xl font-bold">{analysisData.posts_analyzed}</div>
                  <div className="text-sm text-muted-foreground">Total Analyzed</div>
                  <div className="text-xs mt-2">
                    AI-powered insights generated
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Performing Posts */}
        {analysis.topPerformers && analysis.topPerformers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Top Performing Content
                </CardTitle>
                <CardDescription>
                  Your best posts and why they resonated with your audience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.topPerformers.map((post, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {post.platform === 'instagram' ? <Instagram className="h-4 w-4" /> : <TikTokIcon />}
                          <Badge variant="secondary" className="text-xs">{post.type}</Badge>
                          <span className="text-sm font-semibold text-green-700 dark:text-green-400">{post.engagement}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Why it worked:</span> {post.whyItWorked}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Data Sources Section */}
        {analysisData.platforms && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  Your Digital Presence
                </CardTitle>
                <CardDescription>
                  Comprehensive data from your music and social platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Music Platform Data */}
                  {analysisData.platforms.viberate && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Music className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Music Platforms</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Followers</span>
                          <span className="font-semibold">{analysisData.platforms.viberate.totalFollowers.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Reach</span>
                          <span className="font-semibold">{analysisData.platforms.viberate.totalReach.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Engaged Audience</span>
                          <span className="font-semibold">{analysisData.platforms.viberate.engagedAudience.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {/* Platform Breakdown */}
                      <div className="pt-3 border-t">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(analysisData.platforms.viberate.platforms).map(([platform, data]) => {
                            if (!data || typeof data !== 'object') return null;
                            const followerCount = (data as any).followers || (data as any).subscribers || (data as any).fans || 0;
                            if (followerCount === 0) return null;
                            return (
                              <div key={platform} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                <span className="capitalize">{platform}</span>
                                <span className="font-medium">{followerCount.toLocaleString()}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Social Media Data */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Social Platforms</span>
                    </div>
                    <div className="space-y-2">
                      {analysisData.platforms.instagram && (
                        <div className="flex items-center gap-2 text-sm">
                          <Instagram className="h-3 w-3" />
                          <span>Instagram - {analysisData.instagram_username}</span>
                          <Badge variant="secondary" className="text-xs">Connected</Badge>
                        </div>
                      )}
                      {analysisData.platforms.tiktok && (
                        <div className="flex items-center gap-2 text-sm">
                          <TikTokIcon />
                          <span>TikTok - {analysisData.tiktok_username}</span>
                          <Badge variant="secondary" className="text-xs">Connected</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Analysis Summary */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Analysis Summary</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Posts Analyzed</span>
                        <span className="font-semibold">{analysisData.posts_analyzed}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Overall Score</span>
                        <span className="font-semibold">{analysis.overallScore}/10</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Data Sources</span>
                        <span className="font-semibold">
                          {[analysisData.platforms?.viberate && 'Music', analysisData.platforms?.instagram && 'IG', analysisData.platforms?.tiktok && 'TT'].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Key Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Key Insights
              </CardTitle>
              <CardDescription>
                Important findings from your content analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`flex items-start gap-3 p-4 rounded-lg border ${getInsightBgColor(insight.type)}`}
                >
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{insight.title}</span>
                      {insight.metric && (
                        <Badge variant="secondary" className="text-xs">
                          {insight.metric}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Strategy Guide */}
        {analysis.contentGuide && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-8"
          >
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Your Personalized Content Strategy
                </CardTitle>
                <CardDescription>
                  Based on your actual post performance data
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Content Type Mix */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <PlayCircle className="h-4 w-4 text-purple-500" />
                      Content Type Strategy
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Reels/Videos</span>
                        <span className="font-medium">{analysis.contentGuide.contentTypeMix.reels}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Static Posts</span>
                        <span className="font-medium">{analysis.contentGuide.contentTypeMix.posts}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Carousels</span>
                        <span className="font-medium">{analysis.contentGuide.contentTypeMix.carousels}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Stories</span>
                        <span className="font-medium">{analysis.contentGuide.contentTypeMix.stories}</span>
                      </div>
                    </div>
                  </div>

                  {/* Caption Strategy */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      Caption Strategy
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <div className="font-medium mb-1">Ideal Length</div>
                        <div className="text-muted-foreground">{analysis.contentGuide.captionStrategy.idealLength}</div>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <div className="font-medium mb-1">Structure</div>
                        <div className="text-muted-foreground">{analysis.contentGuide.captionStrategy.structure}</div>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <div className="font-medium mb-1">Call to Action</div>
                        <div className="text-muted-foreground">{analysis.contentGuide.captionStrategy.callToAction}</div>
                      </div>
                    </div>
                  </div>

                  {/* Hashtag Strategy */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Hash className="h-4 w-4 text-green-500" />
                      Hashtag Strategy
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <div className="font-medium mb-1">Optimal Count</div>
                        <div className="text-muted-foreground">{analysis.contentGuide.hashtagStrategy.optimalCount}</div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <div className="font-medium mb-1">Mix Strategy</div>
                        <div className="text-muted-foreground">{analysis.contentGuide.hashtagStrategy.mix}</div>
                      </div>
                      {analysis.contentGuide.hashtagStrategy.examples.length > 0 && (
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <div className="font-medium mb-2">Example Hashtags</div>
                          <div className="flex flex-wrap gap-1">
                            {analysis.contentGuide.hashtagStrategy.examples.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Posting Frequency */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      Posting Schedule
                    </h4>
                    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div className="font-medium mb-2">Recommended Frequency</div>
                      <div className="text-sm text-muted-foreground">{analysis.contentGuide.postingFrequency}</div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="font-medium mb-1">Best Time</div>
                        <div className="text-sm text-muted-foreground">{analysis.contentAnalysis.optimalPostingTime}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Content Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Content Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-sm">Best Performing</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {analysis.contentAnalysis.bestPerforming}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowUp className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">Needs Improvement</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {analysis.contentAnalysis.worstPerforming}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span className="font-medium text-sm">Optimal Posting Time</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {analysis.contentAnalysis.optimalPostingTime}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="h-4 w-4 text-orange-500" />
                      <span className="font-medium text-sm">Top Hashtags</span>
                    </div>
                    <div className="flex flex-wrap gap-1 pl-6">
                      {analysis.contentAnalysis.topHashtags.map((hashtag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {hashtag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Growth Predictions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Growth Predictions
                </CardTitle>
                <CardDescription>
                  Expected follower growth with optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">30 Days</span>
                      <span className="text-sm font-semibold text-green-600">
                        +{analysis.growthPrediction.thirtyDays}%
                      </span>
                    </div>
                    <Progress value={analysis.growthPrediction.thirtyDays} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">60 Days</span>
                      <span className="text-sm font-semibold text-blue-600">
                        +{analysis.growthPrediction.sixtyDays}%
                      </span>
                    </div>
                    <Progress value={analysis.growthPrediction.sixtyDays} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">90 Days</span>
                      <span className="text-sm font-semibold text-purple-600">
                        +{analysis.growthPrediction.ninetyDays}%
                      </span>
                    </div>
                    <Progress value={Math.min(analysis.growthPrediction.ninetyDays, 100)} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Action Plan
              </CardTitle>
              <CardDescription>
                Personalized recommendations to boost your growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {analysis.recommendations.map((recommendation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-sm">{recommendation}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Scraped Posts Preview */}
        {analysisData.scraped_posts && (analysisData.scraped_posts.instagram?.length > 0 || analysisData.scraped_posts.tiktok?.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  Actual Posts Analyzed
                </CardTitle>
                <CardDescription>
                  Real data from your social media - sorted by engagement rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Instagram Posts */}
                  {analysisData.scraped_posts.instagram?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Instagram className="h-4 w-4" />
                        <span className="font-medium">Instagram Posts</span>
                        <Badge variant="outline" className="text-xs">
                          {analysisData.scraped_posts.instagram.length} posts
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {analysisData.scraped_posts.instagram
                          .sort((a, b) => {
                            const engagementA = a.likes + a.comments + (a.views || 0);
                            const engagementB = b.likes + b.comments + (b.views || 0);
                            return engagementB - engagementA;
                          })
                          .slice(0, 6)
                          .map((post, index) => {
                            const totalEngagement = post.likes + post.comments + (post.views || 0);
                            const engagementRate = post.views ? 
                              ((totalEngagement / post.views) * 100).toFixed(2) : 
                              '—';
                            return (
                          <div key={index} className="p-3 bg-muted/30 rounded-lg border hover:border-purple-400 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {post.type}
                                </Badge>
                                {index === 0 && <Badge className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500">Top Post</Badge>}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(post.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm mb-3 line-clamp-2">{post.caption || 'No caption'}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                <span>{post.likes.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{post.comments.toLocaleString()}</span>
                              </div>
                              {post.views && (
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  <span>{post.views.toLocaleString()}</span>
                                </div>
                              )}
                              {engagementRate !== '—' && (
                                <Badge variant="outline" className="text-xs ml-auto">
                                  {engagementRate}% ER
                                </Badge>
                              )}
                            </div>
                            {post.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {post.hashtags.slice(0, 3).map((tag, tagIndex) => (
                                  <span key={tagIndex} className="text-xs text-blue-600 bg-blue-50 px-1 rounded">
                                    {tag}
                                  </span>
                                ))}
                                {post.hashtags.length > 3 && (
                                  <span className="text-xs text-muted-foreground">+{post.hashtags.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      </div>
                    </div>
                  )}
                  
                  {/* TikTok Posts */}
                  {analysisData.scraped_posts.tiktok?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <TikTokIcon />
                        <span className="font-medium">TikTok Posts</span>
                        <Badge variant="outline" className="text-xs">
                          {analysisData.scraped_posts.tiktok.length} posts
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {analysisData.scraped_posts.tiktok.slice(0, 4).map((post, index) => (
                          <div key={index} className="p-3 bg-muted/30 rounded-lg border">
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant="secondary" className="text-xs">
                                Video
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(post.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm mb-3 line-clamp-2">{post.caption || 'No caption'}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                <span>{post.likes.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{post.comments.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Share2 className="h-3 w-3" />
                                <span>{post.shares.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{post.views.toLocaleString()}</span>
                              </div>
                            </div>
                            {post.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {post.hashtags.slice(0, 3).map((tag, tagIndex) => (
                                  <span key={tagIndex} className="text-xs text-purple-600 bg-purple-50 px-1 rounded">
                                    {tag}
                                  </span>
                                ))}
                                {post.hashtags.length > 3 && (
                                  <span className="text-xs text-muted-foreground">+{post.hashtags.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-8 text-center">
              <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Ready to Implement These Insights?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Upgrade to get real-time monitoring, automated posting suggestions, 
                and advanced analytics to track your progress.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={handleUpgrade}
                >
                  Upgrade to Pro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Report
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Start at $29/month • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Analysis generated on {new Date(analysisData.created_at).toLocaleDateString()} • 
            Need help? <Link href="/contact" className="text-primary hover:underline">Contact support</Link>
          </p>
        </div>
      </div>
    </div>
  )
}