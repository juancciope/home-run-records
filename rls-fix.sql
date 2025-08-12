-- Fix RLS Policies - More permissive policies for authenticated users
DROP POLICY IF EXISTS "Users can manage own production records" ON production_records;
DROP POLICY IF EXISTS "Users can manage own marketing records" ON marketing_records;
DROP POLICY IF EXISTS "Users can manage own fan engagement records" ON fan_engagement_records;
DROP POLICY IF EXISTS "Users can manage own conversion records" ON conversion_records;
DROP POLICY IF EXISTS "Users can manage own agent records" ON agent_records;

-- Create more permissive policies that allow all operations for authenticated users on their own data
CREATE POLICY "production_records_policy" ON production_records
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "marketing_records_policy" ON marketing_records
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "fan_engagement_records_policy" ON fan_engagement_records
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "conversion_records_policy" ON conversion_records
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agent_records_policy" ON agent_records
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);