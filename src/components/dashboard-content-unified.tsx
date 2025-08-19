'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
} from "recharts";
import { Plus, TrendingUp, Users, Target, Music, FileText, Eye, MoreHorizontal, Calendar } from "lucide-react";
import { AddDataModal } from "./add-data-modal";
import { ProductionPipelineCards } from "./production-pipeline-cards";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Utility function to format numbers properly without showing 0K
const formatNumber = (num: number): string => {
  if (num === 0) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}


// Add Data Action Button Component
function AddDataButton({ 
  section,
  recordType,
  tooltip,
  onRecordAdded
}: { 
  section: 'production' | 'marketing' | 'fan_engagement';
  recordType: string;
  tooltip: string;
  onRecordAdded?: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <AddDataModal
      section={section}
      recordType={recordType}
      onRecordAdded={onRecordAdded}
      open={open}
      onOpenChange={setOpen}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 shrink-0"
            onClick={() => setOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-only">{tooltip}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </AddDataModal>
  );
}

// Helper function to generate recent months with real dates
function generateRecentMonths(count: number = 6) {
  const months = [];
  const now = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      fullDate: date.toISOString().split('T')[0],
      monthYear: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    });
  }
  
  return months;
}

interface DashboardData {
  overview: {
    marketing: {
      totalReach: number;
      engagedAudience: number;
      totalFollowers: number;
      isRealData: boolean;
    };
    production: {
      unfinished: number;
      finished: number;
      released: number;
    };
    fanEngagement: {
      capturedData: number;
      fans: number;
      superFans: number;
    };
  };
  metadata: {
    lastSynced: string;
    hasDataConnection: boolean;
  };
}

export function DashboardContentUnified() {
  const { user } = useAuth();
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [timeFilter, setTimeFilter] = React.useState<'all' | '6m' | '3m' | '1m'>('6m');
  const [chartData, setChartData] = React.useState<any>(null);
  const [chartLoading, setChartLoading] = React.useState(false);

  const loadDashboardData = React.useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Loading unified dashboard data for user:', user.id);
      
      const response = await fetch(`/api/dashboard/unified?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load dashboard data');
      }
      
      console.log('✅ Dashboard data loaded:', result);
      
      // Use the overview data from the API response
      const transformedData = {
        overview: result.overview,
        metadata: result.metadata
      };
      
      setData(transformedData);
      
    } catch (err) {
      console.error('❌ Error loading dashboard:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Set fallback data so dashboard shows 0 values instead of error
      setData({
        overview: {
          marketing: { totalReach: 0, engagedAudience: 0, totalFollowers: 0, isRealData: false },
          production: { unfinished: 0, finished: 0, released: 0 },
          fanEngagement: { capturedData: 0, fans: 0, superFans: 0 }
        },
        metadata: { lastSynced: new Date().toISOString(), hasDataConnection: false }
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Load chart data from API
  const loadChartData = React.useCallback(async () => {
    if (!user?.id) return;

    try {
      setChartLoading(true);
      console.log('📈 Loading chart data for time filter:', timeFilter);
      
      const response = await fetch(`/api/dashboard/charts?userId=${user.id}&timeFilter=${timeFilter}`);
      
      if (!response.ok) {
        throw new Error(`Chart API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Chart data loaded:', result.data);
        setChartData(result.data);
      } else {
        console.error('Failed to load chart data:', result);
        setChartData(null);
      }
    } catch (err) {
      console.error('❌ Error loading chart data:', err);
      setChartData(null);
    } finally {
      setChartLoading(false);
    }
  }, [user?.id, timeFilter]);

  // Function to refresh pipeline data
  const refreshPipelineData = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // Re-run the loadDashboardData function
      await loadDashboardData();
      await loadChartData();
    } catch (error) {
      console.error('Error refreshing pipeline data:', error);
    }
  }, [user?.id, loadDashboardData, loadChartData]);

  React.useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  React.useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  // Chart configurations (moved before early returns)
  const reachChartConfig = {
    reach: {
      label: "Reach",
      color: "hsl(var(--chart-2))",
    },
    engaged: {
      label: "Engaged",
      color: "hsl(var(--chart-3))",
    },
    followers: {
      label: "Followers",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  // Use real chart data from Viberate API (moved before early returns)
  const marketingTrendData = React.useMemo(() => {
    const marketing = data?.overview.marketing;
    
    if (chartData?.marketing?.followers && chartData.marketing.followers.length > 0) {
      console.log('📊 Using real Viberate data:', chartData.marketing.followers.length, 'data points');
      console.log('📊 Sample data:', chartData.marketing.followers.slice(0, 2));
      console.log('📊 Metadata:', chartData.metadata);
      
      // Use real Viberate data from API - properly formatted
      return chartData.marketing.followers.map((item: any) => {
        const itemDate = new Date(item.date);
        const monthLabel = itemDate.toLocaleDateString('en-US', { 
          month: 'short', 
          year: '2-digit' 
        });
        
        return {
          month: monthLabel,
          date: item.date,
          reach: item.total || 0,
          engaged: chartData.marketing.engagement.find((e: any) => e.date === item.date)?.value || 0,
          followers: item.total || 0,
          spotify: item.spotify || 0,
          instagram: item.instagram || 0,
          tiktok: item.tiktok || 0,
          youtube: item.youtube || 0,
          soundcloud: item.soundcloud || 0,
          beatport: item.beatport || 0,
          facebook: item.facebook || 0,
          twitter: item.twitter || 0,
          // Additional metadata for debugging
          artistCount: item.artistCount || 0,
          artists: item.artists || []
        };
      });
    } else {
      console.log('📊 No real data available, using fallback data');
      
      // Fallback to generated data if no real data available
      const recentMonths = generateRecentMonths(6);
      return recentMonths.map((monthInfo, index) => ({
        month: monthInfo.monthYear,
        date: monthInfo.fullDate,
        reach: index === recentMonths.length - 1 ? marketing?.totalReach || 0 : Math.round((marketing?.totalReach || 0) * (0.70 + (index * (0.30 / (recentMonths.length - 1))))),
        engaged: index === recentMonths.length - 1 ? marketing?.engagedAudience || 0 : Math.round((marketing?.engagedAudience || 0) * (0.70 + (index * (0.30 / (recentMonths.length - 1))))),
        followers: index === recentMonths.length - 1 ? marketing?.totalFollowers || 0 : Math.round((marketing?.totalFollowers || 0) * (0.70 + (index * (0.30 / (recentMonths.length - 1))))),
        spotify: 0,
        instagram: 0,
        tiktok: 0,
        youtube: 0,
        soundcloud: 0,
        beatport: 0,
        facebook: 0,
        twitter: 0,
        artistCount: 0,
        artists: []
      }));
    }
  }, [chartData, data?.overview.marketing]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const marketing = data?.overview.marketing;
  const production = data?.overview.production;
  const fanEngagement = data?.overview.fanEngagement;

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Business Intelligence Dashboard</h1>
          <div className="flex items-center gap-2">
            <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Last month</SelectItem>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="text-xs">
              {chartLoading ? '⏳ Loading...' : '🟢 Live Data'}
            </Badge>
            {chartData?.metadata && (
              <Badge variant="outline" className="text-xs">
                {chartData.metadata.artistCount} Artist{chartData.metadata.artistCount !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button variant="outline" size="sm">
              Manage Connection
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">
          Your complete view of performance across all business realms
        </p>
      </div>

      {error && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠️</span>
              <span className="text-sm text-yellow-800">
                {error} - Showing available data
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Production Pipeline */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Music className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Production Pipeline</h2>
            </div>
            <p className="text-sm text-muted-foreground">Track your creative output from idea to release</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>In Progress</span>
            <span>→</span>
            <span>Ready</span>
            <span>→</span>
            <span>Live</span>
          </div>
        </div>
        
        <ProductionPipelineCards 
          production={production || { unfinished: 0, finished: 0, released: 0 }} 
          onRecordAdded={refreshPipelineData}
        />
      </div>

      {/* Marketing Reach */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Marketing Reach</h2>
            </div>
            <p className="text-sm text-muted-foreground">Expand your audience and engagement</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Awareness</span>
            <span>→</span>
            <span>Engagement</span>
            <span>→</span>
            <span>Following</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium">Total Reach</CardTitle>
                  <CardDescription className="text-sm">Unique people exposed to content</CardDescription>
                </div>
                <div className="flex gap-1">
                </div>
              </div>
              <div className="text-4xl font-bold">{formatNumber(marketing?.totalReach || 0)}</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>6-month growth</span>
                  <span className="text-green-500 font-medium">+84%</span>
                </div>
                <Badge variant="outline" className="text-xs">Live</Badge>
              </div>
              <div className="space-y-2">
                <ChartContainer config={reachChartConfig} className="h-20 w-full">
                  <AreaChart data={marketingTrendData} margin={{ left: 0, right: 0, top: 2, bottom: 15 }}>
                    <defs>
                      <linearGradient id="fillReachMini" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    />
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
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>
                    {marketingTrendData.length > 0 && marketingTrendData[marketingTrendData.length - 1]?.artists?.length > 0
                      ? `${marketingTrendData[marketingTrendData.length - 1].artists.length} artist${marketingTrendData[marketingTrendData.length - 1].artists.length !== 1 ? 's' : ''} contributing`
                      : 'Expanding awareness'
                    }
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="border-purple-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium">Engaged Audience</CardTitle>
                  <CardDescription className="text-sm">Active content interactions</CardDescription>
                </div>
                <div className="flex gap-1">
                </div>
              </div>
              <div className="text-4xl font-bold">{formatNumber(marketing?.engagedAudience || 0)}</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>Engagement Rate</span>
                  <span className="text-purple-500 font-medium">12.0%</span>
                </div>
                <Badge variant="outline" className="text-xs">Engaged</Badge>
              </div>
              <div className="space-y-2">
                <ChartContainer config={{
                  engaged: { label: "Engaged", color: "hsl(var(--chart-3))" }
                }} className="h-20 w-full">
                  <AreaChart data={marketingTrendData} margin={{ left: 0, right: 0, top: 2, bottom: 15 }}>
                    <defs>
                      <linearGradient id="fillEngagedMini" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    />
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
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span>High interaction quality</span>
                </div>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium">Total Followers</CardTitle>
                  <CardDescription className="text-sm">Across all platforms</CardDescription>
                </div>
                <div className="flex gap-1">
                </div>
              </div>
              <div className="text-4xl font-bold">{formatNumber(marketing?.totalFollowers || 0)}</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>Follow-through Rate</span>
                  <span className="text-green-500 font-medium">55.6%</span>
                </div>
                <Badge variant="outline" className="text-xs">Growing</Badge>
              </div>
              <div className="space-y-2">
                <ChartContainer config={{
                  followers: { label: "Followers", color: "hsl(var(--chart-1))" }
                }} className="h-20 w-full">
                  <AreaChart data={marketingTrendData} margin={{ left: 0, right: 0, top: 2, bottom: 15 }}>
                    <defs>
                      <linearGradient id="fillFollowersMini" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="followers"
                      stroke="hsl(var(--chart-1))"
                      fill="url(#fillFollowersMini)"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </AreaChart>
                </ChartContainer>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>Building community</span>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Fan Engagement Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">Fan Engagement</h2>
            </div>
            <p className="text-sm text-muted-foreground">Build and engage your fanbase</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-cyan-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium">Data Captured</CardTitle>
                  <CardDescription className="text-sm">Email & contact information</CardDescription>
                </div>
                <div className="flex gap-1">
                  <AddDataButton 
                    section="fan_engagement" 
                    recordType="captured" 
                    tooltip="Add contact data manually"
                    onRecordAdded={refreshPipelineData}
                  />
                </div>
              </div>
              <div className="text-4xl font-bold">{formatNumber(fanEngagement?.capturedData || 0)}</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>Growth Rate</span>
                  <span className="text-green-500 font-medium">+31%</span>
                </div>
                <Badge variant="outline" className="text-xs">Potential</Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>Building database</span>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium">Active Fans</CardTitle>
                  <CardDescription className="text-sm">Regular engagement & support</CardDescription>
                </div>
                <div className="flex gap-1">
                  <AddDataButton 
                    section="fan_engagement" 
                    recordType="fans" 
                    tooltip="Add fan activity manually"
                    onRecordAdded={refreshPipelineData}
                  />
                </div>
              </div>
              <div className="text-4xl font-bold">{formatNumber(fanEngagement?.fans || 0)}</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>Conversion Rate</span>
                  <span className="text-orange-500 font-medium">{fanEngagement?.capturedData ? Math.round((fanEngagement.fans / fanEngagement.capturedData) * 100) : 0}%</span>
                </div>
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Target className="h-3 w-3" />
                <span>Consistent engagement</span>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="border-pink-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium">Super Fans</CardTitle>
                  <CardDescription className="text-sm">Most loyal advocates</CardDescription>
                </div>
                <div className="flex gap-1">
                  <AddDataButton 
                    section="fan_engagement" 
                    recordType="super_fans" 
                    tooltip="Add super fan manually"
                    onRecordAdded={refreshPipelineData}
                  />
                </div>
              </div>
              <div className="text-4xl font-bold">{fanEngagement?.superFans || 0}</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>Elite Rate</span>
                  <span className="text-pink-500 font-medium">{fanEngagement?.fans ? Math.round((fanEngagement.superFans / fanEngagement.fans) * 100) : 0}%</span>
                </div>
                <Badge variant="outline" className="text-xs">VIP</Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>Brand ambassadors</span>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Metadata */}
      {data?.metadata && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Last updated: {new Date(data.metadata.lastSynced).toLocaleString()}
              </span>
              <span>
                {data.metadata.hasDataConnection ? '🟢 Data Connected' : '🔴 No Data Connection'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </TooltipProvider>
  );
}