import { NextRequest, NextResponse } from 'next/server';

const VIBERATE_API_KEY = process.env.VIBERATE_API_KEY || '';
const VIBERATE_BASE_URL = 'https://data.viberate.com/api/v1';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artistId = searchParams.get('artistId');
  const dateFrom = searchParams.get('dateFrom') || '2024-01-01';
  const dateTo = searchParams.get('dateTo') || new Date().toISOString().split('T')[0];

  if (!artistId) {
    return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
  }

  if (!VIBERATE_API_KEY) {
    return NextResponse.json({
      error: 'Viberate API key not configured',
      message: 'Historical data temporarily unavailable'
    }, { status: 503 });
  }

  try {
    const headers = {
      'Access-Key': VIBERATE_API_KEY,
      'Accept': 'application/json',
    };

    console.log(`Fetching historical data for artist ${artistId} from ${dateFrom} to ${dateTo}`);

    // Fetch historical data from multiple endpoints in parallel
    const [
      spotifyStreamsResponse,
      spotifyListenersResponse,
      spotifyPlaylistReachResponse,
      youtubeViewsResponse,
      shazamResponse,
      instagramLikesResponse,
      tiktokViewsResponse,
      soundcloudPlaysResponse,
      performancePointsResponse,
      ranksHistoricalResponse
    ] = await Promise.allSettled([
      // Spotify streaming data
      fetch(`${VIBERATE_BASE_URL}/artist/${artistId}/spotify/streams-historical?date-from=${dateFrom}&date-to=${dateTo}`, {
        headers,
        signal: AbortSignal.timeout(10000)
      }).catch(() => null),
      
      // Spotify listeners data
      fetch(`${VIBERATE_BASE_URL}/artist/${artistId}/spotify/listeners-historical?date-from=${dateFrom}&date-to=${dateTo}`, {
        headers,
        signal: AbortSignal.timeout(10000)
      }).catch(() => null),
      
      // Spotify playlist reach
      fetch(`${VIBERATE_BASE_URL}/artist/${artistId}/spotify/playlist-reach-historical?date-from=${dateFrom}&date-to=${dateTo}`, {
        headers,
        signal: AbortSignal.timeout(10000)
      }).catch(() => null),
      
      // YouTube views
      fetch(`${VIBERATE_BASE_URL}/artist/${artistId}/youtube/views-historical?date-from=${dateFrom}&date-to=${dateTo}`, {
        headers,
        signal: AbortSignal.timeout(10000)
      }).catch(() => null),
      
      // Shazam discoveries
      fetch(`${VIBERATE_BASE_URL}/artist/${artistId}/shazam/shazams-historical?date-from=${dateFrom}&date-to=${dateTo}`, {
        headers,
        signal: AbortSignal.timeout(10000)
      }).catch(() => null),
      
      // Instagram engagement
      fetch(`${VIBERATE_BASE_URL}/artist/${artistId}/instagram/likes-historical?date-from=${dateFrom}&date-to=${dateTo}`, {
        headers,
        signal: AbortSignal.timeout(10000)
      }).catch(() => null),
      
      // TikTok views
      fetch(`${VIBERATE_BASE_URL}/artist/${artistId}/tiktok/views-historical/daily?date-from=${dateFrom}&date-to=${dateTo}`, {
        headers,
        signal: AbortSignal.timeout(10000)
      }).catch(() => null),
      
      // SoundCloud plays
      fetch(`${VIBERATE_BASE_URL}/artist/${artistId}/soundcloud/plays-historical?date-from=${dateFrom}&date-to=${dateTo}`, {
        headers,
        signal: AbortSignal.timeout(10000)
      }).catch(() => null),
      
      // Overall performance points
      fetch(`${VIBERATE_BASE_URL}/artist/${artistId}/viberate/performance-points-historical?date-from=${dateFrom}&date-to=${dateTo}`, {
        headers,
        signal: AbortSignal.timeout(10000)
      }).catch(() => null),
      
      // Historical ranks
      fetch(`${VIBERATE_BASE_URL}/artist/${artistId}/viberate/ranks-historical?date-from=${dateFrom}&date-to=${dateTo}`, {
        headers,
        signal: AbortSignal.timeout(10000)
      }).catch(() => null)
    ]);

    // Process responses safely
    const processResponse = async (response: PromiseSettledResult<Response | null>, name: string) => {
      if (response.status === 'fulfilled' && response.value?.ok) {
        try {
          const data = await response.value.json();
          console.log(`Successfully fetched ${name}:`, data.data ? Object.keys(data.data).length : 'no data');
          return data;
        } catch (error) {
          console.warn(`Error parsing ${name}:`, error);
          return null;
        }
      } else {
        console.warn(`Failed to fetch ${name}:`, response.status === 'fulfilled' ? response.value?.status : 'rejected');
        return null;
      }
    };

    const [
      spotifyStreams,
      spotifyListeners, 
      spotifyPlaylistReach,
      youtubeViews,
      shazamData,
      instagramLikes,
      tiktokViews,
      soundcloudPlays,
      performancePoints,
      ranksHistorical
    ] = await Promise.all([
      processResponse(spotifyStreamsResponse, 'Spotify Streams'),
      processResponse(spotifyListenersResponse, 'Spotify Listeners'),
      processResponse(spotifyPlaylistReachResponse, 'Spotify Playlist Reach'),
      processResponse(youtubeViewsResponse, 'YouTube Views'),
      processResponse(shazamResponse, 'Shazam Data'),
      processResponse(instagramLikesResponse, 'Instagram Likes'),
      processResponse(tiktokViewsResponse, 'TikTok Views'),
      processResponse(soundcloudPlaysResponse, 'SoundCloud Plays'),
      processResponse(performancePointsResponse, 'Performance Points'),
      processResponse(ranksHistoricalResponse, 'Historical Ranks')
    ]);

    const historicalData = {
      success: true,
      dateRange: { from: dateFrom, to: dateTo },
      streaming: {
        spotify: {
          streams: { data: spotifyStreams?.data || {} },
          listeners: { data: spotifyListeners?.data || {} },
          playlistReach: { data: spotifyPlaylistReach?.data || {} }
        },
        youtube: {
          views: { data: youtubeViews?.data || {} }
        },
        soundcloud: {
          plays: { data: soundcloudPlays?.data || {} }
        }
      },
      social: {
        instagram: {
          likes: { data: instagramLikes?.data || {} }
        },
        tiktok: {
          views: { data: tiktokViews?.data || {} }
        }
      },
      discovery: {
        shazam: { data: shazamData?.data || {} }
      },
      performance: {
        points: { data: performancePoints?.data || {} },
        ranks: { data: ranksHistorical?.data || {} }
      },
      fetchedAt: new Date().toISOString()
    };

    console.log('Historical data summary:', {
      spotifyStreams: Object.keys(historicalData.streaming.spotify.streams.data).length,
      spotifyListeners: Object.keys(historicalData.streaming.spotify.listeners.data).length,
      youtubeViews: Object.keys(historicalData.streaming.youtube.views.data).length,
      shazam: Object.keys(historicalData.discovery.shazam.data).length
    });

    return NextResponse.json(historicalData);

  } catch (error) {
    console.error('Error fetching historical data:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch historical data',
      message: 'Unable to retrieve historical analytics data',
      dateRange: { from: dateFrom, to: dateTo }
    }, { status: 500 });
  }
}