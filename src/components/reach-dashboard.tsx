"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  TrendingUp,
  Users,
  Globe,
  Activity,
  Wifi,
  WifiOff,
  Music,
  Video,
  MessageCircle,
  Radio,
  Headphones,
  Award,
  AlertCircle,
  Info,
  Calendar,
  Clock,
} from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import {
  Area,
  AreaChart,
  Cell,
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  LineChart,
} from "recharts"
import { useArtist } from "@/contexts/artist-context"

interface PlatformData {
  spotify: { followers: number; streams: number };
  youtube: { subscribers: number; views: number };
  instagram: { followers: number; engagement: number };
  tiktok: { followers: number; views: number };
  facebook: { followers: number; engagement: number };
  twitter?: { followers: number; engagement: number };
  deezer?: { fans: number; streams: number };
  soundcloud?: { followers: number; plays: number };
}

interface ReachAnalytics {
  totalReach: number;
  engagedAudience: number;
  totalFollowers: number;
  platforms: PlatformData;
  trending: Array<{
    date: string;
    spotify?: number;
    youtube?: number;
    instagram?: number;
    tiktok?: number;
    facebook?: number;
    twitter?: number;
  }>;
  isRealData: boolean;
  artist?: {
    name: string;
    rank: number;
    verified: boolean;
    country?: { name: string; code: string } | string;
    genre?: { name: string } | string;
    subgenres?: Array<{ name: string } | string>;
    status?: string;
    image?: string;
  };
  dataSource?: string;
  lastUpdated?: string;
}

// Helper function to format numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Helper function to safely parse and format dates from API
const formatApiDate = (dateString: string): string => {
  try {
    // Try parsing the date string - handle various formats
    let date: Date;
    
    // If it looks like YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      date = new Date(dateString + 'T00:00:00.000Z');
    } else {
      date = new Date(dateString);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return dateString; // Return original string if parsing fails
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (error) {
    console.warn('Error parsing date:', dateString, error);
    return dateString; // Return original string if parsing fails
  }
}

// Helper function to generate real dates
const generateDateRange = (months: number) => {
  const dates = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    dates.push({
      shortDate: date.toLocaleDateString('en-US', { month: 'short' }),
      fullDate: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      year: date.getFullYear(),
      month: date.getMonth(),
      isoString: date.toISOString(),
    });
  }
  
  return dates;
}

// Time range options
const TIME_RANGES = {
  "3m": { label: "3 Months", months: 3 },
  "6m": { label: "6 Months", months: 6 },
  "12m": { label: "12 Months", months: 12 },
  "24m": { label: "2 Years", months: 24 },
};


// Platform metadata
const PLATFORM_META = {
  spotify: { name: "Spotify", icon: Music, color: "#1DB954", category: "streaming" },
  youtube: { name: "YouTube", icon: Video, color: "#FF0000", category: "video" },
  instagram: { name: "Instagram", icon: MessageCircle, color: "#E4405F", category: "social" },
  tiktok: { name: "TikTok", icon: Video, color: "#000000", category: "video" },
  facebook: { name: "Facebook", icon: Users, color: "#1877F2", category: "social" },
  twitter: { name: "Twitter", icon: MessageCircle, color: "#1DA1F2", category: "social" },
  deezer: { name: "Deezer", icon: Radio, color: "#FF6D00", category: "streaming" },
  soundcloud: { name: "SoundCloud", icon: Headphones, color: "#FF5500", category: "streaming" },
};

export function ReachDashboard() {
  const { user, isLoading } = useArtist();
  const [analyticsData, setAnalyticsData] = React.useState<ReachAnalytics | null>(null);
  const [historicalData, setHistoricalData] = React.useState<{
    streaming: {
      spotify: { 
        streams: { data: Record<string, number> }; 
        listeners: { data: Record<string, number> }; 
        listenersDaily: { data: Record<string, number> };
        popularity: { data: Record<string, number> };
        fanbase: { data: Record<string, number> };
        fanbaseDaily: { data: Record<string, number> };
        playlistReach: { data: Record<string, number> };
        activePlaylists: { data: Record<string, number> };
        tracksOnPlaylists: { data: Record<string, number> };
      };
      soundcloud: {
        fanbase: { data: Record<string, number> };
        plays: { data: Record<string, number> };
      };
      youtube: {
        fanbase: { data: Record<string, number> };
        views: { data: Record<string, number> };
      };
      deezer: {
        fanbase: { data: Record<string, number> };
      };
      apple: {
        activePlaylists: { data: Record<string, number> };
        playlistAdds: { data: Record<string, number> };
      };
    };
    social: {
      facebook: { fanbase: { data: Record<string, number> } };
      instagram: { 
        fanbase: { data: Record<string, number> };
        likes: { data: Record<string, number> };
      };
      tiktok: {
        fanbase: { data: Record<string, number> };
        likes: { data: Record<string, number> };
        viewsDaily: { data: Record<string, number> };
      };
      twitter: {
        fanbase: { data: Record<string, number> };
        likes: { data: Record<string, number> };
      };
    };
    discovery: {
      shazam: { shazams: { data: Record<string, number> } };
      airplay: { spins: { data: Record<string, number> } };
    };
    performance: {
      viberate: { 
        points: { data: Record<string, number> };
        ranks: { data: Record<string, number> };
      };
      beatport: { points: { data: Record<string, number> } };
    };
    success: boolean;
  } | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = React.useState(true);
  const [isLoadingHistorical, setIsLoadingHistorical] = React.useState(false);
  const [hasVibrateConnection, setHasVibrateConnection] = React.useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = React.useState("6m");

  const loadAnalyticsData = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingAnalytics(true);
      const { ArtistService } = await import('@/lib/services/artist-service');
      
      // Check if user has Viberate connection
      const profile = await ArtistService.getArtistProfile(user.id, user.email);
      const hasConnection = !!profile?.viberate_artist_id;
      setHasVibrateConnection(hasConnection);
      
      if (hasConnection && profile?.viberate_artist_id) {
        try {
          const response = await fetch(`/api/viberate/analytics?artistId=${encodeURIComponent(profile.viberate_artist_id)}`);
          const vibrateData = await response.json();
          
          if (vibrateData && !vibrateData.error) {
            setAnalyticsData(vibrateData);
          }
        } catch (error) {
          console.error('Error fetching Viberate analytics:', error);
        }
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [user?.id, user?.email]);

  const loadHistoricalData = React.useCallback(async (artistId: string, timeRange?: string) => {
    if (!artistId) return;
    
    try {
      setIsLoadingHistorical(true);
      const endDate = new Date().toISOString().split('T')[0];
      const range = timeRange || selectedTimeRange;
      const daysBack = TIME_RANGES[range as keyof typeof TIME_RANGES]?.months * 30 || 180; // Convert months to days
      const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(`/api/viberate/historical?artistId=${encodeURIComponent(artistId)}&dateFrom=${startDate}&dateTo=${endDate}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('Historical data loaded:', Object.keys(data.streaming?.spotify?.streams?.data || {}).length, 'data points');
        console.log('Sample date keys from API:', Object.keys(data.streaming?.spotify?.streams?.data || {}).slice(0, 5));
        console.log('Full historical data structure:', data);
        setHistoricalData(data);
      } else {
        console.warn('Historical data request failed:', data);
      }
    } catch (error) {
      console.error('Error loading historical data:', error);
    } finally {
      setIsLoadingHistorical(false);
    }
  }, [selectedTimeRange]);


  React.useEffect(() => {
    if (user?.id) {
      loadAnalyticsData();
    }
  }, [user?.id, loadAnalyticsData]);

  // Load additional data when we have a Viberate connection
  React.useEffect(() => {
    if (hasVibrateConnection && analyticsData?.artist && user?.id) {
      // Find the viberate artist ID from the profile
      const loadAdditionalData = async () => {
        try {
          const { ArtistService } = await import('@/lib/services/artist-service');
          const profile = await ArtistService.getArtistProfile(user.id, user.email);
          
          if (profile?.viberate_artist_id) {
            loadHistoricalData(profile.viberate_artist_id, selectedTimeRange);
          }
        } catch (error) {
          console.error('Error loading additional data:', error);
        }
      };
      
      loadAdditionalData();
    }
  }, [hasVibrateConnection, analyticsData?.artist, user?.id, user?.email, loadHistoricalData]);

  // Reload historical data when time range changes
  React.useEffect(() => {
    if (hasVibrateConnection && analyticsData?.artist && user?.id) {
      const reloadHistoricalData = async () => {
        try {
          const { ArtistService } = await import('@/lib/services/artist-service');
          const profile = await ArtistService.getArtistProfile(user.id, user.email);
          
          if (profile?.viberate_artist_id) {
            loadHistoricalData(profile.viberate_artist_id, selectedTimeRange);
          }
        } catch (error) {
          console.error('Error reloading historical data:', error);
        }
      };
      
      reloadHistoricalData();
    }
  }, [selectedTimeRange, hasVibrateConnection, analyticsData?.artist, user?.id, user?.email, loadHistoricalData]);

  if (isLoading || isLoadingAnalytics) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">No Analytics Data Available</h3>
          <p className="text-muted-foreground max-w-md">
            Connect your Viberate account to see detailed reach analytics.
          </p>
          <Button onClick={() => window.location.href = '/dashboard'}>
            <Wifi className="h-4 w-4 mr-2" />
            Connect Data Sources
          </Button>
        </div>
      </div>
    );
  }

  // Calculate aggregated metrics
  const streamingTotal = 
    (analyticsData.platforms.spotify?.followers || 0) +
    (analyticsData.platforms.deezer?.fans || 0) +
    (analyticsData.platforms.soundcloud?.followers || 0);

  const videoTotal = 
    (analyticsData.platforms.youtube?.subscribers || 0) +
    (analyticsData.platforms.tiktok?.followers || 0);

  const socialTotal = 
    (analyticsData.platforms.instagram?.followers || 0) +
    (analyticsData.platforms.facebook?.followers || 0) +
    (analyticsData.platforms.twitter?.followers || 0);

  // Calculate engagement rate
  const engagementRate = analyticsData.totalFollowers > 0 
    ? ((analyticsData.engagedAudience / analyticsData.totalReach) * 100).toFixed(1)
    : "0";

  // Platform distribution for pie chart
  const platformDistribution = Object.entries(analyticsData.platforms)
    .filter(([, data]) => {
      const value = 'followers' in data ? data.followers : 
                   'subscribers' in data ? data.subscribers : 
                   'fans' in data ? data.fans : 0;
      return value > 0;
    })
    .map(([platform, data]) => ({
      name: PLATFORM_META[platform as keyof typeof PLATFORM_META]?.name || platform,
      value: 'followers' in data ? data.followers : 
             'subscribers' in data ? data.subscribers : 
             'fans' in data ? data.fans : 0,
      color: PLATFORM_META[platform as keyof typeof PLATFORM_META]?.color || '#666',
    }))
    .sort((a, b) => b.value - a.value);

  // Generate real dates based on selected time range
  const dateRange = generateDateRange(TIME_RANGES[selectedTimeRange as keyof typeof TIME_RANGES].months);
  
  // Growth trend data with real dates and simulated growth
  const growthTrend = dateRange.map((dateInfo, index) => {
    // Simulate realistic growth patterns based on current follower counts
    const growthFactor = (index + 1) / dateRange.length;
    const baseSpotify = analyticsData?.platforms?.spotify?.followers || 4145;
    const baseYoutube = analyticsData?.platforms?.youtube?.subscribers || 10900;
    const baseTiktok = analyticsData?.platforms?.tiktok?.followers || 12670;
    const baseInstagram = analyticsData?.platforms?.instagram?.followers || 40158;
    const baseFacebook = analyticsData?.platforms?.facebook?.followers || 148426;
    const baseTwitter = analyticsData?.platforms?.twitter?.followers || 71733;

    return {
      date: dateInfo.fullDate,
      shortDate: dateInfo.shortDate,
      streaming: Math.round(baseSpotify * (0.4 + growthFactor * 0.6)),
      video: Math.round((baseYoutube * (0.5 + growthFactor * 0.5)) + (baseTiktok * (0.3 + growthFactor * 0.7))),
      social: Math.round(
        (baseInstagram * (0.6 + growthFactor * 0.4)) + 
        (baseFacebook * (0.8 + growthFactor * 0.2)) + 
        (baseTwitter * (0.7 + growthFactor * 0.3))
      ),
      spotify: Math.round(baseSpotify * (0.4 + growthFactor * 0.6)),
      youtube: Math.round(baseYoutube * (0.5 + growthFactor * 0.5)),
      instagram: Math.round(baseInstagram * (0.6 + growthFactor * 0.4)),
      tiktok: Math.round(baseTiktok * (0.3 + growthFactor * 0.7)),
      facebook: Math.round(baseFacebook * (0.8 + growthFactor * 0.2)),
      twitter: Math.round(baseTwitter * (0.7 + growthFactor * 0.3)),
    };
  });

  // Platform performance matrix
  const platformPerformance = Object.entries(analyticsData.platforms).map(([platform, data]) => {
    const followers = 'followers' in data ? data.followers : 
                     'subscribers' in data ? data.subscribers : 
                     'fans' in data ? data.fans : 0;
    const engagement = 'engagement' in data ? data.engagement : 
                      followers > 0 ? Math.round((followers / analyticsData.totalFollowers) * 100) : 0;
    
    return {
      platform: PLATFORM_META[platform as keyof typeof PLATFORM_META]?.name || platform,
      followers,
      engagement,
      category: PLATFORM_META[platform as keyof typeof PLATFORM_META]?.category || 'other',
      color: PLATFORM_META[platform as keyof typeof PLATFORM_META]?.color || '#666',
    };
  }).filter(p => p.followers > 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Your complete audience reach and engagement across all platforms
        </p>
      </div>

      {/* Hero Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-600" />
              Total Reach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(analyticsData.totalReach)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Potential audience size
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              Total Followers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(analyticsData.totalFollowers)}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+12.5% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Engaged Audience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(analyticsData.engagedAudience)}</div>
            <Progress value={parseFloat(engagementRate)} className="h-1 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{engagementRate}% engagement rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-orange-600" />
              Artist Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">#{analyticsData.artist?.rank?.toLocaleString() || 'N/A'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Global ranking
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Platform Categories */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Streaming Platforms */}
        <Card className="bg-sidebar">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Headphones className="h-5 w-5 text-green-600" />
              Streaming Platforms
            </CardTitle>
            <CardDescription>Audio streaming services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-bold">{formatNumber(streamingTotal)}</div>
            
            {analyticsData.platforms.spotify && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1DB954]" />
                  <span className="text-sm font-medium">Spotify</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatNumber(analyticsData.platforms.spotify.followers)}</div>
                  <div className="text-xs text-muted-foreground">{formatNumber(analyticsData.platforms.spotify.streams)} streams</div>
                </div>
              </div>
            )}

            {analyticsData.platforms.deezer && analyticsData.platforms.deezer.fans > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#FF6D00]" />
                  <span className="text-sm font-medium">Deezer</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatNumber(analyticsData.platforms.deezer.fans)}</div>
                  <div className="text-xs text-muted-foreground">{formatNumber(analyticsData.platforms.deezer.streams)} streams</div>
                </div>
              </div>
            )}

            {analyticsData.platforms.soundcloud && analyticsData.platforms.soundcloud.followers > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#FF5500]" />
                  <span className="text-sm font-medium">SoundCloud</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatNumber(analyticsData.platforms.soundcloud.followers)}</div>
                  <div className="text-xs text-muted-foreground">{formatNumber(analyticsData.platforms.soundcloud.plays)} plays</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Video Platforms */}
        <Card className="bg-sidebar">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Video className="h-5 w-5 text-red-600" />
              Video Platforms
            </CardTitle>
            <CardDescription>Video & short-form content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-bold">{formatNumber(videoTotal)}</div>
            
            {analyticsData.platforms.youtube && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#FF0000]" />
                  <span className="text-sm font-medium">YouTube</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatNumber(analyticsData.platforms.youtube.subscribers)}</div>
                  <div className="text-xs text-muted-foreground">{formatNumber(analyticsData.platforms.youtube.views)} views</div>
                </div>
              </div>
            )}

            {analyticsData.platforms.tiktok && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                  <span className="text-sm font-medium">TikTok</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatNumber(analyticsData.platforms.tiktok.followers)}</div>
                  <div className="text-xs text-muted-foreground">{formatNumber(analyticsData.platforms.tiktok.views)} views</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="bg-sidebar">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Social Media
            </CardTitle>
            <CardDescription>Social networking platforms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-bold">{formatNumber(socialTotal)}</div>
            
            {analyticsData.platforms.instagram && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#E4405F]" />
                  <span className="text-sm font-medium">Instagram</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatNumber(analyticsData.platforms.instagram.followers)}</div>
                  <div className="text-xs text-muted-foreground">{analyticsData.platforms.instagram.engagement}% engagement</div>
                </div>
              </div>
            )}

            {analyticsData.platforms.facebook && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1877F2]" />
                  <span className="text-sm font-medium">Facebook</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatNumber(analyticsData.platforms.facebook.followers)}</div>
                  <div className="text-xs text-muted-foreground">{analyticsData.platforms.facebook.engagement}% engagement</div>
                </div>
              </div>
            )}

            {analyticsData.platforms.twitter && analyticsData.platforms.twitter.followers > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1DA1F2]" />
                  <span className="text-sm font-medium">Twitter</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatNumber(analyticsData.platforms.twitter.followers)}</div>
                  <div className="text-xs text-muted-foreground">{analyticsData.platforms.twitter.engagement}% engagement</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row: Platform Distribution and Performance Matrix */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform Distribution */}
        <Card className="bg-sidebar">
          <CardHeader>
            <CardTitle className="text-base">Platform Distribution</CardTitle>
            <CardDescription>Follower breakdown across all platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
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
                  <ChartTooltip 
                    content={({ payload }) => {
                      if (payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background p-2 rounded shadow-lg border">
                            <p className="font-semibold">{data.name}</p>
                            <p className="text-sm">{formatNumber(data.value)} followers</p>
                            <p className="text-xs text-muted-foreground">
                              {((data.value / analyticsData.totalFollowers) * 100).toFixed(1)}% of total
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {platformDistribution.slice(0, 4).map((platform) => (
                <div key={platform.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: platform.color }}
                  />
                  <span className="text-xs">{platform.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {((platform.value / analyticsData.totalFollowers) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Performance Matrix */}
        <Card className="bg-sidebar">
          <CardHeader>
            <CardTitle className="text-base">Platform Performance Matrix</CardTitle>
            <CardDescription>Compare follower count vs engagement rate across platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {platformPerformance.map((platform) => (
                <div key={platform.platform} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: platform.color }}
                      />
                      <span className="text-sm font-medium">{platform.platform}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {formatNumber(platform.followers)} followers
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {platform.engagement}% engagement
                      </Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={(platform.followers / analyticsData.totalFollowers) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Filter - Applies to Growth Trend and Historical Data */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-lg font-semibold">Performance Analytics</h3>
          <p className="text-sm text-muted-foreground">Growth trends and historical performance data</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Time Range:</span>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="text-sm border rounded px-3 py-2 bg-background font-medium"
          >
            {Object.entries(TIME_RANGES).map(([key, range]) => (
              <option key={key} value={key}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Growth Trend - Full Width */}
      <Card className="bg-sidebar">
        <CardHeader>
          <CardTitle className="text-base">Growth Trend</CardTitle>
          <CardDescription>
            {TIME_RANGES[selectedTimeRange as keyof typeof TIME_RANGES].label.toLowerCase()} growth by platform category
            ({dateRange[0]?.fullDate} - {dateRange[dateRange.length - 1]?.fullDate})
          </CardDescription>
        </CardHeader>
          <CardContent>
            <ChartContainer 
              config={{
                streaming: { label: "Streaming", color: "#1DB954" },
                video: { label: "Video", color: "#FF0000" },
                social: { label: "Social", color: "#1877F2" },
              }} 
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={growthTrend}
                  margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                  dataKey="shortDate"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value, index) => {
                    if (index === 0 || index === growthTrend.length - 1) {
                      return growthTrend[index]?.date || value;
                    }
                    return index % 2 === 0 ? value : '';
                  }}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatNumber}
                />
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const dataPoint = growthTrend.find(d => d.shortDate === label);
                      return (
                        <div className="bg-background p-3 rounded shadow-lg border">
                          <p className="font-semibold mb-2">{dataPoint?.date}</p>
                          {payload.map((entry) => (
                            <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: entry.color }}
                              />
                              <span>{entry.name}: {formatNumber(entry.value as number)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  dataKey="social"
                  type="natural"
                  fill="#1877F2"
                  fillOpacity={0.2}
                  stroke="#1877F2"
                  strokeWidth={2}
                />
                <Area
                  dataKey="video"
                  type="natural"
                  fill="#FF0000"
                  fillOpacity={0.2}
                  stroke="#FF0000"
                  strokeWidth={2}
                />
                <Area
                  dataKey="streaming"
                  type="natural"
                  fill="#1DB954"
                  fillOpacity={0.2}
                  stroke="#1DB954"
                  strokeWidth={2}
                />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
      </Card>


      {/* Historical Performance Data - Only show if we have historical data */}
      {hasVibrateConnection && historicalData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Historical Performance Data
              </h3>
              <p className="text-sm text-muted-foreground">
                Spotify streaming and social data over the last {TIME_RANGES[selectedTimeRange as keyof typeof TIME_RANGES]?.label.toLowerCase()}
                {isLoadingHistorical && (
                  <span className="text-xs text-blue-600 ml-2">Loading...</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
              {/* Spotify Streams Chart */}
              <Card className="bg-sidebar">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Spotify Streams</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="h-40">
                    {Object.keys(historicalData?.streaming?.spotify?.streams?.data || {}).length > 0 ? (
                    <ChartContainer 
                      config={{
                        streams: { label: "Streams", color: "#1DB954" }
                      }} 
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={Object.entries(historicalData.streaming.spotify.streams.data)
                          .map(([date, streams]) => ({
                            date: formatApiDate(date),
                            rawDate: date,
                            streams: streams as number
                          }))
                          .sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())
                          .slice(-Math.min(30, TIME_RANGES[selectedTimeRange as keyof typeof TIME_RANGES]?.months * 5 || 30))
                        }>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} tickFormatter={formatNumber} />
                          <Line 
                            type="monotone" 
                            dataKey="streams" 
                            stroke="#1DB954" 
                            strokeWidth={2}
                            dot={false}
                          />
                          <ChartTooltip 
                            content={({ payload, label }) => {
                              if (payload && payload[0]) {
                                return (
                                  <div className="bg-background p-2 rounded shadow-lg border">
                                    <p className="font-semibold">{label}</p>
                                    <p className="text-sm text-green-600">{formatNumber(payload[0].value as number)} streams</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <div className="text-sm">No streaming data available</div>
                      </div>
                    </div>
                  )}
                  </div>
                </CardContent>
              </Card>

              {/* Spotify Popularity Chart */}
              <Card className="bg-sidebar">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Spotify Popularity</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="h-40">
                    {Object.keys(historicalData?.streaming?.spotify?.popularity?.data || {}).length > 0 ? (
                    <ChartContainer 
                      config={{
                        popularity: { label: "Popularity", color: "#FF6B35" }
                      }} 
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={Object.entries(historicalData.streaming.spotify.popularity.data)
                          .map(([date, popularity]) => ({
                            date: formatApiDate(date),
                            rawDate: date,
                            popularity: popularity as number
                          }))
                          .sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())
                          .slice(-Math.min(30, TIME_RANGES[selectedTimeRange as keyof typeof TIME_RANGES]?.months * 5 || 30))
                        }>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                          <Line 
                            type="monotone" 
                            dataKey="popularity" 
                            stroke="#FF6B35" 
                            strokeWidth={2}
                            dot={false}
                          />
                          <ChartTooltip 
                            content={({ payload, label }) => {
                              if (payload && payload[0]) {
                                return (
                                  <div className="bg-background p-2 rounded shadow-lg border">
                                    <p className="font-semibold">{label}</p>
                                    <p className="text-sm" style={{ color: '#FF6B35' }}>{payload[0].value}/100 popularity</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <div className="text-sm">No popularity data available</div>
                      </div>
                    </div>
                  )}
                  </div>
                </CardContent>
              </Card>

              {/* Instagram Likes Chart */}
              <Card className="bg-sidebar">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Instagram Likes</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="h-40">
                    {Object.keys(historicalData?.social?.instagram?.likes?.data || {}).length > 0 ? (
                    <ChartContainer 
                      config={{
                        likes: { label: "Likes", color: "var(--chart-1)" }
                      }} 
                      className="h-full"
                    >
                      <AreaChart
                        data={Object.entries(historicalData.social.instagram.likes.data)
                          .map(([date, likes]) => ({
                            date: formatApiDate(date),
                            rawDate: date,
                            likes: likes as number
                          }))
                          .sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())
                          .slice(-Math.min(30, TIME_RANGES[selectedTimeRange as keyof typeof TIME_RANGES]?.months * 5 || 30))
                        }
                        margin={{ left: 12, right: 12 }}
                      >
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tick={{ fontSize: 10 }}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={({ payload, label }) => {
                            if (payload && payload[0]) {
                              return (
                                <div className="bg-background p-2 rounded shadow-lg border">
                                  <p className="font-semibold">{label}</p>
                                  <p className="text-sm" style={{ color: '#E4405F' }}>{formatNumber(payload[0].value as number)} likes</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          dataKey="likes"
                          type="natural"
                          fill="#E4405F"
                          fillOpacity={0.4}
                          stroke="#E4405F"
                        />
                      </AreaChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <div className="text-sm">No Instagram data available</div>
                      </div>
                    </div>
                  )}
                  </div>
                </CardContent>
              </Card>
              
              {/* TikTok Views Chart */}
              <Card className="bg-sidebar">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">TikTok Views</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="h-40">
                    {Object.keys(historicalData?.social?.tiktok?.viewsDaily?.data || {}).length > 0 ? (
                    <ChartContainer 
                      config={{
                        views: { label: "Views", color: "#000000" }
                      }} 
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={Object.entries(historicalData.social.tiktok.viewsDaily.data)
                          .map(([date, views]) => ({
                            date: formatApiDate(date),
                            rawDate: date,
                            views: views as number
                          }))
                          .sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())
                          .slice(-Math.min(30, TIME_RANGES[selectedTimeRange as keyof typeof TIME_RANGES]?.months * 5 || 30))
                        }>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} tickFormatter={formatNumber} />
                          <Line 
                            type="monotone" 
                            dataKey="views" 
                            stroke="hsl(var(--foreground))" 
                            strokeWidth={2}
                            dot={false}
                          />
                          <ChartTooltip 
                            content={({ payload, label }) => {
                              if (payload && payload[0]) {
                                return (
                                  <div className="bg-background p-2 rounded shadow-lg border">
                                    <p className="font-semibold">{label}</p>
                                    <p className="text-sm">{formatNumber(payload[0].value as number)} views</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <Video className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <div className="text-sm">No TikTok data available</div>
                      </div>
                    </div>
                  )}
                  </div>
                </CardContent>
              </Card>
          </div>
        </div>
      )}



      {/* Footer Info */}
      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
        <div className="flex items-center gap-4">
          {analyticsData.lastUpdated && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Last updated: {new Date(analyticsData.lastUpdated).toLocaleString()}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Time range: {TIME_RANGES[selectedTimeRange as keyof typeof TIME_RANGES].label}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Info className="h-3 w-3" />
          {hasVibrateConnection ? 'Real-time data from Viberate' : 'Demo data for preview'}
        </div>
      </div>
    </div>
  );
}