"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Music, CheckCircle, AlertCircle, Sparkles } from "lucide-react"
import { useArtist } from "@/contexts/artist-context"

interface ArtistOnboardingProps {
  onComplete: () => void;
}

export function ArtistOnboarding({ onComplete }: ArtistOnboardingProps) {
  const { user } = useArtist();
  const [step, setStep] = useState(1);
  const [identifierType, setIdentifierType] = useState<"name" | "spotify">("name");
  const [artistName, setArtistName] = useState("");
  const [spotifyId, setSpotifyId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; spotify_id?: string }>>([]);
  const [selectedArtist, setSelectedArtist] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSearch = async () => {
    setIsSearching(true);
    setError("");
    
    try {
      const { VibrateService } = await import('@/lib/services/viberate-service');
      
      // Search for artist
      const searchTerm = identifierType === "name" ? artistName : spotifyId;
      const artists = await VibrateService.searchArtist(searchTerm);
      
      if (artists && artists.length > 0) {
        setSearchResults(artists);
        setStep(2);
        
        // Show info if we're using fallback data
        if (artists[0]?.id === '1' && artists[0]?.spotify_id === '5tP5qKnhTbTa2uEL3CLHh9') {
          console.info('Using demo data - Viberate API temporarily unavailable');
        }
      } else {
        setError("No artist found with that name. Please try a different search term.");
      }
    } catch (error) {
      console.error('Error searching for artist:', error);
      setError("Failed to search for artist. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmArtist = async () => {
    if (!selectedArtist || !user?.id) return;
    
    setIsSyncing(true);
    setError("");
    
    try {
      const { VibrateService } = await import('@/lib/services/viberate-service');
      const { ArtistService } = await import('@/lib/services/artist-service');
      
      // Find the selected artist
      const artist = searchResults.find(a => a.id === selectedArtist);
      if (!artist) throw new Error("Artist not found");
      
      // Update profile with artist name first
      console.log('Updating profile with artist name:', artist.name);
      await ArtistService.updateProfile(user.id, {
        artist_name: artist.name,
      });
      
      // Then sync artist data from Viberate
      console.log('Syncing Viberate data for artist:', artist.id);
      await VibrateService.syncArtistData(user.id, artist.id);
      
      setStep(3);
      
      // Complete onboarding after showing success
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error('Error syncing artist data:', error);
      setError("Failed to sync artist data. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (step === 3) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Successfully Connected!</h3>
                <p className="text-sm text-muted-foreground">
                  Your artist data is being synced. This may take a few moments.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>Loading your dashboard...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Confirm Your Artist Profile</CardTitle>
            <CardDescription>
              We found {searchResults.length} artist{searchResults.length > 1 ? 's' : ''} matching your search. Please select your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedArtist} onValueChange={setSelectedArtist}>
              <div className="space-y-3">
                {searchResults.map((artist) => (
                  <label
                    key={artist.id}
                    htmlFor={artist.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedArtist === artist.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value={artist.id} id={artist.id} />
                    <div className="flex-1">
                      <div className="font-medium">{artist.name}</div>
                      {artist.spotify_id && (
                        <div className="text-xs text-muted-foreground">
                          Spotify ID: {artist.spotify_id}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setStep(1);
                setSelectedArtist("");
                setSearchResults([]);
              }}
            >
              Back
            </Button>
            <Button
              onClick={handleConfirmArtist}
              disabled={!selectedArtist || isSyncing}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing Data...
                </>
              ) : (
                'Confirm & Connect'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Music className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle>Connect Your Artist Data</CardTitle>
          <CardDescription>
            Let&apos;s connect your streaming and social media data to power your dashboard. 
            We&apos;ll automatically sync your stats from Spotify, YouTube, Instagram, and more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>How would you like us to find your data?</Label>
            <RadioGroup value={identifierType} onValueChange={(value) => setIdentifierType(value as "name" | "spotify")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="name" id="name" />
                <Label htmlFor="name" className="cursor-pointer">
                  Search by artist name
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="spotify" id="spotify" />
                <Label htmlFor="spotify" className="cursor-pointer">
                  Search by Spotify artist ID
                </Label>
              </div>
            </RadioGroup>
          </div>

          {identifierType === "name" ? (
            <div className="space-y-2">
              <Label htmlFor="artistName">Artist Name</Label>
              <Input
                id="artistName"
                placeholder="Enter your artist or band name"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && artistName) {
                    handleSearch();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Enter your exact artist name as it appears on streaming platforms
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="spotifyId">Spotify Artist ID</Label>
              <Input
                id="spotifyId"
                placeholder="e.g., 3TVXtAsR1Inumwj472S9r4"
                value={spotifyId}
                onChange={(e) => setSpotifyId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && spotifyId) {
                    handleSearch();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                You can find this in your Spotify for Artists or from your Spotify artist URL
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleSearch}
            disabled={isSearching || (identifierType === "name" ? !artistName : !spotifyId)}
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              'Search & Connect'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}