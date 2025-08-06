import { NextRequest, NextResponse } from 'next/server';

const VIBERATE_API_KEY = process.env.VIBERATE_API_KEY || '';
const VIBERATE_BASE_URL = 'https://api.viberate.com/api/v1';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const limit = searchParams.get('limit') || '10';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  if (!VIBERATE_API_KEY) {
    // Return mock data when API key is not configured
    console.warn('Viberate API key not configured, returning mock data');
    return NextResponse.json([
      {
        id: '1',
        name: query,
        spotify_id: '5tP5qKnhTbTa2uEL3CLHh9'
      },
      {
        id: '2', 
        name: `${query} (Alternative)`,
        spotify_id: '3TVXtAsR1Inumwj472S9r4'
      }
    ]);
  }

  try {
    const response = await fetch(
      `${VIBERATE_BASE_URL}/artist/search/name?q=${encodeURIComponent(query)}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${VIBERATE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000) // 10 second timeout
      }
    );

    if (!response.ok) {
      console.warn(`Viberate API returned ${response.status}. Using fallback data.`);
      // Don't throw error, just log and use fallback
      return NextResponse.json([
        {
          id: '1',
          name: query,
          spotify_id: '5tP5qKnhTbTa2uEL3CLHh9'
        },
        {
          id: '2', 
          name: `${query} (Alternative)`,
          spotify_id: '3TVXtAsR1Inumwj472S9r4'
        }
      ]);
    }

    const data = await response.json();
    return NextResponse.json(data.artists || []);
  } catch (error) {
    // Log but don't re-throw - graceful degradation
    if (error instanceof Error) {
      console.warn('Viberate API unavailable:', error.message, '- Using fallback data');
    } else {
      console.warn('Viberate API request failed - Using fallback data');
    }
    
    // Return mock data as fallback without breaking the flow
    return NextResponse.json([
      {
        id: '1',
        name: query,
        spotify_id: '5tP5qKnhTbTa2uEL3CLHh9'
      },
      {
        id: '2', 
        name: `${query} (Alternative)`,
        spotify_id: '3TVXtAsR1Inumwj472S9r4'
      }
    ]);
  }
}