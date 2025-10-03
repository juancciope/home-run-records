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
  const [selectedGenre, setSelectedGenre] = React.useState('')
  const [selectedKeywords, setSelectedKeywords] = React.useState<string[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const [results, setResults] = React.useState<Playlist[]>([])
  const [hasSearched, setHasSearched] = React.useState(false)
  const [error, setError] = React.useState('')
  const [totalResults, setTotalResults] = React.useState(0)

  // Handle genre selection (single selection)
  const handleGenreClick = (genre: string) => {
    setSelectedGenre(genre)
    // Clear results when changing genre
    setResults([])
    setHasSearched(false)
  }

  // Toggle keyword selection
  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords(prev =>
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    )
  }

  // Clear all keywords
  const clearKeywords = () => {
    setSelectedKeywords([])
  }

  // Calculate search queries
  const searchQueries = React.useMemo(() => {
    if (!selectedGenre) return []
    if (selectedKeywords.length === 0) return [selectedGenre]
    return selectedKeywords.slice(0, 10).map(keyword => `${selectedGenre} ${keyword}`)
  }, [selectedGenre, selectedKeywords])

  // Handle search
  const handleSearch = async () => {
    if (!selectedGenre) return

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
          genre: selectedGenre,
          keywords: selectedKeywords
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
    a.download = `spotify-playlists-${selectedGenre.toLowerCase().replace(/\s+/g, '-')}.csv`
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

          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover curated playlists with curator contact details to pitch your music
          </p>
        </motion.div>

        {/* 3-Step Search Builder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* STEP 1: Select Genre */}
          <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center text-purple-300 font-bold">
                  1
                </div>
                <div>
                  <CardTitle className="text-white">Select Your Music Genre</CardTitle>
                  <CardDescription>Choose one genre that best describes your music</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {MUSIC_GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreClick(genre)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      selectedGenre === genre
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-purple-400 shadow-lg shadow-purple-500/50'
                        : 'bg-gray-800/50 hover:bg-gray-800 border-2 border-gray-700 hover:border-purple-500/50 text-gray-300 hover:text-white'
                    }`}
                  >
                    <Music className="w-4 h-4 inline mr-2" />
                    {genre}
                  </button>
                ))}
              </div>
              {selectedGenre && (
                <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span className="text-sm text-purple-300">
                    Selected: <strong>{selectedGenre}</strong>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* STEP 2: Select Keywords (Optional) */}
          <Card className={`bg-gray-900/50 backdrop-blur-xl border-gray-800 transition-all ${
            !selectedGenre ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 border-2 border-pink-500 flex items-center justify-center text-pink-300 font-bold">
                    2
                  </div>
                  <div>
                    <CardTitle className="text-white">Add Strategic Keywords (Optional)</CardTitle>
                    <CardDescription>
                      Select keywords to find more specific playlists. You can skip this to search only by genre.
                    </CardDescription>
                  </div>
                </div>
                {selectedKeywords.length > 0 && (
                  <Button
                    onClick={clearKeywords}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-2">
                {STRATEGIC_KEYWORDS.map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => toggleKeyword(keyword)}
                    disabled={!selectedGenre}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      selectedKeywords.includes(keyword)
                        ? 'bg-pink-500/30 border-2 border-pink-400 text-white shadow-md'
                        : 'bg-gray-800/50 hover:bg-gray-800 border-2 border-gray-700 hover:border-pink-500/50 text-gray-300 hover:text-white'
                    }`}
                  >
                    {selectedKeywords.includes(keyword) && <CheckCircle className="w-3 h-3 inline mr-1" />}
                    {keyword}
                  </button>
                ))}
              </div>
              {selectedKeywords.length > 0 && (
                <div className="mt-4 p-3 bg-pink-500/10 border border-pink-500/30 rounded-lg">
                  <p className="text-sm text-pink-300 font-medium mb-1">
                    {selectedKeywords.length} keyword{selectedKeywords.length > 1 ? 's' : ''} selected
                    {selectedKeywords.length >= 10 && ' (maximum reached)'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* STEP 3: Review & Search */}
          <Card className={`bg-gray-900/50 backdrop-blur-xl border-gray-800 transition-all ${
            !selectedGenre ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-green-300 font-bold">
                  3
                </div>
                <div>
                  <CardTitle className="text-white">Review Your Search</CardTitle>
                  <CardDescription>See exactly what we'll search for and start finding playlists</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Preview */}
              <div className="p-4 bg-gray-800/50 border-2 border-gray-700 rounded-lg">
                <p className="text-sm text-gray-400 mb-3 font-medium">
                  {searchQueries.length === 1 ? 'We will search for:' : `We will perform ${searchQueries.length} searches:`}
                </p>
                <div className="space-y-2">
                  {searchQueries.slice(0, 5).map((query, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-300 flex-shrink-0">
                        {index + 1}
                      </div>
                      <code className="text-sm text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded border border-purple-500/30">
                        "{query}"
                      </code>
                    </div>
                  ))}
                  {searchQueries.length > 5 && (
                    <p className="text-xs text-gray-500 ml-8">
                      ...and {searchQueries.length - 5} more searches
                    </p>
                  )}
                </div>
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                disabled={isSearching || !selectedGenre}
                size="lg"
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg font-semibold"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Searching {searchQueries.length} {searchQueries.length === 1 ? 'query' : 'queries'}...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Find Playlists ({searchQueries.length} {searchQueries.length === 1 ? 'search' : 'searches'})
                  </>
                )}
              </Button>

              {/* Helper Text */}
              <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-300">
                  <strong>Tip:</strong> More keywords = more searches = better coverage!
                  Each keyword combination helps you discover different types of playlists.
                </p>
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
                Results for "{selectedGenre}"
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

            {playlist.songCount && (
              <div className="flex items-center gap-1 text-sm text-gray-400 mb-3">
                <Music className="w-4 h-4" />
                <span>{playlist.songCount} songs</span>
              </div>
            )}

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
