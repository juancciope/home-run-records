"use client"

import { useEffect, useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-provider"

interface ArtistHeaderData {
  name: string
  image: string | null
  followers: number | null
  hasViberateData: boolean
}

export function PersistentArtistHeader() {
  const { user, profile } = useAuth()
  const [artistData, setArtistData] = useState<ArtistHeaderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArtistData() {
      if (!user?.id) return

      try {
        // Try to get artist data from API
        const response = await fetch('/api/artist-header')
        
        if (response.ok) {
          const data = await response.json()
          setArtistData(data)
        } else {
          // Fallback to user profile data
          const displayName = profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}`
            : profile?.first_name || user.email?.split('@')[0] || 'Artist'
          
          setArtistData({
            name: displayName,
            image: profile?.avatar_url || null,
            followers: null,
            hasViberateData: false
          })
        }
      } catch (error) {
        console.error('Error loading artist data:', error)
        // Always fallback to user profile
        const displayName = profile?.first_name && profile?.last_name 
          ? `${profile.first_name} ${profile.last_name}`
          : profile?.first_name || user.email?.split('@')[0] || 'Artist'
        
        setArtistData({
          name: displayName,
          image: profile?.avatar_url || null,
          followers: null,
          hasViberateData: false
        })
      } finally {
        setLoading(false)
      }
    }

    loadArtistData()
  }, [user, profile])

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  if (!artistData) {
    return null
  }

  // Get the first letter for fallback
  const initial = artistData.name.charAt(0).toUpperCase()

  // Multiple image sources to try
  const imageSources = [
    artistData.image,
    profile?.avatar_url,
    `https://ui-avatars.com/api/?name=${encodeURIComponent(artistData.name)}&size=128&background=6366f1&color=ffffff&bold=true`
  ].filter(Boolean) as string[]

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-lg ring-2 ring-background">
          {imageSources.map((src, index) => (
            <AvatarImage 
              key={index}
              src={src} 
              alt={artistData.name}
              className="object-cover"
              onError={(e) => {
                console.log(`Avatar image ${index} failed to load:`, src)
                e.currentTarget.style.display = 'none'
              }}
            />
          ))}
          <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white font-bold text-xl">
            {initial}
          </AvatarFallback>
        </Avatar>
        {/* Debug overlay - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            {imageSources.length}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold text-foreground truncate">
          {artistData.name}
        </h1>
        <div className="flex items-center gap-3 text-sm">
          {artistData.followers && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="font-medium">
                {artistData.followers.toLocaleString()} followers
              </span>
            </div>
          )}
          {artistData.hasViberateData ? (
            <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400 text-xs border-green-200 dark:border-green-800">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5 inline-block animate-pulse"></span>
              Live Data
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Setup Required
            </Badge>
          )}
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <Badge variant="secondary" className="text-xs">
              Img: {artistData.image ? '✓' : '✗'} | Profile: {profile?.avatar_url ? '✓' : '✗'}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}