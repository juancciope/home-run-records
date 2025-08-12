import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getServerUser } from '@/lib/auth/server-auth'

export async function GET() {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const supabase = await createClient()

    console.log('Fetching artist data for user:', user.id)

    // Try artist_profiles first (where Viberate data is stored)
    const { data: profile, error: profileError } = await supabase
      .from('artist_profiles')
      .select('stage_name, artist_name, profile_image_url, avatar_url, image_url, spotify_followers, total_followers, viberate_uuid, viberate_artist_id')
      .eq('id', user.id)
      .single()

    console.log('Artist profile query result:', { profile, profileError })

    if (profile && !profileError) {
      const artistData = {
        name: profile.stage_name || profile.artist_name || 'Artist',
        image: profile.profile_image_url || profile.avatar_url || profile.image_url || null,
        followers: profile.spotify_followers || profile.total_followers || null,
        hasViberateData: !!profile.viberate_uuid || !!profile.viberate_artist_id
      }
      console.log('Returning artist data from profile:', artistData)
      return NextResponse.json(artistData)
    }

    // Try artists table as fallback
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('stage_name, name, avatar_url, image, total_followers, viberate_uuid, uuid')
      .eq('user_id', user.id)
      .single()

    console.log('Artist query result:', { artist, artistError })

    if (artist && !artistError) {
      const artistData = {
        name: artist.stage_name || artist.name || 'Artist',
        image: artist.avatar_url || artist.image || null,
        followers: artist.total_followers || null,
        hasViberateData: !!artist.viberate_uuid || !!artist.uuid
      }
      console.log('Returning artist data from artists:', artistData)
      return NextResponse.json(artistData)
    }

    console.log('No artist data found')
    return NextResponse.json({ 
      error: 'No artist profile found',
      debug: {
        userId: user.id,
        profileError: profileError?.message,
        artistError: artistError?.message
      }
    }, { status: 404 })

  } catch (error) {
    console.error('Error in artist-header API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}