import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { requireAuth, getUserWithProfile } from "@/lib/auth/server-auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Music, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

// Artist Header Component
async function ArtistHeader() {
  const authData = await getUserWithProfile();
  
  if (!authData?.user) {
    redirect('/login');
  }

  const { user, profile } = authData;

  // Get the artist data from the database
  const supabase = await createClient();
  
  // First, check artist_profiles table (this is where Viberate data is stored)
  const { data: artistProfile } = await supabase
    .from('artist_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  let artist: any = null;
  
  if (artistProfile) {
    // Use artist_profiles data which has Viberate info
    artist = {
      stage_name: artistProfile.stage_name || artistProfile.artist_name,
      name: artistProfile.artist_name,
      avatar_url: artistProfile.profile_image_url || artistProfile.avatar_url || artistProfile.image_url,
      image: artistProfile.profile_image_url || artistProfile.image_url || artistProfile.avatar_url,
      total_followers: artistProfile.spotify_followers || artistProfile.total_followers,
      viberate_uuid: artistProfile.viberate_uuid
    };
  }
  
  // If no artist_profiles, try artists table
  if (!artist) {
    const { data: artistData } = await supabase
      .from('artists')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (artistData) {
      artist = artistData;
    }
  }

  // If still no artist and user is a manager, get first artist from agency
  if (!artist && profile?.global_role === 'artist_manager') {
    const { data: agencyUser } = await supabase
      .from('agency_users')
      .select('agency_id')
      .eq('user_id', user.id)
      .single();

    if (agencyUser?.agency_id) {
      // First try artist_profiles
      const { data: profiles } = await supabase
        .from('artist_profiles')
        .select('*')
        .limit(1);
      
      if (profiles?.[0]) {
        artist = {
          stage_name: profiles[0].stage_name || profiles[0].artist_name,
          name: profiles[0].artist_name,
          avatar_url: profiles[0].profile_image_url || profiles[0].avatar_url || profiles[0].image_url,
          image: profiles[0].profile_image_url || profiles[0].image_url || profiles[0].avatar_url,
          total_followers: profiles[0].spotify_followers || profiles[0].total_followers
        };
      } else {
        // Fallback to artists table
        const { data: artists } = await supabase
          .from('artists')
          .select('*')
          .eq('agency_id', agencyUser.agency_id)
          .limit(1);
        
        artist = artists?.[0];
      }
    }
  }

  // Get the best available data
  const displayName = artist?.stage_name || artist?.name || artist?.artist_name || profile?.first_name || user.email?.split('@')[0] || "Artist";
  const avatarUrl = artist?.avatar_url || artist?.image || artist?.image_url || artistProfile?.profile_image_url || profile?.avatar_url;
  const followers = artist?.total_followers || artist?.spotify_followers;

  // Log for debugging
  console.log('Artist data:', { 
    artist, 
    displayName, 
    avatarUrl, 
    followers,
    artistProfile 
  });

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12 border-2 border-border shadow-md">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
        ) : null}
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
          <span className="text-lg">{displayName.charAt(0).toUpperCase()}</span>
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {followers && (
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{followers.toLocaleString()} followers</span>
            </div>
          )}
          {profile?.global_role === 'artist_manager' && (
            <Badge variant="outline" className="text-xs ml-1">
              Manager
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure user is authenticated
  await requireAuth();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-20 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between w-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />
                <ArtistHeader />
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-6 pt-2">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}