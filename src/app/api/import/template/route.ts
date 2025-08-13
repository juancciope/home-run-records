import { NextRequest, NextResponse } from 'next/server';
import { PipelineService } from '@/lib/services/pipeline-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    
    if (!type || !['production', 'marketing', 'fan_engagement', 'conversion', 'agent'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid template type. Must be one of: production, marketing, fan_engagement, conversion, agent' },
        { status: 400 }
      );
    }

    const csvContent = PipelineService.getCSVTemplate(
      type as 'production' | 'marketing' | 'fan_engagement' | 'conversion' | 'agent'
    );

    const response = new NextResponse(csvContent);
    response.headers.set('Content-Type', 'text/csv');
    response.headers.set('Content-Disposition', `attachment; filename="${type}_import_template.csv"`);
    
    return response;

  } catch (error) {
    console.error('Error generating CSV template:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate CSV template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}