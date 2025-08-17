// Test script to check dashboard with authentication using local development database
const { createClient } = require('@supabase/supabase-js');

// Use local Supabase configuration from environment
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthAndProfile() {
  try {
    console.log('🔐 Testing authentication with local development database...');
    
    // Try to sign in with the admin credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'juan@blo7.com',
      password: 'VxM82piZ!hsi0737'
    });

    if (authError) {
      console.error('❌ Login error:', authError);
      return;
    }

    console.log('✅ Login successful!');
    console.log('👤 User:', authData.user?.email);
    console.log('🔑 User ID:', authData.user?.id);
    console.log('🔐 Session:', authData.session ? 'Active' : 'None');
    
    if (authData.user) {
      // Check for user profile
      console.log('\n📋 Checking user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Profile error:', profileError);
      } else {
        console.log('✅ Profile found:', profile);
      }
      
      // Check for agencies
      console.log('\n🏢 Checking user agencies...');
      const { data: agencies, error: agenciesError } = await supabase
        .from('agency_users')
        .select(`
          *,
          agency:agencies(*)
        `)
        .eq('user_id', authData.user.id);
      
      if (agenciesError) {
        console.error('❌ Agencies error:', agenciesError);
      } else {
        console.log('✅ Agencies found:', agencies);
      }
      
      // Check artist profile
      console.log('\n🎵 Checking artist profile...');
      const { data: artistProfile, error: artistError } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();
      
      if (artistError) {
        console.log('ℹ️ No artist profile or error:', artistError.message);
      } else {
        console.log('✅ Artist profile found:', artistProfile);
      }
      
      // Now test dashboard access with the session
      if (authData.session) {
        console.log('\n🌐 Testing dashboard HTTP request...');
        try {
          const response = await fetch('http://localhost:3002/dashboard', {
            headers: {
              'Cookie': `sb-access-token=${authData.session.access_token}; sb-refresh-token=${authData.session.refresh_token}`
            }
          });
          
          console.log('📊 Dashboard response status:', response.status);
          console.log('🔀 Dashboard redirects to:', response.headers.get('location') || 'No redirect');
          
          if (response.status === 500) {
            const text = await response.text();
            console.log('🚫 Server error response:', text.substring(0, 500));
          }
        } catch (fetchError) {
          console.error('❌ Dashboard fetch error:', fetchError);
        }
      }
    }
    
  } catch (err) {
    console.error('💥 Test error:', err);
  }
}

testAuthAndProfile();