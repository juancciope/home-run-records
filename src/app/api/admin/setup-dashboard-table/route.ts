import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Setting up user_dashboard_metrics table...');
    
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('👤 Executing table setup for user:', user.email);

    // Create the table with proper schema
    const createTableQuery = `
-- Create user_dashboard_metrics table with proper permissions
CREATE TABLE IF NOT EXISTS user_dashboard_metrics (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Marketing/Reach metrics (from Viberate)
  viberate_reach BIGINT DEFAULT 0,
  viberate_followers BIGINT DEFAULT 0,
  viberate_engagement BIGINT DEFAULT 0,
  viberate_artist_id TEXT,
  
  -- Production metrics (user uploaded)
  user_production_unfinished INTEGER DEFAULT 0,
  user_production_finished INTEGER DEFAULT 0,
  user_production_released INTEGER DEFAULT 0,
  
  -- Fan engagement metrics (user uploaded)
  user_fan_engagement INTEGER DEFAULT 0,
  user_fans INTEGER DEFAULT 0,
  user_super_fans INTEGER DEFAULT 0,
  
  -- Conversion metrics (user uploaded)
  user_conversion_leads INTEGER DEFAULT 0,
  user_conversion_opportunities INTEGER DEFAULT 0,
  user_conversion_sales INTEGER DEFAULT 0,
  user_conversion_revenue DECIMAL(15,2) DEFAULT 0,
  
  -- Metadata
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_dashboard_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_dashboard_metrics
DROP POLICY IF EXISTS "Users can view own dashboard metrics" ON user_dashboard_metrics;
CREATE POLICY "Users can view own dashboard metrics" ON user_dashboard_metrics 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own dashboard metrics" ON user_dashboard_metrics;
CREATE POLICY "Users can insert own dashboard metrics" ON user_dashboard_metrics 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own dashboard metrics" ON user_dashboard_metrics;
CREATE POLICY "Users can update own dashboard metrics" ON user_dashboard_metrics 
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_dashboard_metrics_user_id ON user_dashboard_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dashboard_metrics_viberate_artist_id ON user_dashboard_metrics(viberate_artist_id) WHERE viberate_artist_id IS NOT NULL;
`;

    // Execute the table creation
    const { error: createError } = await supabase.rpc('exec_sql', { sql_query: createTableQuery });
    
    if (createError) {
      console.error('❌ Error creating table:', createError);
      // Try alternative approach without rpc
      const { error: directError } = await (supabase as any)
        .from('user_dashboard_metrics')
        .select('count')
        .limit(1);
      
      if (directError && directError.code === '42P01') {
        // Table doesn't exist, we need to create it manually
        return NextResponse.json({ 
          error: 'Table creation failed - need manual SQL execution',
          sql: createTableQuery
        }, { status: 500 });
      }
    }

    console.log('✅ Table setup completed');

    // Insert initial record for current user if not exists
    const { error: insertError } = await supabase
      .from('user_dashboard_metrics')
      .upsert([{ 
        user_id: user.id,
        last_synced: new Date().toISOString()
      }], {
        onConflict: 'user_id'
      });

    if (insertError) {
      console.error('⚠️ Error inserting initial record:', insertError);
    } else {
      console.log('✅ Initial record created for user');
    }

    return NextResponse.json({
      success: true,
      message: 'Dashboard table setup completed',
      user_id: user.id
    });

  } catch (error) {
    console.error('❌ Error in table setup:', error);
    return NextResponse.json({ 
      error: 'Failed to setup table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Table setup endpoint - use POST to execute setup',
    instructions: 'This endpoint creates the user_dashboard_metrics table with proper RLS policies'
  });
}