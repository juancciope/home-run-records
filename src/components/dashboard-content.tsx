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
  Music,
  Star,
  Zap,
} from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis,
  Pie,
  PieChart,
  Cell
} from "recharts"
import { useArtist } from "@/contexts/artist-context"

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

  // Chart configurations following Shadcn/UI patterns
  const productionChartConfig = {
    unfinished: {
      label: "Unfinished",
      color: "hsl(var(--chart-1))",
    },
    finished: {
      label: "Finished", 
      color: "hsl(var(--chart-2))",
    },
    released: {
      label: "Released",
      color: "hsl(var(--chart-3))",
    },
  }

  const marketingChartConfig = {
    totalReach: {
      label: "Total Reach",
      color: "hsl(var(--chart-1))",
    },
    engaged: {
      label: "Engaged",
      color: "hsl(var(--chart-2))",
    },
    followers: {
      label: "Followers",
      color: "hsl(var(--chart-3))",
    },
  }

  const fanEngagementChartConfig = {
    capturedData: {
      label: "Captured Data",
      color: "hsl(var(--chart-1))",
    },
    fans: {
      label: "Fans",
      color: "hsl(var(--chart-2))",
    },
    superFans: {
      label: "Super Fans",
      color: "hsl(var(--chart-3))",
    },
  }

  const conversionChartConfig = {
    leads: {
      label: "Leads",
      color: "hsl(var(--chart-1))",
    },
    opportunities: {
      label: "Opportunities", 
      color: "hsl(var(--chart-2))",
    },
    sales: {
      label: "Sales",
      color: "hsl(var(--chart-3))",
    },
  }

  // Chart data following Shadcn/UI patterns
  const productionChartData = [
    { stage: "Unfinished", value: productionData.unfinished, fill: "var(--color-unfinished)" },
    { stage: "Finished", value: productionData.finished, fill: "var(--color-finished)" },
    { stage: "Released", value: productionData.released, fill: "var(--color-released)" },
  ]

  const marketingTrendData = [
    { month: "January", totalReach: 186000, engaged: 24000, followers: 18000 },
    { month: "February", totalReach: 205000, engaged: 26000, followers: 19200 },
    { month: "March", totalReach: 237000, engaged: 30800, followers: 19800 },
    { month: "April", totalReach: 273000, engaged: 35500, followers: 20400 },
    { month: "May", totalReach: 309000, engaged: 40200, followers: 20800 },
    { month: "June", totalReach: marketingData.totalReach, engaged: marketingData.engaged, followers: marketingData.followers },
  ]

  const fanEngagementTrendData = [
    { month: "January", capturedData: 6500, fans: 2400, superFans: 120 },
    { month: "February", capturedData: 7200, fans: 2650, superFans: 125 },
    { month: "March", capturedData: 7600, fans: 2800, superFans: 132 },
    { month: "April", capturedData: 7950, fans: 2920, superFans: 138 },
    { month: "May", capturedData: 8200, fans: 3050, superFans: 144 },
    { month: "June", capturedData: fanEngagementData.capturedData, fans: fanEngagementData.fans, superFans: fanEngagementData.superFans },
  ]

  const conversionBarData = [
    { stage: "Leads", value: conversionData.leads, fill: "var(--color-leads)" },
    { stage: "Opportunities", value: conversionData.opportunities, fill: "var(--color-opportunities)" },
    { stage: "Sales", value: conversionData.sales, fill: "var(--color-sales)" },
  ]

  if (isDashboardLoading || isLoadingMetrics) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-1 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[400px] bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(pipelineMetrics?.conversion?.revenue || 12450).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 inline mr-1" />
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingData.totalReach.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 inline mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Fans</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fanEngagementData.superFans}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 inline mr-1" />
              +4.2% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productionData.unfinished + productionData.finished}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 inline mr-1" />
              +2 from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Business Pipeline Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Production Pipeline - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Production Pipeline</CardTitle>
            <CardDescription>
              Current distribution of your creative output
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={productionChartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={productionChartData}
                  dataKey="value"
                  nameKey="stage"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <Cell fill="var(--color-unfinished)" />
                  <Cell fill="var(--color-finished)" />
                  <Cell fill="var(--color-released)" />
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[--color-unfinished]"></div>
                <span className="text-sm">Unfinished: {productionData.unfinished}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[--color-finished]"></div>
                <span className="text-sm">Finished: {productionData.finished}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[--color-released]"></div>
                <span className="text-sm">Released: {productionData.released}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marketing Reach - Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Marketing Reach Trend</CardTitle>
            <CardDescription>
              Showing growth across all marketing channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={marketingChartConfig} className="min-h-[250px]">
              <AreaChart
                accessibilityLayer
                data={marketingTrendData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <defs>
                  <linearGradient id="fillTotalReach" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-totalReach)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-totalReach)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillEngaged" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-engaged)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-engaged)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="engaged"
                  type="natural"
                  fill="url(#fillEngaged)"
                  fillOpacity={0.4}
                  stroke="var(--color-engaged)"
                  stackId="a"
                />
                <Area
                  dataKey="totalReach"
                  type="natural"
                  fill="url(#fillTotalReach)"
                  fillOpacity={0.4}
                  stroke="var(--color-totalReach)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Fan Engagement - Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Fan Engagement Pipeline</CardTitle>
            <CardDescription>
              Building deeper connections over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={fanEngagementChartConfig} className="min-h-[250px]">
              <AreaChart
                accessibilityLayer
                data={fanEngagementTrendData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient id="fillCapturedData" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-capturedData)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-capturedData)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillFans" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-fans)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-fans)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillSuperFans" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-superFans)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-superFans)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="superFans"
                  type="natural"
                  fill="url(#fillSuperFans)"
                  fillOpacity={0.4}
                  stroke="var(--color-superFans)"
                />
                <Area
                  dataKey="fans"
                  type="natural"
                  fill="url(#fillFans)"
                  fillOpacity={0.4}
                  stroke="var(--color-fans)"
                />
                <Area
                  dataKey="capturedData"
                  type="natural"
                  fill="url(#fillCapturedData)"
                  fillOpacity={0.4}
                  stroke="var(--color-capturedData)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Conversion Pipeline - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Pipeline</CardTitle>
            <CardDescription>
              Revenue generation funnel performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={conversionChartConfig} className="min-h-[250px]">
              <BarChart
                accessibilityLayer
                data={conversionBarData}
                margin={{
                  top: 20,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="stage"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="value" fill="var(--color-leads)" radius={8} />
              </BarChart>
            </ChartContainer>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{conversionData.leads}</div>
                <p className="text-xs text-muted-foreground">Leads</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{conversionData.opportunities}</div>
                <p className="text-xs text-muted-foreground">Opportunities</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{conversionData.sales}</div>
                <p className="text-xs text-muted-foreground">Sales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Business Health Summary</CardTitle>
          <CardDescription>
            Overall performance across all pipeline realms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Production Health</span>
              </div>
              <p className="text-2xl font-bold text-green-600">Good</p>
              <p className="text-xs text-muted-foreground">
                {Math.round((productionData.finished / (productionData.unfinished + productionData.finished)) * 100)}% completion rate
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-sm font-medium">Reach Efficiency</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">13.3%</p>
              <p className="text-xs text-muted-foreground">
                Engagement rate
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-sm font-medium">Fan Conversion</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">4.7%</p>
              <p className="text-xs text-muted-foreground">
                To super fans
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-sm font-medium">Sales Conversion</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">37.5%</p>
              <p className="text-xs text-muted-foreground">
                Opportunities to sales
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}