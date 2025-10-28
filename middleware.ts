import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Extract subdomain (handles both production and localhost)
  const isLocalhost = hostname.includes('localhost');
  const subdomain = isLocalhost
    ? hostname.split('.')[0].replace(/:\d+$/, '') // Remove port for localhost
    : hostname.split('.')[0];

  // Determine the target path based on subdomain
  let targetPath = request.nextUrl.pathname;

  switch (subdomain) {
    case 'spotify':
      targetPath = `/spotify${request.nextUrl.pathname}`;
      break;
    case 'social':
      targetPath = `/social${request.nextUrl.pathname}`;
      break;
    case 'audience':
      targetPath = `/audience${request.nextUrl.pathname}`;
      break;
    case 'homerun':
      // Main app - keep at root level, no rewrite needed
      break;
    default:
      // For production bare domain, redirect to homerun (main app)
      if (!isLocalhost && (subdomain === 'www' || subdomain === 'homeformusic')) {
        return NextResponse.redirect(new URL('https://homerun.homeformusic.app', request.url));
      }
      // For localhost without subdomain, allow normal routing
      break;
  }

  // Update session with Supabase
  const response = await updateSession(request);

  // If we need to rewrite to a subdomain path, do it after session update
  if (targetPath !== request.nextUrl.pathname) {
    const url = new URL(targetPath, request.url);
    url.search = request.nextUrl.search; // Preserve query params
    return NextResponse.rewrite(url, { headers: response.headers });
  }

  return response;
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