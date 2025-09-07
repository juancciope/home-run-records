import { NextRequest, NextResponse } from 'next/server';
import { analysisProgress } from '@/lib/artist-ai/progress-tracker';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ analysisId: string }> }
) {
  const params = await context.params;
  const { analysisId } = params;

  // Get progress from memory
  const status = analysisProgress.get(analysisId);

  if (!status) {
    return NextResponse.json({
      progress: 0,
      message: "Initializing...",
      estimatedTime: 120000,
      complete: false
    });
  }

  return NextResponse.json(status);
}