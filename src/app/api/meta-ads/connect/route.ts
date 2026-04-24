import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { buildAuthorizeURL, redirectUriFromRequest } from '@/lib/meta-ads/oauth';
import { getCurrentAgencyId } from '@/lib/meta-ads/connection';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Case 1: genuinely not logged in — let the user log in first.
  if (!user) {
    console.log('[META-ADS/CONNECT] no supabase user, redirecting to /login');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Case 2: logged in but no agency membership — don't send them to /login
  // (that looks like a session expiry). Bounce back to the dashboard with a
  // specific reason so the UI can tell them what to do.
  const agencyId = await getCurrentAgencyId();
  if (!agencyId) {
    console.log('[META-ADS/CONNECT] user has no agency_users row', user.id, user.email);
    const url = new URL('/dashboard', req.url);
    url.searchParams.set('meta_ads', 'error');
    url.searchParams.set('reason', 'Your account is not attached to an agency. Ask an admin to add you.');
    return NextResponse.redirect(url);
  }

  // Case 3: happy path — redirect to Facebook.
  const nonce = randomBytes(16).toString('hex');
  const state = Buffer
    .from(JSON.stringify({ a: agencyId, u: user.id, n: nonce }))
    .toString('base64url');

  const redirectUri = redirectUriFromRequest(req);
  console.log('[META-ADS/CONNECT] starting OAuth', { user: user.email, agencyId, redirectUri });

  const res = NextResponse.redirect(buildAuthorizeURL(state, redirectUri));
  res.cookies.set('meta_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60,
  });
  return res;
}
