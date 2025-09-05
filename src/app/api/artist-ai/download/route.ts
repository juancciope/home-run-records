import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/client'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const artistSlug = searchParams.get('slug')
  const platform = searchParams.get('platform')

  if (!artistSlug || !platform) {
    return NextResponse.json(
      { error: 'Artist slug and platform are required' },
      { status: 400 }
    )
  }

  if (!['instagram', 'tiktok'].includes(platform)) {
    return NextResponse.json(
      { error: 'Platform must be instagram or tiktok' },
      { status: 400 }
    )
  }

  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .rpc('get_analysis_by_slug', { slug: artistSlug })

    if (error || !data || data.length === 0) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    const analysisData = data[0]
    const posts = analysisData.analysis_result.scraped_posts[platform] || []

    if (posts.length === 0) {
      return NextResponse.json(
        { error: `No ${platform} posts found` },
        { status: 404 }
      )
    }

    // Generate CSV content
    const headers = [
      'Platform',
      'Type', 
      'Caption',
      'Likes',
      'Comments', 
      'Views',
      'Shares',
      'Timestamp',
      'Hashtags',
      'Media URL'
    ]

    const csvRows = posts.map((post: any) => [
      post.platform || platform,
      post.type || 'post',
      `"${(post.caption || '').replace(/"/g, '""')}"`, // Escape quotes in captions
      post.likes || 0,
      post.comments || 0,
      post.views || 0,
      post.shares || 0,
      post.timestamp || '',
      `"${(post.hashtags || []).join(' ')}"`, // Join hashtags
      post.mediaUrl || ''
    ])

    const csvContent = [
      headers.join(','),
      ...csvRows.map((row: (string | number)[]) => row.join(','))
    ].join('\n')

    // Return CSV file
    const filename = `${analysisData.artist_name}_${platform}_posts_${new Date().toISOString().split('T')[0]}.csv`
    
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error('Error generating CSV:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSV' },
      { status: 500 }
    )
  }
}