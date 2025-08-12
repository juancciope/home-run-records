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
  Info,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
  RadialBarChart,
  RadialBar,
  PolarGrid,
  PolarRadiusAxis,
  XAxis,
  Label,
} from "recharts"
import { useAuth } from "@/contexts/auth-provider"
import { ArtistOnboarding } from "./artist-onboarding"

export function DashboardContent() {
  const { user: authUser, isLoading, profile } = useAuth();
  
  // Note: Superadmin redirect now handled server-side in dashboard page
  const user = authUser; // Use authenticated user directly
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
      const profile = await ArtistService.getArtistProfile(user.id, authUser?.email || '');
      console.log('Dashboard loaded profile:', profile);
      
      const hasConnection = !!profile?.viberate_artist_id;
      setHasVibrateConnection(hasConnection);
      
      // Load real marketing data if Viberate is connected
      if (hasConnection && profile?.viberate_artist_id) {
        try {
          const response = await fetch(`/api/viberate/analytics?artistId=${encodeURIComponent(profile.viberate_artist_id)}`);
          const vibrateData = await response.json();
          
          if (vibrateData && !vibrateData.error) {
            console.log('Loaded Viberate analytics data:', vibrateData);
            setMarketingData({
              totalReach: vibrateData.totalReach,
              engaged: vibrateData.engagedAudience,
              followers: vibrateData.totalFollowers,
              isRealData: vibrateData.isRealData || false,
            });
          }
        } catch (error) {
          console.warn('Error loading Viberate analytics:', error);
          // Keep mock data if API call fails
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
  }, [user?.id, authUser?.email]);

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

  // Show loading state while checking authentication
  if (isLoading || isLoadingMetrics) {
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

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (needsOnboarding) {
    return <ArtistOnboarding onComplete={() => setNeedsOnboarding(false)} />;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Business Intelligence Dashboard</h1>
          <p className="text-muted-foreground">
            Your complete view of performance across all business realms
          </p>
        </div>
        <div className="flex items-center gap-4">
          {hasVibrateConnection ? (
            <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400">
              <Wifi className="h-3 w-3 mr-1" />
              Live Data
            </Badge>
          ) : (
            <Badge variant="secondary">
              <WifiOff className="h-3 w-3 mr-1" />
              Demo Mode
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => setNeedsOnboarding(true)}>
            <Database className="h-4 w-4 mr-2" />
            {hasVibrateConnection ? 'Manage Connection' : 'Connect Data'}
          </Button>
        </div>
      </div>

      {/* Production Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Production Pipeline</h2>
            <p className="text-muted-foreground">Track your creative output from idea to release</p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {/* Unfinished Projects */}
          <Card className="bg-sidebar">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Unfinished Projects</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Number of songs, albums, or other creative projects that are currently being worked on but not yet completed. This includes demos, works in progress, and tracks in production.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>Projects in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productionData.unfinished}</div>
              <p className="text-sm text-muted-foreground mt-3 flex items-center">
                <Activity className="h-3 w-3 mr-1" />
                Focus on completion
              </p>
            </CardContent>
          </Card>

          {/* Finished Projects */}
          <Card className="bg-sidebar">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Ready to Release</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Completed tracks that are mastered and ready for distribution but haven't been released yet. These are your release-ready assets waiting for the right moment to launch.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>Completed, awaiting release</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{productionData.finished}</div>
              <p className="text-sm text-muted-foreground mt-3 flex items-center">
                <Target className="h-3 w-3 mr-1" />
                Schedule releases
              </p>
            </CardContent>
          </Card>

          {/* Released with RadialBar */}
          <Card className="bg-sidebar">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Released Tracks</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Total number of tracks currently live on streaming platforms and stores. This represents your active catalog that's available to fans and generating streams/revenue.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>Live & generating revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={productionChartConfig} className="mx-auto aspect-square max-h-[180px] w-full">
                <RadialBarChart accessibilityLayer cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={productionChartData}>
                  <PolarGrid gridType="circle" radialLines={false} stroke="none" />
                  <RadialBar dataKey="value" cornerRadius={6} fill="hsl(var(--chart-1))" />
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan 
                                x={viewBox.cx} 
                                y={(viewBox.cy || 0) - 6} 
                                className="fill-foreground font-bold text-2xl"
                              >
                                {productionData.released}
                              </tspan>
                              <tspan 
                                x={viewBox.cx} 
                                y={(viewBox.cy || 0) + 16} 
                                className="fill-muted-foreground text-sm"
                              >
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
          <Megaphone className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Marketing Reach</h2>
            <p className="text-muted-foreground">Expand your audience and engagement</p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {/* Total Reach with Area Chart */}
          <Card className="bg-sidebar">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Total Reach</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>The total number of unique people who have been exposed to your content across all platforms. This includes social media impressions, streaming platform reach, and other touchpoints.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>6-month growth trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={reachChartConfig} className="aspect-auto h-[200px] w-full">
                <AreaChart accessibilityLayer data={reachTrendData} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                  <defs>
                    <linearGradient id="fillReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-reach)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-reach)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <Area
                    type="monotone"
                    dataKey="reach"
                    stroke="var(--color-reach)"
                    fill="url(#fillReach)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </AreaChart>
              </ChartContainer>
              <div className="flex justify-between items-center mt-2">
                <span className="text-2xl font-bold">{(marketingData.totalReach / 1000).toFixed(0)}K</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-green-600">+84% growth</span>
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
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Engaged Audience</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>People who actively interact with your content through likes, comments, shares, saves, and other engagement actions. This is your most valuable audience segment.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>Active interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(marketingData.engaged / 1000).toFixed(1)}K</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(marketingData.engaged / marketingData.totalReach) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">13.3%</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Followers */}
          <Card className="bg-sidebar">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Total Followers</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Combined follower count from all your social media platforms including Instagram, TikTok, Facebook, Twitter, and YouTube subscribers.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>Across all platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{(marketingData.followers / 1000).toFixed(1)}K</div>
              <p className="text-sm text-muted-foreground mt-2">
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
          <Heart className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Fan Engagement</h2>
            <p className="text-muted-foreground">Build deeper connections with your audience</p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {/* Captured Data */}
          <Card className="bg-sidebar">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Data Captured</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Number of fan email addresses and contact information collected through your website, landing pages, and campaigns. This is your owned audience data.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>Email & contact info</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(fanEngagementData.capturedData / 1000).toFixed(1)}K</div>
              <p className="text-sm text-muted-foreground mt-2">
                <Users className="inline h-3 w-3 mr-1" />
                Potential fan base
              </p>
            </CardContent>
          </Card>

          {/* Active Fans with Line Chart */}
          <Card className="bg-sidebar">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Active Fans</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Fans who regularly engage with your content, stream your music, and show consistent support. Calculated based on engagement frequency and interaction patterns.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>Growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={engagementChartConfig} className="aspect-auto h-[140px] w-full">
                <LineChart accessibilityLayer data={fanEngagementTrendData} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <Line
                    type="monotone"
                    dataKey="fans"
                    stroke="var(--color-fans)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, stroke: "var(--color-fans)", strokeWidth: 2 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </LineChart>
              </ChartContainer>
              <div className="flex justify-between items-center mt-2">
                <span className="text-2xl font-bold">{(fanEngagementData.fans / 1000).toFixed(1)}K</span>
                <span className="text-sm text-yellow-600">37.6% conversion</span>
              </div>
            </CardContent>
          </Card>

          {/* Super Fans with RadialBar */}
          <Card className="bg-sidebar">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Super Fans</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Your top 1% most engaged fans who consistently stream, share, purchase, and advocate for your music. These are your brand ambassadors and most valuable supporters.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>Your most loyal supporters</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                superFans: { label: "Super Fans", color: "hsl(var(--chart-3))" }
              }} className="mx-auto aspect-square max-h-[180px] w-full">
                <RadialBarChart 
                  accessibilityLayer
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
                  <RadialBar dataKey="value" cornerRadius={6} />
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan 
                                x={viewBox.cx} 
                                y={(viewBox.cy || 0) - 6} 
                                className="fill-foreground font-bold text-2xl"
                              >
                                {fanEngagementData.superFans}
                              </tspan>
                              <tspan 
                                x={viewBox.cx} 
                                y={(viewBox.cy || 0) + 16} 
                                className="fill-muted-foreground text-sm"
                              >
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
          <DollarSign className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Conversion Pipeline</h2>
            <p className="text-muted-foreground">Transform interest into revenue</p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {/* Leads with Bar Chart */}
          <Card className="bg-sidebar">
            <CardHeader>
              <CardTitle className="text-base">Lead Generation</CardTitle>
              <CardDescription>Funnel performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={conversionChartConfig} className="aspect-auto h-[140px] w-full">
                <BarChart accessibilityLayer data={conversionFunnelData} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis 
                    dataKey="stage" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="var(--color-value)" 
                    radius={[2, 2, 0, 0]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ChartContainer>
              <div className="flex justify-between items-center mt-2">
                <span className="text-2xl font-bold">{conversionData.leads}</span>
                <span className="text-sm text-muted-foreground">Total leads</span>
              </div>
            </CardContent>
          </Card>

          {/* Opportunities */}
          <Card className="bg-sidebar">
            <CardHeader>
              <CardTitle className="text-base">Opportunities</CardTitle>
              <CardDescription>Qualified prospects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{conversionData.opportunities}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-600 rounded-full"
                    style={{ width: `${(conversionData.opportunities / conversionData.leads) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">27% conversion</span>
              </div>
            </CardContent>
          </Card>

          {/* Sales */}
          <Card className="bg-sidebar">
            <CardHeader>
              <CardTitle className="text-base">Closed Sales</CardTitle>
              <CardDescription>Successful conversions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{conversionData.sales}</div>
              <p className="text-sm text-muted-foreground mt-2">
                <Zap className="inline h-3 w-3 mr-1" />
                38% close rate
              </p>
              <p className="text-sm font-medium mt-1">
                Revenue: ${(pipelineMetrics?.conversion?.revenue || 12450).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </TooltipProvider>
  )
}