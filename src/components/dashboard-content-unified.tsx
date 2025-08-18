'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, Target, Music, FileText, Eye, MoreHorizontal } from "lucide-react";

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

  React.useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Business Intelligence Dashboard</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              🟢 Live Data
            </Badge>
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium">In Progress</CardTitle>
                  <CardDescription className="text-sm">Projects in development</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Target className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-4xl font-bold">{production?.unfinished || 0}</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>Priority</span>
                  <span className="text-red-500 font-medium">High</span>
                </div>
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
              <div className="w-full bg-orange-100 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>Focus on completion</span>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="border-yellow-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium">Ready to Release</CardTitle>
                  <CardDescription className="text-sm">Completed, awaiting launch</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Target className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-4xl font-bold">{production?.finished || 0}</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>Next Release</span>
                  <span className="text-yellow-600 font-medium">2 weeks</span>
                </div>
                <Badge variant="outline" className="text-xs">Ready</Badge>
              </div>
              <div className="w-full bg-yellow-100 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                <span>Schedule releases</span>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium">Live Catalog</CardTitle>
                  <CardDescription className="text-sm">Live & generating revenue</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Target className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-4xl font-bold">{production?.released || 0}</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>Completion</span>
                  <span className="text-green-600 font-medium">100%</span>
                </div>
                <Badge variant="outline" className="text-xs">Live</Badge>
              </div>
              <div className="w-full bg-green-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>Earning revenue</span>
              </div>
            </CardHeader>
          </Card>
        </div>
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
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Target className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-4xl font-bold">{marketing?.totalReach ? `${(marketing.totalReach / 1000).toFixed(0)}K` : '0'}</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>6-month growth</span>
                  <span className="text-green-500 font-medium">+84%</span>
                </div>
                <Badge variant="outline" className="text-xs">Live</Badge>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '84%' }}></div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>Expanding awareness</span>
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
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Target className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-4xl font-bold">{marketing?.engagedAudience ? `${(marketing.engagedAudience / 1000).toFixed(1)}K` : '0'}</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>Engagement Rate</span>
                  <span className="text-purple-500 font-medium">12.0%</span>
                </div>
                <Badge variant="outline" className="text-xs">Engaged</Badge>
              </div>
              <div className="w-full bg-purple-100 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Target className="h-3 w-3" />
                <span>High interaction quality</span>
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
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Target className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-4xl font-bold">{marketing?.totalFollowers ? `${(marketing.totalFollowers / 1000).toFixed(1)}K` : '0'}</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>Follow-through Rate</span>
                  <span className="text-green-500 font-medium">55.6%</span>
                </div>
                <Badge variant="outline" className="text-xs">Growing</Badge>
              </div>
              <div className="w-full bg-green-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>Building community</span>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Captured Data</CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fanEngagement?.capturedData || 0}</div>
              <p className="text-xs text-muted-foreground">
                Fan data collected
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fans</CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fanEngagement?.fans ? `${(fanEngagement.fans / 1000).toFixed(1)}K` : '0'}</div>
              <p className="text-xs text-muted-foreground">
                Active fans
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Super Fans</CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fanEngagement?.superFans || 0}</div>
              <p className="text-xs text-muted-foreground">
                Highly engaged fans
              </p>
            </CardContent>
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
  );
}