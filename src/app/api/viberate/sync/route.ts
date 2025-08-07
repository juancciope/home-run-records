import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { artistId, userId } = await request.json();

    if (!artistId || !userId) {
      return NextResponse.json({ error: 'Artist ID and User ID are required' }, { status: 400 });
    }

    console.log('Starting comprehensive artist sync for UUID:', artistId, 'User:', userId);

    // Fetch complete artist data from our new endpoint
    const artistDataResponse = await fetch(
      `${request.nextUrl.origin}/api/viberate/artist/${artistId}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    const artistDataResult = await artistDataResponse.json();
    
    if (!artistDataResult.success) {
      console.warn('Failed to fetch artist data, proceeding with basic sync');
    }

    const artistData = artistDataResult.data;

    // Store artist data in Supabase
    try {
      // Insert or update artist record
      const { data: artistRecord, error: artistError } = await supabase
        .from('artists')
        .upsert({
          uuid: artistData.uuid,
          name: artistData.name,
          slug: artistData.slug,
          image: artistData.image,
          bio: artistData.bio,
          country: artistData.country,
          genre: artistData.genre,
          subgenres: artistData.subgenres,
          rank: artistData.rank,
          status: artistData.status,
          verified: artistData.verified,
          fetched_at: artistData.fetched_at,
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

      if (artistDbId) {
        // Store social links
        if (artistData.social_links?.length > 0) {
          const { error: linksError } = await supabase
            .from('artist_social_links')
            .delete()
            .eq('artist_id', artistDbId);

          if (!linksError) {
            const socialLinks = artistData.social_links.map((link: { platform: string; url: string }) => ({
              artist_id: artistDbId,
              platform: link.platform,
              url: link.url
            }));

            const { error: insertLinksError } = await supabase
              .from('artist_social_links')
              .insert(socialLinks);

            if (insertLinksError) {
              console.error('Error storing social links:', insertLinksError);
            }
          }
        }

        // Store tracks
        if (artistData.tracks?.length > 0) {
          const { error: tracksDeleteError } = await supabase
            .from('artist_tracks')
            .delete()
            .eq('artist_id', artistDbId);

          if (!tracksDeleteError) {
            const tracks = artistData.tracks.map((track: { track_id?: string; id?: string; name: string; release_date?: string }) => ({
              artist_id: artistDbId,
              track_id: track.track_id || track.id,
              name: track.name,
              release_date: track.release_date,
              source: 'viberate'
            }));

            const { error: insertTracksError } = await supabase
              .from('artist_tracks')
              .insert(tracks);

            if (insertTracksError) {
              console.error('Error storing tracks:', insertTracksError);
            }
          }
        }

        // Store fanbase data
        if (artistData.fanbase) {
          const { error: fanbaseError } = await supabase
            .from('artist_fanbase')
            .upsert({
              artist_id: artistDbId,
              total_fans: artistData.fanbase.total || 0,
              distribution: artistData.fanbase.distribution || {},
              data: artistData.fanbase,
              fetched_at: artistData.fetched_at,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'artist_id'
            });

          if (fanbaseError) {
            console.error('Error storing fanbase:', fanbaseError);
          }
        }

        // Store ranks
        if (artistData.ranks) {
          const ranksArray = Object.entries(artistData.ranks).map(([type, value]) => ({
            artist_id: artistDbId,
            rank_type: type,
            rank_value: typeof value === 'number' ? value : 0,
            data: { [type]: value },
            updated_at: new Date().toISOString()
          }));

          if (ranksArray.length > 0) {
            const { error: ranksError } = await supabase
              .from('artist_ranks')
              .delete()
              .eq('artist_id', artistDbId);

            if (!ranksError) {
              const { error: insertRanksError } = await supabase
                .from('artist_ranks')
                .insert(ranksArray);

              if (insertRanksError) {
                console.error('Error storing ranks:', insertRanksError);
              }
            }
          }
        }

        // Update user profile to link to this artist
        const { ArtistService } = await import('@/lib/services/artist-service');
        await ArtistService.updateProfile(userId, {
          artist_name: artistData.name,
          viberate_artist_id: artistData.uuid,
          onboarding_completed: true,
        });

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