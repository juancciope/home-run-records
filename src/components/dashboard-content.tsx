"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp,
  Users,
  Heart,
  DollarSign,
  Package,
  Megaphone,
  Target,
  Star,
} from "lucide-react"
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Cell,
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

  // Strategic chart configurations optimized for business insights
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
  } satisfies ChartConfig

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
  } satisfies ChartConfig

  const fanEngagementChartConfig = {
    conversionRate: {
      label: "Conversion Rate",
      color: "hsl(var(--chart-1))",
    },
    superFanRate: {
      label: "Super Fan Rate",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig

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
  } satisfies ChartConfig

  // Strategic data transformations for actionable insights
  const productionEfficiencyData = [
    {
      stage: "Unfinished",
      count: productionData.unfinished,
      percentage: Math.round((productionData.unfinished / (productionData.unfinished + productionData.finished + productionData.released)) * 100),
      fill: "var(--color-unfinished)"
    },
    {
      stage: "Finished",
      count: productionData.finished,
      percentage: Math.round((productionData.finished / (productionData.unfinished + productionData.finished + productionData.released)) * 100),
      fill: "var(--color-finished)"
    },
    {
      stage: "Released",
      count: productionData.released,
      percentage: Math.round((productionData.released / (productionData.unfinished + productionData.finished + productionData.released)) * 100),
      fill: "var(--color-released)"
    },
  ]

  const marketingTrendData = [
    { month: "Jan", totalReach: 186000, engaged: 24000, followers: 18000 },
    { month: "Feb", totalReach: 205000, engaged: 26000, followers: 19200 },
    { month: "Mar", totalReach: 237000, engaged: 30800, followers: 19800 },
    { month: "Apr", totalReach: 273000, engaged: 35500, followers: 20400 },
    { month: "May", totalReach: 309000, engaged: 40200, followers: 20800 },
    { month: "Jun", totalReach: marketingData.totalReach, engaged: marketingData.engaged, followers: marketingData.followers },
  ]

  const fanConversionTrendData = [
    { month: "Jan", conversionRate: 37, superFanRate: 5 },
    { month: "Feb", conversionRate: 37, superFanRate: 4.7 },
    { month: "Mar", conversionRate: 37, superFanRate: 4.7 },
    { month: "Apr", conversionRate: 37, superFanRate: 4.7 },
    { month: "May", conversionRate: 37, superFanRate: 4.7 },
    { month: "Jun", conversionRate: Math.round((fanEngagementData.fans / fanEngagementData.capturedData) * 100), superFanRate: Math.round((fanEngagementData.superFans / fanEngagementData.fans) * 100) },
  ]

  const conversionComparisonData = [
    {
      stage: "Leads",
      count: conversionData.leads,
      conversionRate: 100,
      fill: "var(--color-leads)"
    },
    {
      stage: "Opportunities",
      count: conversionData.opportunities,
      conversionRate: Math.round((conversionData.opportunities / conversionData.leads) * 100),
      fill: "var(--color-opportunities)"
    },
    {
      stage: "Sales",
      count: conversionData.sales,
      conversionRate: Math.round((conversionData.sales / conversionData.opportunities) * 100),
      fill: "var(--color-sales)"
    },
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
        <Card className="bg-sidebar">
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
        
        <Card className="bg-sidebar">
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
        
        <Card className="bg-sidebar">
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
        
        <Card className="bg-sidebar">
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

      {/* Business Pipeline Realms */}
      <div className="space-y-8">
        {/* Production Pipeline Realm */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="p-2 bg-primary/10 rounded-md">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Production Pipeline</h3>
              <p className="text-xs text-muted-foreground">Your product, your releases - from idea to market</p>
            </div>
          </div>
          
          {/* Production Workflow Efficiency */}
          <Card className="bg-sidebar">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Production Workflow Efficiency</CardTitle>
              <CardDescription className="text-xs">Focus: Complete more projects to increase revenue</CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
              <ChartContainer
                config={productionChartConfig}
                className="h-[200px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={productionEfficiencyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="stage"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis hide />
                  <ChartTooltip 
                    content={<ChartTooltipContent hideLabel />}
                    cursor={false}
                  />
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={4}>
                    {productionEfficiencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{Math.round((productionData.finished / (productionData.unfinished + productionData.finished)) * 100)}%</div>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{productionData.released}</div>
                  <p className="text-xs text-muted-foreground">Generating Revenue</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{productionData.unfinished}</div>
                  <p className="text-xs text-muted-foreground">Bottleneck</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-xs border-t pt-4">
              <div className="flex items-center gap-2 leading-none font-medium text-orange-600">
                <Target className="h-3 w-3" />
                Action: Focus on completing {productionData.unfinished} unfinished projects
              </div>
              <div className="text-muted-foreground leading-none">
                Each completed project = potential revenue. Prioritize finishing over starting new ones.
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Marketing Reach Realm */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="p-2 bg-primary/10 rounded-md">
              <Megaphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Marketing Reach</h3>
              <p className="text-xs text-muted-foreground">Aggregate audience reach to engaged followers</p>
            </div>
          </div>
          
          {/* Marketing Growth Trends */}
          <Card className="bg-sidebar">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Marketing Growth & Engagement Trends</CardTitle>
              <CardDescription className="text-xs">Focus: Improve engagement rate to convert reach into followers</CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
              <ChartContainer config={marketingChartConfig} className="h-[250px] w-full">
                <AreaChart
                  accessibilityLayer
                  data={marketingTrendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <defs>
                    <linearGradient id="fillTotalReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-totalReach)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-totalReach)" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="fillEngaged" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-engaged)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-engaged)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Area
                    dataKey="totalReach"
                    type="natural"
                    fill="url(#fillTotalReach)"
                    fillOpacity={0.4}
                    stroke="var(--color-totalReach)"
                    stackId="a"
                  />
                  <Area
                    dataKey="engaged"
                    type="natural"
                    fill="url(#fillEngaged)"
                    fillOpacity={0.4}
                    stroke="var(--color-engaged)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{Math.round((marketingData.engaged / marketingData.totalReach) * 100)}%</div>
                  <p className="text-xs text-muted-foreground">Engagement Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{Math.round((marketingData.followers / marketingData.engaged) * 100)}%</div>
                  <p className="text-xs text-muted-foreground">Follower Conversion</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">+84%</div>
                  <p className="text-xs text-muted-foreground">6-Month Growth</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-xs border-t pt-4">
              <div className="flex items-center gap-2 leading-none font-medium text-blue-600">
                <TrendingUp className="h-3 w-3" />
                Action: Improve 13% engagement rate with more interactive content
              </div>
              <div className="text-muted-foreground leading-none">
                Great reach growth! Focus on engagement to convert more viewers into loyal followers.
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Fan Engagement Realm */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="p-2 bg-primary/10 rounded-md">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Fan Engagement Pipeline</h3>
              <p className="text-xs text-muted-foreground">Building deeper connections with your audience</p>
            </div>
          </div>
          
          {/* Fan Conversion Efficiency */}
          <Card className="bg-sidebar">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Fan Conversion Efficiency</CardTitle>
              <CardDescription className="text-xs">Focus: Improve super fan conversion rate for higher lifetime value</CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
              <ChartContainer config={fanEngagementChartConfig} className="h-[200px] w-full">
                <LineChart
                  accessibilityLayer
                  data={fanConversionTrendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    dataKey="conversionRate"
                    type="monotone"
                    stroke="var(--color-conversionRate)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="superFanRate"
                    type="monotone"
                    stroke="var(--color-superFanRate)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{Math.round((fanEngagementData.fans / fanEngagementData.capturedData) * 100)}%</div>
                  <p className="text-xs text-muted-foreground">Data → Fans</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{Math.round((fanEngagementData.superFans / fanEngagementData.fans) * 100)}%</div>
                  <p className="text-xs text-muted-foreground">Fans → Super Fans</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{fanEngagementData.superFans}</div>
                  <p className="text-xs text-muted-foreground">VIP Members</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-xs border-t pt-4">
              <div className="flex items-center gap-2 leading-none font-medium text-red-600">
                <Heart className="h-3 w-3" />
                Action: Low 4.7% super fan conversion - create VIP exclusive content
              </div>
              <div className="text-muted-foreground leading-none">
                Super fans generate 5x more revenue. Focus on deeper engagement with existing fans.
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Conversion Realm */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="p-2 bg-primary/10 rounded-md">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Conversion Pipeline</h3>
              <p className="text-xs text-muted-foreground">Revenue generation from leads to sales</p>
            </div>
          </div>
          
          {/* Revenue Conversion Funnel */}
          <Card className="bg-sidebar">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Revenue Conversion Funnel</CardTitle>
              <CardDescription className="text-xs">Focus: Improve 27% lead-to-opportunity conversion rate</CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
              <ChartContainer config={conversionChartConfig} className="h-[250px] w-full">
                <BarChart
                  accessibilityLayer
                  data={conversionComparisonData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="stage"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis hide />
                  <ChartTooltip 
                    content={<ChartTooltipContent hideLabel />}
                    cursor={false}
                  />
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={4}>
                    {conversionComparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">27%</div>
                  <p className="text-xs text-muted-foreground">Leads → Opportunities</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">38%</div>
                  <p className="text-xs text-muted-foreground">Opportunities → Sales</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">10%</div>
                  <p className="text-xs text-muted-foreground">Overall Conversion</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-xs border-t pt-4">
              <div className="flex items-center gap-2 leading-none font-medium text-red-600">
                <DollarSign className="h-3 w-3" />
                Action: 27% lead conversion is low - improve qualification process
              </div>
              <div className="text-muted-foreground leading-none">
                Good close rate (38%)! Focus on better lead qualification to increase opportunities.
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Business Health Summary */}
      <Card className="bg-sidebar">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Business Health Summary</CardTitle>
          <CardDescription className="text-xs">
            Overall performance across all pipeline realms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs font-medium">Production Health</span>
              </div>
              <p className="text-lg font-bold text-red-600">Needs Work</p>
              <p className="text-xs text-muted-foreground">
                {Math.round((productionData.finished / (productionData.unfinished + productionData.finished)) * 100)}% completion rate - complete more projects
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs font-medium">Reach Efficiency</span>
              </div>
              <p className="text-lg font-bold text-blue-600">Good</p>
              <p className="text-xs text-muted-foreground">
                13.3% engagement rate - growing well
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs font-medium">Fan Conversion</span>
              </div>
              <p className="text-lg font-bold text-red-600">Critical</p>
              <p className="text-xs text-muted-foreground">
                4.7% super fan rate - needs VIP strategy
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-xs font-medium">Sales Conversion</span>
              </div>
              <p className="text-lg font-bold text-yellow-600">Opportunity</p>
              <p className="text-xs text-muted-foreground">
                27% lead conversion - improve qualification
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}