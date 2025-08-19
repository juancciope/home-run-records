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
import { usePathname } from "next/navigation"
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
  const pathname = usePathname();
  
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
        isActive: pathname.startsWith('/onboarding') || pathname === '/team',
        items: [
          {
            title: "Onboarding",
            url: "/onboarding",
            isActive: pathname.startsWith('/onboarding'),
            items: [
              {
                title: "Connect Data",
                url: "/onboarding/connect-data",
                isActive: pathname === "/onboarding/connect-data",
              },
              {
                title: "Set Goals",
                url: "/onboarding/set-goals",
                isActive: pathname === "/onboarding/set-goals",
              },
            ],
          },
          // Only show My Team for managers and superadmins
          ...(isManager || isSuperId ? [{
            title: "My Team",
            url: "/team",
            isActive: pathname === "/team",
          }] : [])
        ],
      },
      {
        title: "Dashboards",
        url: "#",
        icon: BarChart3,
        isActive: pathname.startsWith('/dashboard'),
        items: [
          {
            title: "Operations",
            url: "/dashboard",
            isActive: pathname === "/dashboard",
          },
          {
            title: "Production",
            url: "/dashboard/production",
            isActive: pathname === "/dashboard/production",
          },
          {
            title: "Reach",
            url: "/dashboard/reach",
            isActive: pathname === "/dashboard/reach",
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
        isActive: pathname.startsWith('/admin'),
        items: [
          {
            title: "Agencies",
            url: "/admin/agencies",
            isActive: pathname === "/admin/agencies",
          },
          {
            title: "Users",
            url: "/admin/users", 
            isActive: pathname === "/admin/users",
          },
          {
            title: "System Settings",
            url: "/admin/settings",
            isActive: pathname === "/admin/settings",
          }
        ]
      });
    } else {
      // Tools for non-superadmins
      baseItems.push({
        title: "Tools",
        url: "#",
        icon: Wrench,
        isActive: pathname.startsWith('/tools'),
        items: [
          {
            title: "Content",
            url: "/tools/content",
            isActive: pathname === "/tools/content",
          },
          {
            title: "Brand",
            url: "/tools/brand",
            isActive: pathname === "/tools/brand",
          },
          {
            title: "Catalog",
            url: "/tools/catalog",
            isActive: pathname === "/tools/catalog",
          },
          {
            title: "Agents",
            url: "/tools/agents",
            isActive: pathname === "/tools/agents",
          },
          {
            title: "PMS",
            url: "/tools/pms",
            isActive: pathname === "/tools/pms",
          },
          {
            title: "AI",
            url: "/tools/ai",
            isActive: pathname === "/tools/ai",
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