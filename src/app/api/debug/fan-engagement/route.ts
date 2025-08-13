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

    // Fetch all fan engagement records for this user
    const { data: records, error } = await supabase
      .from('fan_engagement_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by engagement_level
    const byEngagementLevel = records?.reduce((acc, record) => {
      const level = record.engagement_level || 'unknown';
      if (!acc[level]) acc[level] = [];
      acc[level].push(record);
      return acc;
    }, {} as Record<string, any[]>) || {};

    // Count by engagement_level
    const counts = {
      captured: records?.filter(r => r.engagement_level === 'captured').length || 0,
      active: records?.filter(r => r.engagement_level === 'active').length || 0,
      super: records?.filter(r => r.engagement_level === 'super').length || 0,
      total: records?.length || 0
    };

    return NextResponse.json({
      success: true,
      user_id: user.id,
      total_records: records?.length || 0,
      records: records || [],
      by_engagement_level: byEngagementLevel,
      counts,
      sample_record: records?.[0] || null
    });
  } catch (error) {
    console.error('Error in debug API:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}