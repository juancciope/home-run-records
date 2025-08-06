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
    // Return mock analytics data when API key is not configured
    console.warn('Viberate API key not configured, returning mock analytics data');
    return NextResponse.json({
      totalReach: 342000,
      engagedAudience: 45600,
      totalFollowers: 21200,
      youtubeSubscribers: 18500,
      spotifyStreams: 127000,
      isRealData: false
    });
  }

  try {
    // Get current date and 30 days ago for API calls
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    // Fetch real analytics data from multiple Viberate endpoints
    const [spotifyResponse, instagramResponse, youtubeResponse] = await Promise.all([
      fetch(`${VIBERATE_BASE_URL}/artist/${artistId}/spotify/listeners-historical?date-from=${startDate}&date-to=${endDate}`, {
        headers: { 'Access-Key': VIBERATE_API_KEY, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      }).catch(() => null),
      fetch(`${VIBERATE_BASE_URL}/artist/${artistId}/instagram/fanbase-historical?date-from=${startDate}&date-to=${endDate}`, {
        headers: { 'Access-Key': VIBERATE_API_KEY, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      }).catch(() => null),
      fetch(`${VIBERATE_BASE_URL}/artist/${artistId}/youtube/fanbase-historical?date-from=${startDate}&date-to=${endDate}`, {
        headers: { 'Access-Key': VIBERATE_API_KEY, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      }).catch(() => null)
    ]);

    let spotifyData, instagramData, youtubeData;
    let hasRealData = false;

    // Parse responses if available
    if (spotifyResponse?.ok) {
      spotifyData = await spotifyResponse.json();
      hasRealData = true;
    }
    if (instagramResponse?.ok) {
      instagramData = await instagramResponse.json();
      hasRealData = true;
    }
    if (youtubeResponse?.ok) {
      youtubeData = await youtubeResponse.json();
      hasRealData = true;
    }

    // Extract latest values or use defaults
    const latestSpotify = spotifyData?.data?.data ? Object.values(spotifyData.data.data).pop() as { value: number } | undefined : null;
    const latestInstagram = instagramData?.data?.data ? Object.values(instagramData.data.data).pop() as { value: number } | undefined : null;
    const latestYoutube = youtubeData?.data?.data ? Object.values(youtubeData.data.data).pop() as { value: number } | undefined : null;

    const spotifyListeners = latestSpotify?.value || 0;
    const instagramFollowers = latestInstagram?.value || 0;
    const youtubeSubscribers = latestYoutube?.value || 0;
    
    const totalFollowers = spotifyListeners + instagramFollowers + youtubeSubscribers;
    const totalReach = Math.round(totalFollowers * 1.8); // Estimate reach multiplier
    const engagedAudience = Math.round(totalReach * 0.12); // Estimate 12% engagement

    if (hasRealData) {
      return NextResponse.json({
        totalReach,
        engagedAudience,
        totalFollowers,
        youtubeSubscribers,
        spotifyStreams: spotifyListeners,
        instagramFollowers,
        isRealData: true
      });
    } else {
      // Fallback to mock data if no real data available
      console.warn('No real Viberate data available, using mock analytics');
      return NextResponse.json({
        totalReach: 342000 + Math.floor(Math.random() * 10000),
        engagedAudience: 45600 + Math.floor(Math.random() * 5000),
        totalFollowers: 21200 + Math.floor(Math.random() * 1000),
        youtubeSubscribers: 18500 + Math.floor(Math.random() * 500),
        spotifyStreams: 127000 + Math.floor(Math.random() * 20000),
        isRealData: false
      });
    }
  } catch (error) {
    console.warn('Error fetching analytics data:', error);
    
    // Return fallback mock data
    return NextResponse.json({
      totalReach: 342000,
      engagedAudience: 45600,
      totalFollowers: 21200,
      youtubeSubscribers: 18500,
      spotifyStreams: 127000,
      isRealData: false
    });
  }
}