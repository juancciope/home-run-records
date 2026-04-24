import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createSupabaseJs } from '@supabase/supabase-js';
import { decrypt, encrypt } from './crypto';
import { extendToLongLived } from './oauth';

function service() {
  return createSupabaseJs(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function getCurrentAgencyId(): Promise<string | null> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: rows, error } = await supabase
    .from('agency_users')
    .select('agency_id, is_primary')
    .eq('user_id', user.id);
  if (error || !rows || rows.length === 0) return null;

  const primary = rows.find((r) => r.is_primary) || rows[0];
  return primary.agency_id as string;
}

export async function getCurrentUserAndAgency(): Promise<{ userId: string; agencyId: string } | null> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const agencyId = await getCurrentAgencyId();
  if (!agencyId) return null;
  return { userId: user.id, agencyId };
}

export type Connection = {
  agencyId: string;
  metaUserId: string;
  metaUserName: string | null;
  tokenExpiresAt: Date;
  selectedAdAccountId: string | null;
};

export async function getConnection(agencyId: string): Promise<Connection | null> {
  const db = service();
  const { data, error } = await db
    .from('meta_ad_connections')
    .select('agency_id, meta_user_id, meta_user_name, token_expires_at, selected_ad_account_id')
    .eq('agency_id', agencyId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    agencyId: data.agency_id,
    metaUserId: data.meta_user_id,
    metaUserName: data.meta_user_name,
    tokenExpiresAt: new Date(data.token_expires_at),
    selectedAdAccountId: data.selected_ad_account_id,
  };
}

/**
 * Returns a valid access token for the agency, refreshing if it's within 7 days of expiry.
 * Throws if no connection exists.
 */
export async function getDecryptedToken(agencyId: string): Promise<string> {
  const db = service();
  const { data, error } = await db
    .from('meta_ad_connections')
    .select('access_token_encrypted, token_expires_at')
    .eq('agency_id', agencyId)
    .maybeSingle();
  if (error || !data) throw new Error('No Meta Ads connection for this agency');

  const token = decrypt(data.access_token_encrypted);
  const expiresAt = new Date(data.token_expires_at).getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  if (expiresAt - Date.now() < sevenDays) {
    try {
      const refreshed = await extendToLongLived(token);
      const newExpiry = new Date(Date.now() + (refreshed.expires_in ?? 60 * 24 * 60 * 60) * 1000);
      await db
        .from('meta_ad_connections')
        .update({
          access_token_encrypted: encrypt(refreshed.access_token),
          token_expires_at: newExpiry.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('agency_id', agencyId);
      return refreshed.access_token;
    } catch (e) {
      // Fall through to the existing token; caller will see expiration errors if it's already dead.
      console.error('[meta-ads] token refresh failed:', e);
    }
  }

  return token;
}

export async function upsertConnection(params: {
  agencyId: string;
  userId: string;
  accessToken: string;
  tokenExpiresAt: Date;
  metaUserId: string;
  metaUserName: string | null;
}): Promise<void> {
  const db = service();
  const { error } = await db.from('meta_ad_connections').upsert({
    agency_id: params.agencyId,
    meta_user_id: params.metaUserId,
    meta_user_name: params.metaUserName,
    access_token_encrypted: encrypt(params.accessToken),
    token_expires_at: params.tokenExpiresAt.toISOString(),
    connected_by: params.userId,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'agency_id' });
  if (error) throw error;
}

export async function setSelectedAdAccount(agencyId: string, adAccountId: string | null): Promise<void> {
  const db = service();
  const { error } = await db
    .from('meta_ad_connections')
    .update({ selected_ad_account_id: adAccountId, updated_at: new Date().toISOString() })
    .eq('agency_id', agencyId);
  if (error) throw error;
}

export async function deleteConnection(agencyId: string): Promise<void> {
  const db = service();
  await db.from('meta_ad_connections').delete().eq('agency_id', agencyId);
  await db.from('meta_insights_cache').delete().eq('agency_id', agencyId);
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min

export async function readCache(
  agencyId: string,
  adAccountId: string,
  datePreset: string,
): Promise<unknown | null> {
  const db = service();
  const { data } = await db
    .from('meta_insights_cache')
    .select('payload, fetched_at')
    .eq('agency_id', agencyId)
    .eq('meta_ad_account_id', adAccountId)
    .eq('date_preset', datePreset)
    .maybeSingle();
  if (!data) return null;
  const age = Date.now() - new Date(data.fetched_at).getTime();
  if (age > CACHE_TTL_MS) return null;
  return data.payload;
}

export async function writeCache(
  agencyId: string,
  adAccountId: string,
  datePreset: string,
  payload: unknown,
): Promise<void> {
  const db = service();
  await db.from('meta_insights_cache').upsert({
    agency_id: agencyId,
    meta_ad_account_id: adAccountId,
    date_preset: datePreset,
    payload: payload as object,
    fetched_at: new Date().toISOString(),
  });
}
