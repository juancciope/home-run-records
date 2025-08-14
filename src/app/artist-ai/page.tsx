"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  Brain, 
  CheckCircle2, 
  Instagram, 
  Music, 
  Sparkles, 
  TrendingUp, 
  Users,
  Zap,
  ArrowRight,
  Shield,
  Clock,
  Target,
  AlertCircle
} from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

// Social platform icons component
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.34 6.34 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
)

export default function ArtistAIFunnelPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const handleGetStarted = () => {
    setIsLoading(true)
    // Redirect to signup with a special parameter to track funnel conversion
    router.push('/signup?source=artist-ai&product=ai-analysis')
  }

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms analyze your content performance across all platforms"
    },
    {
      icon: Target,
      title: "Actionable Insights",
      description: "Get specific recommendations to improve engagement and grow your fanbase"
    },
    {
      icon: TrendingUp,
      title: "Growth Predictions",
      description: "See projected growth based on current trends and optimization opportunities"
    },
    {
      icon: Clock,
      title: "Real-Time Updates",
      description: "Monitor your progress with live data from all your social platforms"
    }
  ]

  const socialPlatforms = [
    { name: "Instagram", icon: Instagram, color: "bg-gradient-to-br from-purple-600 to-pink-500" },
    { name: "TikTok", icon: TikTokIcon, color: "bg-gradient-to-br from-black to-gray-800" },
    { name: "Spotify", icon: SpotifyIcon, color: "bg-green-500" },
    { name: "YouTube", icon: Music, color: "bg-red-500" },
  ]

  const benefits = [
    "Comprehensive social media audit across all platforms",
    "AI analysis of your last 30 Instagram posts",
    "TikTok content performance breakdown",
    "Personalized growth strategy recommendations",
    "Competitor analysis and benchmarking",
    "Optimal posting time suggestions",
    "Content type performance analysis",
    "Engagement rate optimization tips"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px] [mask-image:radial-gradient(white,transparent_70%)]" />
        
        <div className="relative mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            {/* Trust Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2"
            >
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Powered by Viberate's Industry Data</span>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI-Powered Analysis
                </span>
                <br />
                <span>for Music Artists</span>
              </h1>
              <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                Get instant AI insights on your social media performance. 
                Scan all your accounts, analyze your content, and receive actionable growth strategies.
              </p>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={handleGetStarted}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Loading...
                  </>
                ) : (
                  <>
                    Get Your Free AI Analysis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-8 pt-8"
            >
              <div className="text-center">
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-sm text-muted-foreground">Artists Analyzed</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold">2M+</div>
                <div className="text-sm text-muted-foreground">Posts Scanned</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold">98%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platform Integration Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Complete Platform Coverage</h2>
            <p className="text-muted-foreground">Connect all your accounts for comprehensive analysis</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {socialPlatforms.map((platform) => (
              <motion.div
                key={platform.name}
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <Card className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className={`${platform.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4`}>
                      <platform.icon />
                    </div>
                    <h3 className="font-semibold">{platform.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Full analytics</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="mr-1 h-3 w-3" />
              AI Features
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Powerful AI Analytics</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI engine analyzes millions of data points to give you insights that actually matter
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <feature.icon className="h-10 w-10 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits List */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What You'll Get</h2>
            <p className="text-muted-foreground">Everything you need to understand and grow your online presence</p>
          </div>

          <Card className="p-8">
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Sample Analysis Preview */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">See It In Action</h2>
            <p className="text-muted-foreground">Preview of your personalized AI analysis report</p>
          </div>

          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <Brain className="h-8 w-8" />
                <div>
                  <h3 className="text-xl font-semibold">AI Analysis Report</h3>
                  <p className="text-blue-100">Generated in real-time from your actual data</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6 space-y-6">
              {/* Engagement Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Overall Engagement Score</span>
                  <Badge variant="secondary">8.7/10</Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[87%] bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                </div>
              </div>

              {/* Key Insights */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Top Insights
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <span className="font-medium">Instagram Reels outperform posts by 340%</span>
                      <p className="text-muted-foreground mt-1">Focus on video content for maximum reach</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <span className="font-medium">Best posting time: 7-9 PM EST</span>
                      <p className="text-muted-foreground mt-1">Your audience is most active during evening hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <Users className="h-4 w-4 text-purple-600 mt-0.5" />
                    <div className="text-sm">
                      <span className="font-medium">Gen Z audience growing 45% faster</span>
                      <p className="text-muted-foreground mt-1">Consider content that resonates with younger demographics</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Recommended Actions
                </h4>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>Create 3 more Reels per week</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>Engage with comments within first hour</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>Use trending audio in 50% of TikToks</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Limited Time Offer</h3>
              <p className="text-muted-foreground mb-6">
                Get your complete AI analysis FREE for the next 48 hours. 
                Regular price: $97/month
              </p>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                onClick={handleGetStarted}
              >
                Claim Your Free Analysis Now
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                No credit card required • 2-minute setup • Instant results
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How does the AI analysis work?</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI connects to your social accounts via Viberate's API, analyzes your content performance, 
                  engagement patterns, and audience behavior to generate personalized insights and recommendations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Is my data secure?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! We use bank-level encryption and never store your login credentials. 
                  All data is processed in compliance with GDPR and privacy regulations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How long does the analysis take?</h3>
                <p className="text-sm text-muted-foreground">
                  Initial analysis takes about 2-3 minutes. After that, your dashboard updates in real-time 
                  with fresh data from all connected platforms.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Absolutely! Start with our free analysis, and if you choose to upgrade, 
                  you can cancel your subscription at any time with no questions asked.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Unlock Your Full Potential?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of artists who are using AI to understand their audience 
            and accelerate their growth.
          </p>
          <Button 
            size="lg"
            className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={handleGetStarted}
          >
            Start Your Free AI Analysis
            <Brain className="ml-2 h-5 w-5" />
          </Button>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Free to start
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              No credit card
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Cancel anytime
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}