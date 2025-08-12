import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const artistId = '15bbe04f-b1cc-4f2a-adfa-f052aa669b05';
    
    // Fetch artist data
    const fetchUrl = `${request.nextUrl.origin}/api/viberate/artist/${artistId}`;
    const artistDataResponse = await fetch(fetchUrl);
    const artistDataResult = await artistDataResponse.json();
    
    if (!artistDataResult.success) {
      return NextResponse.json({ error: 'Failed to fetch artist data' }, { status: 500 });
    }
    
    const artistData = artistDataResult.data;
    
    // Get artist from DB
    const supabase = await createClient();
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('id')
      .eq('uuid', artistId)
      .single();
    
    console.log('Artist lookup:', { artist, error: artistError });
    
    const result: any = {
      artistId: artist?.id,
      hasData: {
        social_links: artistData.social_links?.data?.length || 0,
        tracks: artistData.tracks?.length || 0,
        ranks: artistData.ranks?.data ? Object.keys(artistData.ranks.data).length : 0,
        fanbase_distribution: artistData.fanbase_distribution?.data ? Object.keys(artistData.fanbase_distribution.data).length : 0
      },
      samples: {
        first_social_link: artistData.social_links?.data?.[0],
        first_track: artistData.tracks?.[0],
        fanbase_sample: artistData.fanbase_distribution?.data ? Object.entries(artistData.fanbase_distribution.data).slice(0, 3) : null
      }
    };
    
    // Try to insert one social link as a test
    if (artist?.id && artistData.social_links?.data?.[0]) {
      const testLink = artistData.social_links.data[0];
      const { data: inserted, error } = await supabase
        .from('artist_social_links')
        .insert({
          artist_id: artist.id,
          platform: testLink.channel,
          url: testLink.link
        })
        .select();
      
      result.testInsert = {
        success: !error,
        data: inserted,
        error: error?.message
      };
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Test sync error:', error);
    return NextResponse.json({ error: 'Test failed', details: error.message }, { status: 500 });
  }
}