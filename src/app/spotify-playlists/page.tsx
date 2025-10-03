"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Search,
  Music,
  Users,
  ExternalLink,
  Mail,
  Instagram,
  Twitter,
  Globe,
  Loader2,
  Download,
  Filter,
  ListMusic,
  CheckCircle,
  Sparkles
} from "lucide-react"
import { motion } from "framer-motion"

// Genre categories
const MUSIC_GENRES = [
  'Indie Pop',
  'Indie Rock',
  'Alternative Rock',
  'Electronic',
  'Hip Hop',
  'R&B',
  'Folk',
  'Jazz',
  'Pop',
  'Rock',
  'Country',
  'House',
  'Techno',
  'Ambient'
]

// Strategic keywords that help find specific types of playlists
const STRATEGIC_KEYWORDS = [
  // Discovery & Exposure
  'New Music',
  'Emerging Artists',
  'Underground',
  'Rising Stars',
  'Fresh Finds',
  'Discovery',
  'Hidden Gems',
  'Undiscovered',

  // Submission-Friendly
  'Submit',
  'Submissions',
  'Open for Submissions',
  'Send Music',
  'Demo Submission',
  'Artist Submission',

  // Mood & Context
  'Chill',
  'Upbeat',
  'Relaxing',
  'Study Music',
  'Workout',
  'Coffee Shop',
  'Road Trip',
  'Night Vibes',

  // Time-Based
  '2024',
  '2025',
  'Weekly',
  'Monthly',
  'Latest',
  'Current',

  // Size & Reach
  'Viral',
  'Trending',
  'Popular',
  'Hit',
  'Chart',
  'Mainstream',

  // Specific Contexts
  'Spotify Editorial',
  'Playlist Curator',
  'Music Blog',
  'Radio Ready',
  'Festival',
  'Live Session'
]

interface Playlist {
  name: string
  curator: string
  description?: string
  songCount?: number
  followers?: number
  spotifyUrl?: string
  contactEmail?: string
  instagram?: string
  twitter?: string
  website?: string
}

export default function SpotifyPlaylistsPage() {
  const [searchGenre, setSearchGenre] = React.useState('')
  const [isSearching, setIsSearching] = React.useState(false)
  const [results, setResults] = React.useState<Playlist[]>([])
  const [hasSearched, setHasSearched] = React.useState(false)
  const [error, setError] = React.useState('')
  const [totalResults, setTotalResults] = React.useState(0)

  // Handle search
  const handleSearch = async () => {
    if (!searchGenre.trim()) return

    setIsSearching(true)
    setError('')
    setResults([])

    try {
      const response = await fetch('/api/spotify/scrape-playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          genre: searchGenre.trim()
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch playlists')
      }

      const data = await response.json()
      setResults(data.playlists || [])
      setTotalResults(data.total || 0)
      setHasSearched(true)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching')
    } finally {
      setIsSearching(false)
    }
  }

  // Handle genre pill click
  const handleGenreClick = (genre: string) => {
    setSearchGenre(current => {
      if (!current.trim()) {
        return genre
      } else {
        const currentGenres = current.split(',').map(g => g.trim().toLowerCase())
        const newGenre = genre.trim().toLowerCase()

        if (currentGenres.includes(newGenre)) {
          return current
        } else {
          return current + ', ' + genre
        }
      }
    })
  }

  // Export results to CSV
  const exportToCSV = () => {
    if (results.length === 0) return

    const headers = [
      'Playlist Name',
      'Curator Name',
      'Description',
      'Song Count',
      'Followers',
      'Spotify URL',
      'Contact Email',
      'Instagram',
      'Twitter',
      'Website'
    ]

    const csvContent = [
      headers.join(','),
      ...results.map(playlist => [
        `"${playlist.name}"`,
        `"${playlist.curator}"`,
        `"${playlist.description || ''}"`,
        playlist.songCount || 0,
        playlist.followers || 0,
        playlist.spotifyUrl || '',
        playlist.contactEmail || '',
        playlist.instagram || '',
        playlist.twitter || '',
        playlist.website || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spotify-playlists-${searchGenre.toLowerCase().replace(/\s+/g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 mb-6">
            <ListMusic className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">Playlist Discovery</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Find Spotify Playlists
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-4">
            Discover curated playlists with curator contact details to pitch your music
          </p>

          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 max-w-4xl mx-auto">
            <CardContent className="p-4">
              <p className="text-sm text-gray-300">
                <Sparkles className="w-4 h-4 inline mr-2 text-purple-400" />
                <strong>Pro Tip:</strong> Combine genres with strategic keywords like "Indie Pop + Submissions" or "Electronic + New Music" to find playlists actively seeking your type of music.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
            <CardContent className="p-8">
              {/* Search Input */}
              <div className="mb-8">
                <label className="block text-white text-lg font-semibold mb-4">
                  Build your search query
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={searchGenre}
                    onChange={(e) => setSearchGenre(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="e.g., Indie Pop, New Music, Submissions, Electronic, Chill..."
                    className="w-full h-14 px-6 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500 pr-32"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching || !searchGenre.trim()}
                    className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Combine multiple keywords for better results. Each click adds to your search.
                </p>
              </div>

              {/* Two Category Sections */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Music Genres */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Music className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Music Genres</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MUSIC_GENRES.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => handleGenreClick(genre)}
                        className="px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500 rounded-full text-sm text-gray-300 hover:text-white transition-all"
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Strategic Keywords */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-pink-400" />
                    <h3 className="text-lg font-semibold text-white">Strategic Keywords</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-purple-600">
                    {STRATEGIC_KEYWORDS.map((keyword) => (
                      <button
                        key={keyword}
                        onClick={() => handleGenreClick(keyword)}
                        className="px-3 py-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 hover:border-pink-500 rounded-full text-sm text-gray-300 hover:text-white transition-all whitespace-nowrap"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Keywords to find submission-friendly, discovery-focused, and niche playlists
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <Card className="bg-red-500/10 border-red-500/50">
              <CardContent className="p-4">
                <p className="text-red-400">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results Header */}
        {hasSearched && !isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mt-8 mb-6"
          >
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white">
                Results for "{searchGenre}"
              </h2>
              {totalResults > 0 && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold border border-purple-500/30">
                  {totalResults} playlists found
                </span>
              )}
            </div>

            {results.length > 0 && (
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="border-gray-700 hover:bg-gray-800"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </motion.div>
        )}

        {/* Loading State */}
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 mt-8"
          >
            <Card className="bg-gray-900/50 border-gray-800 inline-block">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                  <span className="text-white text-lg">Searching playlists...</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  This may take a few moments as we scan thousands of playlists
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* No Results */}
        {hasSearched && !isSearching && results.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 mt-8"
          >
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-8">
                <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No playlists found</h3>
                <p className="text-gray-500">
                  Try searching for a different genre or check your spelling
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results Grid */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8"
          >
            {results.map((playlist, index) => (
              <PlaylistCard key={index} playlist={playlist} index={index} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Individual Playlist Card Component
function PlaylistCard({ playlist, index }: { playlist: Playlist; index: number }) {
  const hasContact = playlist.contactEmail || playlist.instagram || playlist.twitter || playlist.website

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:border-purple-500/50 transition-all group h-full">
        <CardContent className="p-6">
          {/* Playlist Header */}
          <div className="mb-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                {playlist.name}
              </h3>
              {playlist.spotifyUrl && (
                <a
                  href={playlist.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded-full text-white text-xs font-medium transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Spotify
                </a>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{playlist.curator}</span>
              </div>

              {playlist.songCount && (
                <div className="flex items-center gap-1">
                  <Music className="w-4 h-4" />
                  <span>{playlist.songCount} songs</span>
                </div>
              )}
            </div>

            {playlist.followers && (
              <div className="flex items-center gap-1 text-sm text-gray-400 mb-3">
                <CheckCircle className="w-4 h-4" />
                <span>{playlist.followers.toLocaleString()} followers</span>
              </div>
            )}

            {playlist.description && (
              <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                {playlist.description}
              </p>
            )}
          </div>

          {/* Contact Information */}
          {hasContact ? (
            <div className="border-t border-gray-800 pt-4">
              <p className="text-purple-400 text-sm font-semibold mb-3">Contact Info:</p>
              <div className="space-y-2">
                {playlist.contactEmail && (
                  <a
                    href={`mailto:${playlist.contactEmail}`}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {playlist.contactEmail}
                  </a>
                )}

                {playlist.instagram && (
                  <a
                    href={playlist.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                )}

                {playlist.twitter && (
                  <a
                    href={playlist.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </a>
                )}

                {playlist.website && (
                  <a
                    href={playlist.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-800 pt-4">
              <p className="text-gray-600 text-sm">No contact information available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
