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

    // Get data from artist_profiles table
    const { data: artistProfiles, error: profilesError } = await supabase
      .from('artist_profiles')
      .select('*')
      .eq('id', user.id)

    // Get data from artists table
    const { data: artists, error: artistsError } = await supabase
      .from('artists')
      .select('*')
      .eq('user_id', user.id)

    // Get user profile data
    const { data: userProfile, error: userProfileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      user_id: user.id,
      email: user.email,
      user_profile: userProfile,
      artist_profiles: artistProfiles || [],
      artists: artists || [],
      errors: {
        profiles: profilesError?.message,
        artists: artistsError?.message,
        user_profile: userProfileError?.message
      },
      debug_info: {
        has_artist_profiles: (artistProfiles?.length || 0) > 0,
        has_artists: (artists?.length || 0) > 0,
        profile_images: artistProfiles?.map(p => ({
          name: p.stage_name || p.artist_name,
          profile_image_url: p.profile_image_url,
          avatar_url: p.avatar_url,
          image_url: p.image_url,
          viberate_uuid: p.viberate_uuid,
          viberate_artist_id: p.viberate_artist_id
        })) || [],
        artist_images: artists?.map(a => ({
          name: a.stage_name || a.name,
          avatar_url: a.avatar_url,
          image: a.image,
          uuid: a.uuid,
          viberate_uuid: a.viberate_uuid
        })) || []
      }
    })
  } catch (error) {
    console.error('Error in debug artist data:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}