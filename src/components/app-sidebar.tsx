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

// This is sample data.
const data = {
  user: {
    name: "Artist Name",
    email: "artist@example.com",
    avatar: "",
  },
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
      url: "#",
      icon: BarChart3,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "#",
        },
        {
          title: "Analytics",
          url: "#",
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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}