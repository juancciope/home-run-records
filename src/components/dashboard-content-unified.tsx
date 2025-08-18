'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Users, Target, Music, FileText, DollarSign, Eye } from "lucide-react";

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
    conversion: {
      leads: number;
      opportunities: number;
      sales: number;
      revenue: number;
    };
  };
  metadata: {
    lastSynced: string;
    hasVibrateConnection: boolean;
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
      setData(result);
      
    } catch (err) {
      console.error('❌ Error loading dashboard:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Set fallback data so dashboard shows 0 values instead of error
      setData({
        overview: {
          marketing: { totalReach: 0, engagedAudience: 0, totalFollowers: 0, isRealData: false },
          production: { unfinished: 0, finished: 0, released: 0 },
          fanEngagement: { capturedData: 0, fans: 0, superFans: 0 },
          conversion: { leads: 0, opportunities: 0, sales: 0, revenue: 0 }
        },
        metadata: { lastSynced: new Date().toISOString(), hasVibrateConnection: false }
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
  const conversion = data?.overview.conversion;

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

      {/* Marketing Reach Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Marketing Reach</h2>
            {data?.metadata.hasVibrateConnection && (
              <Badge variant="secondary" className="text-xs">Viberate Connected</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Expand your audience and engagement</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {marketing?.totalReach.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Unique people exposed to content
              </p>
              {!marketing?.isRealData && (
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
                {marketing?.totalFollowers.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all platforms
              </p>
              {!marketing?.isRealData && (
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
                {marketing?.engagedAudience.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Active content interactions
              </p>
              {!marketing?.isRealData && (
                <Badge variant="outline" className="mt-2 text-xs">No data</Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Production Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Production</h2>
          </div>
          <p className="text-sm text-muted-foreground">Track your music creation pipeline</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unfinished</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{production?.unfinished || 0}</div>
              <p className="text-xs text-muted-foreground">
                Works in progress
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ready to Release</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{production?.finished || 0}</div>
              <p className="text-xs text-muted-foreground">
                Completed tracks
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Catalog</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{production?.released || 0}</div>
              <p className="text-xs text-muted-foreground">
                Published releases
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fan Engagement Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold">Fan Engagement</h2>
          </div>
          <p className="text-sm text-muted-foreground">Build and engage your fanbase</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Captured Data</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
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
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fanEngagement?.fans || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active fans
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Super Fans</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
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

      {/* Conversion Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-yellow-600" />
            <h2 className="text-xl font-semibold">Conversion</h2>
          </div>
          <p className="text-sm text-muted-foreground">Turn fans into revenue</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversion?.leads || 0}</div>
              <p className="text-xs text-muted-foreground">
                Potential customers
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversion?.opportunities || 0}</div>
              <p className="text-xs text-muted-foreground">
                Sales opportunities
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversion?.sales || 0}</div>
              <p className="text-xs text-muted-foreground">
                Completed sales
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${Number(conversion?.revenue || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total revenue
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
                {data.metadata.hasVibrateConnection ? '🟢 Viberate Connected' : '🔴 No Viberate Connection'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}