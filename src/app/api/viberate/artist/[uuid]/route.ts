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
    console.warn('Viberate API key not configured, returning mock artist data for UUID:', uuid);
    
    return NextResponse.json({
      success: true,
      data: {
        uuid,
        name: 'Mock Artist',
        slug: 'mock-artist',
        image: 'https://via.placeholder.com/300x300?text=Artist',
        bio: 'Mock artist data - API key not configured.',
        country: { name: 'United States', code: 'US' },
        genre: { name: 'Pop' },
        subgenres: [{ name: 'Pop Rock' }],
        rank: 1000,
        verified: false,
        social_links: [],
        tracks: [],
        events: [],
        fanbase: {},
        fanbase_distribution: {},
        similar_artists: [],
        ranks: {},
        metrics: {
          total_followers: 0,
          engagement_rate: 0
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

    console.log('🎵 Fetching Viberate artist data:', { uuid, hasKey: !!VIBERATE_API_KEY });

    // Fetch core artist data first
    const detailsResponse = await fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/details`, { 
      headers,
      signal: AbortSignal.timeout(10000) 
    });
    
    console.log('✅ Viberate Details Response:', { 
      status: detailsResponse.status, 
      ok: detailsResponse.ok 
    });

    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text();
      console.warn(`❌ Viberate Details Error: ${detailsResponse.status} - ${errorText}`);
      
      // Return fallback data
      return NextResponse.json({
        success: false,
        error: 'Artist not found in Viberate database',
        data: {
          uuid: uuid,
          name: 'Unknown Artist',
          image: 'https://via.placeholder.com/300x300?text=Artist',
          bio: 'Artist data not available',
          country: null,
          genre: null,
          subgenres: [],
          rank: 0,
          verified: false,
          social_links: [],
          tracks: [],
          events: [],
          fanbase: {},
          fanbase_distribution: {},
          similar_artists: [],
          ranks: {},
          fetched_at: new Date().toISOString()
        }
      });
    }

    const detailsData = await detailsResponse.json();
    console.log('📊 Viberate Details Success:', { 
      name: detailsData.data?.name,
      verified: detailsData.data?.verified,
      api_version: detailsData.api_version 
    });

    // Get additional data in parallel (but don't fail if they error)
    const currentDate = new Date().toISOString().split('T')[0];
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const [
      linksResponse,
      bioResponse,
      fanbaseDistributionResponse,
      ranksResponse,
      tracksResponse,
      eventsResponse,
      similarArtistsResponse,
      spotifyFanbaseResponse,
      instagramFanbaseResponse
    ] = await Promise.all([
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/links`, { headers, signal: AbortSignal.timeout(10000) }).catch(() => null),
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/viberate/bio`, { headers, signal: AbortSignal.timeout(10000) }).catch(() => null),
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/viberate/fanbase-distribution`, { headers, signal: AbortSignal.timeout(10000) }).catch(() => null),
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/viberate/ranks`, { headers, signal: AbortSignal.timeout(10000) }).catch(() => null),
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/viberate/tracks?limit=20&offset=0`, { headers, signal: AbortSignal.timeout(10000) }).catch(() => null),
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/viberate/events?entity=all&data-type=upcoming`, { headers, signal: AbortSignal.timeout(10000) }).catch(() => null),
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/viberate/similar-artists`, { headers, signal: AbortSignal.timeout(10000) }).catch(() => null),
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/spotify/fanbase-historical?date-from=${lastMonth}&date-to=${currentDate}`, { headers, signal: AbortSignal.timeout(10000) }).catch(() => null),
      fetch(`${VIBERATE_BASE_URL}/artist/${uuid}/instagram/fanbase-historical?date-from=${lastMonth}&date-to=${currentDate}`, { headers, signal: AbortSignal.timeout(10000) }).catch(() => null),
    ]);

    // Parse additional data safely
    const parseResponse = async (response: Response | null, name: string) => {
      if (!response?.ok) return null;
      try {
        const data = await response.json();
        console.log(`📊 ${name} data:`, data?.data ? 'Success' : 'No data');
        return data;
      } catch (error) {
        console.warn(`❌ ${name} parse error:`, error);
        return null;
      }
    };

    const [links, bio, fanbaseDistribution, ranks, tracks, events, similarArtists, spotifyFanbase, instagramFanbase] = await Promise.all([
      parseResponse(linksResponse, 'Links'),
      parseResponse(bioResponse, 'Bio'),
      parseResponse(fanbaseDistributionResponse, 'Fanbase Distribution'),
      parseResponse(ranksResponse, 'Ranks'),
      parseResponse(tracksResponse, 'Tracks'),
      parseResponse(eventsResponse, 'Events'),
      parseResponse(similarArtistsResponse, 'Similar Artists'),
      parseResponse(spotifyFanbaseResponse, 'Spotify Fanbase'),
      parseResponse(instagramFanbaseResponse, 'Instagram Fanbase'),
    ]);

    // Build comprehensive artist profile
    const artistProfile = {
      uuid: uuid,
      name: detailsData.data?.name || 'Unknown Artist',
      slug: detailsData.data?.slug || '',
      image: detailsData.data?.image || 'https://via.placeholder.com/300x300?text=Artist',
      bio: bio?.data?.bio || detailsData.data?.bio || '',
      country: detailsData.data?.country || null,
      genre: detailsData.data?.genre || null,
      subgenres: detailsData.data?.subgenres || [],
      rank: ranks?.data?.current?.global || detailsData.data?.rank || 0,
      status: detailsData.data?.status || 'active',
      verified: detailsData.data?.verified || false,
      social_links: links?.data || [],
      tracks: tracks?.data || [],
      events: events?.data || [],
      fanbase: {
        spotify: spotifyFanbase?.data || {},
        instagram: instagramFanbase?.data || {}
      },
      fanbase_distribution: fanbaseDistribution?.data || {},
      ranks: ranks?.data || {},
      similar_artists: similarArtists?.data || [],
      metrics: {
        total_followers: fanbaseDistribution?.data?.total_followers || 0,
        engagement_rate: 0.035 // Default rate
      },
      fetched_at: new Date().toISOString()
    };

    console.log('🎉 Viberate artist data complete:', { 
      name: artistProfile.name,
      verified: artistProfile.verified,
      tracksCount: artistProfile.tracks.length,
      eventsCount: artistProfile.events.length
    });

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