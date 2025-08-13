import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/utils/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAuthenticatedClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user's artist profile
    const { data: profile, error: profileError } = await supabase
      .from('artist_profiles')
      .select('viberate_artist_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.viberate_artist_id) {
      return NextResponse.json({ error: 'No Viberate artist ID found' }, { status: 404 });
    }

    // Import and run the sync function
    const { PipelineService } = await import('@/lib/services/pipeline-service');
    await PipelineService.syncVibrateHistoricalData(user.id, profile.viberate_artist_id, 6);

    // Check how many metrics were created
    const { data: metrics, error: metricsError } = await supabase
      .from('artist_metrics')
      .select('*')
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      message: 'Viberate historical data sync completed',
      metrics_count: metrics?.length || 0,
      metrics: metrics?.slice(0, 10) || [] // Return first 10 as sample
    });
  } catch (error) {
    console.error('Error in sync API:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}