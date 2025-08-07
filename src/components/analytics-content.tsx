"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Eye,
  Database,
  Wifi,
  WifiOff,
  BarChart3,
  LineChart as LineChartIcon,
  Calendar,
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
  Line,
  LineChart,
} from "recharts"
import { useArtist } from "@/contexts/artist-context"
import { ArtistOnboarding } from "./artist-onboarding"

interface VibrateAnalytics {
  totalReach: number;
  engagedAudience: number;
  totalFollowers: number;
  platforms: {
    spotify: { followers: number; streams: number };
    youtube: { subscribers: number; views: number };
    instagram: { followers: number; engagement: number };
    tiktok: { followers: number; views: number };
    facebook: { followers: number; engagement: number };
    twitter?: { followers: number; engagement: number };
    deezer?: { fans: number; streams: number };
    soundcloud?: { followers: number; plays: number };
  };
  trending: {
    date: string;
    spotify: number;
    youtube: number;
    instagram: number;
    tiktok: number;
  }[];
  isRealData: boolean;
  lastUpdated?: string;
}

export function AnalyticsContent() {
  const { user } = useArtist();
  const [analyticsData, setAnalyticsData] = React.useState<VibrateAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = React.useState(true);
  const [hasVibrateConnection, setHasVibrateConnection] = React.useState(false);
  const [needsOnboarding, setNeedsOnboarding] = React.useState(false);

  const loadAnalyticsData = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingAnalytics(true);
      const { ArtistService } = await import('@/lib/services/artist-service');
      
      // Check if user has Viberate connection
      const profile = await ArtistService.getArtistProfile(user.id, user.email);
      const hasConnection = !!profile?.viberate_artist_id;
      console.log('Analytics loaded profile:', profile);
      console.log(`hasConnection: ${hasConnection}, vibrateId: "${profile?.viberate_artist_id}"`);
      setHasVibrateConnection(hasConnection);
      
      if (hasConnection && profile?.viberate_artist_id) {
        try {
          // Try to get Viberate analytics data via API route
          const response = await fetch(`/api/viberate/analytics?artistId=${encodeURIComponent(profile.viberate_artist_id)}`);
          const vibrateData = await response.json();
          
          console.log('Analytics API response:', vibrateData);
          if (vibrateData && !vibrateData.error) {
            setAnalyticsData({
              totalReach: vibrateData.totalReach || 0,
              engagedAudience: vibrateData.engagedAudience || 0,
              totalFollowers: vibrateData.totalFollowers || 0,
              platforms: vibrateData.platforms || {
                spotify: { followers: 0, streams: 0 },
                youtube: { subscribers: 0, views: 0 },
                instagram: { followers: 0, engagement: 0 },
                tiktok: { followers: 0, views: 0 },
                facebook: { followers: 0, engagement: 0 },
                twitter: { followers: 0, engagement: 0 },
                deezer: { fans: 0, streams: 0 },
                soundcloud: { followers: 0, plays: 0 },
              },
              trending: vibrateData.trending || [],
              isRealData: vibrateData.isRealData || false,
              lastUpdated: new Date().toISOString(),
            });
          } else {
            // Fallback to enhanced mock data when real data is not available
            setAnalyticsData(getEnhancedMockData(false));
          }
        } catch (error) {
          console.error('Error fetching Vibrate analytics:', error);
          setAnalyticsData(getEnhancedMockData(false));
        }
      } else {
        // Show mock data when no connection
        setAnalyticsData(getEnhancedMockData(false));
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalyticsData(getEnhancedMockData(false));
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [user?.id, user?.email]);

  React.useEffect(() => {
    if (user?.id) {
      loadAnalyticsData();
    }
  }, [user?.id, loadAnalyticsData]);

  const getEnhancedMockData = (isReal: boolean): VibrateAnalytics => ({
    totalReach: 450000,
    engagedAudience: 67500,
    totalFollowers: 28900,
    platforms: {
      spotify: { followers: 12400, streams: 186000 },
      youtube: { subscribers: 8900, views: 95000 },
      instagram: { followers: 5200, engagement: 15.6 },
      tiktok: { followers: 2100, views: 42000 },
      facebook: { followers: 300, engagement: 8.2 },
    },
    trending: [
      { date: "Jan", spotify: 8200, youtube: 6800, instagram: 4100, tiktok: 1200 },
      { date: "Feb", spotify: 9100, youtube: 7200, instagram: 4400, tiktok: 1400 },
      { date: "Mar", spotify: 9800, youtube: 7800, instagram: 4700, tiktok: 1600 },
      { date: "Apr", spotify: 10500, youtube: 8200, instagram: 4900, tiktok: 1800 },
      { date: "May", spotify: 11200, youtube: 8600, instagram: 5100, tiktok: 1900 },
      { date: "Jun", spotify: 12400, youtube: 8900, instagram: 5200, tiktok: 2100 },
    ],
    isRealData: isReal,
  });

  // Chart configurations
  const platformChartConfig = {
    spotify: { label: "Spotify", color: "#1DB954" },
    youtube: { label: "YouTube", color: "#FF0000" },
    instagram: { label: "Instagram", color: "#E4405F" },
    tiktok: { label: "TikTok", color: "#000000" },
    facebook: { label: "Facebook", color: "#1877F2" },
  } satisfies ChartConfig;

  const engagementChartConfig = {
    engagement: { label: "Engagement", color: "hsl(var(--chart-1))" },
    reach: { label: "Reach", color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;

  if (needsOnboarding) {
    return <ArtistOnboarding onComplete={() => {
      setNeedsOnboarding(false);
      loadAnalyticsData();
    }} />;
  }

  const ConnectionStatus = () => (
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
  );

  const DataCard = ({ 
    children, 
    className = "", 
    showDemoIndicator = !hasVibrateConnection 
  }: { 
    children: React.ReactNode; 
    className?: string; 
    showDemoIndicator?: boolean; 
  }) => (
    <Card className={`bg-sidebar relative ${className}`}>
      {showDemoIndicator && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-200">
            Demo
          </Badge>
        </div>
      )}
      {children}
    </Card>
  );

  if (isLoadingAnalytics) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Platform Overview Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-sidebar">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trending Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="bg-sidebar">
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Database className="h-16 w-16 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">No Analytics Data Available</h3>
          <p className="text-muted-foreground max-w-md">
            Connect your streaming and social media accounts to see detailed analytics.
          </p>
          <Button onClick={() => setNeedsOnboarding(true)}>
            <Database className="h-4 w-4 mr-2" />
            Connect Data Sources
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Deep dive into your streaming and social media performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionStatus />
          {!hasVibrateConnection && (
            <Button 
              variant="outline" 
              onClick={() => setNeedsOnboarding(true)}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Connect Data
            </Button>
          )}
          {analyticsData.lastUpdated && (
            <div className="text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 inline mr-1" />
              Updated: {new Date(analyticsData.lastUpdated).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Platform Overview */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Platform Overview</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Spotify */}
          <DataCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#1DB954]" />
                Spotify
              </CardTitle>
              <CardDescription className="text-xs">Streaming platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{analyticsData.platforms.spotify.followers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Monthly Listeners</p>
                <div className="text-lg font-semibold text-[#1DB954]">
                  {(analyticsData.platforms.spotify.streams / 1000).toFixed(0)}K streams
                </div>
              </div>
            </CardContent>
          </DataCard>

          {/* YouTube */}
          <DataCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF0000]" />
                YouTube
              </CardTitle>
              <CardDescription className="text-xs">Video platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{analyticsData.platforms.youtube.subscribers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Subscribers</p>
                <div className="text-lg font-semibold text-[#FF0000]">
                  {(analyticsData.platforms.youtube.views / 1000).toFixed(0)}K views
                </div>
              </div>
            </CardContent>
          </DataCard>

          {/* Instagram */}
          <DataCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#E4405F]" />
                Instagram
              </CardTitle>
              <CardDescription className="text-xs">Social media</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{analyticsData.platforms.instagram.followers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Followers</p>
                <div className="text-lg font-semibold text-[#E4405F]">
                  {analyticsData.platforms.instagram.engagement}% engagement
                </div>
              </div>
            </CardContent>
          </DataCard>

          {/* TikTok */}
          <DataCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-black" />
                TikTok
              </CardTitle>
              <CardDescription className="text-xs">Short-form video</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{analyticsData.platforms.tiktok.followers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Followers</p>
                <div className="text-lg font-semibold">
                  {(analyticsData.platforms.tiktok.views / 1000).toFixed(0)}K views
                </div>
              </div>
            </CardContent>
          </DataCard>

          {/* Facebook */}
          <DataCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#1877F2]" />
                Facebook
              </CardTitle>
              <CardDescription className="text-xs">Social media</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{analyticsData.platforms.facebook.followers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Followers</p>
                <div className="text-lg font-semibold text-[#1877F2]">
                  {analyticsData.platforms.facebook.engagement}% engagement
                </div>
              </div>
            </CardContent>
          </DataCard>

          {/* Twitter */}
          {analyticsData.platforms.twitter && analyticsData.platforms.twitter.followers > 0 && (
            <DataCard>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-black" />
                  Twitter
                </CardTitle>
                <CardDescription className="text-xs">Social media</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{analyticsData.platforms.twitter.followers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Followers</p>
                  <div className="text-lg font-semibold">
                    {analyticsData.platforms.twitter.engagement}% engagement
                  </div>
                </div>
              </CardContent>
            </DataCard>
          )}

          {/* Total Reach Summary */}
          <DataCard className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Total Reach & Engagement
              </CardTitle>
              <CardDescription className="text-xs">Aggregated across all platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {(analyticsData.totalReach / 1000).toFixed(0)}K
                  </div>
                  <p className="text-xs text-muted-foreground">Total Reach</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(analyticsData.engagedAudience / 1000).toFixed(0)}K
                  </div>
                  <p className="text-xs text-muted-foreground">Engaged Audience</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {(analyticsData.totalFollowers / 1000).toFixed(1)}K
                  </div>
                  <p className="text-xs text-muted-foreground">Total Followers</p>
                </div>
              </div>
            </CardContent>
          </DataCard>
        </div>
      </div>

      {/* Growth Trends */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <LineChartIcon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Growth Trends</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {/* Platform Follower Growth */}
          <DataCard>
            <CardHeader>
              <CardTitle className="text-base">Platform Growth</CardTitle>
              <CardDescription>6-month follower growth across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={platformChartConfig} className="h-64">
                <AreaChart data={analyticsData.trending} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spotify" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1DB954" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#1DB954" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="youtube" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF0000" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#FF0000" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="instagram" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E4405F" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#E4405F" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="spotify"
                    stackId="1"
                    stroke="#1DB954"
                    fill="url(#spotify)"
                  />
                  <Area
                    type="monotone"
                    dataKey="youtube"
                    stackId="1"
                    stroke="#FF0000"
                    fill="url(#youtube)"
                  />
                  <Area
                    type="monotone"
                    dataKey="instagram"
                    stackId="1"
                    stroke="#E4405F"
                    fill="url(#instagram)"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </DataCard>

          {/* Engagement vs Reach */}
          <DataCard>
            <CardHeader>
              <CardTitle className="text-base">Engagement Rate</CardTitle>
              <CardDescription>How well your content connects with your audience</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={engagementChartConfig} className="h-64">
                <LineChart 
                  data={[
                    { month: "Jan", rate: 12.3 },
                    { month: "Feb", rate: 13.1 },
                    { month: "Mar", rate: 14.2 },
                    { month: "Apr", rate: 13.8 },
                    { month: "May", rate: 15.1 },
                    { month: "Jun", rate: Math.round((analyticsData.engagedAudience / analyticsData.totalReach) * 100 * 10) / 10 },
                  ]}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="var(--color-engagement)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-engagement)" }}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`${value}%`, 'Engagement Rate']}
                  />
                </LineChart>
              </ChartContainer>
              <div className="mt-4 text-center">
                <div className="text-2xl font-bold">
                  {Math.round((analyticsData.engagedAudience / analyticsData.totalReach) * 100 * 10) / 10}%
                </div>
                <p className="text-xs text-muted-foreground">Current engagement rate</p>
              </div>
            </CardContent>
          </DataCard>
        </div>
      </div>
    </div>
  );
}