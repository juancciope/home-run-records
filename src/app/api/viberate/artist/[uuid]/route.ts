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

    // Fetch all artist data endpoints in parallel as specified in instructions
    const [
      detailsResponse,
      bioResponse,
      linksResponse,
      fanbaseResponse,
      eventsResponse,
      tracksResponse,
      similarResponse,
      ranksResponse
    ] = await Promise.all([
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/details`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/viberate/bio`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/links`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/viberate/fanbase-distribution`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/viberate/events`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/viberate/tracks`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/viberate/similar-artists`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/viberate/ranks`, { 
        headers,
        signal: AbortSignal.timeout(10000) 
      }).catch(() => null),
    ]);

    // Parse responses
    let details, bio, links, fanbase, events, tracks, similar, ranks;

    if (detailsResponse?.ok) {
      details = await detailsResponse.json();
    }
    if (bioResponse?.ok) {
      bio = await bioResponse.json();
    }
    if (linksResponse?.ok) {
      links = await linksResponse.json();
    }
    if (fanbaseResponse?.ok) {
      fanbase = await fanbaseResponse.json();
    }
    if (eventsResponse?.ok) {
      events = await eventsResponse.json();
    }
    if (tracksResponse?.ok) {
      tracks = await tracksResponse.json();
    }
    if (similarResponse?.ok) {
      similar = await similarResponse.json();
    }
    if (ranksResponse?.ok) {
      ranks = await ranksResponse.json();
    }

    // Combine all data into a single artist profile object
    const artistProfile = {
      uuid: uuid,
      name: details?.data?.name || 'Unknown Artist',
      slug: details?.data?.slug || '',
      image: details?.data?.image || '',
      bio: bio?.data?.bio || '',
      country: details?.data?.country || null,
      genre: details?.data?.genre || null,
      subgenres: details?.data?.subgenres || [],
      rank: details?.data?.rank || 0,
      status: details?.data?.status || '',
      verified: details?.data?.verified || false,
      social_links: links?.data || [],
      tracks: tracks?.data || [],
      events: events?.data || [],
      fanbase: fanbase?.data || {},
      similar_artists: similar?.data || [],
      ranks: ranks?.data || {},
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