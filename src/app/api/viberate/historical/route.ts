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
      spotifyPopularityResponse,
      spotifyTracksOnPlaylistsResponse,
      spotifyFanbaseResponse,
      facebookFanbaseResponse
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
      
      // Spotify popularity
      fetch(`${VIBERATE_BASE_URL}/artist/${artistId}/spotify/popularity-historical?date-from=${dateFrom}&date-to=${dateTo}`, {
        headers,
        signal: AbortSignal.timeout(10000)
      }).catch(() => null),
      
      // Spotify tracks on playlists
      fetch(`${VIBERATE_BASE_URL}/artist/${artistId}/spotify/tracks-on-playlists-historical?date-from=${dateFrom}&date-to=${dateTo}`, {
        headers,
        signal: AbortSignal.timeout(10000)
      }).catch(() => null),
      
      // Spotify fanbase daily
      fetch(`${VIBERATE_BASE_URL}/artist/${artistId}/spotify/fanbase-historical/daily?date-from=${dateFrom}&date-to=${dateTo}`, {
        headers,
        signal: AbortSignal.timeout(10000)
      }).catch(() => null),
      
      // Facebook fanbase
      fetch(`${VIBERATE_BASE_URL}/artist/${artistId}/facebook/fanbase-historical?date-from=${dateFrom}&date-to=${dateTo}`, {
        headers,
        signal: AbortSignal.timeout(10000)
      }).catch(() => null)
    ]);

    // Process responses safely
    const processResponse = async (response: PromiseSettledResult<Response | null>, name: string) => {
      if (response.status === 'fulfilled' && response.value?.ok) {
        try {
          const responseData = await response.value.json();
          console.log(`Successfully fetched ${name}:`, responseData.data?.data ? Object.keys(responseData.data.data).length : 'no data');
          console.log(`${name} sample data:`, responseData);
          return responseData;
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
      spotifyPopularity,
      spotifyTracksOnPlaylists,
      spotifyFanbase,
      facebookFanbase
    ] = await Promise.all([
      processResponse(spotifyStreamsResponse, 'Spotify Streams'),
      processResponse(spotifyListenersResponse, 'Spotify Listeners'),
      processResponse(spotifyPopularityResponse, 'Spotify Popularity'),
      processResponse(spotifyTracksOnPlaylistsResponse, 'Spotify Tracks on Playlists'),
      processResponse(spotifyFanbaseResponse, 'Spotify Fanbase Daily'),
      processResponse(facebookFanbaseResponse, 'Facebook Fanbase')
    ]);

    const historicalData = {
      success: true,
      dateRange: { from: dateFrom, to: dateTo },
      streaming: {
        spotify: {
          streams: { data: spotifyStreams?.data?.data || {} },
          listeners: { data: spotifyListeners?.data?.data || {} },
          popularity: { data: spotifyPopularity?.data?.data || {} },
          tracksOnPlaylists: { data: spotifyTracksOnPlaylists?.data?.data || {} },
          fanbase: { data: spotifyFanbase?.data?.data || {} }
        }
      },
      social: {
        facebook: {
          fanbase: { data: facebookFanbase?.data?.data || {} }
        }
      },
      fetchedAt: new Date().toISOString()
    };

    console.log('Historical data summary:', {
      spotifyStreams: Object.keys(historicalData.streaming.spotify.streams.data).length,
      spotifyListeners: Object.keys(historicalData.streaming.spotify.listeners.data).length,
      spotifyPopularity: Object.keys(historicalData.streaming.spotify.popularity.data).length,
      spotifyTracksOnPlaylists: Object.keys(historicalData.streaming.spotify.tracksOnPlaylists.data).length,
      spotifyFanbase: Object.keys(historicalData.streaming.spotify.fanbase.data).length,
      facebookFanbase: Object.keys(historicalData.social.facebook.fanbase.data).length
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