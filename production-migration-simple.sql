-- Production Database Migration (Simplified)
-- Run this in Supabase SQL Editor to create pipeline tables

-- First ensure the update function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create pipeline metrics tables for dashboard functionality

-- Production Pipeline table
CREATE TABLE IF NOT EXISTS production_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('unfinished', 'finished', 'released')),
  title TEXT NOT NULL,
  artist_name TEXT,
  description TEXT,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  release_date DATE,
  platforms JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketing Reach table
CREATE TABLE IF NOT EXISTS marketing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('reach', 'engaged', 'followers')),
  platform TEXT,
  campaign_name TEXT,
  reach_count INTEGER DEFAULT 0,
  engagement_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  date_recorded DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fan Engagement table
CREATE TABLE IF NOT EXISTS fan_engagement_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('captured', 'fans', 'super_fans')),
  contact_info JSONB DEFAULT '{}'::jsonb, -- email, name, phone, etc.
  engagement_level TEXT CHECK (engagement_level IN ('captured', 'active', 'super')),
  source TEXT, -- where the contact came from
  engagement_score INTEGER DEFAULT 0,
  last_interaction DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Conversion Pipeline table
CREATE TABLE IF NOT EXISTS conversion_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('leads', 'opportunities', 'sales')),
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  deal_value DECIMAL(10,2) DEFAULT 0,
  probability DECIMAL(3,2) DEFAULT 0, -- 0.00 to 1.00
  stage TEXT,
  source TEXT,
  notes TEXT,
  close_date DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Agent Pipeline table
CREATE TABLE IF NOT EXISTS agent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('potential', 'meeting_booked', 'signed')),
  agent_name TEXT NOT NULL,
  agency_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  specialization TEXT[],
  meeting_date TIMESTAMP WITH TIME ZONE,
  contract_terms TEXT,
  commission_rate DECIMAL(5,2),
  contract_value DECIMAL(10,2),
  status TEXT DEFAULT 'active',
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_production_records_user_id ON production_records(user_id);
CREATE INDEX IF NOT EXISTS idx_production_records_type ON production_records(record_type);

CREATE INDEX IF NOT EXISTS idx_marketing_records_user_id ON marketing_records(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_records_type ON marketing_records(record_type);
CREATE INDEX IF NOT EXISTS idx_marketing_records_date ON marketing_records(date_recorded);

CREATE INDEX IF NOT EXISTS idx_fan_engagement_records_user_id ON fan_engagement_records(user_id);
CREATE INDEX IF NOT EXISTS idx_fan_engagement_records_type ON fan_engagement_records(record_type);
CREATE INDEX IF NOT EXISTS idx_fan_engagement_records_level ON fan_engagement_records(engagement_level);

CREATE INDEX IF NOT EXISTS idx_conversion_records_user_id ON conversion_records(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_records_type ON conversion_records(record_type);
CREATE INDEX IF NOT EXISTS idx_conversion_records_stage ON conversion_records(stage);

CREATE INDEX IF NOT EXISTS idx_agent_records_user_id ON agent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_records_type ON agent_records(record_type);
CREATE INDEX IF NOT EXISTS idx_agent_records_status ON agent_records(status);

-- Add updated_at triggers
CREATE TRIGGER update_production_records_updated_at BEFORE UPDATE ON production_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_records_updated_at BEFORE UPDATE ON marketing_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fan_engagement_records_updated_at BEFORE UPDATE ON fan_engagement_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversion_records_updated_at BEFORE UPDATE ON conversion_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_records_updated_at BEFORE UPDATE ON agent_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_engagement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_records ENABLE ROW LEVEL SECURITY;

-- Users can only access their own records
CREATE POLICY "Users can manage own production records" ON production_records
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own marketing records" ON marketing_records
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own fan engagement records" ON fan_engagement_records
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own conversion records" ON conversion_records
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own agent records" ON agent_records
  USING (auth.uid() = user_id);