"use client"

import {
  BarChart3,
  GalleryVerticalEnd,
  Wrench,
  Rocket,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { ArtistSwitcher } from "@/components/artist-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useArtist } from "@/contexts/artist-context"
import * as React from "react"

// This is sample data.
const staticData = {
  teams: [
    {
      name: "Home Run Records",
      logo: GalleryVerticalEnd,
      plan: "Agency Account",
    },
  ],
  navMain: [
    {
      title: "Start Here",
      url: "#",
      icon: Rocket,
      isActive: false,
      items: [
        {
          title: "Onboarding",
          url: "/onboarding",
          items: [
            {
              title: "Connect Data",
              url: "/onboarding/connect-data",
            },
            {
              title: "Set Goals",
              url: "/onboarding/set-goals",
            },
          ],
        },
        {
          title: "My Team",
          url: "/team",
        },
      ],
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
        {
          title: "Analytics",
          url: "/analytics",
        },
      ],
    },
    {
      title: "Tools",
      url: "#",
      icon: Wrench,
      items: [
        {
          title: "Brand",
          url: "#",
        },
        {
          title: "Ads",
          url: "#",
        },
        {
          title: "Content Calendar",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useArtist();
  const [artistData, setArtistData] = React.useState<{ artist?: { name?: string; image?: string } } | null>(null);
  
  React.useEffect(() => {
    const loadArtistData = async () => {
      if (!user?.id) return;
      
      try {
        const { ArtistService } = await import('@/lib/services/artist-service');
        const profile = await ArtistService.getArtistProfile(user.id, user.email);
        
        if (profile?.viberate_artist_id) {
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
  
  // Prepare user data for NavUser component with Viberate image
  const userData = {
    name: artistData?.artist?.name || user?.artist_name || user?.email?.split('@')[0] || "Artist",
    email: user?.email || "artist@example.com",
    avatar: artistData?.artist?.image || user?.profile_image_url || "",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={staticData.teams} />
        <ArtistSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={staticData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}