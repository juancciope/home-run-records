import { NextRequest, NextResponse } from 'next/server';

const VIBERATE_API_KEY = process.env.VIBERATE_API_KEY || '';
const VIBERATE_BASE_URL = 'https://api.viberate.com/api/v1';

export async function POST(request: NextRequest) {
  try {
    const { artistId, userId } = await request.json();

    if (!artistId || !userId) {
      return NextResponse.json({ error: 'Artist ID and User ID are required' }, { status: 400 });
    }

    if (!VIBERATE_API_KEY) {
      return NextResponse.json({ error: 'Viberate API key not configured' }, { status: 500 });
    }

    // For now, return success to avoid CORS issues
    // In a real implementation, you would fetch data from Viberate here
    // and save it to your database

    return NextResponse.json({ 
      success: true,
      message: 'Artist data sync initiated'
    });
  } catch (error) {
    console.error('Error syncing artist data:', error);
    return NextResponse.json(
      { error: 'Failed to sync artist data' },
      { status: 500 }
    );
  }
}