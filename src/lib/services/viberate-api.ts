import { createClient } from '@/utils/supabase/client';

// Viberate API Types based on real API response
export interface VibrateArtist {
  uuid: string;
  id?: string;
  name: string;
  slug: string;
  image: string;
  bio?: string;
  verified: boolean;
  rank?: number;
  spotify_id?: string;
  country?: any;
  genre?: any;
  subgenres?: any[];
  status?: string;
  social_links?: Array<{
    platform?: string;
    name?: string;
    url: string;
  }>;
  tracks?: any[];
  events?: any[];
  fanbase?: any;
  similar_artists?: any[];
  ranks?: any;
  fetched_at?: string;
  metrics?: {
    instagram_followers?: number;
    tiktok_followers?: number;
    facebook_followers?: number;
    twitter_followers?: number;
    youtube_subscribers?: number;
    spotify_followers?: number;
    spotify_monthly_listeners?: number;
    deezer_followers?: number;
    soundcloud_followers?: number;
    total_followers?: number;
    engagement_rate?: number;
  };
}

export interface VibrateSearchResult {
  uuid: string;
  id: string;
  name: string;
  slug: string;
  image: string;
  verified?: boolean;
  rank?: number;
  spotify_id?: string;
}

export interface VibrateAnalytics {
  artist_id: string;
  totalReach: number;
  engagedAudience: number;
  totalFollowers: number;
  youtubeSubscribers: number;
  isRealData: boolean;
  platforms: {
    [platform: string]: {
      followers?: number;
      subscribers?: number;
      monthly_listeners?: number;
      engagement_rate?: number;
    };
  };
}

export class VibrateService {
  private static readonly BASE_URL = 'https://api.viberate.com/v1';
  private static readonly API_KEY = process.env.VIBERATE_API_KEY;

  /**
   * Search for artists by name
   * This is what we're currently using successfully
   */
  static async searchArtist(query: string): Promise<VibrateSearchResult[]> {
    try {
      // Use our existing endpoint that works
      const response = await fetch(`/api/viberate/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error searching artists:', error);
      return [];
    }
  }

  /**
   * Get detailed artist information by UUID
   */
  static async getArtistDetails(uuid: string): Promise<VibrateArtist | null> {
    try {
      const response = await fetch(`/api/viberate/artist/${uuid}`);
      
      if (!response.ok) {
        console.error(`Failed to fetch artist details: ${response.status}`);
        return null;
      }

      const result = await response.json();
      
      if (result.error || !result.success) {
        console.error('Artist details error:', result.error);
        return null;
      }

      // Return the actual artist data from the API response
      return result.data;
    } catch (error) {
      console.error('Error fetching artist details:', error);
      return null;
    }
  }

  /**
   * Get analytics data for an artist
   */
  static async getArtistAnalytics(artistId: string): Promise<VibrateAnalytics | null> {
    try {
      const response = await fetch(`/api/viberate/analytics?artistId=${encodeURIComponent(artistId)}`);
      
      if (!response.ok) {
        console.error(`Failed to fetch analytics: ${response.status}`);
        return null;
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('Analytics error:', data.error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }

  /**
   * Sync artist data from Viberate to our database
   */
  static async syncArtistData(userId: string, artistUuid: string): Promise<{success: boolean, message: string}> {
    try {
      const response = await fetch('/api/viberate/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          artistId: artistUuid
        })
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error syncing artist data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Sync failed'
      };
    }
  }

  /**
   * Update artist profile in our database with Viberate data
   */
  static async updateArtistProfile(userId: string, artistData: VibrateArtist): Promise<boolean> {
    try {
      const supabase = createClient();
      
      // Get user email for the required email field
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email;
      
      if (!userEmail) {
        console.error('User email not available for profile update');
        return false;
      }
      
      // Prepare the profile update data
      const profileUpdate = {
        id: userId, // Ensure the user ID is included
        email: userEmail, // Required field
        viberate_artist_id: artistData.id || artistData.uuid,
        viberate_uuid: artistData.uuid,
        viberate_slug: artistData.slug,
        viberate_verified: artistData.verified || false,
        viberate_rank: artistData.rank,
        viberate_last_sync: new Date().toISOString(),
        
        // Update artist name if not set
        artist_name: artistData.name,
        profile_image_url: artistData.image,
        
        // Social media URLs - handle real Viberate API format
        instagram_url: this.extractSocialUrl(artistData.social_links, 'instagram'),
        tiktok_url: this.extractSocialUrl(artistData.social_links, 'tiktok'),
        facebook_url: this.extractSocialUrl(artistData.social_links, 'facebook'),
        twitter_url: this.extractSocialUrl(artistData.social_links, 'twitter'),
        youtube_url: this.extractSocialUrl(artistData.social_links, 'youtube'),
        spotify_url: this.extractSocialUrl(artistData.social_links, 'spotify'),
        apple_music_url: this.extractSocialUrl(artistData.social_links, 'apple_music'),
        deezer_url: this.extractSocialUrl(artistData.social_links, 'deezer'),
        soundcloud_url: this.extractSocialUrl(artistData.social_links, 'soundcloud'),
        spotify_id: artistData.spotify_id,
        
        // Metrics
        instagram_followers: artistData.metrics?.instagram_followers || 0,
        tiktok_followers: artistData.metrics?.tiktok_followers || 0,
        facebook_followers: artistData.metrics?.facebook_followers || 0,
        twitter_followers: artistData.metrics?.twitter_followers || 0,
        youtube_subscribers: artistData.metrics?.youtube_subscribers || 0,
        spotify_followers: artistData.metrics?.spotify_followers || 0,
        spotify_monthly_listeners: artistData.metrics?.spotify_monthly_listeners || 0,
        deezer_followers: artistData.metrics?.deezer_followers || 0,
        soundcloud_followers: artistData.metrics?.soundcloud_followers || 0,
        total_followers: artistData.metrics?.total_followers || 0,
        engagement_rate: artistData.metrics?.engagement_rate || 0,
        
        // Social links as JSON
        social_links: artistData.social_links || {},
        
        // Mark onboarding as completed
        onboarding_completed: true,
        
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('artist_profiles')
        .upsert(profileUpdate, { 
          onConflict: 'id'
        });

      if (error) {
        console.error('Error updating artist profile:', error);
        return false;
      }

      console.log('Artist profile updated successfully');
      return true;
    } catch (error) {
      console.error('Error in updateArtistProfile:', error);
      return false;
    }
  }

  /**
   * Store historical metrics for tracking
   */
  static async storeMetrics(userId: string, artistData: VibrateArtist): Promise<void> {
    try {
      const supabase = createClient();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const metrics = [];
      
      // Add various metrics if they exist
      if (artistData.metrics?.instagram_followers) {
        metrics.push({
          user_id: userId,
          metric_type: 'followers',
          platform: 'instagram',
          value: artistData.metrics.instagram_followers,
          date: today
        });
      }

      if (artistData.metrics?.spotify_monthly_listeners) {
        metrics.push({
          user_id: userId,
          metric_type: 'streams',
          platform: 'spotify',
          value: artistData.metrics.spotify_monthly_listeners,
          date: today
        });
      }

      if (artistData.metrics?.youtube_subscribers) {
        metrics.push({
          user_id: userId,
          metric_type: 'followers',
          platform: 'youtube',
          value: artistData.metrics.youtube_subscribers,
          date: today
        });
      }

      if (artistData.metrics?.total_followers) {
        metrics.push({
          user_id: userId,
          metric_type: 'followers',
          platform: 'total',
          value: artistData.metrics.total_followers,
          date: today
        });
      }

      if (metrics.length > 0) {
        const { error } = await supabase
          .from('artist_metrics')
          .upsert(metrics, {
            onConflict: 'user_id,metric_type,platform,date'
          });

        if (error) {
          console.error('Error storing metrics:', error);
        }
      }
    } catch (error) {
      console.error('Error in storeMetrics:', error);
    }
  }

  /**
   * Get stored artist profile from our database
   */
  static async getStoredProfile(userId: string) {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching stored profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getStoredProfile:', error);
      return null;
    }
  }

  /**
   * Check if artist needs data refresh (daily sync)
   */
  static shouldRefreshData(lastSync?: string): boolean {
    if (!lastSync) return true;
    
    const lastSyncDate = new Date(lastSync);
    const now = new Date();
    const hoursSinceSync = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60);
    
    // Refresh if more than 24 hours old
    return hoursSinceSync > 24;
  }

  /**
   * Complete artist onboarding flow
   */
  static async completeOnboarding(userId: string, artistUuid: string, artistName: string): Promise<{success: boolean, message: string}> {
    try {
      // 1. Get detailed artist data from Viberate
      const artistData = await this.getArtistDetails(artistUuid);
      
      if (!artistData) {
        return {
          success: false,
          message: 'Failed to fetch artist data from Viberate'
        };
      }

      // 2. Update the artist profile with Viberate data
      const profileUpdated = await this.updateArtistProfile(userId, artistData);
      
      if (!profileUpdated) {
        return {
          success: false,
          message: 'Failed to update artist profile'
        };
      }

      // 3. Store initial metrics
      await this.storeMetrics(userId, artistData);

      // 4. Sync additional data via API
      const syncResult = await this.syncArtistData(userId, artistUuid);

      return {
        success: true,
        message: 'Artist onboarding completed successfully'
      };
    } catch (error) {
      console.error('Error in completeOnboarding:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Onboarding failed'
      };
    }
  }

  /**
   * Helper method to extract social URLs from Vibrate API response
   */
  private static extractSocialUrl(socialLinks: any, platform: string): string | undefined {
    if (!socialLinks || !Array.isArray(socialLinks)) return undefined;
    
    const link = socialLinks.find(link => 
      link.platform?.toLowerCase() === platform.toLowerCase() ||
      link.name?.toLowerCase() === platform.toLowerCase()
    );
    
    return link?.url || undefined;
  }
}