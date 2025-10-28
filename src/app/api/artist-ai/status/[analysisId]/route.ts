import { NextRequest, NextResponse } from 'next/server';
import { analysisProgress } from '@/lib/artist-ai/progress-tracker';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ analysisId: string }> }
) {
  const params = await context.params;
  const { analysisId } = params;

  // Get progress from Supabase database
  const status = await analysisProgress.get(analysisId);

  if (!status) {
    const availableIds = await analysisProgress.keys();
    console.log(`❓ Status requested for ${analysisId} - not found in database. Available IDs: ${availableIds.join(', ')}`);
    return NextResponse.json({
      progress: 0,
      message: "Initializing...",
      estimatedTime: 120000,
      complete: false
    });
  }

  console.log(`📊 Status requested for ${analysisId} - progress: ${status.progress}%, message: "${status.message}", complete: ${status.complete}`);
  return NextResponse.json(status);
}