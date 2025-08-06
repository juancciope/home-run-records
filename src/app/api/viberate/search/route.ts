import { NextRequest, NextResponse } from 'next/server';

const VIBERATE_API_KEY = process.env.VIBERATE_API_KEY || '';
const VIBERATE_BASE_URL = 'https://data.viberate.com/api/v1';

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
      `${VIBERATE_BASE_URL}/artist/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      {
        headers: {
          'Access-Key': VIBERATE_API_KEY,
          'Accept': 'application/json',
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
    
    // Transform the response to match our expected format
    const artists = data.data?.map((artist: any) => ({
      id: artist.uuid,
      name: artist.name,
      spotify_id: artist.spotify_id || null,
      rank: artist.rank,
      verified: artist.verified,
      country: artist.country,
      genre: artist.genre,
      subgenres: artist.subgenres
    })) || [];
    
    return NextResponse.json(artists);
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