export interface VibrateArtistData {
  id: string;
  name: string;
  spotify_id?: string;
  instagram_id?: string;
  youtube_id?: string;
  tiktok_id?: string;
}

export interface VibrateStreamingData {
  date: string;
  streams: number;
  listeners: number;
  followers: number;
  playlist_reach: number;
}

export interface VibrateSocialData {
  date: string;
  platform: string;
  followers: number;
  engagement: number;
  posts: number;
}

export interface VibratePlaylistData {
  date: string;
  active_playlists: number;
  playlist_adds: number;
  playlist_reach: number;
}

export class VibrateService {
  private static readonly BASE_URL = 'https://api.viberate.com/api/v1';
  private static readonly API_KEY = process.env.VIBERATE_API_KEY || '';
  
  /**
   * Search for artist by name
   */
  static async searchArtist(artistName: string): Promise<VibrateArtistData[]> {
    try {
      const response = await fetch(
        `/api/viberate/search?q=${encodeURIComponent(artistName)}&limit=10`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error searching for artist:', error);
      throw error;
    }
  }

  /**
   * Get artist streaming data from Spotify
   */
  static async getSpotifyStreamingData(
    artistId: string,
    days: number = 30
  ): Promise<VibrateStreamingData[]> {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      const [streamsResponse, listenersResponse, followersResponse, playlistResponse] = await Promise.all([
        fetch(`${this.BASE_URL}/artist/spotify/streams/historical?artist_id=${artistId}&start=${startDate}&end=${endDate}`, {
          headers: { 'Authorization': `Bearer ${this.API_KEY}` }
        }),
        fetch(`${this.BASE_URL}/artist/spotify/listeners/historical?artist_id=${artistId}&start=${startDate}&end=${endDate}`, {
          headers: { 'Authorization': `Bearer ${this.API_KEY}` }
        }),
        fetch(`${this.BASE_URL}/artist/spotify/fanbase/historical?artist_id=${artistId}&start=${startDate}&end=${endDate}`, {
          headers: { 'Authorization': `Bearer ${this.API_KEY}` }
        }),
        fetch(`${this.BASE_URL}/artist/spotify/playlist/reach/historical?artist_id=${artistId}&start=${startDate}&end=${endDate}`, {
          headers: { 'Authorization': `Bearer ${this.API_KEY}` }
        }),
      ]);

      const [streamsData, listenersData, followersData, playlistData] = await Promise.all([
        streamsResponse.json(),
        listenersResponse.json(),
        followersResponse.json(),
        playlistResponse.json(),
      ]);

      // Combine data by date
      const combinedData: Record<string, VibrateStreamingData> = {};
      
      streamsData.data?.forEach((entry: { date: string; value: number }) => {
        combinedData[entry.date] = {
          date: entry.date,
          streams: entry.value || 0,
          listeners: 0,
          followers: 0,
          playlist_reach: 0,
        };
      });

      listenersData.data?.forEach((entry: { date: string; value: number }) => {
        if (combinedData[entry.date]) {
          combinedData[entry.date].listeners = entry.value || 0;
        }
      });

      followersData.data?.forEach((entry: { date: string; value: number }) => {
        if (combinedData[entry.date]) {
          combinedData[entry.date].followers = entry.value || 0;
        }
      });

      playlistData.data?.forEach((entry: { date: string; value: number }) => {
        if (combinedData[entry.date]) {
          combinedData[entry.date].playlist_reach = entry.value || 0;
        }
      });

      return Object.values(combinedData).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

    } catch (error) {
      console.error('Error fetching Spotify streaming data:', error);
      throw error;
    }
  }

  /**
   * Get social media data from multiple platforms
   */
  static async getSocialMediaData(
    artistId: string,
    platform: 'instagram' | 'youtube' | 'tiktok' | 'twitter',
    days: number = 30
  ): Promise<VibrateSocialData[]> {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      const [followersResponse, engagementResponse] = await Promise.all([
        fetch(`${this.BASE_URL}/artist/${platform}/fanbase/historical?artist_id=${artistId}&start=${startDate}&end=${endDate}`, {
          headers: { 'Authorization': `Bearer ${this.API_KEY}` }
        }),
        fetch(`${this.BASE_URL}/artist/${platform}/likes/historical?artist_id=${artistId}&start=${startDate}&end=${endDate}`, {
          headers: { 'Authorization': `Bearer ${this.API_KEY}` }
        }),
      ]);

      const [followersData, engagementData] = await Promise.all([
        followersResponse.json(),
        engagementResponse.json(),
      ]);

      const socialData: Record<string, VibrateSocialData> = {};

      followersData.data?.forEach((entry: { date: string; value: number }) => {
        socialData[entry.date] = {
          date: entry.date,
          platform,
          followers: entry.value || 0,
          engagement: 0,
          posts: 0,
        };
      });

      engagementData.data?.forEach((entry: { date: string; value: number }) => {
        if (socialData[entry.date]) {
          socialData[entry.date].engagement = entry.value || 0;
        }
      });

      return Object.values(socialData).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

    } catch (error) {
      console.error(`Error fetching ${platform} data:`, error);
      throw error;
    }
  }

  /**
   * Get playlist data for fan engagement metrics
   */
  static async getPlaylistData(
    artistId: string,
    platform: 'spotify' | 'apple',
    days: number = 30
  ): Promise<VibratePlaylistData[]> {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      const [activeResponse, addsResponse] = await Promise.all([
        fetch(`${this.BASE_URL}/artist/${platform}/active/playlists/historical?artist_id=${artistId}&start=${startDate}&end=${endDate}`, {
          headers: { 'Authorization': `Bearer ${this.API_KEY}` }
        }),
        fetch(`${this.BASE_URL}/artist/${platform}/playlists/adds/historical?artist_id=${artistId}&start=${startDate}&end=${endDate}`, {
          headers: { 'Authorization': `Bearer ${this.API_KEY}` }
        }),
      ]);

      const [activeData, addsData] = await Promise.all([
        activeResponse.json(),
        addsResponse.json(),
      ]);

      const playlistData: Record<string, VibratePlaylistData> = {};

      activeData.data?.forEach((entry: { date: string; value: number }) => {
        playlistData[entry.date] = {
          date: entry.date,
          active_playlists: entry.value || 0,
          playlist_adds: 0,
          playlist_reach: 0,
        };
      });

      addsData.data?.forEach((entry: { date: string; value: number }) => {
        if (playlistData[entry.date]) {
          playlistData[entry.date].playlist_adds = entry.value || 0;
        }
      });

      return Object.values(playlistData).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

    } catch (error) {
      console.error(`Error fetching playlist data:`, error);
      throw error;
    }
  }

  /**
   * Get artist tracks for production pipeline
   */
  static async getArtistTracks(artistId: string) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/artist/tracks?artist_id=${artistId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Viberate API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching artist tracks:', error);
      throw error;
    }
  }

  /**
   * Get conversion data (Shazam discovery metrics as proxy for conversion)
   */
  static async getConversionData(
    artistId: string,
    days: number = 30
  ) {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      const response = await fetch(
        `${this.BASE_URL}/artist/shazam/historical?artist_id=${artistId}&start=${startDate}&end=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Viberate API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching conversion data:', error);
      throw error;
    }
  }

  /**
   * Sync all artist data to our database
   */
  static async syncArtistData(userId: string, artistId: string) {
    try {
      const response = await fetch('/api/viberate/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ artistId, userId }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Update profile with artist ID
      const { ArtistService } = await import('./artist-service');
      await ArtistService.updateProfile(userId, {
        viberate_artist_id: artistId,
      });

      return result.success;
    } catch (error) {
      console.error('Error syncing artist data:', error);
      throw error;
    }
  }

  /**
   * Test API connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/artist/search/name?q=test&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error testing Viberate connection:', error);
      return false;
    }
  }
}