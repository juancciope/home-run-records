"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Database,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Music2,
  MessageCircle,
  Video,
  Music,
  Search,
  ExternalLink,
  Wifi,
  WifiOff
} from "lucide-react"
import Link from "next/link"
import { useArtist } from "@/contexts/artist-context"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface ViberateSearchResult {
  uuid: string
  name: string
  followers?: number
  rank?: number
  image?: string
}

export default function ConnectDataPage() {
  const { user } = useArtist()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ViberateSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedArtist, setSelectedArtist] = useState<ViberateSearchResult | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'connected' | 'error'>('none')
  const [currentConnection, setCurrentConnection] = useState<ViberateSearchResult | null>(null)

  useEffect(() => {
    const checkExistingConnection = async () => {
      if (!user?.id) return

      try {
        const { ArtistService } = await import('@/lib/services/artist-service')
        const profile = await ArtistService.getArtistProfile(user.id, user.email)
        
        if (profile?.viberate_artist_id) {
          // Fetch current connection data
          const response = await fetch(`/api/viberate/analytics?artistId=${encodeURIComponent(profile.viberate_artist_id)}`)
          const data = await response.json()
          
          if (data && !data.error) {
            setCurrentConnection({
              uuid: profile.viberate_artist_id,
              name: data.artist?.name || 'Connected Artist',
              followers: data.artist?.followers,
              rank: data.artist?.rank,
              image: data.artist?.image
            })
            setConnectionStatus('connected')
          }
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }

    checkExistingConnection()
  }, [user?.id, user?.email])

  const searchArtists = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/viberate/search?q=${encodeURIComponent(searchQuery)}&limit=5`)
      const data = await response.json()
      
      if (data.artists && Array.isArray(data.artists)) {
        setSearchResults(data.artists.map((artist: any) => ({
          uuid: artist.uuid,
          name: artist.name,
          followers: artist.followers,
          rank: artist.rank,
          image: artist.image
        })))
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const connectToArtist = async (artist: ViberateSearchResult) => {
    if (!user?.id) return

    setIsConnecting(true)
    setSelectedArtist(artist)

    try {
      const { ArtistService } = await import('@/lib/services/artist-service')
      
      // Update profile with Viberate artist ID
      const result = await ArtistService.updateProfile(user.id, {
        viberate_artist_id: artist.uuid,
        artist_name: artist.name
      })

      if (result) {
        setCurrentConnection(artist)
        setConnectionStatus('connected')
        
        // Trigger data sync
        await fetch('/api/viberate/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user.id, 
            artistId: artist.uuid 
          })
        })
      } else {
        setConnectionStatus('error')
      }
    } catch (error) {
      console.error('Connection error:', error)
      setConnectionStatus('error')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectArtist = async () => {
    if (!user?.id) return

    setIsConnecting(true)
    try {
      const { ArtistService } = await import('@/lib/services/artist-service')
      
      await ArtistService.updateProfile(user.id, {
        viberate_artist_id: undefined
      })

      setCurrentConnection(null)
      setConnectionStatus('none')
      setSearchResults([])
      setSearchQuery("")
    } catch (error) {
      console.error('Disconnection error:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleNext = () => {
    router.push('/onboarding/set-goals')
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/onboarding">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Connect Your Data</h1>
          <p className="text-muted-foreground">
            Link your artist profile to unlock real-time analytics and insights
          </p>
        </div>
      </div>

      {/* Step Progress */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Step 1 of 3: Connect Your Data</h3>
              <p className="text-sm text-muted-foreground">
                Find and connect your artist profile to access real-time data from Spotify, Instagram, YouTube, and more
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Connection Section */}
        <div className="space-y-6">
          {connectionStatus === 'connected' && currentConnection ? (
            <Card className="bg-green-500/5 border-green-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Connected Successfully
                </CardTitle>
                <CardDescription>
                  Your profile is now connected to Viberate's real-time data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 bg-background rounded-lg border">
                  {currentConnection.image && (
                    <img 
                      src={currentConnection.image} 
                      alt={currentConnection.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold">{currentConnection.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {currentConnection.followers && (
                        <span>{currentConnection.followers.toLocaleString()} followers</span>
                      )}
                      {currentConnection.rank && (
                        <span>Global Rank #{currentConnection.rank.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400">
                    <Wifi className="h-3 w-3 mr-1" />
                    Live Data
                  </Badge>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectArtist}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <WifiOff className="h-4 w-4 mr-2" />
                    )}
                    Disconnect
                  </Button>
                  <Link href={`/analytics?artist=${currentConnection.uuid}`}>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-sidebar">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Find Your Artist Profile
                </CardTitle>
                <CardDescription>
                  Search for your artist name to connect your profile with real-time data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="search" className="sr-only">Artist Name</Label>
                    <Input
                      id="search"
                      placeholder="Enter your artist name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchArtists()}
                    />
                  </div>
                  <Button 
                    onClick={searchArtists} 
                    disabled={isSearching || !searchQuery.trim()}
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {connectionStatus === 'error' && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center text-red-600 dark:text-red-400">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm">Failed to connect. Please try again.</span>
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Select Your Profile:</Label>
                    {searchResults.map((artist) => (
                      <div
                        key={artist.uuid}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => connectToArtist(artist)}
                      >
                        {artist.image && (
                          <img 
                            src={artist.image} 
                            alt={artist.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{artist.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {artist.followers && (
                              <span>{artist.followers.toLocaleString()} followers</span>
                            )}
                            {artist.rank && (
                              <span>• Rank #{artist.rank.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          disabled={isConnecting && selectedArtist?.uuid === artist.uuid}
                        >
                          {isConnecting && selectedArtist?.uuid === artist.uuid ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Connect'
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.length === 0 && searchQuery && !isSearching && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No artists found. Try a different search term.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Benefits Section */}
        <div className="space-y-6">
          <Card className="bg-sidebar">
            <CardHeader>
              <CardTitle>What You&apos;ll Get</CardTitle>
              <CardDescription>
                Connecting your data unlocks powerful insights and automation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                  <Music2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Real-time Streaming Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Track your Spotify streams, listeners, and playlist additions automatically
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Social Media Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor your Instagram, TikTok, and Facebook growth and engagement
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Video Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Track your YouTube views, subscribers, and video engagement metrics
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Historical Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    Access months of historical data to understand your growth patterns
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skip Option */}
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-medium">Want to skip this step?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    You can connect your data later, but you'll see demo data in the dashboard until then.
                  </p>
                  <Button variant="outline" size="sm" onClick={handleNext}>
                    Continue with Demo Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t pt-6">
        <Link href="/onboarding">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
        </Link>

        <Button 
          onClick={handleNext}
          disabled={connectionStatus !== 'connected' && connectionStatus !== 'none'}
        >
          Next: Set Your Goals
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}