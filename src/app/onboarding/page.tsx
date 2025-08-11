"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Database,
  Target,
  CheckCircle,
  Clock,
  ArrowRight,
  Wifi,
  TrendingUp,
  Users
} from "lucide-react"
import Link from "next/link"
import { useArtist } from "@/contexts/artist-context"
import { useState, useEffect } from "react"

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  completed: boolean
  estimatedTime: string
}

export default function OnboardingPage() {
  const { user } = useArtist()
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([])
  const [overallProgress, setOverallProgress] = useState(0)

  useEffect(() => {
    const loadOnboardingStatus = async () => {
      if (!user?.id) return

      try {
        const { ArtistService } = await import('@/lib/services/artist-service')
        const profile = await ArtistService.getArtistProfile(user.id, user.email)
        
        const steps: OnboardingStep[] = [
          {
            id: "connect-data",
            title: "Connect Your Data",
            description: "Link your Spotify, Instagram, and other platforms to unlock real-time analytics",
            icon: Database,
            href: "/onboarding/connect-data",
            completed: !!profile?.viberate_artist_id,
            estimatedTime: "2 mins"
          },
          {
            id: "set-goals",
            title: "Set Your Goals",
            description: "Define your streaming, follower, and revenue targets to track progress",
            icon: Target,
            href: "/onboarding/set-goals",
            completed: false, // TODO: Check if goals are set
            estimatedTime: "3 mins"
          }
        ]

        setOnboardingSteps(steps)
        
        // Calculate progress
        const completedCount = steps.filter(step => step.completed).length
        setOverallProgress(Math.round((completedCount / steps.length) * 100))
      } catch (error) {
        console.error('Error loading onboarding status:', error)
      }
    }

    loadOnboardingStatus()
  }, [user?.id, user?.email])

  const completedSteps = onboardingSteps.filter(step => step.completed).length
  const isAllComplete = completedSteps === onboardingSteps.length

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to Home Run Records</h1>
            <p className="text-muted-foreground">
              Let's get you started with tracking your music career in just 2 simple steps
            </p>
          </div>
          {isAllComplete && (
            <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              Setup Complete
            </Badge>
          )}
        </div>

        {/* Progress Overview */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Onboarding Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {completedSteps} of {onboardingSteps.length} steps completed
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{overallProgress}%</div>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Steps */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {onboardingSteps.map((step, index) => {
          const IconComponent = step.icon
          return (
            <Card 
              key={step.id} 
              className={`transition-all hover:shadow-lg ${
                step.completed 
                  ? 'bg-green-500/5 border-green-500/20' 
                  : 'bg-sidebar hover:bg-sidebar/80'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${
                    step.completed 
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {step.estimatedTime}
                    </Badge>
                    {step.completed && (
                      <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Done
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {step.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={step.href}>
                  <Button 
                    className="w-full" 
                    variant={step.completed ? "outline" : "default"}
                  >
                    {step.completed ? "Review" : "Start"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3 mt-8">
        <Card className="bg-sidebar">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wifi className="h-5 w-5 text-blue-500" />
              Live Data Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your platforms to unlock real-time insights and automatic data tracking
            </p>
            <Link href="/onboarding/connect-data">
              <Button size="sm" variant="outline" className="w-full">
                Connect Now
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-sidebar">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Track Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Set meaningful goals and track your growth across all platforms
            </p>
            <Link href="/onboarding/set-goals">
              <Button size="sm" variant="outline" className="w-full">
                Set Goals
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-sidebar">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Find Your Audience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Discover your ideal fan profile with our audience assessment tool
            </p>
            <Link href="/find-your-audience">
              <Button size="sm" variant="outline" className="w-full">
                Start Assessment
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Completion Action */}
      {isAllComplete && (
        <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20 mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">🎉 Setup Complete!</h3>
              <p className="text-muted-foreground mb-6">
                You've completed the setup process. You're ready to start tracking your music career!
              </p>
              <Link href="/dashboard">
                <Button size="lg">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}