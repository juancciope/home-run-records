import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artistId = searchParams.get('artistId');

  if (!artistId) {
    return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
  }

  try {
    console.log('Fetching analytics data from database for artist UUID:', artistId);

    const supabase = await createClient();

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

    console.log('Raw fanbase data structure:', JSON.stringify({
      distribution: fanbase?.distribution,
      data: fanbase?.data
    }, null, 2));

    // Extract platform-specific data from fanbase
    // The sync route stores artistData.fanbase.data in the distribution field with hyphenated keys
    const distribution = fanbase?.distribution || {};
    
    // Parse platform followers directly from distribution (this is where the data actually is)
    const spotifyFollowers = distribution['spotify-followers'] || 0;
    const instagramFollowers = distribution['instagram-followers'] || 0;
    const youtubeSubscribers = distribution['youtube-subscribers'] || 0;
    const tiktokFollowers = distribution['tiktok-followers'] || 0;
    const facebookFollowers = distribution['facebook-followers'] || 0;
    const twitterFollowers = distribution['twitter-followers'] || 0;
    const deezerFans = distribution['deezer-fans'] || 0;
    const soundcloudFollowers = distribution['soundcloud-followers'] || 0;

    // Use total_fans if available, otherwise sum individual platforms later
    const totalFans = fanbase?.total_fans || 0;

    console.log('Extracted platform values:', {
      spotifyFollowers,
      instagramFollowers,
      youtubeSubscribers,
      tiktokFollowers,
      facebookFollowers,
      twitterFollowers,
      deezerFans,
      soundcloudFollowers,
      totalFans
    });
    const totalFollowers = totalFans > 0 ? totalFans : 
      spotifyFollowers + instagramFollowers + youtubeSubscribers + tiktokFollowers + facebookFollowers + twitterFollowers + deezerFans + soundcloudFollowers;

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
        tiktok: Math.round(tiktokFollowers * (0.3 + growthFactor * 0.7)),
        facebook: Math.round(facebookFollowers * (0.8 + growthFactor * 0.2)), // Facebook grows slower
        twitter: Math.round(twitterFollowers * (0.7 + growthFactor * 0.3))
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
          engagement: facebookFollowers > 0 ? Math.round((facebookFollowers / totalFollowers) * 100) : 0
        },
        twitter: {
          followers: twitterFollowers,
          engagement: twitterFollowers > 0 ? Math.round((twitterFollowers / totalFollowers) * 100) : 0
        },
        deezer: {
          fans: deezerFans,
          streams: deezerFans * 15 // Estimate streams from fans
        },
        soundcloud: {
          followers: soundcloudFollowers,
          plays: soundcloudFollowers * 25 // Estimate plays from followers
        }
      },
      trending: trendingData,
      isRealData: hasRealData,
      artist: {
        name: artist.name,
        rank: artist.rank || 0,
        verified: artist.verified || false,
        country: artist.country,
        genre: artist.genre,
        subgenres: artist.subgenres || [],
        status: artist.status,
        image: artist.image
      },
      dataSource: 'database',
      lastUpdated: fanbase?.updated_at || artist.updated_at
    };

    console.log('Returning analytics data:', {
      totalFollowers: analyticsData.totalFollowers,
      totalReach: analyticsData.totalReach,
      hasRealData: analyticsData.isRealData,
      platforms: Object.keys(analyticsData.platforms).filter(p => {
        const platform = analyticsData.platforms[p as keyof typeof analyticsData.platforms];
        return ('followers' in platform && platform.followers > 0) || ('subscribers' in platform && platform.subscribers > 0);
      })
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