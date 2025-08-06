"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp,
  Users,
  Heart,
  DollarSign,
  Package,
  Megaphone,
  Target,
} from "lucide-react"
import { useArtist } from "@/contexts/artist-context"

// Metric card component with clean design
interface MetricCardProps {
  title: string
  value: number | string
  change?: string
  icon: React.ElementType
  trend?: "up" | "down" | "neutral"
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, trend = "neutral" }) => {
  const trendColor = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
          {change && (
            <p className={`text-xs ${trendColor}`}>
              {change}
            </p>
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
      <div className="p-6 space-y-6">
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
    <div className="flex-1 space-y-4 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your music business performance.
          </p>
        </div>
      </div>

      {/* Main metrics grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={`$${(pipelineMetrics?.conversion?.revenue || 12450).toLocaleString()}`}
          change="+20.1% from last month"
          icon={DollarSign}
          trend="up"
        />
        <MetricCard
          title="Followers"
          value={marketingData.followers}
          change="+180.1% from last month"
          icon={Users}
          trend="up"
        />
        <MetricCard
          title="Sales"
          value={conversionData.sales}
          change="+19% from last month"
          icon={Target}
          trend="up"
        />
        <MetricCard
          title="Active Projects"
          value={productionData.unfinished + productionData.finished}
          change="+2 from last week"
          icon={Package}
          trend="up"
        />
      </div>

      {/* Detailed cards grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Production Pipeline</CardTitle>
            <CardDescription>
              Track your creative output from idea to release.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium leading-none">Unfinished</p>
                <p className="text-2xl font-bold">{productionData.unfinished}</p>
                <p className="text-xs text-muted-foreground">Ideas & demos</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium leading-none">Finished</p>
                <p className="text-2xl font-bold">{productionData.finished}</p>
                <p className="text-xs text-muted-foreground">Ready to release</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium leading-none">Released</p>
                <p className="text-2xl font-bold">{productionData.released}</p>
                <p className="text-xs text-muted-foreground">Live tracks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Fan Engagement</CardTitle>
            <CardDescription>
              Building deeper connections with your audience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Heart className="h-4 w-4" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Super Fans</p>
                  <p className="text-sm text-muted-foreground">{fanEngagementData.superFans}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Users className="h-4 w-4" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Total Fans</p>
                  <p className="text-sm text-muted-foreground">{fanEngagementData.fans.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Megaphone className="h-4 w-4" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Email List</p>
                  <p className="text-sm text-muted-foreground">{fanEngagementData.capturedData.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom grid with marketing and conversion data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Marketing Reach</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingData.totalReach.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {marketingData.engaged.toLocaleString()} engaged (13% rate)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Conversion Pipeline</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionData.leads}</div>
            <p className="text-xs text-muted-foreground">
              {conversionData.opportunities} opportunities → {conversionData.sales} sales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+24%</div>
            <p className="text-xs text-muted-foreground">
              Overall growth rate this quarter
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}