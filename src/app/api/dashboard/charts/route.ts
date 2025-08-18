import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timeFilter = searchParams.get('timeFilter') || '6m'; // all, 1m, 3m, 6m

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Use service role client to bypass RLS for server-side aggregation
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('📊 Loading chart data for user:', userId, 'timeFilter:', timeFilter);

    // Calculate date range based on filter
    const endDate = new Date();
    let startDate: Date;
    let aggregation: 'day' | 'week' | 'month' = 'day';

    switch (timeFilter) {
      case '1m':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        aggregation = 'day';
        break;
      case '3m':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        aggregation = 'week';
        break;
      case '6m':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        aggregation = 'month';
        break;
      case 'all':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 2);
        aggregation = 'month';
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        aggregation = 'month';
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log('📅 Date range:', startDateStr, 'to', endDateStr, 'aggregation:', aggregation);

    // Get user's artists using the correct user_id relationship
    const { data: userArtists, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('user_id', userId);

    if (artistError) {
      console.error('Error fetching user artists:', artistError);
      return NextResponse.json({ error: 'Failed to fetch artist data' }, { status: 500 });
    }

    const artistIds = userArtists?.map(a => a.id) || [];
    
    if (artistIds.length === 0) {
      console.log('No artists found for user');
      return NextResponse.json({
        success: true,
        data: {
          marketing: { reach: [], followers: [], engagement: [] },
          production: { records: [] },
          fanEngagement: { fans: [] }
        },
        metadata: {
          dateRange: { start: startDateStr, end: endDateStr },
          timeFilter,
          aggregation,
          artistCount: 0
        }
      });
    }

    console.log('🎤 Found artists:', userArtists?.map(a => a.stage_name).join(', '));

    // Fetch artist analytics data with proper date filtering
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('artist_analytics')
      .select('artist_id, date, platform, metric_type, value')
      .in('artist_id', artistIds)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true });

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
      return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
    }

    console.log(`📈 Found ${analyticsData?.length || 0} analytics records`);

    // Process and aggregate the data properly
    const processedData = processVibrateAnalytics(analyticsData || [], userArtists || [], aggregation);

    const result = {
      success: true,
      data: {
        marketing: {
          reach: processedData.reach,
          followers: processedData.followers,
          engagement: processedData.engagement
        },
        production: {
          records: []
        },
        fanEngagement: {
          fans: []
        }
      },
      metadata: {
        dateRange: { start: startDateStr, end: endDateStr },
        timeFilter,
        aggregation,
        artistCount: artistIds.length,
        totalDataPoints: analyticsData?.length || 0,
        artists: userArtists?.map(a => ({ id: a.id, name: a.stage_name || a.name || 'Unknown Artist' }))
      }
    };

    console.log('✅ Returning processed data:', {
      followers: processedData.followers.length,
      reach: processedData.reach.length,
      engagement: processedData.engagement.length
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error loading chart data:', error);
    return NextResponse.json({ 
      error: 'Failed to load chart data',
      success: false 
    }, { status: 500 });
  }
}

// Completely rewritten data processing function
function processVibrateAnalytics(
  data: Array<{
    artist_id: string;
    date: string;
    platform: string;
    metric_type: string;
    value: number;
  }>,
  artists: Array<{
    id: string;
    stage_name?: string;
    name?: string;
    uuid?: string;
    viberate_artist_id?: string;
  }>,
  aggregation: 'day' | 'week' | 'month'
) {
  // Create artist lookup
  const artistLookup = new Map(artists.map(a => [a.id, a.stage_name || a.name || 'Unknown Artist']));

  // Group data by date and aggregate across all artists
  const dateGroups: Record<string, {
    date: string;
    platforms: Record<string, number>;
    totalReach: number;
    totalEngagement: number;
    artistCount: number;
    artists: Set<string>;
  }> = {};

  // Process each analytics record
  data.forEach(record => {
    const dateKey = getDateKey(record.date, aggregation);
    const artistName = artistLookup.get(record.artist_id) || 'Unknown';

    if (!dateGroups[dateKey]) {
      dateGroups[dateKey] = {
        date: dateKey,
        platforms: {},
        totalReach: 0,
        totalEngagement: 0,
        artistCount: 0,
        artists: new Set()
      };
    }

    const group = dateGroups[dateKey];
    group.artists.add(artistName);

    // Aggregate data based on metric type
    if (record.metric_type === 'followers') {
      // Sum followers across all artists for each platform
      group.platforms[record.platform] = (group.platforms[record.platform] || 0) + record.value;
      group.totalReach += record.value;
    } else if (record.metric_type === 'engagement' || record.metric_type === 'streams') {
      group.totalEngagement += record.value;
    }
  });

  // Convert to sorted arrays for charts
  const sortedDates = Object.keys(dateGroups).sort();
  
  const followers = sortedDates.map(dateKey => {
    const group = dateGroups[dateKey];
    return {
      date: dateKey,
      total: group.totalReach,
      spotify: group.platforms.spotify || 0,
      instagram: group.platforms.instagram || 0,
      tiktok: group.platforms.tiktok || 0,
      youtube: group.platforms.youtube || 0,
      soundcloud: group.platforms.soundcloud || 0,
      beatport: group.platforms.beatport || 0,
      facebook: group.platforms.facebook || 0,
      twitter: group.platforms.twitter || 0,
      artistCount: group.artists.size,
      artists: Array.from(group.artists)
    };
  });

  const reach = sortedDates.map(dateKey => ({
    date: dateKey,
    value: dateGroups[dateKey].totalReach,
    artistCount: dateGroups[dateKey].artists.size
  }));

  const engagement = sortedDates.map(dateKey => ({
    date: dateKey,
    value: dateGroups[dateKey].totalEngagement,
    artistCount: dateGroups[dateKey].artists.size
  }));

  console.log('📊 Processed data summary:', {
    datePoints: sortedDates.length,
    dateRange: sortedDates.length > 0 ? `${sortedDates[0]} to ${sortedDates[sortedDates.length - 1]}` : 'none',
    totalArtists: artistLookup.size,
    sampleFollowers: followers.slice(0, 2)
  });

  return { followers, reach, engagement };
}

// Improved date aggregation function
function getDateKey(dateStr: string, aggregation: 'day' | 'week' | 'month'): string {
  const date = new Date(dateStr);
  
  switch (aggregation) {
    case 'day':
      return date.toISOString().split('T')[0];
    case 'week':
      // Get the Monday of the week
      const dayOfWeek = date.getDay();
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(date.getFullYear(), date.getMonth(), diff);
      return monday.toISOString().split('T')[0];
    case 'month':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    default:
      return date.toISOString().split('T')[0];
  }
}