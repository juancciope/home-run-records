import { NextRequest, NextResponse } from 'next/server';

const VIBERATE_API_KEY = process.env.VIBERATE_API_KEY || '';
const VIBERATE_BASE_URL = 'https://data.viberate.com/api/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;

  if (!uuid) {
    return NextResponse.json({ error: 'Artist UUID is required' }, { status: 400 });
  }

  if (!VIBERATE_API_KEY) {
    console.warn('Viberate API key not configured, returning mock artist data');
    return NextResponse.json({
      uuid,
      name: 'Mock Artist',
      image: 'https://via.placeholder.com/300x300?text=Mock+Artist',
      bio: 'This is a mock artist profile for development purposes.',
      country: { name: 'United States', code: 'US' },
      genre: { name: 'Pop' },
      subgenres: [{ name: 'Pop Rock' }],
      rank: 1000,
      verified: true,
      social_links: [
        { platform: 'spotify', url: 'https://open.spotify.com/artist/mock' },
        { platform: 'instagram', url: 'https://instagram.com/mockartist' }
      ],
      tracks: [
        { track_id: 'mock-1', name: 'Mock Song 1', release_date: '2024-01-01' },
        { track_id: 'mock-2', name: 'Mock Song 2', release_date: '2024-02-01' }
      ],
      events: [],
      fanbase: { total: 50000, distribution: {} },
      similar_artists: [],
      ranks: { global: 1000, country: 100 }
    });
  }

  try {
    const headers = {
      'Access-Key': VIBERATE_API_KEY,
      'Accept': 'application/json',
    };

    console.log('Fetching complete artist data for UUID:', uuid);
    console.log('API Key available:', !!VIBERATE_API_KEY);

    // Fetch all artist data using the correct Viberate API endpoint structure
    // Based on successful call pattern: /artist/{uuid}/{platform}/{data-type}
    const [
      detailsResponse,
      linksResponse,
      spotifyFanbaseResponse,
      facebookFanbaseResponse,
      instagramFanbaseResponse,
      youtubeFanbaseResponse,
      tiktokFanbaseResponse,
      tracksResponse,
      eventsResponse
    ] = await Promise.all([
      // Basic artist details
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      // Social links  
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/links`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      // Platform-specific fanbase data
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/spotify/fanbase`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/facebook/fanbase`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/instagram/fanbase`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/youtube/fanbase`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/tiktok/fanbase`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      // Other data
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/tracks`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/events`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
    ]);

    // Parse responses with detailed logging
    let details, links, fanbase = {}, events, tracks;

    console.log('Response statuses:', {
      details: detailsResponse?.status,
      links: linksResponse?.status,
      spotify_fanbase: spotifyFanbaseResponse?.status,
      facebook_fanbase: facebookFanbaseResponse?.status,
      instagram_fanbase: instagramFanbaseResponse?.status,
      youtube_fanbase: youtubeFanbaseResponse?.status,
      tiktok_fanbase: tiktokFanbaseResponse?.status,
      events: eventsResponse?.status,
      tracks: tracksResponse?.status,
    });

    if (detailsResponse?.ok) {
      details = await detailsResponse.json();
      console.log('Details data:', details);
    } else {
      console.log('Details failed:', detailsResponse?.status, await detailsResponse?.text?.());
    }
    
    if (linksResponse?.ok) {
      links = await linksResponse.json();
    } else {
      console.log('Links failed:', linksResponse?.status);
    }
    
    // Parse platform-specific fanbase data
    const platforms = ['spotify', 'facebook', 'instagram', 'youtube', 'tiktok'];
    const responses = [spotifyFanbaseResponse, facebookFanbaseResponse, instagramFanbaseResponse, youtubeFanbaseResponse, tiktokFanbaseResponse];
    
    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];
      const response = responses[i];
      
      if (response?.ok) {
        try {
          const data = await response.json();
          fanbase[platform] = data;
          console.log(`${platform} fanbase data:`, data?.data ? Object.keys(data.data).length + ' data points' : 'No data');
        } catch (error) {
          console.log(`${platform} fanbase parse error:`, error);
        }
      } else {
        console.log(`${platform} fanbase failed:`, response?.status);
      }
    }
    
    if (eventsResponse?.ok) {
      events = await eventsResponse.json();
    } else {
      console.log('Events failed:', eventsResponse?.status);
    }
    
    if (tracksResponse?.ok) {
      tracks = await tracksResponse.json();
    } else {
      console.log('Tracks failed:', tracksResponse?.status);
    }

    // Combine all data into a single artist profile object
    const artistProfile = {
      uuid: uuid,
      name: details?.data?.name || 'Unknown Artist',
      slug: details?.data?.slug || '',
      image: details?.data?.image || '',
      bio: details?.data?.bio || '',
      country: details?.data?.country || null,
      genre: details?.data?.genre || null,
      subgenres: details?.data?.subgenres || [],
      rank: details?.data?.rank || 0,
      status: details?.data?.status || '',
      verified: details?.data?.verified || false,
      social_links: links || {},
      tracks: tracks || {},
      events: events || {},
      fanbase: fanbase, // Now contains platform-specific data
      fetched_at: new Date().toISOString()
    };

    console.log('Successfully fetched complete artist data:', artistProfile.name);

    return NextResponse.json({
      success: true,
      data: artistProfile
    });

  } catch (error) {
    console.error('Error fetching complete artist data:', error);
    
    // Return partial data as fallback
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch complete artist data',
      data: {
        uuid: uuid,
        name: 'Unknown Artist',
        image: 'https://via.placeholder.com/300x300?text=Artist',
        bio: 'Artist data temporarily unavailable',
        country: null,
        genre: null,
        subgenres: [],
        rank: 0,
        verified: false,
        social_links: [],
        tracks: [],
        events: [],
        fanbase: {},
        similar_artists: [],
        ranks: {},
        fetched_at: new Date().toISOString()
      }
    });
  }
}