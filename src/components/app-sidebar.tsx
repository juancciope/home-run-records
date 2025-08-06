"use client"

import {
  BarChart3,
  Megaphone,
  CheckSquare,
  GalleryVerticalEnd,
  Settings,
  Wrench,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useArtist } from "@/contexts/artist-context"

// This is sample data.
const staticData = {
  teams: [
    {
      name: "Home Run Records",
      logo: GalleryVerticalEnd,
      plan: "Premium Plan",
    },
  ],
  navMain: [
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
          title: "To-do",
          url: "#",
        },
        {
          title: "Content Calendar",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Production Pipeline",
      url: "#",
      icon: Settings,
    },
    {
      name: "Marketing Campaigns",
      url: "#",
      icon: Megaphone,
    },
    {
      name: "Fan Engagement",
      url: "#",
      icon: CheckSquare,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useArtist();
  
  // Prepare user data for NavUser component
  const userData = {
    name: user?.artist_name || user?.email?.split('@')[0] || "Artist",
    email: user?.email || "artist@example.com",
    avatar: user?.profile_image_url || "",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={staticData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={staticData.navMain} />
        <NavProjects projects={staticData.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}