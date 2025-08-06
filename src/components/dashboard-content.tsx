"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Users,
  Heart,
  DollarSign,
  Package,
  Megaphone,
  Target,
  Music,
  ArrowRight,
  Star,
  Zap,
} from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { useArtist } from "@/contexts/artist-context"

// Pipeline stage component following Shadcn/UI patterns
interface PipelineStageProps {
  title: string
  value: number
  icon: React.ElementType
  description: string
  isLast?: boolean
  conversionRate?: number
  trend?: "up" | "down" | "neutral"
}

const PipelineStage: React.FC<PipelineStageProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  isLast = false,
  conversionRate,
  trend = "neutral"
}) => {
  const trendColor = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"
  
  return (
    <div className="flex items-center gap-4">
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
          {conversionRate && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs">
                <span>Conversion</span>
                <span className={trendColor}>{conversionRate}%</span>
              </div>
              <Progress value={conversionRate} className="mt-1 h-1" />
            </div>
          )}
        </CardContent>
      </Card>
      {!isLast && (
        <ArrowRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
      )}
    </div>
  )
}

// Business realm card component
interface BusinessRealmCardProps {
  title: string
  description: string
  icon: React.ElementType
  stages: {
    title: string
    value: number
    icon: React.ElementType
    description: string
    conversionRate?: number
    trend?: "up" | "down" | "neutral"
  }[]
  chartData?: { name: string; value: number }[]
}

const BusinessRealmCard: React.FC<BusinessRealmCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  stages,
  chartData 
}) => {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-md">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <Button size="sm">
            View Details
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-center gap-4">
            {stages.map((stage, index) => (
              <PipelineStage
                key={stage.title}
                title={stage.title}
                value={stage.value}
                icon={stage.icon}
                description={stage.description}
                conversionRate={stage.conversionRate}
                trend={stage.trend}
                isLast={index === stages.length - 1}
              />
            ))}
          </div>
          {chartData && chartData.length > 0 && (
            <div className="mt-4">
              <ChartContainer
                config={{
                  value: {
                    label: "Value",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[200px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="value" 
                      fill="var(--color-value)"
                      radius={4}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardContent() {
  const { user, isDashboardLoading } = useArtist();
  const [pipelineMetrics, setPipelineMetrics] = React.useState<{
    production: { unfinished: number; finished: number; released: number };
    marketing: { totalReach: number; engagedAudience: number; totalFollowers: number; youtubeSubscribers: number };
    fanEngagement: { capturedData: number; fans: number; superFans: number };
    conversion: { leads: number; opportunities: number; sales: number; revenue: number };
  } | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = React.useState(true);

  const loadPipelineMetrics = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingMetrics(true);
      const { ArtistService } = await import('@/lib/services/artist-service');
      const metrics = await ArtistService.getPipelineMetrics(user.id);
      setPipelineMetrics(metrics);
    } catch (error) {
      console.error('Error loading pipeline metrics:', error);
    } finally {
      setIsLoadingMetrics(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    if (user?.id) {
      loadPipelineMetrics();
    }
  }, [user?.id, loadPipelineMetrics]);

  // Use real data if available, otherwise fall back to mock data
  const productionData = pipelineMetrics?.production || {
    unfinished: 12,
    finished: 5,
    released: 28,
  };

  const marketingData = {
    totalReach: pipelineMetrics?.marketing?.totalReach || 342000,
    engaged: pipelineMetrics?.marketing?.engagedAudience || 45600,
    followers: pipelineMetrics?.marketing?.totalFollowers || 21200,
  };

  const fanEngagementData = pipelineMetrics?.fanEngagement || {
    capturedData: 8500,
    fans: 3200,
    superFans: 150,
  };

  const conversionData = pipelineMetrics?.conversion || {
    leads: 450,
    opportunities: 120,
    sales: 45,
  };

  if (isDashboardLoading || isLoadingMetrics) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-1 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(pipelineMetrics?.conversion?.revenue || 12450).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingData.totalReach.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Fans</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fanEngagementData.superFans}</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productionData.unfinished + productionData.finished}</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Business Pipeline Realms */}
      <div className="space-y-6">
        {/* 1. Production Pipeline */}
        <BusinessRealmCard
          title="Production Pipeline"
          description="Your product, your releases - from idea to market"
          icon={Package}
          stages={[
            {
              title: "Unfinished",
              value: productionData.unfinished,
              icon: Music,
              description: "Ideas & demos in progress",
              conversionRate: 42,
              trend: "up"
            },
            {
              title: "Finished",
              value: productionData.finished,
              icon: Target,
              description: "Ready for release",
              conversionRate: 85,
              trend: "up"
            },
            {
              title: "Released",
              value: productionData.released,
              icon: Zap,
              description: "Live in market",
              trend: "up"
            }
          ]}
          chartData={[
            { name: "Unfinished", value: productionData.unfinished },
            { name: "Finished", value: productionData.finished },
            { name: "Released", value: productionData.released }
          ]}
        />

        {/* 2. Marketing Funnel */}
        <BusinessRealmCard
          title="Marketing Reach"
          description="Aggregate audience reach to engaged followers"
          icon={Megaphone}
          stages={[
            {
              title: "Total Reach",
              value: marketingData.totalReach,
              icon: Users,
              description: "Aggregate audience across platforms",
              conversionRate: 13,
              trend: "up"
            },
            {
              title: "Engaged Audience",
              value: marketingData.engaged,
              icon: Heart,
              description: "Active listeners & viewers",
              conversionRate: 6,
              trend: "up"
            },
            {
              title: "Followers",
              value: marketingData.followers,
              icon: Star,
              description: "Loyal subscriber base",
              trend: "up"
            }
          ]}
          chartData={[
            { name: "Reach", value: Math.round(marketingData.totalReach / 1000) },
            { name: "Engaged", value: Math.round(marketingData.engaged / 1000) },
            { name: "Followers", value: Math.round(marketingData.followers / 1000) }
          ]}
        />
        
        {/* 3. Fan Engagement Pipeline */}
        <BusinessRealmCard
          title="Fan Engagement Pipeline"
          description="Building deeper connections with your audience"
          icon={Heart}
          stages={[
            {
              title: "Captured Data",
              value: fanEngagementData.capturedData,
              icon: Users,
              description: "Email list & contact info",
              conversionRate: 38,
              trend: "up"
            },
            {
              title: "Fans",
              value: fanEngagementData.fans,
              icon: Heart,
              description: "Regular supporters",
              conversionRate: 5,
              trend: "up"
            },
            {
              title: "Super Fans",
              value: fanEngagementData.superFans,
              icon: Star,
              description: "VIP community members",
              trend: "up"
            }
          ]}
          chartData={[
            { name: "Data", value: Math.round(fanEngagementData.capturedData / 100) },
            { name: "Fans", value: Math.round(fanEngagementData.fans / 100) },
            { name: "Super", value: fanEngagementData.superFans }
          ]}
        />
        
        {/* 4. Conversion Funnel */}
        <BusinessRealmCard
          title="Conversion Pipeline"
          description="Revenue generation from leads to sales"
          icon={DollarSign}
          stages={[
            {
              title: "Leads",
              value: conversionData.leads,
              icon: Users,
              description: "Interested potential buyers",
              conversionRate: 27,
              trend: "up"
            },
            {
              title: "Opportunities",
              value: conversionData.opportunities,
              icon: Target,
              description: "Active deals in progress",
              conversionRate: 38,
              trend: "up"
            },
            {
              title: "Sales",
              value: conversionData.sales,
              icon: DollarSign,
              description: "Closed won deals",
              trend: "up"
            }
          ]}
          chartData={[
            { name: "Leads", value: conversionData.leads },
            { name: "Opportunities", value: conversionData.opportunities },
            { name: "Sales", value: conversionData.sales }
          ]}
        />
      </div>

      {/* Summary insights */}
      <Card>
        <CardHeader>
          <CardTitle>Business Health Summary</CardTitle>
          <CardDescription>Key insights across all pipeline realms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Production Health</span>
              </div>
              <p className="text-2xl font-bold text-green-600">Good</p>
              <p className="text-xs text-muted-foreground">42% completion rate</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-sm font-medium">Reach Efficiency</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">13%</p>
              <p className="text-xs text-muted-foreground">Engagement rate</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-sm font-medium">Fan Conversion</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">5%</p>
              <p className="text-xs text-muted-foreground">To super fans</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-sm font-medium">Sales Close Rate</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">38%</p>
              <p className="text-xs text-muted-foreground">Revenue: ${(pipelineMetrics?.conversion?.revenue || 12450).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}