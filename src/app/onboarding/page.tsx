"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Database,
  Target,
  Clock,
  ArrowRight,
  TrendingUp
} from "lucide-react"
import Link from "next/link"

export default function OnboardingPage() {

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Welcome to Artist OS</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Get started with your artist management. Connect your data and set goals to track your progress.
        </p>
      </div>

      {/* Start Here Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Connect Data Option */}
        <Link href="/onboarding/connect-data">
          <Card className="transition-all hover:shadow-lg hover:border-blue-500/50 cursor-pointer group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                  <Database className="h-8 w-8" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  2 mins
                </Badge>
              </div>
              <CardTitle className="text-xl mb-2">Connect Your Data</CardTitle>
              <CardDescription className="text-base">
                Link your Spotify, Instagram, and other platforms to unlock real-time analytics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Get live data from your platforms
                </div>
                <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Start <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Set Goals Option */}
        <Link href="/onboarding/set-goals">
          <Card className="transition-all hover:shadow-lg hover:border-purple-500/50 cursor-pointer group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                  <Target className="h-8 w-8" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  3 mins
                </Badge>
              </div>
              <CardTitle className="text-xl mb-2">Set Your Goals</CardTitle>
              <CardDescription className="text-base">
                Define your streaming, follower, and revenue targets to track progress and stay motivated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Define targets and track progress
                </div>
                <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Start <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Get Started */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20 mt-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready to get started?</h3>
            <p className="text-muted-foreground mb-6">
              Complete the setup steps above or jump straight to your dashboard to explore.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button variant="outline" size="lg">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}