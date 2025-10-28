import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint creates the analysis_progress table in Supabase
// Call once to set up the table: GET /api/setup-progress-table

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Test if table exists by trying to insert a test row
    const { error: testError } = await supabase
      .from('analysis_progress')
      .insert({
        id: 'test-setup-check',
        progress: 0,
        message: 'Setup check',
        estimated_time: 0,
        complete: true
      })
      .select()
      .single();

    if (testError) {
      // Table doesn't exist or has an error
      console.log('Table needs setup:', testError.message);

      return NextResponse.json({
        error: 'Table setup required',
        message: 'Please run the SQL migration manually in Supabase SQL Editor',
        instructions: [
          '1. Go to Supabase Dashboard > SQL Editor',
          '2. Run the migration from: supabase/migrations/20251028_create_analysis_progress_table.sql',
          '3. Or create table manually with: id, progress, message, estimated_time, complete, success, error, artist_slug, created_at, updated_at'
        ],
        sqlPath: '/supabase/migrations/20251028_create_analysis_progress_table.sql'
      }, { status: 500 });
    }

    // Clean up test row
    await supabase
      .from('analysis_progress')
      .delete()
      .eq('id', 'test-setup-check');

    return NextResponse.json({
      success: true,
      message: 'analysis_progress table exists and is accessible'
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Setup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
