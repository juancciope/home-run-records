import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// RegExp for public files
const PUBLIC_FILE = /\.(.*)$/

export async function middleware(request: NextRequest) {
  // Clone the URL
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  const pathname = url.pathname

  // Skip public files, _next, api routes, and static assets
  if (PUBLIC_FILE.test(pathname) ||
      pathname.includes('_next') ||
      pathname.startsWith('/api/') ||
      pathname.includes('favicon.ico')) {
    return await updateSession(request)
  }

  // Extract subdomain
  const isLocalhost = hostname.includes('localhost')
  const subdomain = isLocalhost
    ? hostname.split('.')[0].replace(/:\d+$/, '')
    : hostname.split('.')[0]

  console.log('[MIDDLEWARE] Host:', hostname, '| Subdomain:', subdomain, '| Path:', pathname)

  // Route based on subdomain - modify the request pathname directly
  let shouldRewrite = false

  if (subdomain === 'spotify' && !pathname.startsWith('/spotify')) {
    console.log('[MIDDLEWARE] Rewriting spotify:', pathname, '→', `/spotify${pathname}`)
    url.pathname = `/spotify${pathname}`
    request.nextUrl.pathname = `/spotify${pathname}` // Modify request pathname for auth check
    shouldRewrite = true
  } else if (subdomain === 'social' && !pathname.startsWith('/social')) {
    console.log('[MIDDLEWARE] Rewriting social:', pathname, '→', `/social${pathname}`)
    url.pathname = `/social${pathname}`
    request.nextUrl.pathname = `/social${pathname}` // Modify request pathname for auth check
    shouldRewrite = true
  } else if (subdomain === 'audience' && !pathname.startsWith('/audience')) {
    console.log('[MIDDLEWARE] Rewriting audience:', pathname, '→', `/audience${pathname}`)
    url.pathname = `/audience${pathname}`
    request.nextUrl.pathname = `/audience${pathname}` // Modify request pathname for auth check
    shouldRewrite = true
  } else if (!isLocalhost && (subdomain === 'www' || subdomain === 'homeformusic')) {
    console.log('[MIDDLEWARE] Redirecting bare domain to homerun')
    return NextResponse.redirect(new URL('https://homerun.homeformusic.app', request.url))
  } else {
    console.log('[MIDDLEWARE] No rewrite needed for:', subdomain)
  }

  // Update session with modified request
  const sessionResponse = await updateSession(request)

  // If we need to rewrite, create new response with session headers
  if (shouldRewrite) {
    const rewriteResponse = NextResponse.rewrite(url)

    // Copy session headers
    sessionResponse.headers.forEach((value, key) => {
      rewriteResponse.headers.set(key, value)
    })

    return rewriteResponse
  }

  return sessionResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}