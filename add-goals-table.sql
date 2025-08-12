-- Add goals table for pipeline goal tracking
-- Run this in your Supabase SQL editor to add the goals table

CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  section TEXT NOT NULL, -- 'production', 'marketing', 'fan_engagement', 'conversion', 'agent'
  record_type TEXT NOT NULL, -- 'unfinished', 'finished', 'released', 'reach', 'engaged', 'followers', etc.
  goal_type TEXT NOT NULL, -- 'complete_tracks', 'release_track', 'stream_target', etc.
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  target_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_goals_user_section ON goals(user_id, section);
CREATE INDEX IF NOT EXISTS idx_goals_user_record_type ON goals(user_id, record_type);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);

-- RLS (Row Level Security) policies
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Goals policies
DROP POLICY IF EXISTS "Users can view own goals" ON goals;
CREATE POLICY "Users can view own goals" ON goals 
  FOR SELECT USING (auth.uid() = user_id);
  
DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
CREATE POLICY "Users can insert own goals" ON goals 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own goals" ON goals;
CREATE POLICY "Users can update own goals" ON goals 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
CREATE POLICY "Users can delete own goals" ON goals 
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();