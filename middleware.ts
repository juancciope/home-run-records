import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Skip middleware for API routes
  if (pathname.startsWith('/api/')) {
    return await updateSession(request);
  }

  // Extract subdomain (handles both production and localhost)
  const isLocalhost = hostname.includes('localhost');
  const subdomain = isLocalhost
    ? hostname.split('.')[0].replace(/:\d+$/, '') // Remove port for localhost
    : hostname.split('.')[0];

  console.log('🔍 Middleware Debug:', { hostname, subdomain, pathname });

  // Determine the target path based on subdomain
  let rewritePath: string | null = null;

  switch (subdomain) {
    case 'spotify':
      // Avoid double /spotify prefix
      if (!pathname.startsWith('/spotify')) {
        rewritePath = `/spotify${pathname === '/' ? '' : pathname}`;
      }
      break;
    case 'social':
      if (!pathname.startsWith('/social')) {
        rewritePath = `/social${pathname === '/' ? '' : pathname}`;
      }
      break;
    case 'audience':
      if (!pathname.startsWith('/audience')) {
        rewritePath = `/audience${pathname === '/' ? '' : pathname}`;
      }
      break;
    case 'homerun':
      // Main app - keep at root level, no rewrite needed
      break;
    default:
      // For production bare domain, redirect to homerun
      if (!isLocalhost && (subdomain === 'www' || subdomain === 'homeformusic')) {
        return NextResponse.redirect(new URL('https://homerun.homeformusic.app', request.url));
      }
      break;
  }

  // If we need to rewrite, do it before updating session
  if (rewritePath) {
    console.log('✅ Rewriting:', pathname, '→', rewritePath);
    const url = request.nextUrl.clone();
    url.pathname = rewritePath;

    // Rewrite and then update session
    const rewriteResponse = NextResponse.rewrite(url);
    const sessionResponse = await updateSession(request);

    // Copy session headers to rewrite response
    sessionResponse.headers.forEach((value, key) => {
      rewriteResponse.headers.set(key, value);
    });

    return rewriteResponse;
  }

  // No rewrite needed, just update session
  return await updateSession(request);
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