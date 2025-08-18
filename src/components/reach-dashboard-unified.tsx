'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Target, Eye, Music, Play } from "lucide-react";

interface ReachData {
  reach: {
    totalReach: number;
    engagedAudience: number;
    totalFollowers: number;
    artistRank: number;
    platforms: {
      spotify: { followers: number; monthlyListeners: number; streams: number };
      youtube: { subscribers: number; views: number };
      instagram: { followers: number; engagement: number };
      tiktok: { followers: number; views: number };
      facebook: { followers: number; engagement: number };
      twitter: { followers: number };
    };
    isRealData: boolean;
  };
  metadata: {
    lastSynced: string;
    hasVibrateConnection: boolean;
  };
}

export function ReachDashboardUnified() {
  const { user } = useAuth();
  const [data, setData] = React.useState<ReachData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadReachData = React.useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Loading unified reach data for user:', user.id);
      
      const response = await fetch(`/api/dashboard/unified?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load reach data');
      }
      
      console.log('✅ Reach data loaded:', result);
      setData(result);
      
    } catch (err) {
      console.error('❌ Error loading reach dashboard:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Set fallback data
      setData({
        reach: {
          totalReach: 0,
          engagedAudience: 0,
          totalFollowers: 0,
          artistRank: 0,
          platforms: {
            spotify: { followers: 0, monthlyListeners: 0, streams: 0 },
            youtube: { subscribers: 0, views: 0 },
            instagram: { followers: 0, engagement: 0 },
            tiktok: { followers: 0, views: 0 },
            facebook: { followers: 0, engagement: 0 },
            twitter: { followers: 0 }
          },
          isRealData: false
        },
        metadata: { lastSynced: new Date().toISOString(), hasVibrateConnection: false }
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    loadReachData();
  }, [loadReachData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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

  const reach = data?.reach;
  const platforms = reach?.platforms;

  return (
    <div className="space-y-8">
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reach Analytics</h1>
          <p className="text-muted-foreground">
            Track your audience growth and engagement across all platforms
          </p>
        </div>
        {data?.metadata.hasVibrateConnection && (
          <Badge variant="secondary">Viberate Connected</Badge>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reach?.totalReach.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              People reached across platforms
            </p>
            {!reach?.isRealData && (
              <Badge variant="outline" className="mt-2 text-xs">No data</Badge>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reach?.totalFollowers.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined follower count
            </p>
            {!reach?.isRealData && (
              <Badge variant="outline" className="mt-2 text-xs">No data</Badge>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engaged Audience</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reach?.engagedAudience.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active interactions
            </p>
            {!reach?.isRealData && (
              <Badge variant="outline" className="mt-2 text-xs">No data</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Platform Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Spotify */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Music className="h-4 w-4 text-green-500" />
                Spotify
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Followers</span>
                <span className="font-medium">{platforms?.spotify.followers.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Monthly Listeners</span>
                <span className="font-medium">{platforms?.spotify.monthlyListeners.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Streams</span>
                <span className="font-medium">{platforms?.spotify.streams.toLocaleString() || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* YouTube */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Play className="h-4 w-4 text-red-500" />
                YouTube
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Subscribers</span>
                <span className="font-medium">{platforms?.youtube.subscribers.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Views</span>
                <span className="font-medium">{platforms?.youtube.views.toLocaleString() || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Instagram */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-pink-500" />
                Instagram
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Followers</span>
                <span className="font-medium">{platforms?.instagram.followers.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Engagement Rate</span>
                <span className="font-medium">{platforms?.instagram.engagement || 0}%</span>
              </div>
            </CardContent>
          </Card>

          {/* TikTok */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Music className="h-4 w-4 text-black" />
                TikTok
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Followers</span>
                <span className="font-medium">{platforms?.tiktok.followers.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Views</span>
                <span className="font-medium">{platforms?.tiktok.views.toLocaleString() || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Facebook */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Facebook
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Followers</span>
                <span className="font-medium">{platforms?.facebook.followers.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Engagement Rate</span>
                <span className="font-medium">{platforms?.facebook.engagement || 0}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Twitter */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Twitter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Followers</span>
                <span className="font-medium">{platforms?.twitter.followers.toLocaleString() || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* No Data Message */}
      {!reach?.isRealData && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-medium">No Analytics Data Available</h3>
              <p className="text-sm text-muted-foreground">
                {data?.metadata.hasVibrateConnection 
                  ? "Data is being synced from Viberate. Check back in a few minutes."
                  : "Connect your Viberate account to see real analytics data."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      {data?.metadata && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Last updated: {new Date(data.metadata.lastSynced).toLocaleString()}
              </span>
              <span>
                {data.metadata.hasVibrateConnection ? '🟢 Viberate Connected' : '🔴 No Viberate Connection'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}