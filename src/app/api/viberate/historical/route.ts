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

    console.log(`Fetching comprehensive historical data for artist ${artistId} from ${dateFrom} to ${dateTo}`);

    // Comprehensive endpoint fetching - ALL AVAILABLE ENDPOINTS
    const endpoints = [
      // === SPOTIFY ENDPOINTS ===
      { key: 'spotify-streams', url: `/artist/${artistId}/spotify/streams-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'spotify-listeners', url: `/artist/${artistId}/spotify/listeners-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'spotify-listeners-daily', url: `/artist/${artistId}/spotify/listeners-historical/daily?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'spotify-popularity', url: `/artist/${artistId}/spotify/popularity-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'spotify-fanbase', url: `/artist/${artistId}/spotify/fanbase-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'spotify-fanbase-daily', url: `/artist/${artistId}/spotify/fanbase-historical/daily?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'spotify-playlist-reach', url: `/artist/${artistId}/spotify/playlist-reach-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'spotify-active-playlists', url: `/artist/${artistId}/spotify/active-playlists-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'spotify-tracks-on-playlists', url: `/artist/${artistId}/spotify/tracks-on-playlists-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      
      // === YOUTUBE ENDPOINTS ===
      { key: 'youtube-fanbase', url: `/artist/${artistId}/youtube/fanbase-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'youtube-fanbase-daily', url: `/artist/${artistId}/youtube/fanbase-historical/daily?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'youtube-views', url: `/artist/${artistId}/youtube/views-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      
      // === INSTAGRAM ENDPOINTS ===
      { key: 'instagram-fanbase', url: `/artist/${artistId}/instagram/fanbase-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'instagram-fanbase-daily', url: `/artist/${artistId}/instagram/fanbase-historical/daily?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'instagram-likes', url: `/artist/${artistId}/instagram/likes-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'instagram-likes-daily', url: `/artist/${artistId}/instagram/likes-historical/daily?date-from=${dateFrom}&date-to=${dateTo}` },
      
      // === TIKTOK ENDPOINTS ===
      { key: 'tiktok-fanbase', url: `/artist/${artistId}/tiktok/fanbase-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'tiktok-fanbase-daily', url: `/artist/${artistId}/tiktok/fanbase-historical/daily?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'tiktok-likes', url: `/artist/${artistId}/tiktok/likes-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'tiktok-likes-daily', url: `/artist/${artistId}/tiktok/likes-historical/daily?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'tiktok-views-daily', url: `/artist/${artistId}/tiktok/views-historical/daily?date-from=${dateFrom}&date-to=${dateTo}` },
      
      // === TWITTER ENDPOINTS ===
      { key: 'twitter-fanbase', url: `/artist/${artistId}/twitter/fanbase-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'twitter-likes', url: `/artist/${artistId}/twitter/likes-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      
      // === FACEBOOK ENDPOINTS ===
      { key: 'facebook-fanbase', url: `/artist/${artistId}/facebook/fanbase-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      
      // === SOUNDCLOUD ENDPOINTS ===
      { key: 'soundcloud-fanbase', url: `/artist/${artistId}/soundcloud/fanbase-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'soundcloud-fanbase-daily', url: `/artist/${artistId}/soundcloud/fanbase-historical/daily?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'soundcloud-plays', url: `/artist/${artistId}/soundcloud/plays-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'soundcloud-plays-daily', url: `/artist/${artistId}/soundcloud/plays-historical/daily?date-from=${dateFrom}&date-to=${dateTo}` },
      
      // === DEEZER ENDPOINTS ===
      { key: 'deezer-fanbase', url: `/artist/${artistId}/deezer/fanbase-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      
      // === SHAZAM ENDPOINTS ===
      { key: 'shazam-shazams', url: `/artist/${artistId}/shazam/shazams-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      
      // === APPLE MUSIC ENDPOINTS ===
      { key: 'apple-active-playlists', url: `/artist/${artistId}/apple/active-playlists-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'apple-playlist-adds', url: `/artist/${artistId}/apple/playlist-adds-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'apple-playlist-drops', url: `/artist/${artistId}/apple/playlist-drops-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'apple-tracks-on-playlists', url: `/artist/${artistId}/apple/tracks-on-playlists-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      
      // === BEATPORT ENDPOINTS ===
      { key: 'beatport-performance-points', url: `/artist/${artistId}/beatport/performance-points-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      
      // === VIBERATE PLATFORM ENDPOINTS ===
      { key: 'viberate-performance-points', url: `/artist/${artistId}/viberate/performance-points-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'viberate-ranks', url: `/artist/${artistId}/viberate/ranks-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      { key: 'social-performance-points', url: `/artist/${artistId}/social/performance-points-historical?date-from=${dateFrom}&date-to=${dateTo}` },
      
      // === AIRPLAY ENDPOINTS ===
      { key: 'airplay-spins', url: `/artist/${artistId}/airplay/spins-historical?date-from=${dateFrom}&date-to=${dateTo}` },
    ];

    // Fetch all endpoints in parallel with timeout
    console.log(`Making ${endpoints.length} API calls to Viberate...`);
    const responses = await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        try {
          const response = await fetch(`${VIBERATE_BASE_URL}${endpoint.url}`, {
            headers,
            signal: AbortSignal.timeout(15000)
          });
          return { ...endpoint, response };
        } catch (error) {
          console.warn(`Timeout/error for ${endpoint.key}:`, error);
          return { ...endpoint, response: null };
        }
      })
    );

    // Process all responses
    const processedData: Record<string, { data: Record<string, number> | unknown; metadata?: Record<string, unknown>; dataPoints: number; success: boolean; error?: string }> = {};
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < responses.length; i++) {
      const result = responses[i];
      const endpoint = endpoints[i];
      
      if (result.status === 'fulfilled' && result.value.response?.ok) {
        try {
          const data = await result.value.response.json();
          const dataPoints = data.data?.data ? Object.keys(data.data.data).length : 0;
          
          processedData[endpoint.key] = {
            data: data.data?.data || {},
            metadata: {
              uuid: data.data?.uuid,
              name: data.data?.name,
              slug: data.data?.slug
            },
            dataPoints,
            success: true
          };
          
          if (dataPoints > 0) {
            console.log(`✅ ${endpoint.key}: ${dataPoints} data points`);
            successCount++;
          } else {
            console.log(`⚠️  ${endpoint.key}: No data available`);
          }
        } catch (parseError) {
          console.warn(`❌ Parse error for ${endpoint.key}:`, parseError);
          processedData[endpoint.key] = { data: {}, dataPoints: 0, success: false, error: 'Parse error' };
          errorCount++;
        }
      } else {
        const status = result.status === 'fulfilled' ? String(result.value.response?.status || 'unknown') : 'network_error';
        console.warn(`❌ ${endpoint.key}: ${status}`);
        processedData[endpoint.key] = { data: {}, dataPoints: 0, success: false, error: status };
        errorCount++;
      }
    }

    // Organize data by platform and type
    const organizedData = {
      success: true,
      dateRange: { from: dateFrom, to: dateTo },
      summary: {
        totalEndpoints: endpoints.length,
        successful: successCount,
        failed: errorCount,
        fetchedAt: new Date().toISOString()
      },
      
      // STREAMING PLATFORMS
      streaming: {
        spotify: {
          streams: { data: processedData['spotify-streams']?.data || {} },
          listeners: { data: processedData['spotify-listeners']?.data || {} },
          listenersDaily: { data: processedData['spotify-listeners-daily']?.data || {} },
          popularity: { data: processedData['spotify-popularity']?.data || {} },
          fanbase: { data: processedData['spotify-fanbase']?.data || {} },
          fanbaseDaily: { data: processedData['spotify-fanbase-daily']?.data || {} },
          playlistReach: { data: processedData['spotify-playlist-reach']?.data || {} },
          activePlaylists: { data: processedData['spotify-active-playlists']?.data || {} },
          tracksOnPlaylists: { data: processedData['spotify-tracks-on-playlists']?.data || {} }
        },
        soundcloud: {
          fanbase: { data: processedData['soundcloud-fanbase']?.data || {} },
          fanbaseDaily: { data: processedData['soundcloud-fanbase-daily']?.data || {} },
          plays: { data: processedData['soundcloud-plays']?.data || {} },
          playsDaily: { data: processedData['soundcloud-plays-daily']?.data || {} }
        },
        deezer: {
          fanbase: { data: processedData['deezer-fanbase']?.data || {} }
        },
        apple: {
          activePlaylists: { data: processedData['apple-active-playlists']?.data || {} },
          playlistAdds: { data: processedData['apple-playlist-adds']?.data || {} },
          playlistDrops: { data: processedData['apple-playlist-drops']?.data || {} },
          tracksOnPlaylists: { data: processedData['apple-tracks-on-playlists']?.data || {} }
        }
      },
      
      // SOCIAL MEDIA PLATFORMS
      social: {
        facebook: {
          fanbase: { data: processedData['facebook-fanbase']?.data || {} }
        },
        instagram: {
          fanbase: { data: processedData['instagram-fanbase']?.data || {} },
          fanbaseDaily: { data: processedData['instagram-fanbase-daily']?.data || {} },
          likes: { data: processedData['instagram-likes']?.data || {} },
          likesDaily: { data: processedData['instagram-likes-daily']?.data || {} }
        },
        tiktok: {
          fanbase: { data: processedData['tiktok-fanbase']?.data || {} },
          fanbaseDaily: { data: processedData['tiktok-fanbase-daily']?.data || {} },
          likes: { data: processedData['tiktok-likes']?.data || {} },
          likesDaily: { data: processedData['tiktok-likes-daily']?.data || {} },
          viewsDaily: { data: processedData['tiktok-views-daily']?.data || {} }
        },
        twitter: {
          fanbase: { data: processedData['twitter-fanbase']?.data || {} },
          likes: { data: processedData['twitter-likes']?.data || {} }
        },
        youtube: {
          fanbase: { data: processedData['youtube-fanbase']?.data || {} },
          fanbaseDaily: { data: processedData['youtube-fanbase-daily']?.data || {} },
          views: { data: processedData['youtube-views']?.data || {} }
        }
      },
      
      // DISCOVERY & ENGAGEMENT
      discovery: {
        shazam: {
          shazams: { data: processedData['shazam-shazams']?.data || {} }
        },
        airplay: {
          spins: { data: processedData['airplay-spins']?.data || {} }
        }
      },
      
      // PERFORMANCE & RANKINGS
      performance: {
        viberate: {
          points: { data: processedData['viberate-performance-points']?.data || {} },
          ranks: { data: processedData['viberate-ranks']?.data || {} }
        },
        social: {
          points: { data: processedData['social-performance-points']?.data || {} }
        },
        beatport: {
          points: { data: processedData['beatport-performance-points']?.data || {} }
        }
      },
      
      // RAW DATA (for debugging)
      raw: processedData
    };

    console.log(`📊 Historical Data Summary:
      ✅ Successful: ${successCount}/${endpoints.length}
      ❌ Failed: ${errorCount}/${endpoints.length}
      📈 Top data sources:`, 
      Object.entries(processedData)
        .filter(([, data]) => data.dataPoints > 0)
        .map(([key, data]) => `${key}: ${data.dataPoints} points`)
        .slice(0, 5)
    );

    return NextResponse.json(organizedData);

  } catch (error) {
    console.error('Critical error in historical data fetch:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch historical data',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      dateRange: { from: dateFrom, to: dateTo }
    }, { status: 500 });
  }
}