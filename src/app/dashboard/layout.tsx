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
  
  // First, try to get artist directly linked to user
  let artistQuery = supabase
    .from('artists')
    .select('*')
    .eq('user_id', user.id)
    .single();

  let { data: artist } = await artistQuery;

  // If no direct artist, check if user is part of an agency and get first artist
  if (!artist && profile?.global_role === 'artist_manager') {
    const { data: agencyUser } = await supabase
      .from('agency_users')
      .select('agency_id')
      .eq('user_id', user.id)
      .single();

    if (agencyUser?.agency_id) {
      const { data: artists } = await supabase
        .from('artists')
        .select('*')
        .eq('agency_id', agencyUser.agency_id)
        .limit(1);
      
      artist = artists?.[0];
    }
  }

  // If still no artist, try artist_profiles table
  if (!artist) {
    const { data: artistProfile } = await supabase
      .from('artist_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (artistProfile) {
      artist = {
        stage_name: artistProfile.stage_name || artistProfile.artist_name,
        avatar_url: artistProfile.avatar_url,
        total_followers: artistProfile.total_followers
      };
    }
  }

  const displayName = artist?.stage_name || artist?.name || profile?.first_name || user.email?.split('@')[0] || "Artist";
  const avatarUrl = artist?.avatar_url || artist?.image || profile?.avatar_url;
  const followers = artist?.total_followers;

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12 border-2 border-border shadow-md">
        <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
          <Music className="h-6 w-6" />
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