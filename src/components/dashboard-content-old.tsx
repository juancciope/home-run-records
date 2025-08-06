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
  Music,
  Star,
  Zap,
} from "lucide-react"
import {
  ChartContainer,
  ChartConfig,
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
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart,
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
          <div className="grid gap-6 md:grid-cols-3">
            {/* Production Workflow Efficiency */}
            <Card className="flex flex-col bg-sidebar col-span-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-medium">Production Workflow Efficiency</CardTitle>
                  <CardDescription className="text-xs">Focus: Complete more projects to increase revenue</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
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

            {/* Finished */}
            <Card className="flex flex-col bg-sidebar">
                <CardHeader className="items-center pb-0">
                  <CardTitle className="text-sm font-medium">Finished</CardTitle>
                  <CardDescription className="text-xs">Ready for release</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer
                    config={radialChartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <RadialBarChart
                      data={[{ name: "finished", visitors: productionData.finished, fill: "var(--color-data)" }]}
                      endAngle={100}
                      innerRadius={80}
                      outerRadius={140}
                    >
                      <PolarGrid
                        gridType="circle"
                        radialLines={false}
                        stroke="none"
                        className="first:fill-muted last:fill-background"
                        polarRadius={[86, 74]}
                      />
                      <RadialBar dataKey="visitors" background />
                      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-2xl font-bold"
                                  >
                                    {productionData.finished.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground text-xs"
                                  >
                                    Ready
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </PolarRadiusAxis>
                    </RadialBarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Ready to launch <Target className="h-3 w-3" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Completed projects awaiting release
                  </div>
                </CardFooter>
              </Card>

            {/* Released */}
            <Card className="flex flex-col bg-sidebar">
                <CardHeader className="items-center pb-0">
                  <CardTitle className="text-sm font-medium">Released</CardTitle>
                  <CardDescription className="text-xs">Live in market</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer
                    config={radialChartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <RadialBarChart
                      data={[{ name: "released", visitors: productionData.released, fill: "var(--color-data)" }]}
                      endAngle={100}
                      innerRadius={80}
                      outerRadius={140}
                    >
                      <PolarGrid
                        gridType="circle"
                        radialLines={false}
                        stroke="none"
                        className="first:fill-muted last:fill-background"
                        polarRadius={[86, 74]}
                      />
                      <RadialBar dataKey="visitors" background />
                      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-2xl font-bold"
                                  >
                                    {productionData.released.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground text-xs"
                                  >
                                    Live
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </PolarRadiusAxis>
                    </RadialBarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Available to fans <Zap className="h-3 w-3" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Published and generating revenue
                  </div>
                </CardFooter>
            </Card>
          </div>
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
          <div className="grid gap-6 md:grid-cols-3">
            {/* Total Reach */}
            <Card className="flex flex-col bg-sidebar">
                <CardHeader className="items-center pb-0">
                  <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                  <CardDescription className="text-xs">Aggregate audience across platforms</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer
                    config={radialChartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <RadialBarChart
                      data={[{ name: "reach", visitors: Math.round(marketingData.totalReach / 1000), fill: "var(--color-data)" }]}
                      endAngle={100}
                      innerRadius={80}
                      outerRadius={140}
                    >
                      <PolarGrid
                        gridType="circle"
                        radialLines={false}
                        stroke="none"
                        className="first:fill-muted last:fill-background"
                        polarRadius={[86, 74]}
                      />
                      <RadialBar dataKey="visitors" background />
                      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-2xl font-bold"
                                  >
                                    {Math.round(marketingData.totalReach / 1000)}K
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground text-xs"
                                  >
                                    People
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </PolarRadiusAxis>
                    </RadialBarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Trending up by 12.5% <TrendingUp className="h-3 w-3" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Total audience across all platforms
                  </div>
                </CardFooter>
              </Card>

            {/* Engaged Audience */}
            <Card className="flex flex-col bg-sidebar">
                <CardHeader className="items-center pb-0">
                  <CardTitle className="text-sm font-medium">Engaged Audience</CardTitle>
                  <CardDescription className="text-xs">Active listeners & viewers</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer
                    config={radialChartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <RadialBarChart
                      data={[{ name: "engaged", visitors: Math.round(marketingData.engaged / 100), fill: "var(--color-data)" }]}
                      endAngle={100}
                      innerRadius={80}
                      outerRadius={140}
                    >
                      <PolarGrid
                        gridType="circle"
                        radialLines={false}
                        stroke="none"
                        className="first:fill-muted last:fill-background"
                        polarRadius={[86, 74]}
                      />
                      <RadialBar dataKey="visitors" background />
                      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-2xl font-bold"
                                  >
                                    {Math.round(marketingData.engaged / 100)}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground text-xs"
                                  >
                                    Hundreds
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </PolarRadiusAxis>
                    </RadialBarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    13.3% engagement rate <Heart className="h-3 w-3" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    People actively engaging with content
                  </div>
                </CardFooter>
              </Card>

            {/* Followers */}
            <Card className="flex flex-col bg-sidebar">
                <CardHeader className="items-center pb-0">
                  <CardTitle className="text-sm font-medium">Followers</CardTitle>
                  <CardDescription className="text-xs">Loyal subscriber base</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer
                    config={radialChartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <RadialBarChart
                      data={[{ name: "followers", visitors: Math.round(marketingData.followers / 100), fill: "var(--color-data)" }]}
                      endAngle={100}
                      innerRadius={80}
                      outerRadius={140}
                    >
                      <PolarGrid
                        gridType="circle"
                        radialLines={false}
                        stroke="none"
                        className="first:fill-muted last:fill-background"
                        polarRadius={[86, 74]}
                      />
                      <RadialBar dataKey="visitors" background />
                      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-2xl font-bold"
                                  >
                                    {Math.round(marketingData.followers / 100)}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground text-xs"
                                  >
                                    Hundreds
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </PolarRadiusAxis>
                    </RadialBarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Growing steadily <Users className="h-3 w-3" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Committed fans across platforms
                  </div>
                </CardFooter>
            </Card>
          </div>
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
          <div className="grid gap-6 md:grid-cols-3">
            {/* Captured Data */}
            <Card className="flex flex-col bg-sidebar">
                <CardHeader className="items-center pb-0">
                  <CardTitle className="text-sm font-medium">Captured Data</CardTitle>
                  <CardDescription className="text-xs">Email list & contact info</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer
                    config={radialChartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <RadialBarChart
                      data={[{ name: "captured", visitors: Math.round(fanEngagementData.capturedData / 100), fill: "var(--color-data)" }]}
                      endAngle={100}
                      innerRadius={80}
                      outerRadius={140}
                    >
                      <PolarGrid
                        gridType="circle"
                        radialLines={false}
                        stroke="none"
                        className="first:fill-muted last:fill-background"
                        polarRadius={[86, 74]}
                      />
                      <RadialBar dataKey="visitors" background />
                      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-2xl font-bold"
                                  >
                                    {Math.round(fanEngagementData.capturedData / 100)}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground text-xs"
                                  >
                                    Hundreds
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </PolarRadiusAxis>
                    </RadialBarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Growing database <Users className="h-3 w-3" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Direct contact information collected
                  </div>
                </CardFooter>
              </Card>

            {/* Fans */}
            <Card className="flex flex-col bg-sidebar">
                <CardHeader className="items-center pb-0">
                  <CardTitle className="text-sm font-medium">Fans</CardTitle>
                  <CardDescription className="text-xs">Regular supporters</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer
                    config={radialChartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <RadialBarChart
                      data={[{ name: "fans", visitors: Math.round(fanEngagementData.fans / 10), fill: "var(--color-data)" }]}
                      endAngle={100}
                      innerRadius={80}
                      outerRadius={140}
                    >
                      <PolarGrid
                        gridType="circle"
                        radialLines={false}
                        stroke="none"
                        className="first:fill-muted last:fill-background"
                        polarRadius={[86, 74]}
                      />
                      <RadialBar dataKey="visitors" background />
                      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-2xl font-bold"
                                  >
                                    {Math.round(fanEngagementData.fans / 10)}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground text-xs"
                                  >
                                    Tens
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </PolarRadiusAxis>
                    </RadialBarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    4.7% conversion rate <Heart className="h-3 w-3" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    People who regularly engage
                  </div>
                </CardFooter>
              </Card>

            {/* Super Fans */}
            <Card className="flex flex-col bg-sidebar">
                <CardHeader className="items-center pb-0">
                  <CardTitle className="text-sm font-medium">Super Fans</CardTitle>
                  <CardDescription className="text-xs">VIP community members</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer
                    config={radialChartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <RadialBarChart
                      data={[{ name: "superfans", visitors: fanEngagementData.superFans, fill: "var(--color-data)" }]}
                      endAngle={100}
                      innerRadius={80}
                      outerRadius={140}
                    >
                      <PolarGrid
                        gridType="circle"
                        radialLines={false}
                        stroke="none"
                        className="first:fill-muted last:fill-background"
                        polarRadius={[86, 74]}
                      />
                      <RadialBar dataKey="visitors" background />
                      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-2xl font-bold"
                                  >
                                    {fanEngagementData.superFans.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground text-xs"
                                  >
                                    VIPs
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </PolarRadiusAxis>
                    </RadialBarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Premium supporters <Star className="h-3 w-3" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Highest value audience segment
                  </div>
                </CardFooter>
            </Card>
          </div>
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
          <div className="grid gap-6 md:grid-cols-3">
            {/* Leads */}
            <Card className="flex flex-col bg-sidebar">
                <CardHeader className="items-center pb-0">
                  <CardTitle className="text-sm font-medium">Leads</CardTitle>
                  <CardDescription className="text-xs">Interested potential buyers</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer
                    config={radialChartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <RadialBarChart
                      data={[{ name: "leads", visitors: conversionData.leads, fill: "var(--color-data)" }]}
                      endAngle={100}
                      innerRadius={80}
                      outerRadius={140}
                    >
                      <PolarGrid
                        gridType="circle"
                        radialLines={false}
                        stroke="none"
                        className="first:fill-muted last:fill-background"
                        polarRadius={[86, 74]}
                      />
                      <RadialBar dataKey="visitors" background />
                      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-2xl font-bold"
                                  >
                                    {conversionData.leads.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground text-xs"
                                  >
                                    Prospects
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </PolarRadiusAxis>
                    </RadialBarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Active pipeline <Users className="h-3 w-3" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    People showing purchase intent
                  </div>
                </CardFooter>
              </Card>

            {/* Opportunities */}
            <Card className="flex flex-col bg-sidebar">
                <CardHeader className="items-center pb-0">
                  <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
                  <CardDescription className="text-xs">Active deals in progress</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer
                    config={radialChartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <RadialBarChart
                      data={[{ name: "opportunities", visitors: conversionData.opportunities, fill: "var(--color-data)" }]}
                      endAngle={100}
                      innerRadius={80}
                      outerRadius={140}
                    >
                      <PolarGrid
                        gridType="circle"
                        radialLines={false}
                        stroke="none"
                        className="first:fill-muted last:fill-background"
                        polarRadius={[86, 74]}
                      />
                      <RadialBar dataKey="visitors" background />
                      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-2xl font-bold"
                                  >
                                    {conversionData.opportunities.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground text-xs"
                                  >
                                    Deals
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </PolarRadiusAxis>
                    </RadialBarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    26.7% conversion rate <Target className="h-3 w-3" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Qualified leads in negotiation
                  </div>
                </CardFooter>
              </Card>

            {/* Sales */}
            <Card className="flex flex-col bg-sidebar">
                <CardHeader className="items-center pb-0">
                  <CardTitle className="text-sm font-medium">Sales</CardTitle>
                  <CardDescription className="text-xs">Closed won deals</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer
                    config={radialChartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <RadialBarChart
                      data={[{ name: "sales", visitors: conversionData.sales, fill: "var(--color-data)" }]}
                      endAngle={100}
                      innerRadius={80}
                      outerRadius={140}
                    >
                      <PolarGrid
                        gridType="circle"
                        radialLines={false}
                        stroke="none"
                        className="first:fill-muted last:fill-background"
                        polarRadius={[86, 74]}
                      />
                      <RadialBar dataKey="visitors" background />
                      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-2xl font-bold"
                                  >
                                    {conversionData.sales.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground text-xs"
                                  >
                                    Won
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </PolarRadiusAxis>
                    </RadialBarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    37.5% close rate <DollarSign className="h-3 w-3" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Successful transactions completed
                  </div>
                </CardFooter>
            </Card>
          </div>
        </div>
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