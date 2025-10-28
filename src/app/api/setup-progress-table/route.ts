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

    // Execute SQL to create the table
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create analysis_progress table for tracking real-time analysis progress
        CREATE TABLE IF NOT EXISTS analysis_progress (
          id TEXT PRIMARY KEY,
          progress INTEGER NOT NULL DEFAULT 0,
          message TEXT NOT NULL,
          estimated_time INTEGER NOT NULL DEFAULT 0,
          complete BOOLEAN NOT NULL DEFAULT FALSE,
          success BOOLEAN,
          error TEXT,
          artist_slug TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Index for cleanup queries
        CREATE INDEX IF NOT EXISTS idx_analysis_progress_complete_created
          ON analysis_progress(complete, created_at);

        -- Enable Row Level Security
        ALTER TABLE analysis_progress ENABLE ROW LEVEL SECURITY;

        -- Policy: Allow public read access
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE tablename = 'analysis_progress'
            AND policyname = 'Allow public read access to analysis progress'
          ) THEN
            CREATE POLICY "Allow public read access to analysis progress"
              ON analysis_progress
              FOR SELECT
              TO public
              USING (true);
          END IF;
        END $$;

        -- Policy: Allow service role full access
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE tablename = 'analysis_progress'
            AND policyname = 'Allow service role full access to analysis progress'
          ) THEN
            CREATE POLICY "Allow service role full access to analysis progress"
              ON analysis_progress
              FOR ALL
              TO service_role
              USING (true)
              WITH CHECK (true);
          END IF;
        END $$;

        -- Trigger function for updated_at
        CREATE OR REPLACE FUNCTION update_analysis_progress_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Trigger
        DROP TRIGGER IF EXISTS trigger_update_analysis_progress_timestamp ON analysis_progress;
        CREATE TRIGGER trigger_update_analysis_progress_timestamp
          BEFORE UPDATE ON analysis_progress
          FOR EACH ROW
          EXECUTE FUNCTION update_analysis_progress_updated_at();

        -- Cleanup function
        CREATE OR REPLACE FUNCTION cleanup_old_analysis_progress()
        RETURNS INTEGER AS $$
        DECLARE
          deleted_count INTEGER;
        BEGIN
          DELETE FROM analysis_progress
          WHERE (complete = TRUE AND created_at < NOW() - INTERVAL '30 minutes')
             OR (created_at < NOW() - INTERVAL '2 hours');

          GET DIAGNOSTICS deleted_count = ROW_COUNT;
          RETURN deleted_count;
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    if (error) {
      console.error('Error creating table:', error);
      return NextResponse.json(
        { error: 'Failed to create table', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'analysis_progress table created successfully'
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Setup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
