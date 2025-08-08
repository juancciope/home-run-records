import { NextRequest, NextResponse } from 'next/server';

const VIBERATE_API_KEY = process.env.VIBERATE_API_KEY || '';
const VIBERATE_BASE_URL = 'https://data.viberate.com/api/v1';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artistId = searchParams.get('artistId');
  const limit = searchParams.get('limit') || '50';
  const offset = searchParams.get('offset') || '0';
  const sort = searchParams.get('sort') || 'added_at';
  const order = searchParams.get('order') || 'desc';
  const timeframe = searchParams.get('timeframe') || 'all_time';

  if (!artistId) {
    return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
  }

  if (!VIBERATE_API_KEY) {
    return NextResponse.json({
      error: 'Viberate API key not configured',
      message: 'Content data temporarily unavailable'
    }, { status: 503 });
  }

  try {
    const headers = {
      'Access-Key': VIBERATE_API_KEY,
      'Accept': 'application/json',
    };

    console.log(`Fetching content/playlist data for artist ${artistId}`);

    // Content & Playlist Endpoints
    const endpoints = [
      // === SPOTIFY CONTENT ===
      { key: 'spotify-playlists', url: `/artist/${artistId}/spotify/playlists?sort=${sort}&order=${order}&limit=${limit}&offset=${offset}` },
      { key: 'spotify-playlisted-tracks', url: `/artist/${artistId}/spotify/playlisted-tracks?sort=${sort}&order=${order}&limit=${limit}&offset=${offset}` },
      { key: 'spotify-tracks', url: `/artist/${artistId}/spotify/tracks?sort=${sort}&order=${order}&timeframe=${timeframe}&limit=${limit}&offset=${offset}` },
      
      // === APPLE MUSIC CONTENT ===
      { key: 'apple-playlists', url: `/artist/${artistId}/apple/playlists?sort=${sort}&order=${order}&limit=${limit}&offset=${offset}` },
      { key: 'apple-playlisted-tracks', url: `/artist/${artistId}/apple/playlisted-tracks?sort=${sort}&order=${order}&limit=${limit}&offset=${offset}` },
      
      // === YOUTUBE CONTENT ===
      { key: 'youtube-videos', url: `/artist/${artistId}/youtube/videos?sort=${sort}&order=${order}&timeframe=${timeframe}&limit=${limit}&offset=${offset}` },
      
      // === SOUNDCLOUD CONTENT ===
      { key: 'soundcloud-tracks', url: `/artist/${artistId}/soundcloud/tracks?sort=${sort}&order=${order}&timeframe=${timeframe}&limit=${limit}&offset=${offset}` },
      
      // === BEATPORT CONTENT ===
      { key: 'beatport-tracks', url: `/artist/${artistId}/beatport/tracks?sort=${sort}&order=${order}&limit=${limit}&offset=${offset}` },
      
      // === SHAZAM CONTENT ===
      { key: 'shazam-tracks', url: `/artist/${artistId}/shazam/tracks?sort=${sort}&order=${order}&timeframe=${timeframe}&limit=${limit}&offset=${offset}` },
      
      // === VIBERATE CONTENT ===
      { key: 'viberate-tracks', url: `/artist/${artistId}/viberate/tracks?limit=${limit}&offset=${offset}` },
      { key: 'viberate-similar-artists', url: `/artist/${artistId}/viberate/similar-artists` },
      { key: 'viberate-chart-positions', url: `/artist/${artistId}/viberate/chart/top-positions` },
      
      // === INSTAGRAM CONTENT ===
      { key: 'instagram-top-posts', url: `/artist/${artistId}/instagram/top-posts` },
      
      // === TIKTOK CONTENT ===
      { key: 'tiktok-top-posts', url: `/artist/${artistId}/tiktok/top-posts` },
    ];

    // Fetch all endpoints in parallel
    console.log(`Making ${endpoints.length} content API calls...`);
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
    const processedData: Record<string, { data: unknown; metadata?: Record<string, unknown>; dataPoints: number; success: boolean; error?: string }> = {};
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < responses.length; i++) {
      const result = responses[i];
      const endpoint = endpoints[i];
      
      if (result.status === 'fulfilled' && result.value.response?.ok) {
        try {
          const data = await result.value.response.json();
          // Handle different data structures
          const responseData = data.data?.data || data.data || [];
          const dataPoints = Array.isArray(responseData) ? responseData.length : 
                           typeof responseData === 'object' ? Object.keys(responseData).length : 0;
          
          processedData[endpoint.key] = {
            data: responseData,
            metadata: {
              uuid: data.data?.uuid,
              name: data.data?.name,
              slug: data.data?.slug,
              total: data.data?.total,
              pagination: {
                limit: data.data?.limit,
                offset: data.data?.offset,
                total: data.data?.total
              }
            },
            dataPoints,
            success: true
          };
          
          if (dataPoints > 0) {
            console.log(`✅ ${endpoint.key}: ${dataPoints} items`);
            successCount++;
          } else {
            console.log(`⚠️  ${endpoint.key}: No content available`);
          }
        } catch (parseError) {
          console.warn(`❌ Parse error for ${endpoint.key}:`, parseError);
          processedData[endpoint.key] = { data: [], dataPoints: 0, success: false, error: 'Parse error' };
          errorCount++;
        }
      } else {
        const status = result.status === 'fulfilled' ? String(result.value.response?.status || 'unknown') : 'network_error';
        console.warn(`❌ ${endpoint.key}: ${status}`);
        processedData[endpoint.key] = { data: [], dataPoints: 0, success: false, error: status };
        errorCount++;
      }
    }

    // Organize content data by platform and type
    const contentData = {
      success: true,
      summary: {
        totalEndpoints: endpoints.length,
        successful: successCount,
        failed: errorCount,
        fetchedAt: new Date().toISOString(),
        parameters: { limit, offset, sort, order, timeframe }
      },
      
      // SPOTIFY CONTENT
      spotify: {
        playlists: {
          data: processedData['spotify-playlists']?.data || [],
          metadata: processedData['spotify-playlists']?.metadata || {}
        },
        playlistedTracks: {
          data: processedData['spotify-playlisted-tracks']?.data || [],
          metadata: processedData['spotify-playlisted-tracks']?.metadata || {}
        },
        tracks: {
          data: processedData['spotify-tracks']?.data || [],
          metadata: processedData['spotify-tracks']?.metadata || {}
        }
      },
      
      // APPLE MUSIC CONTENT
      apple: {
        playlists: {
          data: processedData['apple-playlists']?.data || [],
          metadata: processedData['apple-playlists']?.metadata || {}
        },
        playlistedTracks: {
          data: processedData['apple-playlisted-tracks']?.data || [],
          metadata: processedData['apple-playlisted-tracks']?.metadata || {}
        }
      },
      
      // VIDEO CONTENT
      youtube: {
        videos: {
          data: processedData['youtube-videos']?.data || [],
          metadata: processedData['youtube-videos']?.metadata || {}
        }
      },
      
      // AUDIO CONTENT
      soundcloud: {
        tracks: {
          data: processedData['soundcloud-tracks']?.data || [],
          metadata: processedData['soundcloud-tracks']?.metadata || {}
        }
      },
      
      beatport: {
        tracks: {
          data: processedData['beatport-tracks']?.data || [],
          metadata: processedData['beatport-tracks']?.metadata || {}
        }
      },
      
      shazam: {
        tracks: {
          data: processedData['shazam-tracks']?.data || [],
          metadata: processedData['shazam-tracks']?.metadata || {}
        }
      },
      
      // SOCIAL CONTENT
      instagram: {
        topPosts: {
          data: processedData['instagram-top-posts']?.data || [],
          metadata: processedData['instagram-top-posts']?.metadata || {}
        }
      },
      
      tiktok: {
        topPosts: {
          data: processedData['tiktok-top-posts']?.data || [],
          metadata: processedData['tiktok-top-posts']?.metadata || {}
        }
      },
      
      // VIBERATE INSIGHTS
      viberate: {
        tracks: {
          data: processedData['viberate-tracks']?.data || [],
          metadata: processedData['viberate-tracks']?.metadata || {}
        },
        similarArtists: {
          data: processedData['viberate-similar-artists']?.data || [],
          metadata: processedData['viberate-similar-artists']?.metadata || {}
        },
        chartPositions: {
          data: processedData['viberate-chart-positions']?.data || [],
          metadata: processedData['viberate-chart-positions']?.metadata || {}
        }
      },
      
      // RAW DATA (for debugging)
      raw: processedData
    };

    console.log(`📊 Content Data Summary:
      ✅ Successful: ${successCount}/${endpoints.length}
      ❌ Failed: ${errorCount}/${endpoints.length}
      📈 Content available:`, 
      Object.entries(processedData)
        .filter(([, data]) => data.dataPoints > 0)
        .map(([key, data]) => `${key}: ${data.dataPoints} items`)
    );

    return NextResponse.json(contentData);

  } catch (error) {
    console.error('Critical error in content data fetch:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch content data',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}