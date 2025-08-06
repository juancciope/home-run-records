"use client"

import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
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
    avatar: "/avatars/shadcn.jpg",
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
      icon: SquareTerminal,
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
        {
          title: "Reports",
          url: "#",
        },
      ],
    },
    {
      title: "Connect Sources",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Spotify",
          url: "#",
        },
        {
          title: "YouTube",
          url: "#",
        },
        {
          title: "Apple Music",
          url: "#",
        },
      ],
    },
    {
      title: "Releases",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Singles",
          url: "#",
        },
        {
          title: "Albums",
          url: "#",
        },
        {
          title: "EPs",
          url: "#",
        },
      ],
    },
    {
      title: "Reach",
      url: "#",
      icon: SquareTerminal,
      items: [
        {
          title: "Social Media",
          url: "#",
        },
        {
          title: "Streaming",
          url: "#",
        },
        {
          title: "Radio",
          url: "#",
        },
      ],
    },
    {
      title: "Fan Engagement",
      url: "#",
      icon: SquareTerminal,
      items: [
        {
          title: "Email List",
          url: "#",
        },
        {
          title: "Community",
          url: "#",
        },
        {
          title: "Events",
          url: "#",
        },
      ],
    },
    {
      title: "My Brand",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Brand Identity",
          url: "#",
        },
        {
          title: "Assets",
          url: "#",
        },
        {
          title: "Guidelines",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Production Pipeline",
      url: "#",
      icon: Frame,
    },
    {
      name: "Marketing Campaigns",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Fan Engagement",
      url: "#",
      icon: Map,
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