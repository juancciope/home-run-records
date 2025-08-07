import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artistId = searchParams.get('artistId');

  if (!artistId) {
    return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
  }

  try {
    console.log('Fetching analytics data from database for artist UUID:', artistId);

    // Query artist data from database
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('uuid', artistId)
      .single();

    if (artistError || !artist) {
      console.warn('Artist not found in database:', artistError);
      return NextResponse.json({
        totalReach: 0,
        engagedAudience: 0,
        totalFollowers: 0,
        platforms: {
          spotify: { followers: 0, streams: 0 },
          youtube: { subscribers: 0, views: 0 },
          instagram: { followers: 0, engagement: 0 },
          tiktok: { followers: 0, views: 0 },
          facebook: { followers: 0, engagement: 0 }
        },
        trending: [],
        isRealData: false,
        message: 'Artist not found in database'
      });
    }

    // Get fanbase data
    const { data: fanbase } = await supabase
      .from('artist_fanbase')
      .select('*')
      .eq('artist_id', artist.id)
      .single();

    // Get social links
    const { data: socialLinks } = await supabase
      .from('artist_social_links')
      .select('*')
      .eq('artist_id', artist.id);

    // Get tracks count
    const { count: tracksCount } = await supabase
      .from('artist_tracks')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', artist.id);

    console.log('Database data retrieved:', {
      artist: artist.name,
      fanbase: fanbase?.total_fans || 0,
      socialLinks: socialLinks?.length || 0,
      tracks: tracksCount || 0
    });

    // Extract platform-specific data from fanbase distribution
    const distribution = fanbase?.distribution || {};
    const fanbaseData = fanbase?.data || {};
    
    // Parse platform followers from distribution or fanbase data
    let spotifyFollowers = 0;
    let instagramFollowers = 0;
    let youtubeSubscribers = 0;
    let tiktokFollowers = 0;
    let facebookFollowers = 0;

    // Try to extract from distribution first
    if (distribution.spotify) spotifyFollowers = distribution.spotify;
    if (distribution.instagram) instagramFollowers = distribution.instagram;
    if (distribution.youtube) youtubeSubscribers = distribution.youtube;
    if (distribution.tiktok) tiktokFollowers = distribution.tiktok;
    if (distribution.facebook) facebookFollowers = distribution.facebook;

    // If no distribution data, try from fanbase.data structure
    if (!spotifyFollowers && fanbaseData.spotify) spotifyFollowers = fanbaseData.spotify;
    if (!instagramFollowers && fanbaseData.instagram) instagramFollowers = fanbaseData.instagram;
    if (!youtubeSubscribers && fanbaseData.youtube) youtubeSubscribers = fanbaseData.youtube;
    if (!tiktokFollowers && fanbaseData.tiktok) tiktokFollowers = fanbaseData.tiktok;
    if (!facebookFollowers && fanbaseData.facebook) facebookFollowers = fanbaseData.facebook;

    // Use total_fans if available, otherwise sum individual platforms
    const totalFans = fanbase?.total_fans || 0;
    const totalFollowers = totalFans > 0 ? totalFans : 
      spotifyFollowers + instagramFollowers + youtubeSubscribers + tiktokFollowers + facebookFollowers;

    // Calculate derived metrics
    const totalReach = Math.round(totalFollowers * 1.8); // Reach multiplier
    const engagedAudience = Math.round(totalReach * 0.12); // 12% engagement rate

    // Generate trending data based on current values (simulated historical growth)
    const trendingData = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    for (let i = 0; i < 6; i++) {
      const growthFactor = (i + 1) / 6; // Progressive growth
      trendingData.push({
        date: months[i],
        spotify: Math.round(spotifyFollowers * (0.4 + growthFactor * 0.6)),
        youtube: Math.round(youtubeSubscribers * (0.5 + growthFactor * 0.5)),
        instagram: Math.round(instagramFollowers * (0.6 + growthFactor * 0.4)),
        tiktok: Math.round(tiktokFollowers * (0.3 + growthFactor * 0.7))
      });
    }

    const hasRealData = totalFollowers > 0 || (socialLinks && socialLinks.length > 0);

    const analyticsData = {
      totalReach,
      engagedAudience,
      totalFollowers,
      platforms: {
        spotify: { 
          followers: spotifyFollowers, 
          streams: spotifyFollowers * 12 // Estimate streams from followers
        },
        youtube: { 
          subscribers: youtubeSubscribers, 
          views: youtubeSubscribers * 8 // Estimate views from subscribers
        },
        instagram: { 
          followers: instagramFollowers, 
          engagement: totalFollowers > 0 ? Math.round((instagramFollowers / totalFollowers) * 100) : 0
        },
        tiktok: { 
          followers: tiktokFollowers, 
          views: tiktokFollowers * 20 // TikTok typically has higher view-to-follower ratio
        },
        facebook: { 
          followers: facebookFollowers, 
          engagement: facebookFollowers > 0 ? 8.2 : 0
        }
      },
      trending: trendingData,
      isRealData: hasRealData,
      artist: {
        name: artist.name,
        rank: artist.rank || 0,
        verified: artist.verified || false
      },
      dataSource: 'database',
      lastUpdated: fanbase?.updated_at || artist.updated_at
    };

    console.log('Returning analytics data:', {
      totalFollowers: analyticsData.totalFollowers,
      totalReach: analyticsData.totalReach,
      hasRealData: analyticsData.isRealData,
      platforms: Object.keys(analyticsData.platforms).filter(p => analyticsData.platforms[p as keyof typeof analyticsData.platforms].followers > 0)
    });

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Error fetching analytics data from database:', error);
    
    // Return fallback data with error info
    return NextResponse.json({
      totalReach: 0,
      engagedAudience: 0,
      totalFollowers: 0,
      platforms: {
        spotify: { followers: 0, streams: 0 },
        youtube: { subscribers: 0, views: 0 },
        instagram: { followers: 0, engagement: 0 },
        tiktok: { followers: 0, views: 0 },
        facebook: { followers: 0, engagement: 0 }
      },
      trending: [],
      isRealData: false,
      error: 'Database error',
      message: 'Failed to fetch analytics data from database'
    });
  }
}