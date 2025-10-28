import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public paths that don't require authentication
  const publicPaths = [
    '/login',
    '/auth',
    '/',
    '/spotify',    // Spotify Playlist Scraper - public tool
    '/social',     // Artist AI Social Analytics - public tool
    '/audience'    // Find Your Audience Quiz - public tool
  ]

  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname === path ||
    request.nextUrl.pathname.startsWith(`${path}/`)
  )

  // Check for analysis token for dynamic artist pages
  const analysisToken = request.cookies.get('analysis_token')?.value
  const isDynamicArtistPage = request.nextUrl.pathname.match(/^\/[a-z0-9-]+$/) &&
                               request.nextUrl.pathname !== '/' &&
                               !publicPaths.includes(request.nextUrl.pathname)

  console.log('[AUTH] Path:', request.nextUrl.pathname, '| User:', !!user, '| Public:', isPublicPath, '| Token:', !!analysisToken, '| Dynamic:', isDynamicArtistPage)

  // Allow access if:
  // 1. It's a public path
  // 2. User is authenticated
  // 3. It's a dynamic artist page and they have a valid analysis token
  if (!user && !isPublicPath && !(isDynamicArtistPage && analysisToken)) {
    console.log('[AUTH] Redirecting to login - no user, not public path, and no token')
    // no user, redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}