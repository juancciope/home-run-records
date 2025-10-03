import { NextRequest, NextResponse } from 'next/server';

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_BASE_URL = 'https://api.apify.com/v2';
const SPOTIFY_ACTOR_ID = process.env.SPOTIFY_ACTOR_ID || 'scraper-mind/spotify-email-scraper';

interface PlaylistResult {
  name: string;
  curator: string;
  description?: string;
  songCount?: number;
  followers?: number;
  spotifyUrl?: string;
  contactEmail?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { genre } = body;

    if (!genre || typeof genre !== 'string') {
      return NextResponse.json(
        { error: 'Genre is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Searching Spotify playlists for:', genre);

    // If Apify token is not configured, return mock data
    if (!APIFY_TOKEN) {
      console.log('📝 Using mock data - Apify token not configured');
      return NextResponse.json({
        playlists: generateMockPlaylists(genre),
        total: 10
      });
    }

    // Use Apify to scrape Spotify playlists
    const playlists = await scrapeSpotifyPlaylists(genre);

    return NextResponse.json({
      playlists,
      total: playlists.length
    });

  } catch (error) {
    console.error('Error scraping Spotify playlists:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to scrape playlists' },
      { status: 500 }
    );
  }
}

async function scrapeSpotifyPlaylists(searchQuery: string): Promise<PlaylistResult[]> {
  if (!APIFY_TOKEN) {
    return generateMockPlaylists(searchQuery);
  }

  try {
    console.log(`🚀 Starting Spotify scraper with actor: ${SPOTIFY_ACTOR_ID}`);

    // Start the Apify actor with correct input format for scraper-mind/spotify-email-scraper
    const runInput = {
      keywords: [searchQuery], // Must be an array, not a string
      customDomains: ['@gmail.com', '@yahoo.com', '@hotmail.com', '@outlook.com', '@icloud.com', '@protonmail.com'],
      platform: 'Spotify'
    };

    console.log('Spotify run input:', JSON.stringify(runInput, null, 2));

    const runResponse = await fetch(
      `${APIFY_BASE_URL}/acts/${SPOTIFY_ACTOR_ID}/runs`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${APIFY_TOKEN}`
        },
        body: JSON.stringify(runInput),
      }
    );

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      console.error(`Failed to start Spotify scraper: ${runResponse.status}`, errorText);
      throw new Error(`Failed to start scraper: ${runResponse.status}`);
    }

    const run = await runResponse.json();
    console.log('Spotify scraper started, run ID:', run.data.id);

    // Wait for completion
    let status = 'RUNNING';
    let attempts = 0;
    const maxAttempts = 60; // 3 minutes max

    while ((status === 'RUNNING' || status === 'READY') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      attempts++;

      try {
        const statusResponse = await fetch(
          `${APIFY_BASE_URL}/actor-runs/${run.data.id}`,
          {
            headers: {
              'Authorization': `Bearer ${APIFY_TOKEN}`
            }
          }
        );

        if (!statusResponse.ok) {
          console.error('Failed to check run status:', statusResponse.status);
          break;
        }

        const statusData = await statusResponse.json();
        status = statusData.data.status;
        console.log(`Spotify scraper status: ${status} (attempt ${attempts}/${maxAttempts})`);

        if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
          console.error('Spotify scraper failed with status:', status);
          throw new Error(`Spotify scraper failed with status: ${status}`);
        }
      } catch (error) {
        console.error('Error checking run status:', error);
        break;
      }
    }

    if (attempts >= maxAttempts) {
      console.error('Spotify scraper timed out after', maxAttempts, 'attempts');
      throw new Error(`Spotify scraper timed out after ${maxAttempts} attempts`);
    }

    // Get the results
    try {
      const resultsResponse = await fetch(
        `${APIFY_BASE_URL}/datasets/${run.data.defaultDatasetId}/items`,
        {
          headers: {
            'Authorization': `Bearer ${APIFY_TOKEN}`
          }
        }
      );

      if (!resultsResponse.ok) {
        const errorText = await resultsResponse.text();
        console.error('Failed to fetch results:', resultsResponse.status, errorText);
        throw new Error(`Failed to fetch results: ${resultsResponse.status}`);
      }

      const results = await resultsResponse.json();
      console.log(`Retrieved ${results.length} Spotify playlists`);

      if (!results || results.length === 0) {
        console.warn('No Spotify playlists found');
        throw new Error('No Spotify playlists found for the search query');
      }

      // Transform Apify data to our format
      // scraper-mind/spotify-email-scraper returns: title, description, url, email
      const playlists = results.map((item: any) => {
        // Extract playlist name from title (format: "Playlist Name - playlist by Curator" or "Playlist Name")
        let playlistName = item.title || 'Untitled Playlist';
        // Remove " - playlist by ..." or " | Podcast on Spotify" etc
        playlistName = playlistName.replace(/\s*-\s*playlist by.*$/i, '').replace(/\s*\|\s*Podcast.*$/i, '').trim();

        return {
          name: playlistName,
          curator: '', // Remove curator field as requested
          description: item.description || '',
          songCount: undefined, // Not provided by this scraper
          followers: undefined, // Not provided by this scraper
          spotifyUrl: item.url || '',
          contactEmail: item.email || extractEmailFromDescription(item.description || ''),
          instagram: extractSocialHandle(item.description || '', 'instagram'),
          twitter: extractSocialHandle(item.description || '', 'twitter'),
          website: extractWebsite(item.description || '')
        };
      });

      return playlists;
    } catch (error) {
      console.error('Error fetching Spotify results:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in Spotify scraper:', error);
    throw error; // Re-throw to see the actual error instead of silently returning mock data
  }
}

// Helper functions to extract contact info from playlist descriptions
function extractEmailFromDescription(description: string): string | undefined {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const match = description.match(emailRegex);
  return match ? match[0] : undefined;
}

function extractSocialHandle(description: string, platform: 'instagram' | 'twitter'): string | undefined {
  const patterns = {
    instagram: /(?:instagram\.com\/|@)([a-zA-Z0-9._]+)/i,
    twitter: /(?:twitter\.com\/|x\.com\/|@)([a-zA-Z0-9_]+)/i
  };

  const match = description.match(patterns[platform]);
  if (match && match[1]) {
    return platform === 'instagram'
      ? `https://instagram.com/${match[1]}`
      : `https://twitter.com/${match[1]}`;
  }
  return undefined;
}

function extractWebsite(description: string): string | undefined {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = description.match(urlRegex);
  if (matches) {
    // Filter out social media URLs
    const website = matches.find(url =>
      !url.includes('instagram.com') &&
      !url.includes('twitter.com') &&
      !url.includes('x.com') &&
      !url.includes('spotify.com')
    );
    return website;
  }
  return undefined;
}

// Generate mock playlists for testing/fallback
function generateMockPlaylists(genre: string): PlaylistResult[] {
  const mockCurators = [
    'Indie Vibes Collective',
    'Fresh Finds Music',
    'Underground Sounds',
    'New Music Friday',
    'Chill Beats Co.',
    'Rising Stars Playlist',
    'Discovery Weekly',
    'Hidden Gems',
    'Emerging Artists',
    'Music Submission Hub'
  ];

  const mockDescriptions = [
    'Submit your best tracks! We feature emerging artists weekly. Contact us for submissions.',
    'Curated playlist for new and upcoming artists. Open to submissions from independent musicians.',
    'Fresh music from talented independent artists. Send your music to get featured!',
    'Weekly updated playlist showcasing the best new releases. Submissions welcome!',
    'Supporting underground artists since 2020. Email us your music for consideration.',
    'Playlist focused on discovering hidden gems. We love finding new talent!',
    'Community-driven playlist featuring independent artists. Submit your tracks!',
    'Handpicked selection of emerging talent. Always looking for new music to feature.',
    'Playlist dedicated to up-and-coming artists. Contact for submission details.',
    'Featuring the best new independent music. Open for artist submissions!'
  ];

  return mockCurators.map((curator, index) => ({
    name: `${genre} - ${curator}`,
    curator,
    description: mockDescriptions[index % mockDescriptions.length],
    songCount: Math.floor(Math.random() * 200) + 50,
    followers: Math.floor(Math.random() * 50000) + 1000,
    spotifyUrl: `https://open.spotify.com/playlist/mock${index}`,
    contactEmail: Math.random() > 0.3 ? `${curator.toLowerCase().replace(/\s+/g, '')}@example.com` : undefined,
    instagram: Math.random() > 0.5 ? `https://instagram.com/${curator.toLowerCase().replace(/\s+/g, '')}` : undefined,
    twitter: Math.random() > 0.6 ? `https://twitter.com/${curator.toLowerCase().replace(/\s+/g, '')}` : undefined,
    website: Math.random() > 0.7 ? `https://${curator.toLowerCase().replace(/\s+/g, '')}.com` : undefined
  }));
}
