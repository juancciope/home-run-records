import { createHmac } from 'node:crypto';

const API_VERSION = process.env.META_GRAPH_API_VERSION || 'v21.0';
const BASE = `https://graph.facebook.com/${API_VERSION}`;

function appsecretProof(token: string): string {
  return createHmac('sha256', process.env.META_APP_SECRET!).update(token).digest('hex');
}

export class MetaApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type Params = Record<string, string | number | boolean | undefined>;

export async function metaGet<T = unknown>(
  path: string,
  token: string,
  params: Params = {},
): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    url.searchParams.set(k, String(v));
  }
  url.searchParams.set('access_token', token);
  url.searchParams.set('appsecret_proof', appsecretProof(token));

  const res = await fetch(url.toString(), { cache: 'no-store' });
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: number } };
  if (!res.ok) {
    const msg = body?.error?.message || `Meta API ${res.status}`;
    throw new MetaApiError(res.status, body, msg);
  }
  return body as T;
}
