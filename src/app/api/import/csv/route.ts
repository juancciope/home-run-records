import { NextRequest, NextResponse } from 'next/server';
import { PipelineService } from '@/lib/services/pipeline-service';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type || !['production', 'marketing', 'fan_engagement', 'conversion', 'agent'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid import type. Must be one of: production, marketing, fan_engagement, conversion, agent' },
        { status: 400 }
      );
    }

    // Read file content
    const csvData = await file.text();
    
    if (!csvData.trim()) {
      return NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      );
    }

    // Import the CSV data
    const result = await PipelineService.batchImportCSV(
      user.id,
      csvData,
      type as 'production' | 'marketing' | 'fan_engagement' | 'conversion' | 'agent'
    );

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.success} records`,
      imported: result.success,
      errors: result.errors,
      hasErrors: result.errors.length > 0
    });

  } catch (error) {
    console.error('Error importing CSV:', error);
    return NextResponse.json(
      { 
        error: 'Failed to import CSV',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}