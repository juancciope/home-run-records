import { NextRequest, NextResponse } from 'next/server';

const VIBERATE_API_KEY = process.env.VIBERATE_API_KEY || '';
const VIBERATE_BASE_URL = 'https://data.viberate.com/api/v1';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artistId = searchParams.get('artistId');

  if (!artistId) {
    return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
  }

  if (!VIBERATE_API_KEY) {
    return NextResponse.json({
      error: 'Viberate API key not configured',
      message: 'Geographic data temporarily unavailable'
    }, { status: 503 });
  }

  try {
    const headers = {
      'Access-Key': VIBERATE_API_KEY,
      'Accept': 'application/json',
    };

    console.log(`Fetching geographic data for artist ${artistId}`);

    // Fetch geographic data from multiple endpoints in parallel
    const [
      spotifyLocationResponse,
      youtubeLocationResponse
    ] = await Promise.allSettled([
      // Spotify listeners by location
      fetch(`${VIBERATE_BASE_URL}/artist/${artistId}/spotify/listeners-by-location`, {
        headers,
        signal: AbortSignal.timeout(10000)
      }).catch(() => null),
      
      // YouTube views by location
      fetch(`${VIBERATE_BASE_URL}/artist/${artistId}/youtube/views-by-location`, {
        headers,
        signal: AbortSignal.timeout(10000)
      }).catch(() => null)
    ]);

    // Process responses safely
    const processResponse = async (response: PromiseSettledResult<Response | null>, name: string) => {
      if (response.status === 'fulfilled' && response.value?.ok) {
        try {
          const data = await response.value.json();
          console.log(`Successfully fetched ${name}:`, data.data ? 'data available' : 'no data');
          return data;
        } catch (error) {
          console.warn(`Error parsing ${name}:`, error);
          return null;
        }
      } else {
        console.warn(`Failed to fetch ${name}:`, response.status === 'fulfilled' ? response.value?.status : 'rejected');
        return null;
      }
    };

    const [
      spotifyLocation,
      youtubeLocation
    ] = await Promise.all([
      processResponse(spotifyLocationResponse, 'Spotify Location'),
      processResponse(youtubeLocationResponse, 'YouTube Location')
    ]);

    // Process geographic data into a more usable format
    const processLocationData = (data: { data?: { countries?: Record<string, number>; cities?: Record<string, number> } } | null) => {
      if (!data?.data) return { countries: [], cities: [] };
      
      const countries: Array<{name: string, listeners: number, percentage: number}> = [];
      const cities: Array<{name: string, country: string, listeners: number, percentage: number}> = [];
      
      // Process countries data if available
      if (data.data.countries) {
        Object.entries(data.data.countries).forEach(([country, listeners]) => {
          countries.push({
            name: country,
            listeners: listeners as number,
            percentage: 0 // Will calculate after we have totals
          });
        });
        
        // Calculate percentages
        const totalListeners = countries.reduce((sum, country) => sum + country.listeners, 0);
        countries.forEach(country => {
          country.percentage = totalListeners > 0 ? (country.listeners / totalListeners) * 100 : 0;
        });
        
        // Sort by listeners count
        countries.sort((a, b) => b.listeners - a.listeners);
      }
      
      // Process cities data if available
      if (data.data.cities) {
        Object.entries(data.data.cities).forEach(([cityKey, listeners]) => {
          const [city, country] = cityKey.split(',').map(s => s.trim());
          cities.push({
            name: city || cityKey,
            country: country || 'Unknown',
            listeners: listeners as number,
            percentage: 0
          });
        });
        
        // Calculate percentages
        const totalListeners = cities.reduce((sum, city) => sum + city.listeners, 0);
        cities.forEach(city => {
          city.percentage = totalListeners > 0 ? (city.listeners / totalListeners) * 100 : 0;
        });
        
        // Sort by listeners count
        cities.sort((a, b) => b.listeners - a.listeners);
      }
      
      return { countries: countries.slice(0, 20), cities: cities.slice(0, 20) };
    };

    const geographicData = {
      success: true,
      spotify: processLocationData(spotifyLocation),
      youtube: processLocationData(youtubeLocation),
      summary: {
        totalCountries: 0,
        totalCities: 0,
        topCountry: null as string | null,
        topCity: null as string | null
      },
      fetchedAt: new Date().toISOString()
    };

    // Calculate summary statistics
    const allCountries = [
      ...geographicData.spotify.countries,
      ...geographicData.youtube.countries
    ];
    
    const allCities = [
      ...geographicData.spotify.cities,
      ...geographicData.youtube.cities
    ];
    
    geographicData.summary = {
      totalCountries: new Set(allCountries.map(c => c.name)).size,
      totalCities: new Set(allCities.map(c => c.name)).size,
      topCountry: geographicData.spotify.countries[0]?.name || 
                  geographicData.youtube.countries[0]?.name || null,
      topCity: geographicData.spotify.cities[0]?.name || 
               geographicData.youtube.cities[0]?.name || null
    };

    console.log('Geographic data summary:', {
      spotifyCountries: geographicData.spotify.countries.length,
      spotifyCities: geographicData.spotify.cities.length,
      youtubeCountries: geographicData.youtube.countries.length,
      youtubeCities: geographicData.youtube.cities.length,
      topCountry: geographicData.summary.topCountry
    });

    return NextResponse.json(geographicData);

  } catch (error) {
    console.error('Error fetching geographic data:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch geographic data',
      message: 'Unable to retrieve geographic analytics data'
    }, { status: 500 });
  }
}