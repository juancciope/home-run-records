import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📊 Loading unified dashboard data for user:', userId);

    // Get unified metrics from new table
    const { data: metrics, error } = await supabase
      .from('user_dashboard_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // If no metrics exist, create default entry
    if (!metrics) {
      console.log('No metrics found, creating default entry for user:', userId);
      const { data: newMetrics, error: insertError } = await supabase
        .from('user_dashboard_metrics')
        .insert([{ user_id: userId }])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating default metrics:', insertError);
        return NextResponse.json({ error: 'Failed to create metrics' }, { status: 500 });
      }

      const defaultMetrics = newMetrics;
      
      return NextResponse.json({
        success: true,
        overview: {
          marketing: {
            totalReach: 0,
            engagedAudience: 0,
            totalFollowers: 0,
            isRealData: false
          },
          production: {
            unfinished: 0,
            finished: 0,
            released: 0
          },
          fanEngagement: {
            capturedData: 0,
            fans: 0,
            superFans: 0
          },
          conversion: {
            leads: 0,
            opportunities: 0,
            sales: 0,
            revenue: 0
          }
        },
        reach: {
          totalReach: 0,
          engagedAudience: 0,
          totalFollowers: 0,
          artistRank: 0,
          platforms: {
            spotify: { followers: 0, monthlyListeners: 0, streams: 0 },
            youtube: { subscribers: 0, views: 0 },
            instagram: { followers: 0, engagement: 0 },
            tiktok: { followers: 0, views: 0 },
            facebook: { followers: 0, engagement: 0 },
            twitter: { followers: 0 }
          },
          isRealData: false
        },
        metadata: {
          lastSynced: defaultMetrics.last_synced,
          hasVibrateConnection: false
        }
      });
    }

    console.log('✅ Found metrics for user:', userId, metrics);

    // Calculate platform breakdown for reach dashboard (estimate from total followers)
    const totalFollowers = metrics.viberate_followers || 0;
    const spotifyFollowers = Math.floor(totalFollowers * 0.4); // 40% Spotify
    const instagramFollowers = Math.floor(totalFollowers * 0.3); // 30% Instagram
    const youtubeSubscribers = Math.floor(totalFollowers * 0.2); // 20% YouTube
    const tiktokFollowers = Math.floor(totalFollowers * 0.1); // 10% TikTok

    return NextResponse.json({
      success: true,
      overview: {
        marketing: {
          totalReach: metrics.viberate_reach || 0,
          engagedAudience: metrics.viberate_engagement || 0,
          totalFollowers: metrics.viberate_followers || 0,
          isRealData: (metrics.viberate_followers || 0) > 0
        },
        production: {
          unfinished: metrics.user_production_unfinished || 0,
          finished: metrics.user_production_finished || 0,
          released: metrics.user_production_released || 0
        },
        fanEngagement: {
          capturedData: metrics.user_fan_engagement || 0,
          fans: metrics.user_fans || 0,
          superFans: metrics.user_super_fans || 0
        },
        conversion: {
          leads: metrics.user_conversion_leads || 0,
          opportunities: metrics.user_conversion_opportunities || 0,
          sales: metrics.user_conversion_sales || 0,
          revenue: metrics.user_conversion_revenue || 0
        }
      },
      reach: {
        totalReach: metrics.viberate_reach || 0,
        engagedAudience: metrics.viberate_engagement || 0,
        totalFollowers: metrics.viberate_followers || 0,
        artistRank: 0, // TODO: Get from Viberate API
        platforms: {
          spotify: { 
            followers: spotifyFollowers, 
            monthlyListeners: spotifyFollowers * 2,
            streams: spotifyFollowers * 12
          },
          youtube: { 
            subscribers: youtubeSubscribers, 
            views: youtubeSubscribers * 8
          },
          instagram: { 
            followers: instagramFollowers, 
            engagement: Math.min(Math.round((instagramFollowers / Math.max(totalFollowers, 1)) * 100), 50)
          },
          tiktok: { 
            followers: tiktokFollowers, 
            views: tiktokFollowers * 20
          },
          facebook: { 
            followers: Math.floor(totalFollowers * 0.05), // 5% Facebook
            engagement: Math.min(Math.round((totalFollowers * 0.05) / Math.max(totalFollowers, 1) * 100), 30)
          },
          twitter: {
            followers: Math.floor(totalFollowers * 0.05) // 5% Twitter
          }
        },
        isRealData: (metrics.viberate_followers || 0) > 0
      },
      metadata: {
        lastSynced: metrics.last_synced,
        hasVibrateConnection: !!metrics.viberate_artist_id
      }
    });

  } catch (error) {
    console.error('❌ Error loading unified dashboard data:', error);
    return NextResponse.json({ 
      error: 'Failed to load dashboard data',
      success: false 
    }, { status: 500 });
  }
}

// PUT endpoint for incremental updates
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const body = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📈 Updating metrics for user:', userId, body);

    // Build update object based on what's provided
    const updates: any = { updated_at: new Date().toISOString() };

    // Handle incremental updates for production
    if (body.production) {
      if (body.production.unfinished !== undefined) {
        updates.user_production_unfinished = body.production.unfinished;
      }
      if (body.production.finished !== undefined) {
        updates.user_production_finished = body.production.finished;
      }
      if (body.production.released !== undefined) {
        updates.user_production_released = body.production.released;
      }
    }

    // Handle incremental updates for fan engagement
    if (body.fanEngagement) {
      if (body.fanEngagement.capturedData !== undefined) {
        updates.user_fan_engagement = body.fanEngagement.capturedData;
      }
      if (body.fanEngagement.fans !== undefined) {
        updates.user_fans = body.fanEngagement.fans;
      }
      if (body.fanEngagement.superFans !== undefined) {
        updates.user_super_fans = body.fanEngagement.superFans;
      }
    }

    // Handle Viberate data updates
    if (body.viberate) {
      if (body.viberate.reach !== undefined) {
        updates.viberate_reach = body.viberate.reach;
      }
      if (body.viberate.followers !== undefined) {
        updates.viberate_followers = body.viberate.followers;
      }
      if (body.viberate.engagement !== undefined) {
        updates.viberate_engagement = body.viberate.engagement;
      }
      if (body.viberate.artistId !== undefined) {
        updates.viberate_artist_id = body.viberate.artistId;
      }
      updates.last_synced = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('user_dashboard_metrics')
      .upsert([{ user_id: userId, ...updates }], { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating metrics:', error);
      return NextResponse.json({ error: 'Failed to update metrics' }, { status: 500 });
    }

    console.log('✅ Updated metrics successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Metrics updated successfully',
      data
    });

  } catch (error) {
    console.error('❌ Error updating dashboard metrics:', error);
    return NextResponse.json({ 
      error: 'Failed to update metrics',
      success: false 
    }, { status: 500 });
  }
}