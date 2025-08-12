import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { EnhancedArtistHeader } from "@/components/enhanced-artist-header";
import { ArtistSwitcher } from "@/components/artist-switcher";
import { requireAuth, getUserWithFullData } from "@/lib/auth/server-auth";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get full user data including agencies
  const userData = await getUserWithFullData();
  if (!userData) {
    throw new Error("Authentication required");
  }

  const { user, profile, agencies, currentAgency } = userData;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <AppSidebar 
          user={user}
          profile={profile} 
          agencies={agencies}
          currentAgency={currentAgency}
        />
        <SidebarInset>
          <header className="flex h-20 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between w-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />
                {/* Show Artist Switcher for agency admins */}
                {profile?.global_role === 'artist_manager' && currentAgency && (
                  <ArtistSwitcher userId={user.id} agencyId={currentAgency.id} />
                )}
                <EnhancedArtistHeader userId={user.id} />
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