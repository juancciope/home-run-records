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
import { useAuth } from "@/contexts/auth-provider"
import * as React from "react"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, profile, isLoading } = useAuth();
  
  // Simplified: Use profile data if available, fallback to user data
  const isSuperId = profile?.global_role === 'superadmin';
  const isManager = profile?.global_role === 'artist_manager';
  
  // Prepare simplified agency teams data (placeholder for now)
  const agencyTeams = [{
    name: "Artist OS",
    logo: GalleryVerticalEnd,
    plan: isSuperId ? 'Super Admin Access' : 
          isManager ? 'Agency Admin' : 
          'Artist Access'
  }];
  
  // Prepare user data for NavUser component  
  // TODO: In the future, we could enhance this to show artist name in sidebar too
  // For now, keeping it as user data to avoid confusion
  const userData = {
    name: profile?.first_name && profile?.last_name 
      ? `${profile.first_name} ${profile.last_name}`
      : user?.email?.split('@')[0] || "User",
    email: user?.email || "user@example.com",
    avatar: profile?.avatar_url || "",
  };

  // Dynamic navigation based on role
  const getNavigationItems = () => {
    const baseItems = [
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
          // Only show My Team for managers and superadmins
          ...(isManager || isSuperId ? [{
            title: "My Team",
            url: "/team",
          }] : [])
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
      }
    ];

    // Add superadmin-specific items
    if (isSuperId) {
      baseItems.push({
        title: "Admin",
        url: "#",
        icon: Wrench,
        isActive: false,
        items: [
          {
            title: "Agencies",
            url: "/admin/agencies",
          },
          {
            title: "Users",
            url: "/admin/users", 
          },
          {
            title: "System Settings",
            url: "/admin/settings",
          }
        ]
      });
    } else {
      // Regular tools for non-superadmins
      baseItems.push({
        title: "Tools",
        url: "#",
        icon: Wrench,
        isActive: false,
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
      });
    }

    return baseItems;
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher 
          teams={agencyTeams} 
          canSwitch={false}
          onSwitch={() => {}}
          currentAgency={null}
        />
        {/* Artist switcher temporarily disabled until multi-tenant data is properly loaded */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={getNavigationItems()} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}