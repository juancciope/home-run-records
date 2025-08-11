"use client"

import * as React from "react"
import { ChevronsUpDown, Music, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

interface Artist {
  id: string
  name: string
  avatar?: string
  status: 'active' | 'inactive'
  followers?: number
}

const sampleArtists: Artist[] = [
  {
    id: "1",
    name: "Alex Rivera",
    status: "active",
    followers: 45000,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex"
  },
  {
    id: "2", 
    name: "Maya Chen",
    status: "active",
    followers: 23000,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maya"
  }
]

export function ArtistSwitcher() {
  const { isMobile } = useSidebar()
  const [activeArtist, setActiveArtist] = React.useState(sampleArtists[0])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {activeArtist.avatar ? (
                  <img 
                    src={activeArtist.avatar} 
                    alt={activeArtist.name}
                    className="size-full rounded-lg object-cover"
                  />
                ) : (
                  <Music className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeArtist.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {activeArtist.followers?.toLocaleString()} followers
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Switch Artist
            </DropdownMenuLabel>
            {sampleArtists.map((artist, index) => (
              <DropdownMenuItem
                key={artist.id}
                onClick={() => setActiveArtist(artist)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border overflow-hidden">
                  {artist.avatar ? (
                    <img 
                      src={artist.avatar} 
                      alt={artist.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Music className="size-4 shrink-0" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm">{artist.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {artist.followers?.toLocaleString()} followers
                  </span>
                </div>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add artist</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}