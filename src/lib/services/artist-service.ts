import { supabase } from '@/lib/supabaseClient';

export interface ArtistMetric {
  id: string;
  user_id: string;
  metric_type: 'streams' | 'followers' | 'engagement' | 'reach' | 'revenue';
  platform?: string;
  value: number;
  date: string;
  metadata?: Record<string, unknown>;
}

export interface Release {
  id: string;
  user_id: string;
  title: string;
  artist_name: string;
  release_type: 'single' | 'ep' | 'album' | 'compilation';
  release_date?: string;
  cover_image_url?: string;
  platforms: Record<string, string>;
  status: 'draft' | 'scheduled' | 'released' | 'archived';
  metadata?: Record<string, unknown>;
}

export interface DashboardSummary {
  artist_score: number;
  metrics: Record<string, {
    current: number;
    previous: number;
    change_percent?: number;
  }>;
  releases: {
    total_releases: number;
    recent_releases: number;
  };
  goals: {
    total_goals: number;
    completed_goals: number;
  };
  updated_at: string;
}

export class ArtistService {
  /**
   * Get dashboard summary for an artist
   */
  static async getDashboardSummary(userId: string): Promise<DashboardSummary | null> {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_summary', {
        artist_id: userId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      return null;
    }
  }

  /**
   * Record artist metrics
   */
  static async recordMetric(metric: Omit<ArtistMetric, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('artist_metrics')
        .upsert({
          user_id: metric.user_id,
          metric_type: metric.metric_type,
          platform: metric.platform,
          value: metric.value,
          date: metric.date,
          metadata: metric.metadata || {}
        }, {
          onConflict: 'user_id,metric_type,platform,date'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error recording metric:', error);
      return false;
    }
  }

  /**
   * Get metrics for a specific time period
   */
  static async getMetrics(
    userId: string,
    metricType?: string,
    platform?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ArtistMetric[]> {
    try {
      let query = supabase
        .from('artist_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (metricType) {
        query = query.eq('metric_type', metricType);
      }

      if (platform) {
        query = query.eq('platform', platform);
      }

      if (startDate) {
        query = query.gte('date', startDate);
      }

      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return [];
    }
  }

  /**
   * Create or update a release
   */
  static async saveRelease(release: Omit<Release, 'id'> & { id?: string }): Promise<Release | null> {
    try {
      const releaseData = {
        user_id: release.user_id,
        title: release.title,
        artist_name: release.artist_name,
        release_type: release.release_type,
        release_date: release.release_date,
        cover_image_url: release.cover_image_url,
        platforms: release.platforms,
        status: release.status,
        metadata: release.metadata || {}
      };

      let query;
      if (release.id) {
        query = supabase
          .from('releases')
          .update(releaseData)
          .eq('id', release.id)
          .select()
          .single();
      } else {
        query = supabase
          .from('releases')
          .insert(releaseData)
          .select()
          .single();
      }

      const { data, error } = await query;
      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error saving release:', error);
      return null;
    }
  }

  /**
   * Get releases for an artist
   */
  static async getReleases(userId: string, status?: string): Promise<Release[]> {
    try {
      let query = supabase
        .from('releases')
        .select('*')
        .eq('user_id', userId)
        .order('release_date', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching releases:', error);
      return [];
    }
  }

  /**
   * Get artist profile with enhanced data
   */
  static async getArtistProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          artist_metrics (
            metric_type,
            platform,
            value,
            date
          ),
          releases (
            id,
            title,
            release_type,
            release_date,
            status
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching artist profile:', error);
      return null;
    }
  }

  /**
   * Update artist profile
   */
  static async updateProfile(userId: string, updates: Partial<{
    artist_name: string;
    stage_name: string;
    genre: string;
    bio: string;
    profile_image_url: string;
    website_url: string;
    social_links: Record<string, string>;
    viberate_artist_id?: string;
  }>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }

  /**
   * Get trending metrics for comparison
   */
  static async getTrendingData(userId: string, days: number = 30) {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      const metrics = await this.getMetrics(userId, undefined, undefined, startDate, endDate);
      
      // Group by metric type and calculate trends
      const trends = metrics.reduce((acc, metric) => {
        if (!acc[metric.metric_type]) {
          acc[metric.metric_type] = [];
        }
        acc[metric.metric_type].push({
          date: metric.date,
          value: metric.value,
          platform: metric.platform
        });
        return acc;
      }, {} as Record<string, Array<{ date: string; value: number; platform?: string }>>);

      return trends;
    } catch (error) {
      console.error('Error fetching trending data:', error);
      return {};
    }
  }

  /**
   * Batch update metrics (for syncing from external APIs)
   */
  static async batchUpdateMetrics(metrics: Omit<ArtistMetric, 'id'>[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('artist_metrics')
        .upsert(metrics, {
          onConflict: 'user_id,metric_type,platform,date'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error batch updating metrics:', error);
      return false;
    }
  }

  /**
   * Get business pipeline metrics
   */
  static async getPipelineMetrics(userId: string): Promise<{
    production: { unfinished: number; finished: number; released: number };
    marketing: { totalReach: number; engagedAudience: number; totalFollowers: number; youtubeSubscribers: number };
    fanEngagement: { capturedData: number; fans: number; superFans: number };
    conversion: { leads: number; opportunities: number; sales: number; revenue: number };
  } | null> {
    try {
      const { data, error } = await supabase.rpc('get_pipeline_metrics', {
        artist_id: userId
      });

      if (error) throw error;
      
      return {
        production: {
          unfinished: data?.production?.unfinished || 0,
          finished: data?.production?.finished || 0,
          released: data?.production?.released || 0
        },
        marketing: {
          totalReach: data?.marketing?.total_reach || 0,
          engagedAudience: data?.marketing?.engaged_audience || 0,
          totalFollowers: data?.marketing?.total_followers || 0,
          youtubeSubscribers: data?.marketing?.youtube_subscribers || 0
        },
        fanEngagement: {
          capturedData: data?.fan_engagement?.captured_data || 0,
          fans: data?.fan_engagement?.fans || 0,
          superFans: data?.fan_engagement?.super_fans || 0
        },
        conversion: {
          leads: data?.conversion?.leads || 0,
          opportunities: data?.conversion?.opportunities || 0,
          sales: data?.conversion?.sales || 0,
          revenue: data?.conversion?.revenue || 0
        }
      };
    } catch (error) {
      console.error('Error fetching pipeline metrics:', error);
      return null;
    }
  }
}