"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Rocket,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Target,
  Users,
  TrendingUp,
  Database,
  Play,
  BookOpen,
  Zap,
  Star
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-provider"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface DashboardFeature {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  color: string
}

export default function CompleteOnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isCompleting, setIsCompleting] = useState(false)

  const dashboardFeatures: DashboardFeature[] = [
    {
      id: "overview",
      title: "Performance Overview",
      description: "See all your key metrics at a glance with real-time charts and insights",
      icon: BarChart3,
      href: "/dashboard",
      color: "blue"
    },
    {
      id: "analytics",
      title: "Deep Analytics",
      description: "Dive into detailed performance data across all your platforms",
      icon: TrendingUp,
      href: "/analytics",
      color: "green"
    },
    {
      id: "reach",
      title: "Audience Reach",
      description: "Track your growth across streaming platforms and social media",
      icon: Users,
      href: "/dashboard/reach",
      color: "purple"
    },
    {
      id: "goals",
      title: "Goal Tracking",
      description: "Monitor your progress toward the goals you just set",
      icon: Target,
      href: "/dashboard#goals",
      color: "orange"
    }
  ]

  const completeOnboarding = async () => {
    if (!user?.id) return

    setIsCompleting(true)
    try {
      const { ArtistService } = await import('@/lib/services/artist-service')
      
      await ArtistService.updateProfile(user.id, {
        onboarding_completed: true
      })

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      green: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
    }
    return colorMap[color] || colorMap.blue
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/onboarding/set-goals">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">You're Ready to Launch! 🚀</h1>
          <p className="text-muted-foreground">
            Congratulations! You've completed the setup. Let's explore your new dashboard.
          </p>
        </div>
      </div>

      {/* Step Progress */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
              <Rocket className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Step 3 of 3: Start Using Your Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Your artist intelligence platform is ready! Explore the features that will help you grow your music career.
              </p>
            </div>
            <div className="text-right">
              <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                Setup Complete
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tour */}
      <div className="grid gap-4 md:grid-cols-2">
        {dashboardFeatures.map((feature) => {
          const IconComponent = feature.icon
          return (
            <Card 
              key={feature.id}
              className={`transition-all hover:shadow-lg cursor-pointer ${getColorClasses(feature.color)}`}
              onClick={() => router.push(feature.href)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${getColorClasses(feature.color).split('border-')[0]}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <Button size="sm" variant="ghost">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {feature.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* Key Features Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-sidebar">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              What's Available Now
            </CardTitle>
            <CardDescription>
              Features you can start using immediately
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-1" />
              <div>
                <h4 className="font-medium text-sm">Real-time Performance Tracking</h4>
                <p className="text-xs text-muted-foreground">
                  Monitor streams, followers, and engagement across all platforms
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-1" />
              <div>
                <h4 className="font-medium text-sm">Historical Data Analysis</h4>
                <p className="text-xs text-muted-foreground">
                  View months of historical data to understand your growth patterns
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-1" />
              <div>
                <h4 className="font-medium text-sm">Goal Progress Tracking</h4>
                <p className="text-xs text-muted-foreground">
                  Track your progress toward the goals you just set
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-1" />
              <div>
                <h4 className="font-medium text-sm">Cross-platform Insights</h4>
                <p className="text-xs text-muted-foreground">
                  Compare performance across Spotify, Instagram, YouTube, and more
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-1" />
              <div>
                <h4 className="font-medium text-sm">Growth Trend Analysis</h4>
                <p className="text-xs text-muted-foreground">
                  Understand which content and strategies drive the most growth
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-sidebar">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Pro Tips for Success
            </CardTitle>
            <CardDescription>
              Get the most out of your artist dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="text-xs mt-0.5">1</Badge>
              <div>
                <h4 className="font-medium text-sm">Check Daily</h4>
                <p className="text-xs text-muted-foreground">
                  Make checking your dashboard part of your daily routine to stay on track
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="text-xs mt-0.5">2</Badge>
              <div>
                <h4 className="font-medium text-sm">Focus on Trends</h4>
                <p className="text-xs text-muted-foreground">
                  Look for patterns over time rather than daily fluctuations
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="text-xs mt-0.5">3</Badge>
              <div>
                <h4 className="font-medium text-sm">Update Your Goals</h4>
                <p className="text-xs text-muted-foreground">
                  Review and adjust your goals quarterly as you grow
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="text-xs mt-0.5">4</Badge>
              <div>
                <h4 className="font-medium text-sm">Use Data to Decide</h4>
                <p className="text-xs text-muted-foreground">
                  Let the insights guide your content strategy and release timing
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="text-xs mt-0.5">5</Badge>
              <div>
                <h4 className="font-medium text-sm">Celebrate Wins</h4>
                <p className="text-xs text-muted-foreground">
                  Acknowledge your progress, even small improvements matter
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Resources */}
      <Card className="bg-gradient-to-r from-purple-500/5 to-blue-500/5 border-purple-500/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Need Help Getting Started?</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're here to help you succeed. Check out our resources or take the audience assessment 
              to better understand your ideal fans.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/find-your-audience">
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Find Your Audience
                </Button>
              </Link>
              <Button variant="outline" size="sm" disabled>
                <BookOpen className="h-4 w-4 mr-2" />
                Help Center (Coming Soon)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final CTA */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">🎉 Setup Complete!</h3>
            <p className="text-muted-foreground mb-6">
              Your Home Run Records dashboard is ready. Start tracking your music career and hitting your goals!
            </p>
            <Button 
              size="lg" 
              onClick={completeOnboarding}
              disabled={isCompleting}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              {isCompleting ? (
                "Finalizing Setup..."
              ) : (
                <>
                  Launch My Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t pt-6">
        <Link href="/onboarding/set-goals">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goals
          </Button>
        </Link>

        <Link href="/onboarding">
          <Button variant="outline">
            Return to Overview
          </Button>
        </Link>
      </div>
    </div>
  )
}