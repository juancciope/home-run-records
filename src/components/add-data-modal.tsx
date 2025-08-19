"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Upload, FileText, AlertCircle, CheckCircle2, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-provider"
import { PipelineService } from "@/lib/services/pipeline-service"
import { toast } from "sonner"

interface AddDataModalProps {
  section: 'production' | 'marketing' | 'fan_engagement' | 'conversion' | 'agent'
  recordType: string
  onRecordAdded?: () => void
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const SECTION_CONFIGS = {
  production: {
    title: 'Add Production Record',
    description: 'Add tracks, projects, or releases to your production pipeline',
    recordTypes: {
      unfinished: 'Work in Progress',
      finished: 'Ready to Release',
      released: 'Live Catalog'
    },
    csvTemplate: 'record_type,title,artist_name,description,completion_percentage,release_date,platforms'
  },
  marketing: {
    title: 'Add Marketing Record',
    description: 'Track your marketing reach, engagement, and follower growth',
    recordTypes: {
      reach: 'Total Reach',
      engaged: 'Engaged Audience',
      followers: 'Followers'
    },
    csvTemplate: 'record_type,platform,campaign_name,reach_count,engagement_count,follower_count,date_recorded'
  },
  fan_engagement: {
    title: 'Add Fan Engagement Record',
    description: 'Import fan data from Laylo, email lists, or any other source',
    recordTypes: {
      captured: 'Data Captured',
      fans: 'Active Fans',
      super_fans: 'Super Fans',
      imported_fans: 'Imported Fans'
    },
    csvTemplate: 'record_type,contact_name,contact_email,phone,city,state,country,engagement_level,source,joined_on,rsvp_frequency,presaved'
  },
  conversion: {
    title: 'Add Conversion Record',
    description: 'Track leads, opportunities, and sales in your conversion funnel',
    recordTypes: {
      leads: 'Lead Generation',
      opportunities: 'Qualified Opportunities',
      sales: 'Closed Sales'
    },
    csvTemplate: 'record_type,contact_name,contact_email,deal_value,probability,stage,source,notes'
  },
  agent: {
    title: 'Add Agent Record',
    description: 'Manage your agent pipeline and representation network',
    recordTypes: {
      potential: 'Potential Agents',
      meeting_booked: 'Meetings Booked',
      signed: 'Agents Signed'
    },
    csvTemplate: 'record_type,agent_name,agency_name,contact_email,specialization,meeting_date,commission_rate'
  }
}

export function AddDataModal({ section, recordType, onRecordAdded, children, open: externalOpen, onOpenChange: externalOnOpenChange }: AddDataModalProps) {
  const { user } = useAuth()
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  // Use external state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange || setInternalOpen
  const [csvData, setCsvData] = React.useState('')
  const [importResults, setImportResults] = React.useState<{ success: number; errors: string[] } | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const config = SECTION_CONFIGS[section]
  const [formData, setFormData] = React.useState<Record<string, any>>({
    record_type: recordType,
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsLoading(true)
    try {
      const recordWithUserId = { ...formData, user_id: user.id }
      
      let result = null
      switch (section) {
        case 'production':
          result = await PipelineService.addProductionRecord(recordWithUserId as any)
          break
        case 'marketing':
          result = await PipelineService.addMarketingRecord(recordWithUserId as any)
          break
        case 'fan_engagement':
          result = await PipelineService.addFanEngagementRecord(recordWithUserId as any)
          break
        case 'conversion':
          result = await PipelineService.addConversionRecord(recordWithUserId as any)
          break
        case 'agent':
          result = await PipelineService.addAgentRecord(recordWithUserId as any)
          break
      }

      if (result) {
        toast.success('Record added successfully!')
        setFormData({ record_type: recordType })
        setOpen(false)
        onRecordAdded?.()
      } else {
        toast.error('Failed to add record')
      }
    } catch (error) {
      console.error('Error adding record:', error)
      toast.error('Error adding record')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCSVImport = async () => {
    if (!user?.id || !csvData.trim()) return

    setIsLoading(true)
    try {
      let processedCsvData = csvData

      // For production section, detect if it's a simple song list
      if (section === 'production' && !csvData.includes('record_type')) {
        // Check if it's a simple song list (with or without completion percentages)
        const songLines = csvData.trim().split('\n').filter(line => line.trim())
        const firstLine = songLines[0] || ''
        
        // If no commas OR commas only for completion percentage format
        const isSimpleList = !csvData.includes(',') || 
          firstLine.split(',').length === 2 && firstLine.includes('%')
        
        if (isSimpleList) {
          // Convert song list to CSV format
          const csvHeader = config.csvTemplate
          const csvRows = songLines.map(line => {
            const trimmedLine = line.trim()
            let songTitle = trimmedLine
            let completionPercentage = recordType === 'unfinished' ? '0' : '100'
            
            // Check if line has format: "song title, XX%"
            if (trimmedLine.includes(',') && trimmedLine.includes('%')) {
              const parts = trimmedLine.split(',')
              if (parts.length === 2) {
                songTitle = parts[0].trim()
                const percentPart = parts[1].trim()
                const percentMatch = percentPart.match(/(\d+)%?/)
                if (percentMatch) {
                  completionPercentage = percentMatch[1]
                }
              }
            }
            
            return `${recordType},${songTitle},,,${completionPercentage},,`
          })
          processedCsvData = csvHeader + '\n' + csvRows.join('\n')
        }
      }

      console.log('Importing CSV data for section:', section)
      console.log('Record type from card context:', recordType)
      console.log('First 500 chars of data:', processedCsvData.substring(0, 500))
      
      const results = await PipelineService.batchImportCSV(user.id, processedCsvData, section, recordType)
      setImportResults(results)
      
      if (results.success > 0) {
        toast.success(`Successfully imported ${results.success} records!`)
        onRecordAdded?.()
      }
      
      if (results.errors.length > 0) {
        console.error('Import errors:', results.errors)
        toast.error(`${results.errors.length} records failed to import - check console for details`)
      }
    } catch (error) {
      console.error('Error importing CSV:', error)
      toast.error('Error importing CSV data - check console for details')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadCSVTemplate = async () => {
    try {
      const response = await fetch(`/api/import/template?type=${section}`)
      if (response.ok) {
        const csvContent = await response.text()
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${section}_import_template.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('Template downloaded successfully!')
      } else {
        toast.error('Failed to download template')
      }
    } catch (error) {
      console.error('Error downloading template:', error)
      toast.error('Error downloading template')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setCsvData(content)
        toast.success('File loaded successfully!')
      }
      reader.onerror = () => {
        toast.error('Failed to read file')
      }
      reader.readAsText(file)
    }
  }

  const renderQuickForm = () => {
    switch (section) {
      case 'production':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quick_title">Title*</Label>
                <Input
                  id="quick_title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Track name"
                />
              </div>
              <div>
                <Label htmlFor="quick_completion">Completion %</Label>
                <Input
                  id="quick_completion"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.completion_percentage || 0}
                  onChange={(e) => handleInputChange('completion_percentage', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        )
      case 'marketing':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quick_platform">Platform</Label>
                <Input
                  id="quick_platform"
                  value={formData.platform || ''}
                  onChange={(e) => handleInputChange('platform', e.target.value)}
                  placeholder="e.g., Instagram"
                />
              </div>
              {recordType === 'reach' && (
                <div>
                  <Label htmlFor="quick_reach">Reach Count</Label>
                  <Input
                    id="quick_reach"
                    type="number"
                    value={formData.reach_count || 0}
                    onChange={(e) => handleInputChange('reach_count', parseInt(e.target.value))}
                  />
                </div>
              )}
              {recordType === 'engaged' && (
                <div>
                  <Label htmlFor="quick_engagement">Engagement Count</Label>
                  <Input
                    id="quick_engagement"
                    type="number"
                    value={formData.engagement_count || 0}
                    onChange={(e) => handleInputChange('engagement_count', parseInt(e.target.value))}
                  />
                </div>
              )}
              {recordType === 'followers' && (
                <div>
                  <Label htmlFor="quick_followers">Follower Count</Label>
                  <Input
                    id="quick_followers"
                    type="number"
                    value={formData.follower_count || 0}
                    onChange={(e) => handleInputChange('follower_count', parseInt(e.target.value))}
                  />
                </div>
              )}
            </div>
          </div>
        )
      case 'fan_engagement':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quick_fan_name">Name</Label>
                <Input
                  id="quick_fan_name"
                  value={formData.contact_info?.name || ''}
                  onChange={(e) => handleInputChange('contact_info', { 
                    ...formData.contact_info, 
                    name: e.target.value 
                  })}
                  placeholder="Fan's name"
                />
              </div>
              <div>
                <Label htmlFor="quick_engagement_score">Score (1-100)</Label>
                <Input
                  id="quick_engagement_score"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.engagement_score || 50}
                  onChange={(e) => handleInputChange('engagement_score', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        )
      case 'conversion':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quick_contact">Contact Name*</Label>
                <Input
                  id="quick_contact"
                  value={formData.contact_name || ''}
                  onChange={(e) => handleInputChange('contact_name', e.target.value)}
                  placeholder="Lead name"
                />
              </div>
              <div>
                <Label htmlFor="quick_deal_value">Deal Value ($)</Label>
                <Input
                  id="quick_deal_value"
                  type="number"
                  step="0.01"
                  value={formData.deal_value || 0}
                  onChange={(e) => handleInputChange('deal_value', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        )
      case 'agent':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quick_agent_name">Agent Name*</Label>
                <Input
                  id="quick_agent_name"
                  value={formData.agent_name || ''}
                  onChange={(e) => handleInputChange('agent_name', e.target.value)}
                  placeholder="Agent's name"
                />
              </div>
              {recordType === 'signed' && (
                <div>
                  <Label htmlFor="quick_commission">Commission %</Label>
                  <Input
                    id="quick_commission"
                    type="number"
                    step="0.01"
                    value={formData.commission_rate || 15}
                    onChange={(e) => handleInputChange('commission_rate', parseFloat(e.target.value))}
                  />
                </div>
              )}
              {recordType !== 'signed' && (
                <div>
                  <Label htmlFor="quick_agency">Agency</Label>
                  <Input
                    id="quick_agency"
                    value={formData.agency_name || ''}
                    onChange={(e) => handleInputChange('agency_name', e.target.value)}
                    placeholder="Agency name"
                  />
                </div>
              )}
            </div>
          </div>
        )
      default:
        return <div>Quick form not implemented for this section</div>
    }
  }

  const renderManualForm = () => {
    switch (section) {
      case 'production':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Track/Project Title*</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter track or project title"
              />
            </div>
            <div>
              <Label htmlFor="artist_name">Artist Name</Label>
              <Input
                id="artist_name"
                value={formData.artist_name || ''}
                onChange={(e) => handleInputChange('artist_name', e.target.value)}
                placeholder="Artist or band name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the project"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="completion_percentage">Completion %</Label>
              <Input
                id="completion_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.completion_percentage || 0}
                onChange={(e) => handleInputChange('completion_percentage', parseInt(e.target.value))}
              />
            </div>
            {recordType === 'released' && (
              <div>
                <Label htmlFor="release_date">Release Date</Label>
                <Input
                  id="release_date"
                  type="date"
                  value={formData.release_date || ''}
                  onChange={(e) => handleInputChange('release_date', e.target.value)}
                />
              </div>
            )}
          </div>
        )
      
      case 'marketing':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Input
                id="platform"
                value={formData.platform || ''}
                onChange={(e) => handleInputChange('platform', e.target.value)}
                placeholder="e.g., Instagram, TikTok, Spotify"
              />
            </div>
            <div>
              <Label htmlFor="campaign_name">Campaign Name</Label>
              <Input
                id="campaign_name"
                value={formData.campaign_name || ''}
                onChange={(e) => handleInputChange('campaign_name', e.target.value)}
                placeholder="Name of the marketing campaign"
              />
            </div>
            {recordType === 'reach' && (
              <div>
                <Label htmlFor="reach_count">Reach Count</Label>
                <Input
                  id="reach_count"
                  type="number"
                  value={formData.reach_count || 0}
                  onChange={(e) => handleInputChange('reach_count', parseInt(e.target.value))}
                  placeholder="Number of people reached"
                />
              </div>
            )}
            {recordType === 'engaged' && (
              <div>
                <Label htmlFor="engagement_count">Engagement Count</Label>
                <Input
                  id="engagement_count"
                  type="number"
                  value={formData.engagement_count || 0}
                  onChange={(e) => handleInputChange('engagement_count', parseInt(e.target.value))}
                  placeholder="Number of engagements"
                />
              </div>
            )}
            {recordType === 'followers' && (
              <div>
                <Label htmlFor="follower_count">Follower Count</Label>
                <Input
                  id="follower_count"
                  type="number"
                  value={formData.follower_count || 0}
                  onChange={(e) => handleInputChange('follower_count', parseInt(e.target.value))}
                  placeholder="Number of new followers"
                />
              </div>
            )}
            <div>
              <Label htmlFor="date_recorded">Date</Label>
              <Input
                id="date_recorded"
                type="date"
                value={formData.date_recorded || new Date().toISOString().split('T')[0]}
                onChange={(e) => handleInputChange('date_recorded', e.target.value)}
              />
            </div>
          </div>
        )

      case 'fan_engagement':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="contact_name">Contact Name</Label>
              <Input
                id="contact_name"
                value={formData.contact_info?.name || ''}
                onChange={(e) => handleInputChange('contact_info', { 
                  ...formData.contact_info, 
                  name: e.target.value 
                })}
                placeholder="Fan's name"
              />
            </div>
            <div>
              <Label htmlFor="contact_email">Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_info?.email || ''}
                onChange={(e) => handleInputChange('contact_info', { 
                  ...formData.contact_info, 
                  email: e.target.value 
                })}
                placeholder="Fan's email address"
              />
            </div>
            <div>
              <Label htmlFor="engagement_level">Engagement Level</Label>
              <Select
                value={formData.engagement_level}
                onValueChange={(value) => handleInputChange('engagement_level', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select engagement level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="captured">Captured</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="super">Super Fan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source || ''}
                onChange={(e) => handleInputChange('source', e.target.value)}
                placeholder="Where did you capture this fan?"
              />
            </div>
            <div>
              <Label htmlFor="engagement_score">Engagement Score (1-100)</Label>
              <Input
                id="engagement_score"
                type="number"
                min="1"
                max="100"
                value={formData.engagement_score || 50}
                onChange={(e) => handleInputChange('engagement_score', parseInt(e.target.value))}
              />
            </div>
          </div>
        )

      case 'conversion':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="contact_name">Contact Name*</Label>
              <Input
                id="contact_name"
                value={formData.contact_name || ''}
                onChange={(e) => handleInputChange('contact_name', e.target.value)}
                placeholder="Lead or customer name"
              />
            </div>
            <div>
              <Label htmlFor="contact_email">Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email || ''}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="Contact email"
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Phone</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone || ''}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="Contact phone number"
              />
            </div>
            <div>
              <Label htmlFor="deal_value">Deal Value ($)</Label>
              <Input
                id="deal_value"
                type="number"
                step="0.01"
                value={formData.deal_value || 0}
                onChange={(e) => handleInputChange('deal_value', parseFloat(e.target.value))}
                placeholder="Potential or actual deal value"
              />
            </div>
            <div>
              <Label htmlFor="probability">Probability (0-1)</Label>
              <Input
                id="probability"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.probability || 0.5}
                onChange={(e) => handleInputChange('probability', parseFloat(e.target.value))}
                placeholder="0.5 = 50% chance"
              />
            </div>
            <div>
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source || ''}
                onChange={(e) => handleInputChange('source', e.target.value)}
                placeholder="Where did this lead come from?"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this contact"
                rows={3}
              />
            </div>
          </div>
        )

      case 'agent':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="agent_name">Agent Name*</Label>
              <Input
                id="agent_name"
                value={formData.agent_name || ''}
                onChange={(e) => handleInputChange('agent_name', e.target.value)}
                placeholder="Agent's full name"
              />
            </div>
            <div>
              <Label htmlFor="agency_name">Agency Name</Label>
              <Input
                id="agency_name"
                value={formData.agency_name || ''}
                onChange={(e) => handleInputChange('agency_name', e.target.value)}
                placeholder="Agency or company name"
              />
            </div>
            <div>
              <Label htmlFor="contact_email">Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email || ''}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="Agent's email"
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Phone</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone || ''}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="Agent's phone number"
              />
            </div>
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={formData.specialization?.join(', ') || ''}
                onChange={(e) => handleInputChange('specialization', e.target.value.split(', ').filter(s => s.trim()))}
                placeholder="e.g., Music, Film, Brand Partnerships"
              />
            </div>
            {recordType === 'meeting_booked' && (
              <div>
                <Label htmlFor="meeting_date">Meeting Date</Label>
                <Input
                  id="meeting_date"
                  type="datetime-local"
                  value={formData.meeting_date || ''}
                  onChange={(e) => handleInputChange('meeting_date', e.target.value)}
                />
              </div>
            )}
            {recordType === 'signed' && (
              <>
                <div>
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    step="0.01"
                    value={formData.commission_rate || 15}
                    onChange={(e) => handleInputChange('commission_rate', parseFloat(e.target.value))}
                    placeholder="e.g., 15 for 15%"
                  />
                </div>
                <div>
                  <Label htmlFor="contract_value">Contract Value ($)</Label>
                  <Input
                    id="contract_value"
                    type="number"
                    step="0.01"
                    value={formData.contract_value || 0}
                    onChange={(e) => handleInputChange('contract_value', parseFloat(e.target.value))}
                    placeholder="Total contract value"
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this agent"
                rows={3}
              />
            </div>
          </div>
        )

      default:
        return <div>Form not implemented for this section</div>
    }
  }

  // Render the dialog content
  const dialogContent = (
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
      <DialogHeader className="pb-4">
        <DialogTitle className="flex items-center gap-2 text-lg">
          <Plus className="h-5 w-5 text-primary" />
          {config.title}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {config.description}
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="quick" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="quick" className="flex items-center gap-1 text-xs px-2">
            <Plus className="h-3.5 w-3.5" />
            Quick Add
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-1 text-xs px-2">
            <FileText className="h-3.5 w-3.5" />
            Full Form
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex items-center gap-1 text-xs px-2">
            <Upload className="h-3.5 w-3.5" />
            Bulk Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="flex-1 flex flex-col mt-0">
          <form onSubmit={handleManualSubmit} className="flex-1 flex flex-col">
            <div className="flex-1">
              <div className="mb-4">
                <Label className="text-sm font-medium">Record Type</Label>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {config.recordTypes[recordType as keyof typeof config.recordTypes]}
                  </Badge>
                </div>
              </div>
              <Separator className="mb-4" />
              {renderQuickForm()}
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="min-w-[100px]">
                {isLoading ? 'Adding...' : 'Add Record'}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="manual" className="flex-1 flex flex-col mt-0">
          <form onSubmit={handleManualSubmit} className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Record Type</Label>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {config.recordTypes[recordType as keyof typeof config.recordTypes]}
                    </Badge>
                  </div>
                </div>
                <Separator />
                {renderManualForm()}
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="min-w-[100px]">
                {isLoading ? 'Adding...' : 'Add Record'}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="csv" className="flex-1 flex flex-col mt-0">
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Bulk Import Data</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs px-3 py-1"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload CSV
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadCSVTemplate}
                    className="text-xs px-3 py-1"
                  >
                    Download Template
                  </Button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder={section === 'production' 
                  ? `CSV Format:\n${config.csvTemplate}\n\nOR Song List:\nJust paste a list of song names, one per line:\nSong Title 1\nSong Title 2\nSong Title 3\n\nYou can also use the "Upload CSV" button above to select a file.`
                  : `Paste your CSV data here or use the "Upload CSV" button above.\n\nExpected format:\n${config.csvTemplate}`}
                rows={10}
                className="font-mono text-sm resize-none"
              />
            </div>

            {importResults && (
              <div className="space-y-2 mt-4 p-3 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Successfully imported: {importResults.success}</span>
                </div>
                {importResults.errors.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">Errors: {importResults.errors.length}</span>
                    </div>
                    <ScrollArea className="max-h-24">
                      <div className="space-y-1">
                        {importResults.errors.map((error, index) => (
                          <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            {error}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCSVImport}
                disabled={isLoading || !csvData.trim()}
                className="min-w-[100px]"
              >
                {isLoading ? 'Importing...' : 'Import Data'}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  );

  // If external state is provided, render children outside dialog
  if (externalOpen !== undefined) {
    return (
      <>
        {children}
        <Dialog open={open} onOpenChange={setOpen}>
          {dialogContent}
        </Dialog>
      </>
    );
  }

  // Default behavior with internal state and DialogTrigger
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  )
}