"use client"

import { useEffect, useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Music, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ArtistData {
  name: string
  image: string | null
  followers: number | null
  hasViberateData: boolean
}

export function EnhancedArtistHeader({ userId }: { userId: string }) {
  const [artistData, setArtistData] = useState<ArtistData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchArtistData() {
      try {
        const response = await fetch('/api/artist-header')
        
        if (response.ok) {
          const data = await response.json()
          setArtistData(data)
        } else if (response.status === 404) {
          const errorData = await response.json()
          console.log('No artist data found:', errorData)
          setError('No artist profile found')
        } else {
          const errorData = await response.json()
          console.error('API error:', errorData)
          setError('Failed to load artist data')
        }
      } catch (err) {
        console.error('Error fetching artist data:', err)
        setError('Failed to load artist data')
      } finally {
        setLoading(false)
      }
    }

    fetchArtistData()
  }, [userId])

  async function refreshArtistData() {
    try {
      setLoading(true)
      const response = await fetch('/api/fix/artist-data', {
        method: 'POST'
      })
      
      if (response.ok) {
        window.location.reload()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to refresh artist data')
      }
    } catch (err) {
      console.error('Error refreshing artist data:', err)
      setError('Failed to refresh artist data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  if (error || !artistData) {
    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border-2 border-border shadow-md">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <Music className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">Artist Profile</h1>
            <Badge variant="outline" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Not Synced
            </Badge>
          </div>
          <Button 
            onClick={refreshArtistData}
            variant="link" 
            className="h-auto p-0 text-sm text-muted-foreground hover:text-primary"
          >
            Click to refresh artist data
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12 border-2 border-border shadow-md">
        {artistData.image ? (
          <AvatarImage 
            src={artistData.image} 
            alt={artistData.name} 
            className="object-cover"
            onError={(e) => {
              console.error('Image failed to load:', artistData.image)
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : null}
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
          <span className="text-lg">{artistData.name.charAt(0).toUpperCase()}</span>
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-xl font-bold text-foreground">{artistData.name}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {artistData.followers && (
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{artistData.followers.toLocaleString()} followers</span>
            </div>
          )}
          {artistData.hasViberateData && (
            <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400 text-xs">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
              Live Data
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}