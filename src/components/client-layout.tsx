"use client"

import { ArtistProvider, useArtist } from "@/contexts/artist-context";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Activity, Wifi, WifiOff, User } from "lucide-react";

interface ClientLayoutProps {
  children: ReactNode;
}

// Artist Header Component
function ArtistHeader() {
  const { user } = useArtist();
  const [artistData, setArtistData] = useState<{ artist?: { name?: string; image?: string; rank?: number } } | null>(null);
  const [hasVibrateConnection, setHasVibrateConnection] = useState(false);

  useEffect(() => {
    const loadArtistData = async () => {
      if (!user?.id) return;
      
      try {
        const { ArtistService } = await import('@/lib/services/artist-service');
        const profile = await ArtistService.getArtistProfile(user.id, user.email);
        const hasConnection = !!profile?.viberate_artist_id;
        setHasVibrateConnection(hasConnection);
        
        if (hasConnection && profile?.viberate_artist_id) {
          const response = await fetch(`/api/viberate/analytics?artistId=${encodeURIComponent(profile.viberate_artist_id)}`);
          const vibrateData = await response.json();
          
          if (vibrateData && !vibrateData.error) {
            setArtistData(vibrateData);
          }
        }
      } catch (error) {
        console.error('Error loading artist data:', error);
      }
    };
    
    loadArtistData();
  }, [user?.id, user?.email]);

  const artistName = artistData?.artist?.name || user?.artist_name || user?.email?.split('@')[0] || "Artist";
  const profileImage = artistData?.artist?.image || user?.profile_image_url;

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10 border-2 border-border">
        <AvatarImage src={profileImage} alt={artistName} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          <User className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-xl font-bold text-foreground">{artistName}</h1>
        <div className="flex items-center gap-2">
          {hasVibrateConnection ? (
            <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400 text-xs">
              <Wifi className="h-3 w-3 mr-1" />
              Live Data
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              <WifiOff className="h-3 w-3 mr-1" />
              Demo Mode
            </Badge>
          )}
          {artistData?.artist?.rank && (
            <span className="text-xs text-muted-foreground">
              Global Rank #{artistData.artist.rank.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Header Actions Component  
function HeaderActions() {
  const refreshData = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="sm" onClick={refreshData}>
        <Activity className="h-4 w-4 mr-2" />
        Refresh Data
      </Button>
    </div>
  );
}

function LayoutContent({ children }: ClientLayoutProps) {
  const { isAuthenticated } = useArtist();
  const pathname = usePathname();
  
  // Pages that should not show the sidebar
  const noSidebarPages = ['/login', '/signup'];
  const shouldShowSidebar = isAuthenticated && !noSidebarPages.includes(pathname);
  
  if (shouldShowSidebar) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-20 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between w-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />
                <ArtistHeader />
              </div>
              <HeaderActions />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-6 pt-2">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }
  
  // Full page layout for login and other non-sidebar pages
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <ArtistProvider>
        <LayoutContent>
          {children}
        </LayoutContent>
      </ArtistProvider>
    </ThemeProvider>
  );
}