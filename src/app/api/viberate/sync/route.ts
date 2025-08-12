import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { artistId, userId } = await request.json();

    if (!artistId || !userId) {
      return NextResponse.json({ error: 'Artist ID and User ID are required' }, { status: 400 });
    }

    console.log('Starting comprehensive artist sync for UUID:', artistId, 'User:', userId);

    // Fetch complete artist data from our new endpoint
    const fetchUrl = `${request.nextUrl.origin}/api/viberate/artist/${artistId}`;
    console.log('Fetching artist data from:', fetchUrl);
    
    const artistDataResponse = await fetch(fetchUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Artist data response status:', artistDataResponse.status);
    const artistDataResult = await artistDataResponse.json();
    console.log('Artist data result:', JSON.stringify(artistDataResult, null, 2));
    
    if (!artistDataResult.success) {
      console.warn('Failed to fetch artist data, proceeding with basic sync');
    }

    const artistData = artistDataResult.data;

    // Store artist data in Supabase
    try {
      console.log('Attempting to store artist data in Supabase...');
      console.log('Artist data to store:', {
        uuid: artistData.uuid,
        name: artistData.name,
        image: artistData.image
      });
      
      // Use service role for server-side operations
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      // Insert or update artist record
      const { data: artistRecord, error: artistError } = await supabase
        .from('artists')
        .upsert({
          uuid: artistData.uuid,
          name: artistData.name,
          stage_name: artistData.name, // Use name as stage_name since that's the primary identifier
          slug: artistData.slug,
          image: artistData.image,
          bio: artistData.bio || '',
          country: artistData.country,
          genre: artistData.genre,
          subgenres: artistData.subgenres,
          rank: artistData.rank,
          status: artistData.status,
          verified: artistData.verified,
          fetched_at: artistData.fetched_at || new Date().toISOString(),
          last_updated: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'uuid'
        })
        .select()
        .single();

      if (artistError) {
        console.error('Error upserting artist:', artistError);
      } else {
        console.log('Successfully stored artist:', artistRecord.name);
      }

      const artistDbId = artistRecord?.id;
      console.log('Artist DB ID:', artistDbId);

      if (artistDbId) {
        console.log('Processing artist data for storage...');
        console.log('Social links available:', artistData.social_links?.data?.length || 0);
        
        // Store social links - handle the correct data structure
        if (artistData.social_links?.data?.length > 0) {
          const { error: linksError } = await supabase
            .from('artist_social_links')
            .delete()
            .eq('artist_id', artistDbId);

          if (!linksError) {
            const socialLinks = artistData.social_links.data.map((link: { channel: string; link: string }) => ({
              artist_id: artistDbId,
              platform: link.channel,
              url: link.link
            }));

            console.log('Attempting to insert social links:', socialLinks);
            const { data: insertedLinks, error: insertLinksError } = await supabase
              .from('artist_social_links')
              .insert(socialLinks)
              .select();

            if (insertLinksError) {
              console.error('Error storing social links:', insertLinksError);
              console.error('Failed data:', socialLinks);
            } else {
              console.log(`Successfully stored ${insertedLinks?.length || 0} social links`);
              console.log('Inserted:', insertedLinks);
            }
          }
        }

        // Store tracks - handle the correct data structure
        if (artistData.tracks?.length > 0) {
          const { error: tracksDeleteError } = await supabase
            .from('artist_tracks')
            .delete()
            .eq('artist_id', artistDbId);

          if (!tracksDeleteError) {
            const tracks = artistData.tracks.map((track: { uuid: string; name: string; slug: string }) => ({
              artist_id: artistDbId,
              track_id: track.uuid,
              name: track.name,
              release_date: null, // No release date in this format
              source: 'viberate'
            }));

            const { error: insertTracksError } = await supabase
              .from('artist_tracks')
              .insert(tracks);

            if (insertTracksError) {
              console.error('Error storing tracks:', insertTracksError);
            } else {
              console.log(`Successfully stored ${tracks.length} tracks`);
            }
          }
        }

        // Store fanbase data - first delete then insert to avoid conflict issues
        console.log('Fanbase data available:', {
          hasFanbase: !!artistData.fanbase,
          hasFanbaseDistribution: !!artistData.fanbase_distribution,
          distributionKeys: artistData.fanbase_distribution ? Object.keys(artistData.fanbase_distribution) : []
        });
        
        if (artistData.fanbase || artistData.fanbase_distribution) {
          // Delete existing fanbase data for this artist
          const { error: deleteError } = await supabase
            .from('artist_fanbase')
            .delete()
            .eq('artist_id', artistDbId);

          if (!deleteError) {
            // Calculate total fans from fanbase_distribution or historical data
            let totalFans = 0;
            let distribution = {};
            
            // Handle the nested data structure from Viberate API
            if (artistData.fanbase_distribution?.data) {
              distribution = artistData.fanbase_distribution.data;
              // Sum up all platform followers from distribution
              Object.entries(distribution).forEach(([key, value]) => {
                if (typeof value === 'number' && key.includes('followers')) {
                  totalFans += value;
                }
                if (typeof value === 'number' && key.includes('subscribers')) {
                  totalFans += value;
                }
              });
            }
            
            // Insert new fanbase data
            const { error: fanbaseError } = await supabase
              .from('artist_fanbase')
              .insert({
                artist_id: artistDbId,
                total_fans: totalFans,
                distribution: distribution,
                data: {
                  historical: artistData.fanbase,
                  distribution: artistData.fanbase_distribution
                },
                fetched_at: artistData.fetched_at,
                updated_at: new Date().toISOString()
              });

            if (fanbaseError) {
              console.error('Error storing fanbase:', fanbaseError);
            } else {
              console.log('Successfully stored fanbase data with total fans:', totalFans);
            }
          } else {
            console.error('Error deleting old fanbase data:', deleteError);
          }
        }

        // Store ranks - handle the complex nested structure
        if (artistData.ranks?.data) {
          const { error: ranksDeleteError } = await supabase
            .from('artist_ranks')
            .delete()
            .eq('artist_id', artistDbId);

          if (!ranksDeleteError) {
            const ranksArray: Array<{
              artist_id: string;
              rank_type: string;
              rank_value: number;
              data: Record<string, unknown>;
              updated_at: string;
            }> = [];
            
            // Extract ranks from the nested structure (data.platform.current/previous)
            Object.entries(artistData.ranks.data).forEach(([platform, platformData]: [string, any]) => {
              if (platformData?.current) {
                Object.entries(platformData.current).forEach(([rankType, rankValue]) => {
                  if (typeof rankValue === 'number') {
                    ranksArray.push({
                      artist_id: artistDbId,
                      rank_type: `${platform}_${rankType}`,
                      rank_value: rankValue,
                      data: { 
                        platform,
                        type: rankType, 
                        current: rankValue, 
                        previous: platformData.previous?.[rankType] 
                      },
                      updated_at: new Date().toISOString()
                    });
                  }
                });
              }
            });

            if (ranksArray.length > 0) {
              const { error: insertRanksError } = await supabase
                .from('artist_ranks')
                .insert(ranksArray);

              if (insertRanksError) {
                console.error('Error storing ranks:', insertRanksError);
              } else {
                console.log(`Successfully stored ${ranksArray.length} rank entries`);
              }
            }
          }
        }

        // Update user profile to link to this artist - with better error handling
        try {
          const { ArtistService } = await import('@/lib/services/artist-service');
          const profileUpdate = await ArtistService.updateProfile(userId, {
            artist_name: artistData.name,
            viberate_artist_id: artistData.uuid,
            onboarding_completed: true,
          });
          
          if (profileUpdate) {
            console.log('Successfully updated user profile:', profileUpdate.id);
          } else {
            console.warn('Profile update returned null - may have RLS issues');
          }
        } catch (profileError) {
          console.error('Profile update failed:', profileError);
          // Continue anyway - the artist data was stored successfully
        }

        console.log('Successfully completed comprehensive artist sync');

        return NextResponse.json({
          success: true,
          message: 'Artist data successfully synced',
          artist: {
            uuid: artistData.uuid,
            name: artistData.name,
            image: artistData.image
          }
        });
      }
    } catch (dbError) {
      console.error('Database error during sync:', dbError);
      // Still update user profile even if detailed storage fails
      const { ArtistService } = await import('@/lib/services/artist-service');
      await ArtistService.updateProfile(userId, {
        artist_name: artistData?.name || 'Unknown Artist',
        viberate_artist_id: artistId,
        onboarding_completed: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Artist data sync completed'
    });

  } catch (error) {
    console.error('Error syncing artist data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to sync artist data',
      message: 'Please try again later'
    }, { status: 500 });
  }
}