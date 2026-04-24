import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCodeForToken,
  expiresAtFromExpiresIn,
  extendToLongLived,
  redirectUriFromRequest,
} from '@/lib/meta-ads/oauth';
import { metaGet } from '@/lib/meta-ads/client';
import { getCurrentUserAndAgency, upsertConnection } from '@/lib/meta-ads/connection';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDesc = url.searchParams.get('error_description');

  const dashboardUrl = new URL('/dashboard', req.url);

  if (error) {
    dashboardUrl.searchParams.set('meta_ads', 'error');
    dashboardUrl.searchParams.set('reason', errorDesc || error);
    return NextResponse.redirect(dashboardUrl);
  }

  if (!code || !state) {
    dashboardUrl.searchParams.set('meta_ads', 'error');
    dashboardUrl.searchParams.set('reason', 'missing code/state');
    return NextResponse.redirect(dashboardUrl);
  }

  const cookieState = req.cookies.get('meta_oauth_state')?.value;
  if (!cookieState || cookieState !== state) {
    dashboardUrl.searchParams.set('meta_ads', 'error');
    dashboardUrl.searchParams.set('reason', 'state mismatch');
    return NextResponse.redirect(dashboardUrl);
  }

  const ctx = await getCurrentUserAndAgency();
  if (!ctx) {
    dashboardUrl.searchParams.set('meta_ads', 'error');
    dashboardUrl.searchParams.set('reason', 'not signed in');
    return NextResponse.redirect(dashboardUrl);
  }

  try {
    // 1. code → short-lived. The redirect_uri MUST match what was sent
    //    in /connect, so we rebuild it from the same request-host helper.
    const redirectUri = redirectUriFromRequest(req);
    const short = await exchangeCodeForToken(code, redirectUri);
    // 2. short-lived → long-lived
    const long = await extendToLongLived(short.access_token);
    const expiresAt = expiresAtFromExpiresIn(long.expires_in);
    // 3. identify the Meta user
    const me = await metaGet<{ id: string; name: string }>('/me', long.access_token, {
      fields: 'id,name',
    });
    // 4. persist
    await upsertConnection({
      agencyId: ctx.agencyId,
      userId: ctx.userId,
      accessToken: long.access_token,
      tokenExpiresAt: expiresAt,
      metaUserId: me.id,
      metaUserName: me.name,
    });

    dashboardUrl.searchParams.set('meta_ads', 'connected');
    const res = NextResponse.redirect(dashboardUrl);
    res.cookies.delete('meta_oauth_state');
    return res;
  } catch (e) {
    dashboardUrl.searchParams.set('meta_ads', 'error');
    dashboardUrl.searchParams.set('reason', e instanceof Error ? e.message : 'connect failed');
    return NextResponse.redirect(dashboardUrl);
  }
}
