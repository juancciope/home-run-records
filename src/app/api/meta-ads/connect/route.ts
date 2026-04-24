import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { buildAuthorizeURL, redirectUriFromRequest } from '@/lib/meta-ads/oauth';
import { getCurrentUserAndAgency } from '@/lib/meta-ads/connection';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ctx = await getCurrentUserAndAgency();
  if (!ctx) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const nonce = randomBytes(16).toString('hex');
  const state = Buffer.from(JSON.stringify({ a: ctx.agencyId, u: ctx.userId, n: nonce })).toString('base64url');

  const redirectUri = redirectUriFromRequest(req);
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
