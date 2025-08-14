import { createClient } from '@/utils/supabase/client';

export interface ArtistSyncData {
  uuid: string;
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
  social_links?: Array<{
    platform?: string;
    name?: string;
    url: string;
  }>;
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

export class ArtistSyncHelper {
  /**
   * Sync artist data to both artist_profiles and artists tables for consistency
   */
  static async syncArtistDataToAllTables(userId: string, userEmail: string, artistData: ArtistSyncData): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient();
      
      // Sync to artist_profiles table (primary table for user profiles)
      const profileSuccess = await this.syncToArtistProfiles(supabase, userId, userEmail, artistData);
      
      // Also sync to artists table for backward compatibility
      const artistSuccess = await this.syncToArtistsTable(supabase, userId, artistData);
      
      console.log('Sync results:', { profileSuccess, artistSuccess });
      
      return { success: profileSuccess }; // Primary table success is most important
    } catch (error) {
      console.error('Error in syncArtistDataToAllTables:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown sync error' 
      };
    }
  }

  /**
   * Sync to artist_profiles table (main profile table)
   */
  private static async syncToArtistProfiles(supabase: any, userId: string, userEmail: string, artistData: ArtistSyncData): Promise<boolean> {
    try {
      console.log(`🔄 Syncing artist ${artistData.name} (${artistData.uuid}) to user ${userEmail}`);

      // First, get the current user's profile
      const { data: currentProfile } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Check if this Viberate artist is connected to a different user
      const { data: existingConnections } = await supabase
        .from('artist_profiles')
        .select('id, email, artist_name, viberate_artist_id')
        .eq('viberate_artist_id', artistData.uuid);

      const otherUserConnection = existingConnections?.find((conn: { id: string; email: string; artist_name: string; viberate_artist_id: string }) => conn.id !== userId);
      const currentUserConnection = existingConnections?.find((conn: { id: string; email: string; artist_name: string; viberate_artist_id: string }) => conn.id === userId);
      
      if (otherUserConnection) {
        console.error(`❌ Artist ${artistData.name} is already connected to ${otherUserConnection.email}`);
        throw new Error(`This artist is already connected to another account (${otherUserConnection.email}). Each artist can only be connected to one account.`);
      }

      // Prepare the profile update
      const profileUpdate = {
        // Don't update the ID - it's the primary key
        email: userEmail,
        viberate_artist_id: artistData.uuid,
        viberate_uuid: artistData.uuid,
        viberate_slug: artistData.slug,
        viberate_verified: artistData.verified || false,
        viberate_rank: artistData.rank,
        viberate_last_sync: new Date().toISOString(),
        
        // Artist name and image
        artist_name: artistData.name,
        stage_name: artistData.name,
        profile_image_url: artistData.image,
        
        // Social media URLs (extract from Viberate data)
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
        
        // Metrics from Viberate
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

      let result;
      
      if (currentUserConnection) {
        // User is reconnecting the same artist - just UPDATE
        console.log(`🔄 User reconnecting same artist ${artistData.name}`);
        result = await supabase
          .from('artist_profiles')
          .update(profileUpdate)
          .eq('id', userId);
      } else {
        // New artist connection - first clear any existing viberate_artist_id for this user
        console.log(`🆕 New artist connection for user`);
        
        // Clear existing viberate connection if any
        await supabase
          .from('artist_profiles')
          .update({ 
            viberate_artist_id: null,
            viberate_uuid: null,
            viberate_last_sync: null 
          })
          .eq('id', userId);
        
        // Now set the new artist connection
        result = await supabase
          .from('artist_profiles')
          .update(profileUpdate)
          .eq('id', userId);
      }

      if (result.error) {
        console.error('❌ Error updating artist_profiles:', result.error);
        
        // If it's a unique constraint violation for viberate_artist_id, provide better error
        if (result.error.code === '23505' && result.error.message.includes('viberate_artist_id')) {
          throw new Error(`Database constraint error: This artist connection already exists. Please try again.`);
        }
        
        throw new Error(`Database error: ${result.error.message}`);
      }

      console.log('✅ Successfully synced to artist_profiles table');
      return true;
    } catch (error) {
      console.error('❌ Error in syncToArtistProfiles:', error);
      throw error; // Re-throw to bubble up the specific error message
    }
  }

  /**
   * Sync to artists table for backward compatibility
   */
  private static async syncToArtistsTable(supabase: any, userId: string, artistData: ArtistSyncData): Promise<boolean> {
    try {
      const artistRecord = {
        user_id: userId,
        uuid: artistData.uuid,
        name: artistData.name,
        stage_name: artistData.name,
        slug: artistData.slug,
        image: artistData.image,
        bio: artistData.bio || '',
        country: artistData.country,
        genre: artistData.genre,
        subgenres: artistData.subgenres,
        rank: artistData.rank,
        verified: artistData.verified,
        spotify_id: artistData.spotify_id,
        total_followers: artistData.metrics?.total_followers || 0,
        total_monthly_listeners: artistData.metrics?.spotify_monthly_listeners || 0,
        last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('artists')
        .upsert(artistRecord, {
          onConflict: 'uuid'
        });

      if (error) {
        console.error('Error updating artists table:', error);
        return false;
      }

      console.log('Successfully synced to artists table');
      return true;
    } catch (error) {
      console.error('Error in syncToArtistsTable:', error);
      return false;
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

  /**
   * Get consolidated artist data from both tables
   */
  static async getArtistData(userId: string) {
    try {
      const supabase = createClient();
      
      // Primary data from artist_profiles
      const { data: profile } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Fallback data from artists table
      const { data: artist } = await supabase
        .from('artists')
        .select('*')
        .eq('user_id', userId)
        .single();

      return {
        profile,
        artist,
        consolidated: profile || artist
      };
    } catch (error) {
      console.error('Error fetching artist data:', error);
      return {
        profile: null,
        artist: null,
        consolidated: null
      };
    }
  }
}