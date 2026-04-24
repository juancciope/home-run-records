const API_VERSION = process.env.META_GRAPH_API_VERSION || 'v21.0';
const GRAPH = `https://graph.facebook.com/${API_VERSION}`;
const DIALOG = `https://www.facebook.com/${API_VERSION}/dialog/oauth`;

export const META_SCOPES = ['ads_read', 'read_insights', 'business_management'];

export function buildAuthorizeURL(state: string): string {
  const url = new URL(DIALOG);
  url.searchParams.set('client_id', process.env.META_APP_ID!);
  url.searchParams.set('redirect_uri', process.env.NEXT_PUBLIC_META_ADS_REDIRECT_URI!);
  url.searchParams.set('state', state);
  url.searchParams.set('scope', META_SCOPES.join(','));
  url.searchParams.set('response_type', 'code');
  return url.toString();
}

type TokenResponse = { access_token: string; expires_in?: number; token_type?: string };

export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const url = new URL(`${GRAPH}/oauth/access_token`);
  url.searchParams.set('client_id', process.env.META_APP_ID!);
  url.searchParams.set('client_secret', process.env.META_APP_SECRET!);
  url.searchParams.set('redirect_uri', process.env.NEXT_PUBLIC_META_ADS_REDIRECT_URI!);
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
