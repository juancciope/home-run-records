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

    // Get ALL data to see what's actually there
    const { data: profile, error: profileError } = await supabase
      .from('artist_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Check what columns actually exist
    const profileColumns = profile ? Object.keys(profile) : []
    const artistColumns = artist ? Object.keys(artist) : []

    return NextResponse.json({
      userId: user.id,
      profile: {
        data: profile,
        error: profileError?.message,
        columns: profileColumns,
        hasName: !!(profile?.stage_name || profile?.artist_name),
        hasImage: !!(profile?.profile_image_url || profile?.image_url),
        nameValue: profile?.stage_name || profile?.artist_name || null,
        imageValue: profile?.profile_image_url || profile?.image_url || null
      },
      artist: {
        data: artist,
        error: artistError?.message,
        columns: artistColumns,
        hasName: !!(artist?.stage_name || artist?.name),
        hasImage: !!(artist?.avatar_url || artist?.image),
        nameValue: artist?.stage_name || artist?.name || null,
        imageValue: artist?.avatar_url || artist?.image || null
      }
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}