import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// RegExp for public files
const PUBLIC_FILE = /\.(.*)$/

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Skip public files, _next, api routes, and static assets
  if (PUBLIC_FILE.test(pathname) ||
      pathname.includes('_next') ||
      pathname.startsWith('/api/') ||
      pathname.includes('favicon.ico')) {
    return await updateSession(request)
  }

  // Extract subdomain for logging and bare domain redirect
  const isLocalhost = hostname.includes('localhost')
  const subdomain = isLocalhost
    ? hostname.split('.')[0].replace(/:\d+$/, '')
    : hostname.split('.')[0]

  console.log('[MIDDLEWARE] Host:', hostname, '| Subdomain:', subdomain, '| Path:', pathname)

  // Redirect bare domain to homerun subdomain
  if (!isLocalhost && (subdomain === 'www' || subdomain === 'homeformusic')) {
    console.log('[MIDDLEWARE] Redirecting bare domain to homerun')
    return NextResponse.redirect(new URL('https://homerun.homeformusic.app', request.url))
  }

  // Subdomain rewrites are handled by next.config.ts beforeFiles
  // By the time we reach here, path is already rewritten (e.g., /spotify, /social, /audience)
  // Just handle auth check
  return await updateSession(request)
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