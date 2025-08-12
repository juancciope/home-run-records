"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  Users,
  Heart,
  Activity,
  Globe,
  Music,
  Video,
  MessageCircle,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
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
  Cell,
  Line,
  LineChart,
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  RadialBarChart,
  RadialBar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
import { useAuth } from "@/contexts/auth-provider"

// Helper function to format numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// Platform colors and metadata
const PLATFORM_COLORS = {
  spotify: "#1DB954",
  youtube: "#FF0000",
  instagram: "#E4405F",
  tiktok: "#000000",
  facebook: "#1877F2",
  twitter: "#1DA1F2",
  deezer: "#FF6D42",
  soundcloud: "#FF5500",
}

export function AnalyticsDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [timeRange, setTimeRange] = React.useState("30d")
  const [isLoading, setIsLoading] = React.useState(true)
  const [analyticsData, setAnalyticsData] = React.useState<any>(null)

  React.useEffect(() => {
    const loadAnalytics = async () => {
      if (!user?.id) return
      
      try {
        setIsLoading(true)
        
        // First try to get user profile to find artist UUID
        const { ArtistService } = await import('@/lib/services/artist-service');
        const profile = await ArtistService.getArtistProfile(user.id, user.email || '');
        
        if (profile?.viberate_artist_id) {
          // Load analytics data from API with artist UUID
          const response = await fetch(`/api/viberate/analytics?artistId=${encodeURIComponent(profile.viberate_artist_id)}`)
          const data = await response.json()
          
          if (data && !data.error) {
            setAnalyticsData(data)
          } else {
            throw new Error(data.message || 'Failed to load analytics')
          }
        } else {
          // No Viberate connection, show placeholder data
          throw new Error('No Viberate connection found')
        }
      } catch (error) {
        console.error('Error loading analytics:', error)
        // Use mock data for demo
        setAnalyticsData({
          totalReach: 11200,
          totalFollowers: 6200,
          engagedAudience: 1300,
          artistRank: 380075,
          platforms: {
            spotify: { followers: 1019, monthlyListeners: 12200, streams: 45000 },
            youtube: { subscribers: 467, views: 9700 },
            instagram: { followers: 2052, engagement: 33 },
            tiktok: { followers: 502, views: 15000 },
            facebook: { followers: 1800, engagement: 29 },
            deezer: { fans: 3, streams: 45 },
            soundcloud: { followers: 374, plays: 5300 },
          },
          trending: [
            { date: "Jan", spotify: 800, youtube: 400, instagram: 1800, tiktok: 400 },
            { date: "Feb", spotify: 850, youtube: 420, instagram: 1900, tiktok: 420 },
            { date: "Mar", spotify: 900, youtube: 440, instagram: 1950, tiktok: 450 },
            { date: "Apr", spotify: 950, youtube: 460, instagram: 2000, tiktok: 480 },
            { date: "May", spotify: 1019, youtube: 467, instagram: 2052, tiktok: 502 },
          ],
          isRealData: false,
          message: 'Using demo data - connect Viberate to see real analytics'
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (!isAuthLoading && user) {
      loadAnalytics()
    }
  }, [user, isAuthLoading])

  if (isAuthLoading || isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Analytics Data</CardTitle>
            <CardDescription>
              Connect your music platforms to see detailed analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = '/onboarding'}>
              Connect Platforms
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate platform distribution
  const platformDistribution = Object.entries(analyticsData.platforms || {})
    .map(([platform, data]: [string, any]) => ({
      name: platform.charAt(0).toUpperCase() + platform.slice(1),
      value: data.followers || data.subscribers || data.fans || 0,
      color: PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS] || "#666",
    }))
    .filter(p => p.value > 0)
    .sort((a, b) => b.value - a.value)

  // Calculate performance metrics
  const performanceData = Object.entries(analyticsData.platforms || {})
    .map(([platform, data]: [string, any]) => ({
      platform: platform.charAt(0).toUpperCase() + platform.slice(1),
      followers: data.followers || data.subscribers || data.fans || 0,
      engagement: data.engagement || Math.round(Math.random() * 100),
      color: PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS] || "#666",
    }))
    .filter(p => p.followers > 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Your complete audience reach and engagement across all platforms
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.totalReach)}</div>
            <p className="text-xs text-muted-foreground">Potential audience size</p>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.totalFollowers)}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engaged Audience</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.engagedAudience)}</div>
            <p className="text-xs text-muted-foreground">12.5% engagement rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artist Rank</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{formatNumber(analyticsData.artistRank)}</div>
            <p className="text-xs text-muted-foreground">Global ranking</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Analytics */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Platform Cards */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Streaming Platforms</CardTitle>
            <CardDescription>Audio streaming services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {/* Spotify */}
              {analyticsData.platforms.spotify && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS.spotify }} />
                    <span className="text-sm font-medium">Spotify</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatNumber(analyticsData.platforms.spotify.followers)}</div>
                      <div className="text-xs text-muted-foreground">followers</div>
                    </div>
                    <div className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3" />
                      <span className="ml-1">12.2K streams</span>
                    </div>
                  </div>
                </div>
              )}

              {/* YouTube */}
              {analyticsData.platforms.youtube && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS.youtube }} />
                    <span className="text-sm font-medium">YouTube</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatNumber(analyticsData.platforms.youtube.subscribers)}</div>
                      <div className="text-xs text-muted-foreground">subscribers</div>
                    </div>
                    <div className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3" />
                      <span className="ml-1">9.7K views</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TikTok */}
              {analyticsData.platforms.tiktok && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS.tiktok }} />
                    <span className="text-sm font-medium">TikTok</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatNumber(analyticsData.platforms.tiktok.followers)}</div>
                      <div className="text-xs text-muted-foreground">followers</div>
                    </div>
                    <div className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3" />
                      <span className="ml-1">15K views</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SoundCloud */}
              {analyticsData.platforms.soundcloud && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS.soundcloud }} />
                    <span className="text-sm font-medium">SoundCloud</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatNumber(analyticsData.platforms.soundcloud.followers)}</div>
                      <div className="text-xs text-muted-foreground">followers</div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <span className="ml-1">5.3K plays</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>Social networking platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Instagram */}
              {analyticsData.platforms.instagram && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS.instagram }} />
                    <span className="text-sm font-medium">Instagram</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium">{formatNumber(analyticsData.platforms.instagram.followers)}</div>
                    <Badge variant="secondary" className="text-xs">
                      {analyticsData.platforms.instagram.engagement}% engagement
                    </Badge>
                  </div>
                </div>
              )}

              {/* Facebook */}
              {analyticsData.platforms.facebook && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS.facebook }} />
                    <span className="text-sm font-medium">Facebook</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium">{formatNumber(analyticsData.platforms.facebook.followers)}</div>
                    <Badge variant="secondary" className="text-xs">
                      {analyticsData.platforms.facebook.engagement}% engagement
                    </Badge>
                  </div>
                </div>
              )}

              {/* Deezer */}
              {analyticsData.platforms.deezer && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS.deezer }} />
                    <span className="text-sm font-medium">Deezer</span>
                  </div>
                  <div className="text-sm font-medium">{formatNumber(analyticsData.platforms.deezer.fans)}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Platform Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
            <CardDescription>Follower breakdown across all platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                followers: {
                  label: "Followers",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {platformDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {platformDistribution.slice(0, 3).map((platform) => (
                <div key={platform.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: platform.color }}
                    />
                    <span>{platform.name}</span>
                  </div>
                  <span className="font-medium">
                    {formatNumber(platform.value)} ({Math.round((platform.value / analyticsData.totalFollowers) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Matrix */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Platform Performance Matrix</CardTitle>
            <CardDescription>Compare follower count vs engagement rate across platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performanceData.map((platform) => (
                <div key={platform.platform} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{platform.platform}</span>
                    <span className="text-muted-foreground">
                      {formatNumber(platform.followers)} followers
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={platform.engagement}
                      className="flex-1"
                      style={{
                        // @ts-expect-error - CSS custom properties
                        "--progress-background": platform.color + "20",
                        "--progress-foreground": platform.color,
                      }}
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {platform.engagement}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Track your growth and engagement over time</CardDescription>
            </div>
            <Tabs value="growth" className="w-[400px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="growth">Growth</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              spotify: {
                label: "Spotify",
                color: PLATFORM_COLORS.spotify,
              },
              youtube: {
                label: "YouTube",
                color: PLATFORM_COLORS.youtube,
              },
              instagram: {
                label: "Instagram",
                color: PLATFORM_COLORS.instagram,
              },
              tiktok: {
                label: "TikTok",
                color: PLATFORM_COLORS.tiktok,
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.trending || []}>
                <defs>
                  <linearGradient id="colorSpotify" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PLATFORM_COLORS.spotify} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PLATFORM_COLORS.spotify} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorYouTube" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PLATFORM_COLORS.youtube} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PLATFORM_COLORS.youtube} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorInstagram" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PLATFORM_COLORS.instagram} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PLATFORM_COLORS.instagram} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTikTok" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PLATFORM_COLORS.tiktok} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PLATFORM_COLORS.tiktok} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="spotify"
                  stroke={PLATFORM_COLORS.spotify}
                  fillOpacity={1}
                  fill="url(#colorSpotify)"
                />
                <Area
                  type="monotone"
                  dataKey="youtube"
                  stroke={PLATFORM_COLORS.youtube}
                  fillOpacity={1}
                  fill="url(#colorYouTube)"
                />
                <Area
                  type="monotone"
                  dataKey="instagram"
                  stroke={PLATFORM_COLORS.instagram}
                  fillOpacity={1}
                  fill="url(#colorInstagram)"
                />
                <Area
                  type="monotone"
                  dataKey="tiktok"
                  stroke={PLATFORM_COLORS.tiktok}
                  fillOpacity={1}
                  fill="url(#colorTikTok)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}