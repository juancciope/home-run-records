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
  Bot,
  Plug,
  Plus,
  ArrowRight,
  ChevronRight,
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

// Action Button Component for pipeline cards
function ActionButton({ 
  icon: Icon, 
  tooltip, 
  variant = "ghost",
  onClick 
}: { 
  icon: any; 
  tooltip: string; 
  variant?: "ghost" | "outline"; 
  onClick?: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className="h-7 w-7 p-0 shrink-0"
          onClick={onClick}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="sr-only">{tooltip}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Production Pipeline</h2>
              <p className="text-sm text-muted-foreground">Track your creative output from idea to release</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <span>In Progress</span>
            <ArrowRight className="h-3 w-3 mx-2" />
            <span>Ready</span>
            <ArrowRight className="h-3 w-3 mx-2" />
            <span>Live</span>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3 relative">
          {/* Flow indicators for mobile */}
          <div className="md:hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-10 pointer-events-none">
            <div className="bg-background border rounded-full p-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="bg-background border rounded-full p-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>

          {/* Unfinished Projects */}
          <Card className="relative border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>In Progress</span>
                <div className="flex items-center gap-1">
                  <ActionButton icon={Info} tooltip="View details about projects in progress" />
                  <ActionButton icon={Bot} tooltip="Get AI suggestions for completing projects" />
                  <ActionButton icon={Plug} tooltip="Connect project management tools" />
                  <ActionButton icon={Plus} tooltip="Add new project manually" />
                </div>
              </CardTitle>
              <CardDescription className="text-xs">Projects in development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold tabular-nums">{productionData.unfinished}</span>
                <Badge variant="secondary" className="text-xs">Active</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Priority</span>
                  <span className="font-medium">High</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-orange-500 rounded-full" />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Focus on completion
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ready to Release */}
          <Card className="relative border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Ready to Release</span>
                <div className="flex items-center gap-1">
                  <ActionButton icon={Info} tooltip="View tracks ready for release" />
                  <ActionButton icon={Bot} tooltip="Get AI-powered release strategy suggestions" />
                  <ActionButton icon={Plug} tooltip="Connect distribution platforms" />
                  <ActionButton icon={Plus} tooltip="Add new completed track" />
                </div>
              </CardTitle>
              <CardDescription className="text-xs">Completed, awaiting launch</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold tabular-nums text-yellow-600">{productionData.finished}</span>
                <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-600">Ready</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next Release</span>
                  <span className="font-medium">2 weeks</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-yellow-500 rounded-full" />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Schedule releases
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Released Tracks */}
          <Card className="relative border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Live Catalog</span>
                <div className="flex items-center gap-1">
                  <ActionButton icon={Info} tooltip="View released tracks performance" />
                  <ActionButton icon={Bot} tooltip="Optimize catalog with AI insights" />
                  <ActionButton icon={Plug} tooltip="Connect streaming platforms" />
                  <ActionButton icon={Plus} tooltip="Add tracks to catalog" />
                </div>
              </CardTitle>
              <CardDescription className="text-xs">Live & generating revenue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold tabular-nums text-green-600">{productionData.released}</span>
                <Badge className="text-xs bg-green-500/10 text-green-600 border-green-200">Live</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium">{Math.round((productionData.released / (productionData.unfinished + productionData.finished + productionData.released)) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${Math.round((productionData.released / (productionData.unfinished + productionData.finished + productionData.released)) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Earning revenue
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Marketing Reach */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Marketing Reach</h2>
              <p className="text-sm text-muted-foreground">Expand your audience and engagement</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <span>Awareness</span>
            <ArrowRight className="h-3 w-3 mx-2" />
            <span>Engagement</span>
            <ArrowRight className="h-3 w-3 mx-2" />
            <span>Following</span>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3 relative">
          {/* Flow indicators for mobile */}
          <div className="md:hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-10 pointer-events-none">
            <div className="bg-background border rounded-full p-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="bg-background border rounded-full p-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>

          {/* Total Reach */}
          <Card className="relative border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Total Reach</span>
                <div className="flex items-center gap-1">
                  <ActionButton icon={Info} tooltip="View reach sources and demographics" />
                  <ActionButton icon={Bot} tooltip="Get AI insights for expanding reach" />
                  <ActionButton icon={Plug} tooltip="Connect marketing platforms" />
                  <ActionButton icon={Plus} tooltip="Add reach data manually" />
                </div>
              </CardTitle>
              <CardDescription className="text-xs">Unique people exposed to content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold tabular-nums">{(marketingData.totalReach / 1000).toFixed(0)}K</span>
                <div className="flex items-center gap-1">
                  {marketingData.isRealData ? (
                    <Badge className="text-xs bg-green-500/10 text-green-600 border-green-200">Live</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Demo</Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <ChartContainer config={reachChartConfig} className="h-16 w-full">
                  <AreaChart data={reachTrendData} margin={{ left: 0, right: 0, top: 2, bottom: 2 }}>
                    <defs>
                      <linearGradient id="fillReachMini" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="reach"
                      stroke="hsl(var(--chart-2))"
                      fill="url(#fillReachMini)"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </AreaChart>
                </ChartContainer>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">6-month growth</span>
                  <span className="font-medium text-green-600">+84%</span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Expanding awareness
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Engaged Audience */}
          <Card className="relative border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Engaged Audience</span>
                <div className="flex items-center gap-1">
                  <ActionButton icon={Info} tooltip="View engagement metrics and patterns" />
                  <ActionButton icon={Bot} tooltip="Get AI recommendations for engagement" />
                  <ActionButton icon={Plug} tooltip="Connect social media tools" />
                  <ActionButton icon={Plus} tooltip="Add engagement data manually" />
                </div>
              </CardTitle>
              <CardDescription className="text-xs">Active content interactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold tabular-nums text-purple-600">{(marketingData.engaged / 1000).toFixed(1)}K</span>
                <Badge variant="outline" className="text-xs border-purple-600 text-purple-600">Engaged</Badge>
              </div>
              <div className="space-y-2">
                <ChartContainer config={{
                  engaged: { label: "Engaged", color: "hsl(var(--chart-3))" }
                }} className="h-16 w-full">
                  <AreaChart data={reachTrendData} margin={{ left: 0, right: 0, top: 2, bottom: 2 }}>
                    <defs>
                      <linearGradient id="fillEngagedMini" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="engaged"
                      stroke="hsl(var(--chart-3))"
                      fill="url(#fillEngagedMini)"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </AreaChart>
                </ChartContainer>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Engagement Rate</span>
                  <span className="font-medium">{((marketingData.engaged / marketingData.totalReach) * 100).toFixed(1)}%</span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  High interaction quality
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total Followers */}
          <Card className="relative border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Total Followers</span>
                <div className="flex items-center gap-1">
                  <ActionButton icon={Info} tooltip="View follower breakdown by platform" />
                  <ActionButton icon={Bot} tooltip="Get AI strategies for follower growth" />
                  <ActionButton icon={Plug} tooltip="Connect social platforms" />
                  <ActionButton icon={Plus} tooltip="Add follower data manually" />
                </div>
              </CardTitle>
              <CardDescription className="text-xs">Across all platforms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold tabular-nums text-green-600">{(marketingData.followers / 1000).toFixed(1)}K</span>
                <Badge className="text-xs bg-green-500/10 text-green-600 border-green-200">Growing</Badge>
              </div>
              <div className="space-y-2">
                <ChartContainer config={{
                  followers: { label: "Followers", color: "hsl(var(--chart-1))" }
                }} className="h-16 w-full">
                  <LineChart data={[
                    { month: "Jan", followers: Math.round(marketingData.followers * 0.7) },
                    { month: "Feb", followers: Math.round(marketingData.followers * 0.75) },
                    { month: "Mar", followers: Math.round(marketingData.followers * 0.82) },
                    { month: "Apr", followers: Math.round(marketingData.followers * 0.88) },
                    { month: "May", followers: Math.round(marketingData.followers * 0.94) },
                    { month: "Jun", followers: marketingData.followers }
                  ]} margin={{ left: 0, right: 0, top: 2, bottom: 2 }}>
                    <Line
                      type="monotone"
                      dataKey="followers"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Conversion Rate</span>
                  <span className="font-medium">{Math.round((marketingData.followers / marketingData.engaged) * 100)}%</span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Building community
                </p>
              </div>
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Conversion Pipeline</h2>
              <p className="text-sm text-muted-foreground">Transform interest into revenue</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <span>Leads</span>
            <ArrowRight className="h-3 w-3 mx-2" />
            <span>Qualified</span>
            <ArrowRight className="h-3 w-3 mx-2" />
            <span>Closed</span>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3 relative">
          {/* Flow indicators for mobile */}
          <div className="md:hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-10 pointer-events-none">
            <div className="bg-background border rounded-full p-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="bg-background border rounded-full p-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>

          {/* Lead Generation */}
          <Card className="relative border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Lead Generation</span>
                <div className="flex items-center gap-1">
                  <ActionButton icon={Info} tooltip="View lead sources and performance" />
                  <ActionButton icon={Bot} tooltip="Get AI-powered lead generation insights" />
                  <ActionButton icon={Plug} tooltip="Connect lead capture tools" />
                  <ActionButton icon={Plus} tooltip="Add leads manually" />
                </div>
              </CardTitle>
              <CardDescription className="text-xs">Initial interest capture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold tabular-nums">{conversionData.leads}</span>
                <Badge variant="secondary" className="text-xs">Prospects</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-medium">+{Math.round(conversionData.leads * 0.15)}</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-blue-500 rounded-full" />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Growing pipeline
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Qualified Opportunities */}
          <Card className="relative border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Qualified Opportunities</span>
                <div className="flex items-center gap-1">
                  <ActionButton icon={Info} tooltip="View opportunity details and stages" />
                  <ActionButton icon={Bot} tooltip="Get AI recommendations for conversions" />
                  <ActionButton icon={Plug} tooltip="Connect CRM and sales tools" />
                  <ActionButton icon={Plus} tooltip="Add opportunity manually" />
                </div>
              </CardTitle>
              <CardDescription className="text-xs">Vetted prospects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold tabular-nums text-yellow-600">{conversionData.opportunities}</span>
                <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-600">Qualified</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Conversion</span>
                  <span className="font-medium">{Math.round((conversionData.opportunities / conversionData.leads) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${(conversionData.opportunities / conversionData.leads) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Ready to convert
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Closed Sales */}
          <Card className="relative border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Closed Sales</span>
                <div className="flex items-center gap-1">
                  <ActionButton icon={Info} tooltip="View sales performance and revenue" />
                  <ActionButton icon={Bot} tooltip="Analyze sales patterns with AI" />
                  <ActionButton icon={Plug} tooltip="Connect payment and analytics tools" />
                  <ActionButton icon={Plus} tooltip="Record sale manually" />
                </div>
              </CardTitle>
              <CardDescription className="text-xs">Successful conversions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold tabular-nums text-green-600">{conversionData.sales}</span>
                <Badge className="text-xs bg-green-500/10 text-green-600 border-green-200">Closed</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Close Rate</span>
                  <span className="font-medium">{Math.round((conversionData.sales / conversionData.opportunities) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(conversionData.sales / conversionData.opportunities) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Generating revenue
                  </p>
                  <span className="text-xs font-semibold text-green-600">
                    ${(pipelineMetrics?.conversion?.revenue || 12450).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </TooltipProvider>
  )
}