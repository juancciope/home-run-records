import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...');
    
    const supabase = await createClient();
    
    // Test 1: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ 
        success: false,
        error: 'Authentication failed',
        details: authError
      });
    }

    console.log('✅ Auth successful, user:', user?.email);

    // Test 2: Check if table exists
    const { error: tableError } = await supabase
      .from('user_dashboard_metrics')
      .select('count')
      .limit(1);

    if (tableError) {
      console.error('Table access error:', tableError);
      return NextResponse.json({
        success: false,
        error: 'Table access failed',
        details: tableError,
        user: user?.email
      });
    }

    console.log('✅ Table access successful');

    // Test 3: Try to get user's record
    if (user) {
      const { data: userRecord, error: userError } = await supabase
        .from('user_dashboard_metrics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('User record error:', userError);
        return NextResponse.json({
          success: false,
          error: 'User record access failed',
          details: userError,
          user: user.email
        });
      }

      console.log('✅ User record access successful:', !!userRecord);

      return NextResponse.json({
        success: true,
        message: 'Database connection test successful',
        user: user.email,
        userId: user.id,
        hasRecord: !!userRecord,
        record: userRecord || 'No record found (will be created on first use)'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'No authenticated user'
    });

  } catch (error) {
    console.error('❌ Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}