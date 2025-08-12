import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getServerUser } from '@/lib/auth/server-auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ agencyId: string }> }
) {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const supabase = await createClient()
    const { agencyId } = await params

    // Verify user has access to this agency
    const { data: agencyUser, error: agencyError } = await supabase
      .from('agency_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('agency_id', agencyId)
      .single()

    if (agencyError || !agencyUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get all artists in this agency
    const { data: artists, error: artistsError } = await supabase
      .from('artists')
      .select(`
        id,
        stage_name,
        name,
        avatar_url,
        image,
        total_followers,
        user_id,
        users!inner(email, first_name, last_name)
      `)
      .eq('agency_id', agencyId)

    if (artistsError) {
      console.error('Error fetching agency artists:', artistsError)
      return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 })
    }

    // Format the response
    const formattedArtists = artists?.map(artist => {
      // Handle the users join which returns an array
      const user = Array.isArray(artist.users) ? artist.users[0] : artist.users;
      
      return {
        id: artist.id,
        name: artist.stage_name || artist.name,
        stage_name: artist.stage_name || artist.name,
        avatar_url: artist.avatar_url || artist.image,
        total_followers: artist.total_followers || 0,
        user_email: user?.email,
        user_name: user?.first_name && user?.last_name
          ? `${user.first_name} ${user.last_name}`
          : user?.email?.split('@')[0]
      };
    }) || []

    return NextResponse.json({
      success: true,
      artists: formattedArtists,
      count: formattedArtists.length
    })

  } catch (error) {
    console.error('Error in agency artists API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}