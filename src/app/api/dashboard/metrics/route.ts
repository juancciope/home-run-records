import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { PipelineService } from '@/lib/services/pipeline-service';
import { ArtistService } from '@/lib/services/artist-service';

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

    // Load all metrics in parallel for speed
    const [
      productionMetrics,
      marketingMetrics, 
      fanEngagementMetrics,
      conversionMetrics,
      agentMetrics,
      profile
    ] = await Promise.all([
      PipelineService.getProductionMetrics(userId),
      PipelineService.getMarketingMetrics(userId),
      PipelineService.getFanEngagementMetrics(userId),
      PipelineService.getConversionMetrics(userId),
      PipelineService.getAgentMetrics(userId),
      ArtistService.getArtistProfile(userId, user.email || '')
    ]);

    const hasVibrateConnection = !!profile?.viberate_artist_id;

    return NextResponse.json({
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
    });

  } catch (error) {
    console.error('Error loading dashboard metrics:', error);
    return NextResponse.json({ 
      error: 'Failed to load metrics',
      success: false 
    }, { status: 500 });
  }
}