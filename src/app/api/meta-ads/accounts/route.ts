import { NextResponse } from 'next/server';
import { getCurrentUserAndAgency, getDecryptedToken, getConnection, setSelectedAdAccount } from '@/lib/meta-ads/connection';
import { listAdAccounts } from '@/lib/meta-ads/insights';

export const dynamic = 'force-dynamic';

export async function GET() {
  const ctx = await getCurrentUserAndAgency();
  if (!ctx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const connection = await getConnection(ctx.agencyId);
  if (!connection) return NextResponse.json({ connected: false, accounts: [], selected: null });

  try {
    const token = await getDecryptedToken(ctx.agencyId);
    const accounts = await listAdAccounts(token);
    return NextResponse.json({
      connected: true,
      metaUserName: connection.metaUserName,
      accounts,
      selected: connection.selectedAdAccountId,
    });
  } catch (e) {
    return NextResponse.json(
      { connected: true, error: e instanceof Error ? e.message : 'failed to load accounts', accounts: [], selected: connection.selectedAdAccountId },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  const ctx = await getCurrentUserAndAgency();
  if (!ctx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const adAccountId = typeof body.adAccountId === 'string' ? body.adAccountId : null;
  await setSelectedAdAccount(ctx.agencyId, adAccountId);
  return NextResponse.json({ ok: true, selected: adAccountId });
}
