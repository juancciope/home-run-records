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
} from "@/components/ui/chart"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
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

  // Radial chart configurations following Shadcn/UI patterns
  const radialChartConfig = {
    visitors: {
      label: "Value",
    },
    data: {
      label: "Data",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

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

      {/* Business Pipeline Realms */}
      <div className="space-y-6">
        {/* Production Pipeline Realm */}
        <Card className="col-span-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-md">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Production Pipeline</CardTitle>
                  <CardDescription>Your product, your releases - from idea to market</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Unfinished */}
              <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                  <CardTitle>Unfinished</CardTitle>
                  <CardDescription>Ideas & demos in progress</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer
                    config={radialChartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <RadialBarChart
                      data={[{ name: "unfinished", visitors: productionData.unfinished, fill: "var(--color-data)" }]}
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
                                    className="fill-foreground text-4xl font-bold"
                                  >
                                    {productionData.unfinished.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
                                  >
                                    Projects
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
                <CardFooter className="flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    In development <Music className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Active creative work in progress
                  </div>
                </CardFooter>
              </Card>

              {/* Finished */}
              <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                  <CardTitle>Finished</CardTitle>
                  <CardDescription>Ready for release</CardDescription>
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
                                    className="fill-foreground text-4xl font-bold"
                                  >
                                    {productionData.finished.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
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
                <CardFooter className="flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Ready to launch <Target className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Completed projects awaiting release
                  </div>
                </CardFooter>
              </Card>

              {/* Released */}
              <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                  <CardTitle>Released</CardTitle>
                  <CardDescription>Live in market</CardDescription>
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
                                    className="fill-foreground text-4xl font-bold"
                                  >
                                    {productionData.released.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
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
                <CardFooter className="flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Available to fans <Zap className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Published and generating revenue
                  </div>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Marketing Reach Realm */}
        <Card className="col-span-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-md">
                  <Megaphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Marketing Reach</CardTitle>
                  <CardDescription>Aggregate audience reach to engaged followers</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Total Reach */}
              <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                  <CardTitle>Total Reach</CardTitle>
                  <CardDescription>Aggregate audience across platforms</CardDescription>
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
                                    className="fill-foreground text-4xl font-bold"
                                  >
                                    {Math.round(marketingData.totalReach / 1000)}K
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
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
                <CardFooter className="flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Trending up by 12.5% <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Total audience across all platforms
                  </div>
                </CardFooter>
              </Card>

              {/* Engaged Audience */}
              <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                  <CardTitle>Engaged Audience</CardTitle>
                  <CardDescription>Active listeners & viewers</CardDescription>
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
                                    className="fill-foreground text-4xl font-bold"
                                  >
                                    {Math.round(marketingData.engaged / 100)}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
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
                <CardFooter className="flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    13.3% engagement rate <Heart className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    People actively engaging with content
                  </div>
                </CardFooter>
              </Card>

              {/* Followers */}
              <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                  <CardTitle>Followers</CardTitle>
                  <CardDescription>Loyal subscriber base</CardDescription>
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
                                    className="fill-foreground text-4xl font-bold"
                                  >
                                    {Math.round(marketingData.followers / 100)}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
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
                <CardFooter className="flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Growing steadily <Users className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Committed fans across platforms
                  </div>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Fan Engagement Realm */}
        <Card className="col-span-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-md">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Fan Engagement Pipeline</CardTitle>
                  <CardDescription>Building deeper connections with your audience</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Captured Data */}
              <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                  <CardTitle>Captured Data</CardTitle>
                  <CardDescription>Email list & contact info</CardDescription>
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
                                    className="fill-foreground text-4xl font-bold"
                                  >
                                    {Math.round(fanEngagementData.capturedData / 100)}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
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
                <CardFooter className="flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Growing database <Users className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Direct contact information collected
                  </div>
                </CardFooter>
              </Card>

              {/* Fans */}
              <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                  <CardTitle>Fans</CardTitle>
                  <CardDescription>Regular supporters</CardDescription>
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
                                    className="fill-foreground text-4xl font-bold"
                                  >
                                    {Math.round(fanEngagementData.fans / 10)}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
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
                <CardFooter className="flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    4.7% conversion rate <Heart className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    People who regularly engage
                  </div>
                </CardFooter>
              </Card>

              {/* Super Fans */}
              <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                  <CardTitle>Super Fans</CardTitle>
                  <CardDescription>VIP community members</CardDescription>
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
                                    className="fill-foreground text-4xl font-bold"
                                  >
                                    {fanEngagementData.superFans.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
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
                <CardFooter className="flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Premium supporters <Star className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Highest value audience segment
                  </div>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Realm */}
        <Card className="col-span-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-md">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Conversion Pipeline</CardTitle>
                  <CardDescription>Revenue generation from leads to sales</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Leads */}
              <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                  <CardTitle>Leads</CardTitle>
                  <CardDescription>Interested potential buyers</CardDescription>
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
                                    className="fill-foreground text-4xl font-bold"
                                  >
                                    {conversionData.leads.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
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
                <CardFooter className="flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Active pipeline <Users className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    People showing purchase intent
                  </div>
                </CardFooter>
              </Card>

              {/* Opportunities */}
              <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                  <CardTitle>Opportunities</CardTitle>
                  <CardDescription>Active deals in progress</CardDescription>
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
                                    className="fill-foreground text-4xl font-bold"
                                  >
                                    {conversionData.opportunities.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
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
                <CardFooter className="flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    26.7% conversion rate <Target className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Qualified leads in negotiation
                  </div>
                </CardFooter>
              </Card>

              {/* Sales */}
              <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                  <CardTitle>Sales</CardTitle>
                  <CardDescription>Closed won deals</CardDescription>
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
                                    className="fill-foreground text-4xl font-bold"
                                  >
                                    {conversionData.sales.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
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
                <CardFooter className="flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    37.5% close rate <DollarSign className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Successful transactions completed
                  </div>
                </CardFooter>
              </Card>
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