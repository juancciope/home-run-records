"use client"

import * as React from "react"
import { CalendarIcon, Target, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useAuth } from "@/contexts/auth-provider"
import { GoalsService } from "@/lib/services/goals-service"
import { toast } from "sonner"

interface AddGoalModalProps {
  section: 'production' | 'marketing' | 'fan_engagement' | 'conversion' | 'agent'
  recordType: string
  onGoalAdded?: () => void
  children?: React.ReactNode
}

const GOAL_CONFIGS = {
  production: {
    unfinished: {
      title: 'Set Completion Goal',
      description: 'Set a target to complete your work-in-progress projects',
      goalTypes: {
        complete_tracks: 'Complete Tracks',
        finish_projects: 'Finish Projects',
        reach_milestone: 'Reach Milestone'
      }
    },
    finished: {
      title: 'Set Release Goal',
      description: 'Set a target release date for your finished tracks',
      goalTypes: {
        release_track: 'Release Track',
        album_release: 'Album Release',
        ep_release: 'EP Release'
      }
    },
    released: {
      title: 'Set Catalog Goal',
      description: 'Set goals for your live catalog performance',
      goalTypes: {
        stream_target: 'Stream Target',
        playlist_adds: 'Playlist Additions',
        revenue_goal: 'Revenue Goal'
      }
    }
  },
  marketing: {
    reach: {
      title: 'Set Reach Goal',
      description: 'Set targets for expanding your total reach',
      goalTypes: {
        follower_growth: 'Follower Growth',
        engagement_rate: 'Engagement Rate',
        campaign_reach: 'Campaign Reach'
      }
    },
    engaged: {
      title: 'Set Engagement Goal',
      description: 'Set targets for audience engagement',
      goalTypes: {
        interaction_rate: 'Interaction Rate',
        comment_growth: 'Comment Growth',
        share_target: 'Share Target'
      }
    },
    followers: {
      title: 'Set Follower Goal',
      description: 'Set targets for follower growth across platforms',
      goalTypes: {
        total_followers: 'Total Followers',
        platform_growth: 'Platform Growth',
        monthly_growth: 'Monthly Growth'
      }
    }
  },
  fan_engagement: {
    captured: {
      title: 'Set Data Goal',
      description: 'Set targets for capturing fan data',
      goalTypes: {
        email_signups: 'Email Signups',
        contact_growth: 'Contact Growth',
        data_quality: 'Data Quality'
      }
    },
    fans: {
      title: 'Set Fan Goal',
      description: 'Set targets for active fan engagement',
      goalTypes: {
        active_fans: 'Active Fans',
        fan_retention: 'Fan Retention',
        community_growth: 'Community Growth'
      }
    },
    super_fans: {
      title: 'Set Super Fan Goal',
      description: 'Set targets for converting to super fans',
      goalTypes: {
        super_fan_count: 'Super Fan Count',
        conversion_rate: 'Conversion Rate',
        loyalty_score: 'Loyalty Score'
      }
    }
  },
  conversion: {
    leads: {
      title: 'Set Lead Goal',
      description: 'Set targets for lead generation',
      goalTypes: {
        lead_count: 'Lead Count',
        monthly_leads: 'Monthly Leads',
        lead_quality: 'Lead Quality Score'
      }
    },
    opportunities: {
      title: 'Set Opportunity Goal',
      description: 'Set targets for qualified opportunities',
      goalTypes: {
        opportunity_count: 'Opportunity Count',
        conversion_rate: 'Conversion Rate',
        deal_size: 'Average Deal Size'
      }
    },
    sales: {
      title: 'Set Sales Goal',
      description: 'Set targets for closed sales',
      goalTypes: {
        sales_count: 'Sales Count',
        revenue_target: 'Revenue Target',
        close_rate: 'Close Rate'
      }
    }
  },
  agent: {
    potential: {
      title: 'Set Agent Prospect Goal',
      description: 'Set targets for agent prospecting',
      goalTypes: {
        prospect_count: 'Prospect Count',
        research_target: 'Research Target',
        outreach_goal: 'Outreach Goal'
      }
    },
    meeting_booked: {
      title: 'Set Meeting Goal',
      description: 'Set targets for agent meetings',
      goalTypes: {
        meeting_count: 'Meeting Count',
        booking_rate: 'Booking Rate',
        monthly_meetings: 'Monthly Meetings'
      }
    },
    signed: {
      title: 'Set Signing Goal',
      description: 'Set targets for agent signings',
      goalTypes: {
        signing_count: 'Signing Count',
        close_rate: 'Close Rate',
        contract_value: 'Contract Value'
      }
    }
  }
}

export function AddGoalModal({ section, recordType, onGoalAdded, children }: AddGoalModalProps) {
  const { user } = useAuth()
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [goalDate, setGoalDate] = React.useState<Date>()
  
  const config = (() => {
    const sectionConfig = GOAL_CONFIGS[section]
    if (!sectionConfig || !(recordType in sectionConfig)) return null
    return sectionConfig[recordType as keyof typeof sectionConfig]
  })()
  
  const [formData, setFormData] = React.useState({
    goal_type: '',
    title: '',
    description: '',
    target_value: '',
    current_value: '0',
    target_date: '',
    priority: 'medium'
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsLoading(true)
    try {
      const goalData = {
        user_id: user.id,
        section,
        record_type: recordType,
        goal_type: formData.goal_type,
        title: formData.title,
        description: formData.description,
        target_value: parseFloat(formData.target_value) || 0,
        current_value: parseFloat(formData.current_value) || 0,
        target_date: goalDate ? format(goalDate, 'yyyy-MM-dd') : undefined,
        priority: formData.priority as 'low' | 'medium' | 'high',
        status: 'active' as const
      }

      // Add goal using new goals service
      await GoalsService.addGoal(goalData)
      
      toast.success("Goal added successfully!")
      setOpen(false)
      onGoalAdded?.()
      
      // Reset form
      setFormData({
        goal_type: '',
        title: '',
        description: '',
        target_value: '',
        current_value: '0',
        target_date: '',
        priority: 'medium'
      })
      setGoalDate(undefined)
    } catch (error) {
      console.error('Error adding goal:', error)
      toast.error("Failed to add goal")
    } finally {
      setIsLoading(false)
    }
  }

  if (!config) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <Target className="h-4 w-4" />
            Add Goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
{(config as any)?.title || 'Add Goal'}
          </DialogTitle>
          <DialogDescription>
{(config as any)?.description || 'Set goals for this section'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal_type">Goal Type</Label>
            <Select onValueChange={(value) => handleInputChange('goal_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select goal type" />
              </SelectTrigger>
              <SelectContent>
{Object.entries((config as any)?.goalTypes || {}).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
{String(label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              placeholder="e.g., Complete 3 tracks by March"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_value">Current Value</Label>
              <Input
                id="current_value"
                type="number"
                placeholder="0"
                value={formData.current_value}
                onChange={(e) => handleInputChange('current_value', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_value">Target Value</Label>
              <Input
                id="target_value"
                type="number"
                placeholder="e.g., 3"
                value={formData.target_value}
                onChange={(e) => handleInputChange('target_value', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !goalDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {goalDate ? format(goalDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={goalDate}
                  onSelect={setGoalDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select onValueChange={(value) => handleInputChange('priority', value)} defaultValue="medium">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional details about this goal..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}