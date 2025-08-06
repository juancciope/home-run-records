"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Users,
  Heart,
  DollarSign,
  Package,
  Megaphone,
  Target,
  Zap,
  Activity,
  Database,
  Wifi,
  WifiOff,
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
  Line,
  LineChart,
  RadialBarChart,
  RadialBar,
  PolarGrid,
  PolarRadiusAxis,
  Label,
} from "recharts"
import { useArtist } from "@/contexts/artist-context"
import { ArtistOnboarding } from "./artist-onboarding"

export function DashboardContent() {
  const { user, isDashboardLoading } = useArtist();
  const [pipelineMetrics, setPipelineMetrics] = React.useState<{
    production: { unfinished: number; finished: number; released: number };
    marketing: { totalReach: number; engagedAudience: number; totalFollowers: number; youtubeSubscribers: number };
    fanEngagement: { capturedData: number; fans: number; superFans: number };
    conversion: { leads: number; opportunities: number; sales: number; revenue: number };
  } | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = React.useState(true);
  const [needsOnboarding, setNeedsOnboarding] = React.useState(false);
  const [hasVibrateConnection, setHasVibrateConnection] = React.useState(false);
  const [marketingData, setMarketingData] = React.useState({
    totalReach: 342000,
    engaged: 45600,
    followers: 21200,
    isRealData: false,
  });

  const loadPipelineMetrics = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingMetrics(true);
      const { ArtistService } = await import('@/lib/services/artist-service');
      const metrics = await ArtistService.getPipelineMetrics(user.id);
      setPipelineMetrics(metrics);
      
      // Check if user has connected their data
      const profile = await ArtistService.getArtistProfile(user.id, user.email);
      console.log('Dashboard loaded profile:', profile);
      
      const hasConnection = !!profile?.viberate_artist_id;
      setHasVibrateConnection(hasConnection);
      
      // Load real marketing data if Viberate is connected
      if (hasConnection && profile?.viberate_artist_id) {
        try {
          const { VibrateService } = await import('@/lib/services/viberate-service');
          const vibrateData = await VibrateService.getArtistAnalytics(profile.viberate_artist_id);
          
          if (vibrateData) {
            console.log('Loaded real Viberate data:', vibrateData);
            setMarketingData({
              totalReach: vibrateData.totalReach,
              engaged: vibrateData.engagedAudience,
              followers: vibrateData.totalFollowers,
              isRealData: true,
            });
          }
        } catch (error) {
          console.error('Error loading Vibrate analytics:', error);
          // Keep mock data if real data fails
        }
      } else {
        // Use mock data for demo
        setMarketingData({
          totalReach: metrics?.marketing?.totalReach || 342000,
          engaged: metrics?.marketing?.engagedAudience || 45600,
          followers: metrics?.marketing?.totalFollowers || 21200,
          isRealData: false,
        });
      }
      
      if (!hasConnection && !profile?.onboarding_completed) {
        console.log('User needs onboarding - no Viberate connection');
        setNeedsOnboarding(true);
      }
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
  }, [user?.id, user?.email, loadPipelineMetrics]);

  // Use real data if available, otherwise fall back to mock data
  const productionData = pipelineMetrics?.production || {
    unfinished: 12,
    finished: 5,
    released: 28,
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

  // Chart configurations
  const productionChartConfig = {
    value: {
      label: "Tracks",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig

  const reachChartConfig = {
    reach: {
      label: "Reach",
      color: "hsl(var(--chart-2))",
    },
    engaged: {
      label: "Engaged",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig

  const engagementChartConfig = {
    fans: {
      label: "Fans",
      color: "hsl(var(--chart-1))",
    },
    superFans: {
      label: "Super Fans",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig

  const conversionChartConfig = {
    value: {
      label: "Count",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig

  // Data transformations for charts
  const productionChartData = [
    {
      name: "production",
      value: Math.round((productionData.released / (productionData.unfinished + productionData.finished + productionData.released)) * 100),
      fill: "var(--color-value)",
    },
  ];

  const reachTrendData = [
    { month: "Jan", reach: 186000, engaged: 24000 },
    { month: "Feb", reach: 205000, engaged: 26000 },
    { month: "Mar", reach: 237000, engaged: 30800 },
    { month: "Apr", reach: 273000, engaged: 35500 },
    { month: "May", reach: 309000, engaged: 40200 },
    { month: "Jun", reach: marketingData.totalReach, engaged: marketingData.engaged },
  ];

  const fanEngagementTrendData = [
    { month: "Jan", fans: 2800, superFans: 120 },
    { month: "Feb", fans: 2900, superFans: 125 },
    { month: "Mar", fans: 3000, superFans: 130 },
    { month: "Apr", fans: 3050, superFans: 135 },
    { month: "May", fans: 3100, superFans: 142 },
    { month: "Jun", fans: fanEngagementData.fans, superFans: fanEngagementData.superFans },
  ];

  const conversionFunnelData = [
    { stage: "Leads", value: conversionData.leads },
    { stage: "Opportunities", value: conversionData.opportunities },
    { stage: "Sales", value: conversionData.sales },
  ];

  if (isDashboardLoading || isLoadingMetrics) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-[280px] bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (needsOnboarding) {
    return <ArtistOnboarding onComplete={() => setNeedsOnboarding(false)} />;
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Header with Connect Data Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Business Intelligence Dashboard</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-muted-foreground">Your complete view of performance across all business realms</p>
            <div className="flex items-center gap-2">
              {hasVibrateConnection ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400">
                    Connected
                  </Badge>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-orange-500" />
                  <Badge variant="secondary" className="bg-orange-500/10 text-orange-700 dark:text-orange-400">
                    Demo Data
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setNeedsOnboarding(true)}
          className="flex items-center gap-2"
        >
          <Database className="h-4 w-4" />
          {hasVibrateConnection ? 'Manage Connection' : 'Connect Data'}
        </Button>
      </div>

      {/* Production Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-md">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Production Pipeline</h2>
            <p className="text-sm text-muted-foreground">Track your creative output from idea to release</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {/* Unfinished Projects */}
          <Card className="bg-sidebar">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unfinished Projects</CardTitle>
              <CardDescription className="text-xs">Projects in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{productionData.unfinished}</div>
              <p className="text-xs text-muted-foreground mt-2">
                <Activity className="inline h-3 w-3 mr-1" />
                Focus on completion
              </p>
            </CardContent>
          </Card>

          {/* Finished Projects */}
          <Card className="bg-sidebar">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ready to Release</CardTitle>
              <CardDescription className="text-xs">Completed, awaiting release</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{productionData.finished}</div>
              <p className="text-xs text-muted-foreground mt-2">
                <Target className="inline h-3 w-3 mr-1" />
                Schedule releases
              </p>
            </CardContent>
          </Card>

          {/* Released with RadialBar */}
          <Card className="bg-sidebar">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Released Tracks</CardTitle>
              <CardDescription className="text-xs">Live & generating revenue</CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
              <ChartContainer config={productionChartConfig} className="h-[140px] w-full">
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={productionChartData}>
                  <PolarGrid gridType="circle" radialLines={false} stroke="none" />
                  <RadialBar dataKey="value" cornerRadius={10} fill="hsl(var(--chart-1))" />
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy} className="text-3xl font-bold fill-foreground">
                                {productionData.released}
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="text-xs fill-muted-foreground">
                                Released
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </PolarRadiusAxis>
                </RadialBarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Marketing Reach */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-md">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Marketing Reach</h2>
            <p className="text-sm text-muted-foreground">Expand your audience and engagement</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {/* Total Reach with Area Chart */}
          <Card className="bg-sidebar">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
              <CardDescription className="text-xs">6-month growth trend</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <ChartContainer config={reachChartConfig} className="h-[140px] w-full">
                <AreaChart data={reachTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-reach)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-reach)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="reach"
                    stroke="var(--color-reach)"
                    fill="url(#fillReach)"
                    strokeWidth={2}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </AreaChart>
              </ChartContainer>
              <div className="flex justify-between items-center mt-2">
                <span className="text-2xl font-bold">{(marketingData.totalReach / 1000).toFixed(0)}K</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-green-600">+84% growth</span>
                  {marketingData.isRealData && (
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-200">
                      Live
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Engaged Audience */}
          <Card className="bg-sidebar">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Engaged Audience</CardTitle>
              <CardDescription className="text-xs">Active interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{(marketingData.engaged / 1000).toFixed(1)}K</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(marketingData.engaged / marketingData.totalReach) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">13.3%</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Followers */}
          <Card className="bg-sidebar">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
              <CardDescription className="text-xs">Across all platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{(marketingData.followers / 1000).toFixed(1)}K</div>
              <p className="text-xs text-muted-foreground mt-2">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                46% conversion rate
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fan Engagement */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-md">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Fan Engagement</h2>
            <p className="text-sm text-muted-foreground">Build deeper connections with your audience</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {/* Captured Data */}
          <Card className="bg-sidebar">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Data Captured</CardTitle>
              <CardDescription className="text-xs">Email & contact info</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{(fanEngagementData.capturedData / 1000).toFixed(1)}K</div>
              <p className="text-xs text-muted-foreground mt-2">
                <Users className="inline h-3 w-3 mr-1" />
                Potential fan base
              </p>
            </CardContent>
          </Card>

          {/* Active Fans with Line Chart */}
          <Card className="bg-sidebar">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Fans</CardTitle>
              <CardDescription className="text-xs">Growth over time</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <ChartContainer config={engagementChartConfig} className="h-[100px] w-full">
                <LineChart data={fanEngagementTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <Line
                    type="monotone"
                    dataKey="fans"
                    stroke="var(--color-fans)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </LineChart>
              </ChartContainer>
              <div className="flex justify-between items-center mt-2">
                <span className="text-2xl font-bold">{(fanEngagementData.fans / 1000).toFixed(1)}K</span>
                <span className="text-xs text-yellow-600">37.6% conversion</span>
              </div>
            </CardContent>
          </Card>

          {/* Super Fans with RadialBar */}
          <Card className="bg-sidebar">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Super Fans</CardTitle>
              <CardDescription className="text-xs">Your most loyal supporters</CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
              <ChartContainer config={{
                superFans: { label: "Super Fans", color: "hsl(var(--chart-3))" }
              }} className="h-[140px] w-full">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="60%" 
                  outerRadius="90%" 
                  data={[{
                    name: "superFans",
                    value: Math.round((fanEngagementData.superFans / fanEngagementData.fans) * 100),
                    fill: "hsl(var(--chart-3))"
                  }]}
                >
                  <PolarGrid gridType="circle" radialLines={false} stroke="none" />
                  <RadialBar dataKey="value" cornerRadius={10} />
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy} className="text-3xl font-bold fill-foreground">
                                {fanEngagementData.superFans}
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="text-xs fill-muted-foreground">
                                VIP Members
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </PolarRadiusAxis>
                </RadialBarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conversion Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-md">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Conversion Pipeline</h2>
            <p className="text-sm text-muted-foreground">Transform interest into revenue</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {/* Leads with Bar Chart */}
          <Card className="bg-sidebar">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Lead Generation</CardTitle>
              <CardDescription className="text-xs">Funnel performance</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <ChartContainer config={conversionChartConfig} className="h-[100px] w-full">
                <BarChart data={conversionFunnelData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ChartContainer>
              <div className="flex justify-between items-center mt-2">
                <span className="text-2xl font-bold">{conversionData.leads}</span>
                <span className="text-xs text-muted-foreground">Total leads</span>
              </div>
            </CardContent>
          </Card>

          {/* Opportunities */}
          <Card className="bg-sidebar">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
              <CardDescription className="text-xs">Qualified prospects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{conversionData.opportunities}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-600 rounded-full"
                    style={{ width: `${(conversionData.opportunities / conversionData.leads) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">27% conversion</span>
              </div>
            </CardContent>
          </Card>

          {/* Sales */}
          <Card className="bg-sidebar">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Closed Sales</CardTitle>
              <CardDescription className="text-xs">Successful conversions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{conversionData.sales}</div>
              <p className="text-xs text-muted-foreground mt-2">
                <Zap className="inline h-3 w-3 mr-1" />
                38% close rate
              </p>
              <p className="text-xs font-medium mt-1">
                Revenue: ${(pipelineMetrics?.conversion?.revenue || 12450).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}