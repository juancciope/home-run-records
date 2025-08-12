import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Use service role for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Test direct insert
    const testData = {
      artist_id: '704a97eb-2ba0-43ec-940d-7fdf5f73174a',
      platform: 'test-platform',
      url: 'https://test.com'
    };
    
    console.log('Testing insert with:', testData);
    
    const { data, error } = await supabase
      .from('artist_social_links')
      .insert(testData)
      .select();
    
    return NextResponse.json({
      success: !error,
      data,
      error: error?.message,
      testData
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}