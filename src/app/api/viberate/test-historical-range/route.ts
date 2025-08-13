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
      error: 'Viberate API key not configured'
    }, { status: 503 });
  }

  try {
    const headers = {
      'Access-Key': VIBERATE_API_KEY,
      'Accept': 'application/json',
    };

    // Test different date ranges to find the maximum available historical data
    const testRanges = [
      { name: '1 month', dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      { name: '3 months', dateFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      { name: '6 months', dateFrom: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      { name: '1 year', dateFrom: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      { name: '2 years', dateFrom: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      { name: '3 years', dateFrom: new Date(Date.now() - 1095 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      { name: '5 years', dateFrom: new Date(Date.now() - 1825 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    ];

    const dateTo = new Date().toISOString().split('T')[0];
    const results: Record<string, any> = {};

    console.log(`Testing historical data ranges for artist ${artistId}`);

    // Test key endpoints for each range
    const testEndpoints = [
      'spotify/streams-historical',
      'spotify/listeners-historical',
      'spotify/fanbase-historical',
      'instagram/fanbase-historical',
      'youtube/fanbase-historical',
    ];

    for (const range of testRanges) {
      console.log(`Testing range: ${range.name} (from ${range.dateFrom})`);
      results[range.name] = {};

      for (const endpoint of testEndpoints) {
        try {
          const url = `${VIBERATE_BASE_URL}/artist/${artistId}/${endpoint}?date-from=${range.dateFrom}&date-to=${dateTo}`;
          const response = await fetch(url, {
            headers,
            signal: AbortSignal.timeout(10000)
          });

          if (response.ok) {
            const data = await response.json();
            const dataPoints = data.data?.data ? Object.keys(data.data.data).length : 0;
            
            results[range.name][endpoint] = {
              success: true,
              dataPoints,
              hasData: dataPoints > 0,
              earliestDate: dataPoints > 0 ? Object.keys(data.data.data)[0] : null,
              latestDate: dataPoints > 0 ? Object.keys(data.data.data).slice(-1)[0] : null
            };

            console.log(`  ${endpoint}: ${dataPoints} data points`);
          } else {
            results[range.name][endpoint] = {
              success: false,
              error: response.status,
              dataPoints: 0
            };
            console.log(`  ${endpoint}: Failed (${response.status})`);
          }
        } catch (error) {
          results[range.name][endpoint] = {
            success: false,
            error: 'timeout/network',
            dataPoints: 0
          };
          console.log(`  ${endpoint}: Error/timeout`);
        }
      }

      // Calculate summary for this range
      const endpointResults = Object.values(results[range.name]);
      const successfulEndpoints = endpointResults.filter((r: any) => r.success);
      const endpointsWithData = endpointResults.filter((r: any) => r.hasData);
      
      results[range.name].summary = {
        totalEndpoints: testEndpoints.length,
        successfulEndpoints: successfulEndpoints.length,
        endpointsWithData: endpointsWithData.length,
        totalDataPoints: endpointResults.reduce((sum: number, r: any) => sum + (r.dataPoints || 0), 0),
        hasAnyData: endpointsWithData.length > 0
      };

      console.log(`  Summary: ${endpointsWithData.length}/${testEndpoints.length} endpoints with data, ${results[range.name].summary.totalDataPoints} total points`);
    }

    // Find the maximum useful range
    const maxRange = testRanges.reverse().find(range => 
      results[range.name].summary.hasAnyData && 
      results[range.name].summary.endpointsWithData >= 2
    );

    const summary = {
      artistId,
      testDate: new Date().toISOString(),
      recommendedMaxRange: maxRange ? {
        name: maxRange.name,
        dateFrom: maxRange.dateFrom,
        summary: results[maxRange.name].summary
      } : null,
      allRanges: Object.keys(results).map(rangeName => ({
        name: rangeName,
        summary: results[rangeName].summary
      }))
    };

    return NextResponse.json({
      success: true,
      summary,
      detailedResults: results,
      recommendations: {
        maxHistoricalRange: maxRange?.name || '6 months',
        optimalRanges: Object.keys(results).filter(rangeName => 
          results[rangeName].summary.endpointsWithData >= 3
        ),
        dataQuality: maxRange ? 'good' : 'limited'
      }
    });

  } catch (error) {
    console.error('Error testing historical ranges:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test historical data ranges',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}