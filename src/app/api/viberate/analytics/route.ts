import { NextRequest, NextResponse } from 'next/server';

const VIBERATE_API_KEY = process.env.VIBERATE_API_KEY || '';
const VIBERATE_BASE_URL = 'https://api.viberate.com/api/v1';

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
    // In a real implementation, you would make multiple API calls here
    // For now, return mock data to avoid API issues
    console.warn('Viberate analytics API not fully implemented, returning enhanced mock data');
    
    return NextResponse.json({
      totalReach: 342000 + Math.floor(Math.random() * 10000),
      engagedAudience: 45600 + Math.floor(Math.random() * 5000),
      totalFollowers: 21200 + Math.floor(Math.random() * 1000),
      youtubeSubscribers: 18500 + Math.floor(Math.random() * 500),
      spotifyStreams: 127000 + Math.floor(Math.random() * 20000),
      isRealData: false // Set to true when real API is implemented
    });
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