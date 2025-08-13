import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/utils/supabase/client';

export async function GET(request: NextRequest) {
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
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found', details: profileError }, { status: 404 });
    }

    // Get artist metrics (Viberate historical data)
    const { data: metrics, error: metricsError } = await supabase
      .from('artist_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(20);

    // Get artist_fanbase data to debug what's stored
    const { data: fanbaseData, error: fanbaseError } = await supabase
      .from('artist_fanbase')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get pipeline records for comparison
    const { data: fanRecords, error: fanError } = await supabase
      .from('fan_engagement_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: marketingRecords, error: marketingError } = await supabase
      .from('marketing_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      user_id: user.id,
      profile: profile,
      viberate_connected: !!profile?.viberate_artist_id,
      viberate_metrics: {
        count: metrics?.length || 0,
        latest_date: metrics?.[0]?.date || null,
        data: metrics || [],
        error: metricsError
      },
      fan_engagement_records: {
        count: fanRecords?.length || 0,
        data: fanRecords || [],
        error: fanError
      },
      marketing_records: {
        count: marketingRecords?.length || 0,
        data: marketingRecords || [],
        error: marketingError
      },
      artist_fanbase: {
        exists: !!fanbaseData,
        has_data: !!fanbaseData?.data,
        has_historical: !!fanbaseData?.data?.historical,
        has_distribution: !!fanbaseData?.data?.distribution,
        data_keys: fanbaseData?.data ? Object.keys(fanbaseData.data) : [],
        error: fanbaseError,
        sample_data: fanbaseData ? {
          total_fans: fanbaseData.total_fans,
          distribution_keys: fanbaseData.distribution ? Object.keys(fanbaseData.distribution) : [],
          historical_type: fanbaseData.data?.historical ? typeof fanbaseData.data.historical : 'none',
          historical_is_array: Array.isArray(fanbaseData.data?.historical),
          historical_length: Array.isArray(fanbaseData.data?.historical) ? fanbaseData.data.historical.length : 'not array'
        } : null
      }
    });
  } catch (error) {
    console.error('Error in debug API:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}