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


interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: any;
  profile?: any;
  agencies?: any[];
  currentAgency?: any;
}

export function AppSidebar({ user, profile, agencies, currentAgency, ...props }: AppSidebarProps) {
  // Fallback to auth context if props not provided (for client components)
  const authContext = useAuth();
  const currentUser = user || authContext.user;
  const currentProfile = profile || authContext.profile;
  
  const isSuperId = currentProfile?.global_role === 'superadmin';
  const isManager = currentProfile?.global_role === 'artist_manager';
  
  // Use real agency data if available
  const agencyTeams = currentAgency ? [{
    name: currentAgency.name,
    logo: GalleryVerticalEnd,
    plan: isSuperId ? 'Super Admin Access' : 
          isManager ? 'Agency Admin' : 
          'Artist Access'
  }] : [{
    name: "Artist OS",
    logo: GalleryVerticalEnd,
    plan: isSuperId ? 'Super Admin Access' : 
          isManager ? 'Agency Admin' : 
          'Artist Access'
  }];
  
  // Prepare user data for NavUser component  
  const userData = {
    name: currentProfile?.first_name && currentProfile?.last_name 
      ? `${currentProfile.first_name} ${currentProfile.last_name}`
      : currentUser?.email?.split('@')[0] || "User",
    email: currentUser?.email || "user@example.com",
    avatar: currentProfile?.avatar_url || "",
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
        title: "DASHBOARDS",
        url: "#",
        icon: BarChart3,
        isActive: true,
        items: [
          {
            title: "OVERVIEW",
            url: "/dashboard",
          },
          {
            title: "PRODUCTION",
            url: "/dashboard/production",
          },
          {
            title: "REACH",
            url: "/dashboard/reach",
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
      // Tools for non-superadmins
      baseItems.push({
        title: "TOOLS",
        url: "#",
        icon: Wrench,
        isActive: false,
        items: [
          {
            title: "CONTENT",
            url: "/tools/content",
          },
          {
            title: "BRAND",
            url: "/tools/brand",
          },
          {
            title: "CATALOG",
            url: "/tools/catalog",
          },
          {
            title: "AGENTS",
            url: "/tools/agents",
          },
          {
            title: "PMS",
            url: "/tools/pms",
          },
          {
            title: "AI",
            url: "/tools/ai",
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
        <NavUser 
          user={userData} 
          currentAgency={currentAgency}
          isManager={isManager}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}