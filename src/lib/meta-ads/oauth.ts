const API_VERSION = process.env.META_GRAPH_API_VERSION || 'v21.0';
const GRAPH = `https://graph.facebook.com/${API_VERSION}`;
const DIALOG = `https://www.facebook.com/${API_VERSION}/dialog/oauth`;

export const META_SCOPES = ['ads_read', 'read_insights', 'business_management'];

/**
 * Build the OAuth redirect URI from the incoming request.
 * We prefer the request's own origin so localhost and production
 * both work without per-environment env vars. Behind Vercel the
 * x-forwarded-* headers carry the real public host.
 */
export function redirectUriFromRequest(req: Request): string {
  const h = req.headers;
  const proto = h.get('x-forwarded-proto') || 'https';
  const host = h.get('x-forwarded-host') || h.get('host');
  if (host) return `${proto}://${host}/api/meta-ads/callback`;
  // Fallback to request URL parsing if headers are absent.
  return new URL('/api/meta-ads/callback', req.url).toString();
}

export function buildAuthorizeURL(state: string, redirectUri: string): string {
  const url = new URL(DIALOG);
  url.searchParams.set('client_id', process.env.META_APP_ID!);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  url.searchParams.set('scope', META_SCOPES.join(','));
  url.searchParams.set('response_type', 'code');
  return url.toString();
}

type TokenResponse = { access_token: string; expires_in?: number; token_type?: string };

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenResponse> {
  const url = new URL(`${GRAPH}/oauth/access_token`);
  url.searchParams.set('client_id', process.env.META_APP_ID!);
  url.searchParams.set('client_secret', process.env.META_APP_SECRET!);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('code', code);
  const res = await fetch(url.toString(), { cache: 'no-store' });
  const body = await res.json();
  if (!res.ok) throw new Error(`code exchange failed: ${JSON.stringify(body)}`);
  return body;
}

export async function extendToLongLived(shortToken: string): Promise<TokenResponse> {
  const url = new URL(`${GRAPH}/oauth/access_token`);
  url.searchParams.set('grant_type', 'fb_exchange_token');
  url.searchParams.set('client_id', process.env.META_APP_ID!);
  url.searchParams.set('client_secret', process.env.META_APP_SECRET!);
  url.searchParams.set('fb_exchange_token', shortToken);
  const res = await fetch(url.toString(), { cache: 'no-store' });
  const body = await res.json();
  if (!res.ok) throw new Error(`token extend failed: ${JSON.stringify(body)}`);
  return body;
}

export function expiresAtFromExpiresIn(expiresIn: number | undefined): Date {
  const seconds = typeof expiresIn === 'number' && expiresIn > 0 ? expiresIn : 60 * 24 * 60 * 60;
  return new Date(Date.now() + seconds * 1000);
}
