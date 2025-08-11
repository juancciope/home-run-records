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

import { Artist } from "@/contexts/auth-context"

export function ArtistSwitcher({ artists }: { artists: Artist[] }) {
  const { isMobile } = useSidebar()
  const [activeArtist, setActiveArtist] = React.useState(artists[0])

  // Update active artist when artists prop changes
  React.useEffect(() => {
    if (artists.length > 0 && (!activeArtist || !artists.find(a => a.id === activeArtist.id))) {
      setActiveArtist(artists[0])
    }
  }, [artists, activeArtist])

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
                {activeArtist?.avatar_url ? (
                  <img 
                    src={activeArtist.avatar_url} 
                    alt={activeArtist.stage_name}
                    className="size-full rounded-lg object-cover"
                  />
                ) : (
                  <Music className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeArtist?.stage_name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {activeArtist?.total_followers?.toLocaleString()} followers
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
            {artists.map((artist, index) => (
              <DropdownMenuItem
                key={artist.id}
                onClick={() => setActiveArtist(artist)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border overflow-hidden">
                  {artist.avatar_url ? (
                    <img 
                      src={artist.avatar_url} 
                      alt={artist.stage_name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Music className="size-4 shrink-0" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm">{artist.stage_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {artist.total_followers?.toLocaleString()} followers
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