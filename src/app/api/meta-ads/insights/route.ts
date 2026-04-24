import { NextRequest, NextResponse } from 'next/server';
import {
  getCurrentUserAndAgency,
  getConnection,
  getDecryptedToken,
  readCache,
  writeCache,
} from '@/lib/meta-ads/connection';
import { fetchAccountInsights, type DatePreset } from '@/lib/meta-ads/insights';
import { assessHealth } from '@/lib/meta-ads/health';

export const dynamic = 'force-dynamic';

const ALLOWED: DatePreset[] = ['last_7d', 'last_30d', 'last_90d'];

export async function GET(req: NextRequest) {
  const ctx = await getCurrentUserAndAgency();
  if (!ctx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const connection = await getConnection(ctx.agencyId);
  if (!connection) {
    return NextResponse.json({ connected: false });
  }

  const adAccountId = connection.selectedAdAccountId;
  if (!adAccountId) {
    return NextResponse.json({ connected: true, needsAdAccount: true });
  }

  const url = new URL(req.url);
  const rawPreset = url.searchParams.get('preset') || 'last_30d';
  const datePreset = (ALLOWED.includes(rawPreset as DatePreset) ? rawPreset : 'last_30d') as DatePreset;
  const force = url.searchParams.get('force') === '1';

  if (!force) {
    const cached = await readCache(ctx.agencyId, adAccountId, datePreset);
    if (cached) {
      return NextResponse.json({ connected: true, cached: true, ...(cached as object) });
    }
  }

  try {
    const token = await getDecryptedToken(ctx.agencyId);
    const insights = await fetchAccountInsights(token, adAccountId, datePreset);
    const health = assessHealth(insights);
    const payload = { insights, health, adAccountId, datePreset, fetchedAt: new Date().toISOString() };
    await writeCache(ctx.agencyId, adAccountId, datePreset, payload);
    return NextResponse.json({ connected: true, cached: false, ...payload });
  } catch (e) {
    return NextResponse.json(
      { connected: true, error: e instanceof Error ? e.message : 'failed' },
      { status: 500 },
    );
  }
}
