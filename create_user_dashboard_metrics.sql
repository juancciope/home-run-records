-- Create user_dashboard_metrics table with proper permissions
-- This table consolidates all dashboard metrics for each user

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

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_dashboard_metrics_updated_at ON user_dashboard_metrics;
CREATE TRIGGER update_user_dashboard_metrics_updated_at BEFORE UPDATE ON user_dashboard_metrics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_dashboard_metrics_user_id ON user_dashboard_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dashboard_metrics_viberate_artist_id ON user_dashboard_metrics(viberate_artist_id) WHERE viberate_artist_id IS NOT NULL;

-- Insert initial data for existing users from the current production data
-- This preserves the 69 records of production data that already exist
INSERT INTO user_dashboard_metrics (user_id, created_at, updated_at)
SELECT DISTINCT user_id, NOW(), NOW()
FROM artist_metrics 
WHERE user_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;