"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Target,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Users,
  Music,
  DollarSign,
  Calendar,
  Save
} from "lucide-react"
import Link from "next/link"
import { useArtist } from "@/contexts/artist-context"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Goal {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  value: string
  target: string
  timeframe: string
  color: string
}

export default function SetGoalsPage() {
  const { user } = useArtist()
  const router = useRouter()
  
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "streams",
      title: "Monthly Streams",
      description: "Target monthly streams across all platforms",
      icon: Music,
      value: "",
      target: "100000",
      timeframe: "monthly",
      color: "green"
    },
    {
      id: "followers",
      title: "Social Followers",
      description: "Combined followers across social platforms",
      icon: Users,
      value: "",
      target: "10000",
      timeframe: "6 months",
      color: "blue"
    },
    {
      id: "revenue",
      title: "Monthly Revenue",
      description: "Target monthly revenue from music",
      icon: DollarSign,
      value: "",
      target: "1000",
      timeframe: "monthly",
      color: "purple"
    },
    {
      id: "releases",
      title: "Releases This Year",
      description: "Number of songs/albums to release",
      icon: TrendingUp,
      value: "",
      target: "6",
      timeframe: "yearly",
      color: "orange"
    }
  ])

  const [customGoal, setCustomGoal] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'none' | 'success' | 'error'>('none')

  useEffect(() => {
    const loadExistingGoals = async () => {
      if (!user?.id) return

      try {
        // TODO: Load existing goals from database
        // For now, we'll use placeholder data
      } catch (error) {
        console.error('Error loading goals:', error)
      }
    }

    loadExistingGoals()
  }, [user?.id])

  const updateGoalValue = (goalId: string, value: string) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, value } : goal
    ))
  }

  const updateGoalTarget = (goalId: string, target: string) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, target } : goal
    ))
  }

  const updateGoalTimeframe = (goalId: string, timeframe: string) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, timeframe } : goal
    ))
  }

  const saveGoals = async () => {
    if (!user?.id) return

    setIsSaving(true)
    setSaveStatus('none')

    try {
      // TODO: Save goals to database
      // For now, we'll simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaveStatus('success')
      
      // Save to localStorage for now
      const goalsData = {
        goals: goals.filter(g => g.target && g.target !== ''),
        customGoal: customGoal.trim(),
        savedAt: new Date().toISOString()
      }
      localStorage.setItem('artist_goals', JSON.stringify(goalsData))
      
    } catch (error) {
      console.error('Error saving goals:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = () => {
    router.push('/onboarding/complete')
  }

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      green: "bg-green-500/10 text-green-600 dark:text-green-400",
      blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400"
    }
    return colorMap[color] || colorMap.blue
  }

  const hasValidGoals = goals.some(g => g.target && g.target !== '')

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/onboarding/connect-data">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Set Your Goals</h1>
          <p className="text-muted-foreground">
            Define meaningful targets to track your progress and stay motivated
          </p>
        </div>
      </div>

      {/* Step Progress */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Step 2 of 3: Set Your Goals</h3>
              <p className="text-sm text-muted-foreground">
                Set SMART goals that align with your music career aspirations and track your progress over time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {saveStatus === 'success' && (
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Goals saved successfully!</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Goals Section */}
        <div className="space-y-6">
          <Card className="bg-sidebar">
            <CardHeader>
              <CardTitle>Your Career Goals</CardTitle>
              <CardDescription>
                Set specific, measurable targets for key metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {goals.map((goal) => {
                const IconComponent = goal.icon
                return (
                  <div key={goal.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getColorClasses(goal.color)}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{goal.title}</h4>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`target-${goal.id}`} className="text-sm">Target</Label>
                        <Input
                          id={`target-${goal.id}`}
                          type="number"
                          placeholder="Enter target..."
                          value={goal.target}
                          onChange={(e) => updateGoalTarget(goal.id, e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`timeframe-${goal.id}`} className="text-sm">Timeframe</Label>
                        <select
                          id={`timeframe-${goal.id}`}
                          value={goal.timeframe}
                          onChange={(e) => updateGoalTimeframe(goal.id, e.target.value)}
                          className="mt-1 w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="6 months">6 Months</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Custom Goal */}
          <Card className="bg-sidebar">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Custom Goal
              </CardTitle>
              <CardDescription>
                Add a personal goal that's specific to your music career
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Example: Get featured on 5 major music blogs this quarter, or perform at 10 live venues this year..."
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <div className="space-y-6">
          <Card className="bg-sidebar">
            <CardHeader>
              <CardTitle>Goal Setting Tips</CardTitle>
              <CardDescription>
                How to set effective goals that drive real progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="text-xs mt-0.5">1</Badge>
                  <div>
                    <h4 className="font-medium text-sm">Be Specific & Measurable</h4>
                    <p className="text-xs text-muted-foreground">
                      Instead of "get more streams," set "reach 50,000 monthly streams"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="text-xs mt-0.5">2</Badge>
                  <div>
                    <h4 className="font-medium text-sm">Set Realistic Targets</h4>
                    <p className="text-xs text-muted-foreground">
                      Base your goals on your current metrics and realistic growth rates
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="text-xs mt-0.5">3</Badge>
                  <div>
                    <h4 className="font-medium text-sm">Include Different Metrics</h4>
                    <p className="text-xs text-muted-foreground">
                      Balance streaming, social media, and revenue goals
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="text-xs mt-0.5">4</Badge>
                  <div>
                    <h4 className="font-medium text-sm">Review & Adjust</h4>
                    <p className="text-xs text-muted-foreground">
                      Update your goals quarterly as you grow and learn
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goal Examples */}
          <Card className="bg-sidebar">
            <CardHeader>
              <CardTitle>Example Goals</CardTitle>
              <CardDescription>
                Real goals from successful independent artists
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">"Reach 100K monthly Spotify streams"</p>
                <p className="text-xs text-muted-foreground">Timeframe: 6 months</p>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">"Gain 25K Instagram followers"</p>
                <p className="text-xs text-muted-foreground">Timeframe: 1 year</p>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">"Release 8 singles this year"</p>
                <p className="text-xs text-muted-foreground">Timeframe: 12 months</p>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">"Generate $2K monthly revenue"</p>
                <p className="text-xs text-muted-foreground">Timeframe: 9 months</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Goals */}
      <Card className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Save Your Goals</h3>
              <p className="text-sm text-muted-foreground">
                Your goals will be tracked in the dashboard and you can update them anytime
              </p>
            </div>
            <Button 
              onClick={saveGoals} 
              disabled={isSaving || !hasValidGoals}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Goals
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t pt-6">
        <Link href="/onboarding/connect-data">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Connect Data
          </Button>
        </Link>

        <Button 
          onClick={handleNext}
          disabled={!hasValidGoals && !customGoal.trim()}
        >
          Next: Start Using App
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}