import { NextResponse } from 'next/server';
import { getCurrentUserAndAgency, deleteConnection } from '@/lib/meta-ads/connection';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  const ctx = await getCurrentUserAndAgency();
  if (!ctx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  await deleteConnection(ctx.agencyId);
  return NextResponse.json({ ok: true });
}
