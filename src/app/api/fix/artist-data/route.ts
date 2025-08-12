import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { VibrateService } from '@/lib/services/viberate-api'
import { getServerUser } from '@/lib/auth/server-auth'

export async function POST() {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const supabase = await createClient()

    // Check if user has a Viberate artist ID stored
    const { data: profile, error: profileQueryError } = await supabase
      .from('artist_profiles')
      .select('viberate_uuid, viberate_artist_id, artist_name')
      .eq('id', user.id)
      .single()

    console.log('Profile query result:', { profile, profileQueryError, userId: user.id })

    // Check for database access errors first
    if (profileQueryError) {
      console.error('Profile query error:', profileQueryError)
      return NextResponse.json({ 
        error: 'Failed to access artist profile data',
        details: profileQueryError.message 
      }, { status: 400 })
    }

    if (!profile || (!profile.viberate_uuid && !profile.viberate_artist_id)) {
      // Try to find artist by name
      if (profile?.artist_name) {
        const searchResults = await VibrateService.searchArtist(profile.artist_name)
        if (searchResults.length > 0) {
          // Use the first result
          const artistUuid = searchResults[0].uuid
          const artistData = await VibrateService.getArtistDetails(artistUuid)
          
          if (artistData) {
            // Update artist_profiles with the fetched data
            const { error: updateError } = await supabase
              .from('artist_profiles')
              .update({
                viberate_uuid: artistData.uuid,
                stage_name: artistData.name,
                profile_image_url: artistData.image,
                spotify_followers: artistData.metrics?.spotify_followers || 0,
                total_followers: artistData.metrics?.total_followers || artistData.metrics?.spotify_followers || 0,
                genres: artistData.genre ? [artistData.genre.name] : [],
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id)

            if (updateError) {
              console.error('Error updating artist profile:', updateError)
              return NextResponse.json({ error: 'Failed to update artist profile' }, { status: 500 })
            }

            return NextResponse.json({ 
              success: true, 
              message: 'Artist data refreshed successfully',
              artist: artistData.name 
            })
          }
        }
      }
      
      return NextResponse.json({ 
        error: 'No Viberate artist connection found. Please complete onboarding first.' 
      }, { status: 400 })
    }

    // Fetch fresh data from Viberate
    const artistUuid = profile.viberate_uuid || profile.viberate_artist_id
    const artistData = await VibrateService.getArtistDetails(artistUuid)
    
    if (!artistData) {
      return NextResponse.json({ error: 'Failed to fetch artist data from Viberate' }, { status: 500 })
    }

    // Update artist_profiles with the fresh data
    const { error: updateError } = await supabase
      .from('artist_profiles')
      .update({
        stage_name: artistData.name,
        artist_name: artistData.name,
        profile_image_url: artistData.image,
        spotify_followers: artistData.metrics?.spotify_followers || 0,
        total_followers: artistData.metrics?.total_followers || artistData.metrics?.spotify_followers || 0,
        genres: artistData.genre ? [artistData.genre.name] : [],
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating artist profile:', updateError)
      return NextResponse.json({ error: 'Failed to update artist profile' }, { status: 500 })
    }

    // Also update artists table if record exists
    const { data: artistRecord } = await supabase
      .from('artists')
      .select('id')
      .eq('id', user.id)
      .single()

    if (artistRecord) {
      await supabase
        .from('artists')
        .update({
          stage_name: artistData.name,
          name: artistData.name,
          avatar_url: artistData.image,
          image: artistData.image,
          total_followers: artistData.metrics?.total_followers || artistData.metrics?.spotify_followers || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Artist data refreshed successfully',
      artist: artistData.name
    })
  } catch (error) {
    console.error('Error in fix artist data:', error)
    return NextResponse.json({ 
      error: 'Internal server error while refreshing artist data' 
    }, { status: 500 })
  }
}