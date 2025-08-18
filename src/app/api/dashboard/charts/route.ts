import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timeFilter = searchParams.get('timeFilter') || '6m'; // all, 1m, 3m, 6m
    // const section = searchParams.get('section') || 'all'; // marketing, production, fanEngagement, all

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📊 Loading chart data for user:', userId, 'timeFilter:', timeFilter);

    // Calculate date range based on filter
    const endDate = new Date();
    const startDate = new Date();
    let aggregation = 'day'; // day, week, month

    switch (timeFilter) {
      case '1m':
        startDate.setMonth(startDate.getMonth() - 1);
        aggregation = 'day';
        break;
      case '3m':
        startDate.setMonth(startDate.getMonth() - 3);
        aggregation = 'week';
        break;
      case '6m':
        startDate.setMonth(startDate.getMonth() - 6);
        aggregation = 'month';
        break;
      case 'all':
        startDate.setFullYear(startDate.getFullYear() - 2);
        aggregation = 'month';
        break;
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Get user's artists first
    const { data: userArtists, error: artistError } = await supabase
      .from('artists')
      .select('id, stage_name, uuid')
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

    console.log('Found artists for user:', artistIds);

    // Fetch artist analytics data
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('artist_analytics')
      .select('*')
      .in('artist_id', artistIds)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true });

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
      return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
    }

    console.log(`Found ${analyticsData?.length || 0} analytics records`);

    // Process and aggregate data based on time filter
    const processedData = processAnalyticsData(analyticsData || [], aggregation);

    // Fetch marketing records (user-entered data)
    const { data: marketingRecords } = await supabase
      .from('marketing_records')
      .select('*')
      .eq('user_id', userId)
      .gte('date_recorded', startDateStr)
      .lte('date_recorded', endDateStr)
      .order('date_recorded', { ascending: true });

    // Fetch production records count over time
    const { data: productionRecords } = await supabase
      .from('production_records')
      .select('created_at, record_type')
      .eq('user_id', userId)
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr)
      .order('created_at', { ascending: true });

    // Fetch fan engagement records over time
    const { data: fanRecords } = await supabase
      .from('fan_engagement_records')
      .select('created_at, record_type')
      .eq('user_id', userId)
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr)
      .order('created_at', { ascending: true });

    // Combine all data sources
    const combinedData = {
      success: true,
      data: {
        marketing: {
          reach: processedData.reach,
          followers: processedData.followers,
          engagement: processedData.engagement,
          userRecords: processMarketingRecords(marketingRecords || [], aggregation)
        },
        production: {
          records: processProductionRecords(productionRecords || [], aggregation)
        },
        fanEngagement: {
          fans: processFanRecords(fanRecords || [], aggregation)
        }
      },
      metadata: {
        dateRange: { start: startDateStr, end: endDateStr },
        timeFilter,
        aggregation,
        artistCount: artistIds.length,
        totalDataPoints: analyticsData?.length || 0
      }
    };

    return NextResponse.json(combinedData);

  } catch (error) {
    console.error('❌ Error loading chart data:', error);
    return NextResponse.json({ 
      error: 'Failed to load chart data',
      success: false 
    }, { status: 500 });
  }
}

// Helper function to process analytics data
function processAnalyticsData(data: any[], aggregation: string) {
  const reach: any[] = [];
  const followers: any[] = [];
  const engagement: any[] = [];

  // Group data by date
  const groupedByDate: Record<string, any> = {};

  data.forEach(record => {
    const dateKey = getAggregatedDateKey(record.date, aggregation);
    
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = {
        date: dateKey,
        reach: 0,
        followers: {},
        streams: 0,
        engagement: 0
      };
    }

    // Aggregate based on metric type
    if (record.metric_type === 'followers') {
      groupedByDate[dateKey].followers[record.platform] = 
        (groupedByDate[dateKey].followers[record.platform] || 0) + record.value;
      groupedByDate[dateKey].reach += record.value;
    } else if (record.metric_type === 'streams') {
      groupedByDate[dateKey].streams += record.value;
      groupedByDate[dateKey].engagement += record.value;
    } else if (record.metric_type === 'engagement') {
      groupedByDate[dateKey].engagement += record.value;
    }
  });

  // Convert to arrays
  Object.keys(groupedByDate).sort().forEach(dateKey => {
    const data = groupedByDate[dateKey];
    
    reach.push({
      date: dateKey,
      value: data.reach
    });

    followers.push({
      date: dateKey,
      ...data.followers,
      total: Object.values(data.followers).reduce((sum: number, val: any) => sum + val, 0)
    });

    engagement.push({
      date: dateKey,
      value: data.engagement || data.streams
    });
  });

  return { reach, followers, engagement };
}

// Helper function to process marketing records
function processMarketingRecords(records: any[], aggregation: string) {
  const grouped: Record<string, any> = {};

  records.forEach(record => {
    const dateKey = getAggregatedDateKey(record.date_recorded, aggregation);
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: dateKey,
        reach: 0,
        engagement: 0,
        followers: 0
      };
    }

    grouped[dateKey].reach += record.reach_count || 0;
    grouped[dateKey].engagement += record.engagement_count || 0;
    grouped[dateKey].followers += record.follower_count || 0;
  });

  return Object.keys(grouped).sort().map(key => grouped[key]);
}

// Helper function to process production records
function processProductionRecords(records: any[], aggregation: string) {
  const grouped: Record<string, any> = {};

  records.forEach(record => {
    const dateKey = getAggregatedDateKey(record.created_at, aggregation);
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: dateKey,
        unfinished: 0,
        finished: 0,
        released: 0,
        total: 0
      };
    }

    grouped[dateKey][record.record_type] = (grouped[dateKey][record.record_type] || 0) + 1;
    grouped[dateKey].total += 1;
  });

  return Object.keys(grouped).sort().map(key => grouped[key]);
}

// Helper function to process fan engagement records
function processFanRecords(records: any[], aggregation: string) {
  const grouped: Record<string, any> = {};

  records.forEach(record => {
    const dateKey = getAggregatedDateKey(record.created_at, aggregation);
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: dateKey,
        captured: 0,
        fans: 0,
        super_fans: 0,
        total: 0
      };
    }

    grouped[dateKey][record.record_type] = (grouped[dateKey][record.record_type] || 0) + 1;
    grouped[dateKey].total += 1;
  });

  return Object.keys(grouped).sort().map(key => grouped[key]);
}

// Helper function to get aggregated date key
function getAggregatedDateKey(dateStr: string, aggregation: string): string {
  const date = new Date(dateStr);
  
  switch (aggregation) {
    case 'day':
      return date.toISOString().split('T')[0];
    case 'week':
      // Get the Monday of the week
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      return monday.toISOString().split('T')[0];
    case 'month':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    default:
      return date.toISOString().split('T')[0];
  }
}