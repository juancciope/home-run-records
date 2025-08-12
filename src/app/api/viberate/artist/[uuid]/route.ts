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

  if (!VIBERATE_API_KEY || VIBERATE_API_KEY === 'your-viberate-api-key-here') {
    console.warn('Viberate API key not configured, returning mock artist data');
    return NextResponse.json({
      success: true,
      data: {
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
          { channel: 'spotify', link: 'https://open.spotify.com/artist/mock' },
          { channel: 'instagram', link: 'https://instagram.com/mockartist' }
        ],
        tracks: [
          { uuid: 'mock-1', name: 'Mock Song 1', slug: 'mock-song-1' },
          { uuid: 'mock-2', name: 'Mock Song 2', slug: 'mock-song-2' }
        ],
        events: [],
        fanbase: {},
        fanbase_distribution: {
          spotify: { followers: 25000 },
          instagram: { followers: 15000 },
          youtube: { followers: 10000 }
        },
        similar_artists: [],
        ranks: { 
          current: { global: 1000, country: 100 },
          previous: { global: 1100, country: 110 }
        },
        fetched_at: new Date().toISOString()
      }
    });
  }

  try {
    const headers = {
      'Access-Key': VIBERATE_API_KEY,
      'Accept': 'application/json',
    };

    console.log('Fetching complete artist data for UUID:', uuid);
    console.log('API Key available:', !!VIBERATE_API_KEY);

    // Fetch all artist data using the CORRECT Viberate API endpoints from documentation
    const currentDate = new Date().toISOString().split('T')[0];
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const [
      detailsResponse,
      linksResponse,
      bioResponse,
      fanbaseDistributionResponse,
      ranksResponse,
      tracksResponse,
      eventsResponse,
      similarArtistsResponse,
      // Historical fanbase data (last 30 days)
      spotifyFanbaseResponse,
      facebookFanbaseResponse,
      instagramFanbaseResponse,
      youtubeFanbaseResponse,
      tiktokFanbaseResponse
    ] = await Promise.all([
      // Basic artist details
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/details`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      // Social links  
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/links`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      // Bio
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/viberate/bio`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      // Fanbase distribution (current totals)
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/viberate/fanbase-distribution`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      // Ranks
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/viberate/ranks`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      // Tracks - with limit and offset parameters
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/viberate/tracks?limit=50&offset=0`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      // Events - with required parameters
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/viberate/events?entity=all&data-type=upcoming`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      // Similar artists
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/viberate/similar-artists`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      // Historical fanbase data (last 30 days for trend data)
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/spotify/fanbase-historical?date-from=${lastMonth}&date-to=${currentDate}`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/facebook/fanbase-historical?date-from=${lastMonth}&date-to=${currentDate}`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/instagram/fanbase-historical?date-from=${lastMonth}&date-to=${currentDate}`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/youtube/fanbase-historical?date-from=${lastMonth}&date-to=${currentDate}`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/tiktok/fanbase-historical?date-from=${lastMonth}&date-to=${currentDate}`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
    ]);

    // Parse responses with detailed logging
    let details, links, bio, fanbaseDistribution, ranks, tracks, events, similarArtists;
    const fanbase: Record<string, any> = {};

    console.log('Response statuses:', {
      details: detailsResponse?.status,
      links: linksResponse?.status,
      bio: bioResponse?.status,
      fanbaseDistribution: fanbaseDistributionResponse?.status,
      ranks: ranksResponse?.status,
      tracks: tracksResponse?.status,
      events: eventsResponse?.status,
      similarArtists: similarArtistsResponse?.status,
      spotify_fanbase: spotifyFanbaseResponse?.status,
      facebook_fanbase: facebookFanbaseResponse?.status,
      instagram_fanbase: instagramFanbaseResponse?.status,
      youtube_fanbase: youtubeFanbaseResponse?.status,
      tiktok_fanbase: tiktokFanbaseResponse?.status,
    });

    if (detailsResponse?.ok) {
      details = await detailsResponse.json();
      console.log('Details data:', details);
    } else {
      console.log('Details failed:', detailsResponse?.status, await detailsResponse?.text?.());
    }
    
    if (linksResponse?.ok) {
      links = await linksResponse.json();
      console.log('Links data:', links);
    } else {
      console.log('Links failed:', linksResponse?.status, await linksResponse?.text?.());
    }
    
    if (bioResponse?.ok) {
      bio = await bioResponse.json();
      console.log('Bio data:', bio);
    } else {
      console.log('Bio failed:', bioResponse?.status, await bioResponse?.text?.());
    }
    
    if (fanbaseDistributionResponse?.ok) {
      fanbaseDistribution = await fanbaseDistributionResponse.json();
      console.log('Fanbase distribution data:', fanbaseDistribution);
    } else {
      console.log('Fanbase distribution failed:', fanbaseDistributionResponse?.status, await fanbaseDistributionResponse?.text?.());
    }
    
    if (ranksResponse?.ok) {
      ranks = await ranksResponse.json();
      console.log('Ranks data:', ranks);
    } else {
      console.log('Ranks failed:', ranksResponse?.status, await ranksResponse?.text?.());
    }
    
    if (similarArtistsResponse?.ok) {
      similarArtists = await similarArtistsResponse.json();
      console.log('Similar artists data:', similarArtists);
    } else {
      console.log('Similar artists failed:', similarArtistsResponse?.status, await similarArtistsResponse?.text?.());
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
      console.log('Events data:', events);
    } else {
      console.log('Events failed:', eventsResponse?.status, await eventsResponse?.text?.());
    }
    
    if (tracksResponse?.ok) {
      tracks = await tracksResponse.json();
      console.log('Tracks data:', tracks);
    } else {
      console.log('Tracks failed:', tracksResponse?.status, await tracksResponse?.text?.());
    }

    // Combine all data into a single artist profile object
    const artistProfile = {
      uuid: uuid,
      name: details?.data?.name || 'Unknown Artist',
      slug: details?.data?.slug || '',
      image: details?.data?.image || '',
      bio: bio?.data?.bio || details?.data?.bio || '',
      country: details?.data?.country || null,
      genre: details?.data?.genre || null,
      subgenres: details?.data?.subgenres || [],
      rank: ranks?.data?.current?.global || details?.data?.rank || 0,
      status: details?.data?.status || '',
      verified: details?.data?.verified || false,
      social_links: links?.data || [],
      tracks: tracks?.data || [],
      events: events?.data || [],
      fanbase: fanbase, // Now contains platform-specific historical data
      fanbase_distribution: fanbaseDistribution?.data || {},
      ranks: ranks?.data || {},
      similar_artists: similarArtists?.data || [],
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