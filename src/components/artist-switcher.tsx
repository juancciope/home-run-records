"use client"

import * as React from "react"
import { ChevronsUpDown, Music, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Simplified Artist type for artist switcher
interface Artist {
  id: string
  name: string
  email?: string
  avatar_url?: string
  stage_name?: string
  total_followers?: number
}

export function ArtistSwitcher({ 
  userId, 
  agencyId 
}: { 
  userId: string
  agencyId: string 
}) {
  const [artists, setArtists] = React.useState<Artist[]>([])
  const [activeArtist, setActiveArtist] = React.useState<Artist | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Fetch agency artists
  React.useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await fetch(`/api/agency/${agencyId}/artists`)
        if (response.ok) {
          const data = await response.json()
          setArtists(data.artists || [])
          if (data.artists?.length > 0) {
            setActiveArtist(data.artists[0])
          }
        }
      } catch (error) {
        console.error('Error fetching agency artists:', error)
      } finally {
        setLoading(false)
      }
    }

    if (agencyId) {
      fetchArtists()
    }
  }, [agencyId])

  const handleAddArtist = () => {
    // Navigate to add artist page or open modal
    window.open('/agency/add-artist', '_blank')
  }

  if (loading || artists.length === 0) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleAddArtist}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Artist
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 min-w-[140px] justify-start"
          >
            <div className="flex aspect-square size-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
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
              <span className="truncate font-medium">
                {activeArtist?.stage_name || 'Select Artist'}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
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
              <div className="flex flex-col flex-1">
                <span className="text-sm">{artist.stage_name}</span>
                <span className="text-xs text-muted-foreground">
                  {artist.total_followers?.toLocaleString()} followers
                </span>
              </div>
              <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleAddArtist} className="gap-2 p-2">
            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
              <Plus className="size-4" />
            </div>
            <div className="font-medium text-muted-foreground">Add artist</div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}