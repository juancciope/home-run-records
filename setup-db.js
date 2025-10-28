// Run: node setup-db.js
// Creates the analysis_progress table in Supabase

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function setup() {
  // Load SQL file
  const sqlPath = path.join(__dirname, 'supabase/migrations/20251028_create_analysis_progress_table.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('📝 Loaded SQL migration...');
  console.log('📊 Connecting to Supabase...');

  // Note: This requires @supabase/supabase-js which may not support raw SQL
  // You'll need to run this SQL manually in Supabase SQL Editor

  console.log('\n⚠️  Please run the following SQL in your Supabase SQL Editor:\n');
  console.log('1. Go to: https://supabase.com/dashboard/project/[your-project]/sql/new');
  console.log('2. Copy and paste the SQL from: supabase/migrations/20251028_create_analysis_progress_table.sql');
  console.log('3. Click "Run"\n');

  console.log('Or copy this SQL:\n');
  console.log('=' .repeat(80));
  console.log(sql);
  console.log('='.repeat(80));
}

setup();
