import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { PipelineService } from '@/lib/services/pipeline-service';
import { ArtistService } from '@/lib/services/artist-service';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Dashboard metrics API called');
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    console.log('👤 User ID from request:', userId);

    if (!userId) {
      console.log('❌ No user ID provided');
      return NextResponse.json({ error: 'User ID required', success: false }, { status: 400 });
    }

    const supabase = await createClient();
    console.log('🔐 Checking authentication...');
    
    // Check authentication - make this more lenient for debugging
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('👤 Authenticated user:', user?.id, 'Email:', user?.email);
    console.log('🔐 Auth error:', authError);
    
    if (!user) {
      console.log('❌ No authenticated user found');
      return NextResponse.json({ error: 'Not authenticated', success: false }, { status: 401 });
    }
    
    if (user.id !== userId) {
      console.log('❌ User ID mismatch:', user.id, 'vs', userId);
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    console.log('✅ Authentication passed, loading metrics...');

    // Load all metrics in parallel for speed
    const [
      productionMetrics,
      marketingMetrics, 
      fanEngagementMetrics,
      conversionMetrics,
      agentMetrics,
      profile
    ] = await Promise.all([
      PipelineService.getProductionMetrics(userId).catch(e => {
        console.error('Production metrics error:', e);
        return { unfinished: 0, finished: 0, released: 0 };
      }),
      PipelineService.getMarketingMetrics(userId).catch(e => {
        console.error('Marketing metrics error:', e);
        return { totalReach: 0, engagedAudience: 0, totalFollowers: 0 };
      }),
      PipelineService.getFanEngagementMetrics(userId).catch(e => {
        console.error('Fan engagement metrics error:', e);
        return { capturedData: 0, fans: 0, superFans: 0 };
      }),
      PipelineService.getConversionMetrics(userId).catch(e => {
        console.error('Conversion metrics error:', e);
        return { leads: 0, opportunities: 0, sales: 0, revenue: 0 };
      }),
      PipelineService.getAgentMetrics(userId).catch(e => {
        console.error('Agent metrics error:', e);
        return { potentialAgents: 0, meetingsBooked: 0, agentsSigned: 0 };
      }),
      ArtistService.getArtistProfile(userId, user.email || '').catch(e => {
        console.error('Profile error:', e);
        return null;
      })
    ]);

    console.log('📊 Loaded metrics:', {
      production: productionMetrics,
      marketing: marketingMetrics,
      fanEngagement: fanEngagementMetrics,
      conversion: conversionMetrics,
      agent: agentMetrics,
      profile: profile?.viberate_artist_id ? 'Has Viberate connection' : 'No Viberate connection'
    });

    const hasVibrateConnection = !!profile?.viberate_artist_id;

    const response = {
      success: true,
      metrics: {
        production: productionMetrics,
        marketing: {
          totalReach: marketingMetrics.totalReach,
          engagedAudience: marketingMetrics.engagedAudience,
          totalFollowers: marketingMetrics.totalFollowers,
          youtubeSubscribers: 0 // Legacy field
        },
        fanEngagement: fanEngagementMetrics,
        conversion: conversionMetrics,
        agent: agentMetrics
      },
      marketing: marketingMetrics,
      hasVibrateConnection,
      profile: {
        onboarding_completed: profile?.onboarding_completed
      }
    };

    console.log('✅ Returning response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error loading dashboard metrics:', error);
    return NextResponse.json({ 
      error: 'Failed to load metrics',
      success: false,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}