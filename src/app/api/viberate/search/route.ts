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
    return NextResponse.json({ error: 'Viberate API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `${VIBERATE_BASE_URL}/artist/search/name?q=${encodeURIComponent(query)}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${VIBERATE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Viberate API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data.artists || []);
  } catch (error) {
    console.error('Error searching for artist:', error);
    return NextResponse.json(
      { error: 'Failed to search for artist' },
      { status: 500 }
    );
  }
}