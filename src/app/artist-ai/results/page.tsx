"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  Loader2
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

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
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
            Need help? <a href="/contact" className="text-primary hover:underline">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  )
}