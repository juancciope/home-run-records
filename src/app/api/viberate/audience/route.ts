import { NextRequest, NextResponse } from 'next/server';

const VIBERATE_API_KEY = process.env.VIBERATE_API_KEY || '';
const VIBERATE_BASE_URL = 'https://data.viberate.com/api/v1';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artistId = searchParams.get('artistId');

  if (!artistId) {
    return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
  }

  if (!VIBERATE_API_KEY) {
    return NextResponse.json({
      error: 'Viberate API key not configured',
      message: 'Audience data temporarily unavailable'
    }, { status: 503 });
  }

  try {
    const headers = {
      'Access-Key': VIBERATE_API_KEY,
      'Accept': 'application/json',
    };

    console.log(`Fetching audience/demographic data for artist ${artistId}`);

    // Audience & Demographic Endpoints
    const endpoints = [
      // === SPOTIFY DEMOGRAPHICS ===
      { key: 'spotify-listeners-location', url: `/artist/${artistId}/spotify/listeners-by-location` },
      
      // === SOCIAL MEDIA DEMOGRAPHICS ===
      { key: 'instagram-audience', url: `/artist/${artistId}/instagram/audience` },
      { key: 'youtube-audience', url: `/artist/${artistId}/youtube/audience` },
      { key: 'tiktok-audience', url: `/artist/${artistId}/tiktok/audience` },
      
      // === YOUTUBE LOCATION DATA ===
      { key: 'youtube-views-location', url: `/artist/${artistId}/youtube/views-by-location` },
      
      // === VIBERATE PLATFORM DATA ===
      { key: 'viberate-fanbase-distribution', url: `/artist/${artistId}/viberate/fanbase-distribution` },
      { key: 'viberate-audience', url: `/artist/${artistId}/viberate/audience` },
      { key: 'viberate-ranks', url: `/artist/${artistId}/viberate/ranks` },
      
      // === AIRPLAY DEMOGRAPHICS ===
      { key: 'airplay-spins-country', url: `/artist/${artistId}/airplay/spins-by-country?timeframe=last_month` },
      { key: 'airplay-spins-city', url: `/artist/${artistId}/airplay/spins-by-city?timeframe=last_month` },
    ];

    // Fetch all endpoints in parallel
    console.log(`Making ${endpoints.length} audience API calls...`);
    const responses = await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        try {
          const response = await fetch(`${VIBERATE_BASE_URL}${endpoint.url}`, {
            headers,
            signal: AbortSignal.timeout(10000)
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
          // Handle different data structures - some endpoints return arrays, others objects
          const responseData = data.data?.data || data.data || {};
          const dataPoints = Array.isArray(responseData) ? responseData.length : 
                           typeof responseData === 'object' ? Object.keys(responseData).length : 0;
          
          processedData[endpoint.key] = {
            data: responseData,
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

    // Organize audience data by platform
    const audienceData = {
      success: true,
      summary: {
        totalEndpoints: endpoints.length,
        successful: successCount,
        failed: errorCount,
        fetchedAt: new Date().toISOString()
      },
      
      // SPOTIFY AUDIENCE DATA
      spotify: {
        locationData: processedData['spotify-listeners-location']?.data || {},
        metadata: processedData['spotify-listeners-location']?.metadata || {}
      },
      
      // SOCIAL MEDIA AUDIENCE DATA
      instagram: {
        audienceBreakdown: processedData['instagram-audience']?.data || {},
        metadata: processedData['instagram-audience']?.metadata || {}
      },
      
      youtube: {
        audienceBreakdown: processedData['youtube-audience']?.data || {},
        viewsByLocation: processedData['youtube-views-location']?.data || {},
        metadata: processedData['youtube-audience']?.metadata || {}
      },
      
      tiktok: {
        audienceBreakdown: processedData['tiktok-audience']?.data || {},
        metadata: processedData['tiktok-audience']?.metadata || {}
      },
      
      // VIBERATE PLATFORM DATA
      viberate: {
        fanbaseDistribution: processedData['viberate-fanbase-distribution']?.data || {},
        audience: processedData['viberate-audience']?.data || {},
        ranks: processedData['viberate-ranks']?.data || {},
        metadata: processedData['viberate-audience']?.metadata || {}
      },
      
      // AIRPLAY DATA
      airplay: {
        spinsByCountry: processedData['airplay-spins-country']?.data || {},
        spinsByCity: processedData['airplay-spins-city']?.data || {},
        metadata: processedData['airplay-spins-country']?.metadata || {}
      },
      
      // RAW DATA (for debugging)
      raw: processedData
    };

    console.log(`📊 Audience Data Summary:
      ✅ Successful: ${successCount}/${endpoints.length}
      ❌ Failed: ${errorCount}/${endpoints.length}
      📈 Data available from:`, 
      Object.entries(processedData)
        .filter(([, data]) => data.dataPoints > 0)
        .map(([key, data]) => `${key}: ${data.dataPoints} points`)
    );

    return NextResponse.json(audienceData);

  } catch (error) {
    console.error('Critical error in audience data fetch:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch audience data',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}