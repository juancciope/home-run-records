import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { buildAuthorizeURL } from '@/lib/meta-ads/oauth';
import { getCurrentUserAndAgency } from '@/lib/meta-ads/connection';

export const dynamic = 'force-dynamic';

export async function GET() {
  const ctx = await getCurrentUserAndAgency();
  if (!ctx) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  }

  const nonce = randomBytes(16).toString('hex');
  const state = Buffer.from(JSON.stringify({ a: ctx.agencyId, u: ctx.userId, n: nonce })).toString('base64url');

  const res = NextResponse.redirect(buildAuthorizeURL(state));
  res.cookies.set('meta_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60,
  });
  return res;
}
