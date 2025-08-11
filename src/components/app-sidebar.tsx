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
import { useAuth } from "@/contexts/auth-context"
import * as React from "react"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { 
    user, 
    currentAgency, 
    userAgencies, 
    availableArtists,
    hasRole,
    canManageCurrentAgency,
    canSwitchAgencies,
    switchAgency 
  } = useAuth();
  
  // Prepare agency teams data
  const agencyTeams = userAgencies.map(ua => ({
    name: ua.agency.name,
    logo: GalleryVerticalEnd,
    plan: hasRole('superadmin') ? 'Super Admin Access' : 
          ua.role === 'artist_manager' ? 'Agency Admin' : 
          'Artist Access'
  }));

  // If user has no agencies, show placeholder
  if (agencyTeams.length === 0) {
    agencyTeams.push({
      name: "Artist OS",
      logo: GalleryVerticalEnd,
      plan: "Getting Started"
    });
  }
  
  // Prepare user data for NavUser component
  const userData = {
    name: user?.first_name && user?.last_name 
      ? `${user.first_name} ${user.last_name}`
      : user?.email?.split('@')[0] || "User",
    email: user?.email || "user@example.com",
    avatar: user?.avatar_url || "",
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
          ...(canManageCurrentAgency ? [{
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
    if (hasRole('superadmin')) {
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
          canSwitch={canSwitchAgencies}
          onSwitch={switchAgency}
          currentAgency={currentAgency}
        />
        {/* Only show artist switcher for managers and superadmins with artists */}
        {canManageCurrentAgency && availableArtists.length > 0 && (
          <ArtistSwitcher artists={availableArtists} />
        )}
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