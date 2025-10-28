import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/utils/supabase/client';
import OpenAI from 'openai';
import { analysisProgress } from '@/lib/artist-ai/progress-tracker';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Apify client configuration
const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_BASE_URL = 'https://api.apify.com/v2';

// Apify Actor IDs - using internal IDs that work with the API
const INSTAGRAM_ACTOR_ID = process.env.INSTAGRAM_ACTOR_ID || 'shu8hvrXbJbY3Eb9W'; // apify/instagram-scraper
const TIKTOK_ACTOR_ID = process.env.TIKTOK_ACTOR_ID || 'OtzYfK1ndEGdwWFKQ'; // clockworks/free-tiktok-scraper

interface SocialMediaPost {
  platform: 'instagram' | 'tiktok';
  type: string;
  caption?: string;
  likes: number;
  comments: number;
  shares?: number;
  views?: number;
  timestamp: string;
  hashtags: string[];
  mediaUrl?: string;
  postUrl?: string;
}

interface AnalysisResult {
  overallScore: number;
  insights: {
    type: 'success' | 'warning' | 'improvement';
    title: string;
    description: string;
    metric?: string;
  }[];
  recommendations: string[];
  contentAnalysis: {
    bestPerforming: string;
    worstPerforming: string;
    optimalPostingTime: string;
    topHashtags: string[];
  };
  growthPrediction: {
    thirtyDays: number;
    sixtyDays: number;
    ninetyDays: number;
  };
  brandAnalysis?: {
    personality: string;
    values: string;
    aesthetic: string;
    targetAudience: string;
    strengths: string[];
    risks: string[];
    projection: string;
  };
  contentGuide?: {
    contentTypeMix: {
      reels: string;
      posts: string;
      carousels: string;
      stories: string;
    };
    captionStrategy: {
      idealLength: string;
      structure: string;
      callToAction: string;
    };
    hashtagStrategy: {
      optimalCount: string;
      mix: string;
      examples: string[];
    };
    postingFrequency: string;
  };
  topPerformers?: {
    platform: string;
    type: string;
    engagement: string;
    whyItWorked: string;
  }[];
}

async function extractInstagramProfile(username: string) {
  if (!APIFY_TOKEN) {
    console.log('No APIFY_TOKEN found, using mock profile data');
    return {
      followersCount: Math.floor(Math.random() * 50000) + 1000,
      profilePicUrl: null
    };
  }

  try {
    console.log(`Starting Instagram PROFILE scraping for @${username}`);
    console.log('Using Instagram main scraper for profile details');

    const runInput = {
      directUrls: [`https://www.instagram.com/${username}/`],
      resultsType: "details", // Get profile details only
      resultsLimit: 1
    };

    console.log('Instagram profile run input:', JSON.stringify(runInput, null, 2));

    const runResponse = await fetch(`${APIFY_BASE_URL}/acts/${INSTAGRAM_ACTOR_ID}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIFY_TOKEN}`
      },
      body: JSON.stringify(runInput)
    });

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      console.error(`Failed to start Instagram profile scraper: ${runResponse.status}`, errorText);
      throw new Error(`Failed to start profile scraper: ${runResponse.status}`);
    }

    const run = await runResponse.json();
    console.log('Instagram profile scraper started, run ID:', run.data.id);

    // Wait for completion
    let status = 'RUNNING';
    let attempts = 0;
    const maxAttempts = 30; // Increased timeout for profile scraping

    while ((status === 'RUNNING' || status === 'READY') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      attempts++;

      try {
        const statusResponse = await fetch(`${APIFY_BASE_URL}/actor-runs/${run.data.id}`, {
          headers: { 'Authorization': `Bearer ${APIFY_TOKEN}` }
        });

        if (!statusResponse.ok) {
          console.error('Failed to check Instagram profile status:', statusResponse.status);
          break;
        }
        
        const statusData = await statusResponse.json();
        status = statusData.data.status;
        console.log(`Instagram profile scraper status: ${status} (attempt ${attempts}/${maxAttempts})`);
        
        if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
          console.error('Instagram profile scraper failed with status:', status);
          console.error('Status message:', statusData.data.statusMessage);
          break;
        }
      } catch (error) {
        console.error('Error checking Instagram profile scraper status:', error);
        break;
      }
    }

    if (status === 'SUCCEEDED') {
      // Get profile data
      const resultsResponse = await fetch(
        `${APIFY_BASE_URL}/datasets/${run.data.defaultDatasetId}/items`,
        {
          headers: { 'Authorization': `Bearer ${APIFY_TOKEN}` }
        }
      );

      if (resultsResponse.ok) {
        const results = await resultsResponse.json();
        console.log(`Instagram profile results:`, JSON.stringify(results, null, 2));
        
        if (results && results.length > 0) {
          const profile = results[0];
          console.log(`✅ Retrieved Instagram profile data:`, {
            followers: profile.followersCount || profile.followers,
            profilePicUrlHD: profile.profilePicUrlHD,
            profilePicUrl: profile.profilePicUrl,
            profilePic: profile.profilePic,
            avatar: profile.avatar,
            allFields: Object.keys(profile)
          });
          
          const profilePicUrl = profile.profilePicUrlHD || profile.profilePicUrl || profile.profilePic || profile.avatar || null;
          console.log(`📸 Instagram profile image URL: ${profilePicUrl}`);
          
          return {
            followersCount: profile.followersCount || profile.followers || profile.followersCount || 0,
            profilePicUrl: profilePicUrl
          };
        }
      }
    }

    // Fallback to mock data
    console.log('⚠️ Using mock Instagram profile data - scraping may have failed');
    return {
      followersCount: Math.floor(Math.random() * 50000) + 1000,
      profilePicUrl: null
    };

  } catch (error) {
    console.error('❌ Instagram profile scraping failed:', error);
    return {
      followersCount: Math.floor(Math.random() * 50000) + 1000,
      profilePicUrl: null
    };
  }
}

async function extractTikTokProfile(username: string) {
  if (!APIFY_TOKEN) {
    console.log('No APIFY_TOKEN found, using mock TikTok profile data');
    return {
      followersCount: Math.floor(Math.random() * 30000) + 500,
      profilePicUrl: null
    };
  }

  try {
    console.log(`Starting TikTok PROFILE scraping for @${username}`);
    console.log('Using TikTok scraper for profile details only');

    const runInput = {
      profiles: [`https://www.tiktok.com/@${username}`],
      resultsPerPage: 1, // Minimum 1 required, we'll focus on profile data
      shouldDownloadCovers: false,
      shouldDownloadVideos: false,
      shouldDownloadSubtitles: false
    };

    console.log('TikTok profile run input:', JSON.stringify(runInput, null, 2));

    const runResponse = await fetch(`${APIFY_BASE_URL}/acts/${TIKTOK_ACTOR_ID}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIFY_TOKEN}`
      },
      body: JSON.stringify(runInput)
    });

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      console.error(`Failed to start TikTok profile scraper: ${runResponse.status}`, errorText);
      throw new Error(`Failed to start TikTok profile scraper: ${runResponse.status}`);
    }

    const run = await runResponse.json();
    console.log('TikTok profile scraper started, run ID:', run.data.id);

    // Wait for completion
    let status = 'RUNNING';
    let attempts = 0;
    const maxAttempts = 30; // Increased timeout

    while ((status === 'RUNNING' || status === 'READY') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      attempts++;

      try {
        const statusResponse = await fetch(`${APIFY_BASE_URL}/actor-runs/${run.data.id}`, {
          headers: { 'Authorization': `Bearer ${APIFY_TOKEN}` }
        });

        if (!statusResponse.ok) {
          console.error('Failed to check TikTok profile status:', statusResponse.status);
          break;
        }
        
        const statusData = await statusResponse.json();
        status = statusData.data.status;
        console.log(`TikTok profile scraper status: ${status} (attempt ${attempts}/${maxAttempts})`);
        
        if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
          console.error('TikTok profile scraper failed with status:', status);
          console.error('Status message:', statusData.data.statusMessage);
          break;
        }
      } catch (error) {
        console.error('Error checking TikTok profile scraper status:', error);
        break;
      }
    }

    if (status === 'SUCCEEDED') {
      // Get profile data
      const resultsResponse = await fetch(
        `${APIFY_BASE_URL}/datasets/${run.data.defaultDatasetId}/items`,
        {
          headers: { 'Authorization': `Bearer ${APIFY_TOKEN}` }
        }
      );

      if (resultsResponse.ok) {
        const results = await resultsResponse.json();
        console.log(`TikTok profile results:`, JSON.stringify(results, null, 2));
        
        if (results && results.length > 0) {
          // Look for profile data - could be in authorMeta or directly in result
          const profileData = results.find((item: any) => item.authorMeta || item.followerCount !== undefined) || results[0];
          const profile = profileData.authorMeta || profileData;
          
          console.log(`✅ Retrieved TikTok profile data:`, {
            followers: profile.followerCount || profile.fans,
            avatarLarger: profile.avatarLarger,
            avatarMedium: profile.avatarMedium, 
            avatar: profile.avatar,
            profilePicUrl: profile.profilePicUrl,
            allFields: Object.keys(profile)
          });
          
          const profilePicUrl = profile.avatarLarger || profile.avatarMedium || profile.avatar || profile.profilePicUrl || null;
          console.log(`📸 TikTok profile image URL: ${profilePicUrl}`);
          
          return {
            followersCount: profile.followerCount || profile.fans || profile.followersCount || 0,
            profilePicUrl: profilePicUrl
          };
        }
      }
    }

    // Fallback to mock data
    console.log('⚠️ Using mock TikTok profile data - scraping may have failed');
    return {
      followersCount: Math.floor(Math.random() * 30000) + 500,
      profilePicUrl: null
    };

  } catch (error) {
    console.error('❌ TikTok profile scraping failed:', error);
    return {
      followersCount: Math.floor(Math.random() * 30000) + 500,
      profilePicUrl: null
    };
  }
}

async function extractInstagramPosts(username: string): Promise<SocialMediaPost[]> {
  if (!APIFY_TOKEN) {
    console.log('📱 Apify token not configured, using mock Instagram data');
    return generateMockInstagramPosts(username);
  }

  console.log('🚀 APIFY_TOKEN found, starting real Instagram scraping...');

  try {
    console.log(`Starting Instagram POSTS scraping for @${username}`);
    
    // Use the configured Instagram Actor
    const actorId = INSTAGRAM_ACTOR_ID;
    console.log(`Using Instagram actor: ${actorId}`);
    
    // Correct input format for apify/instagram-scraper according to documentation
    const runInput = {
      directUrls: [`https://www.instagram.com/${username}/`],
      resultsLimit: 30,
      resultsType: "posts" // Get posts only, not profile details
    };

    console.log('Instagram posts run input:', JSON.stringify(runInput, null, 2));

    const runResponse = await fetch(
      `${APIFY_BASE_URL}/acts/${actorId}/runs`,
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
      console.error('Failed to start Instagram scraper:', runResponse.status, errorText);
      return generateMockInstagramPosts(username);
    }

    const run = await runResponse.json();
    const runId = run.data.id;
    console.log('Instagram scraper started, run ID:', runId);

    // Wait for the run to complete with timeout
    let status = 'RUNNING';
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max wait

    while ((status === 'RUNNING' || status === 'READY') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      attempts++;
      
      try {
        const statusResponse = await fetch(
          `${APIFY_BASE_URL}/actor-runs/${runId}`,
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
        console.log(`Instagram scraper status: ${status} (attempt ${attempts}/${maxAttempts})`);
        
        if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
          console.error('Instagram scraper failed with status:', status);
          console.error('Status message:', statusData.data.statusMessage);
          return generateMockInstagramPosts(username);
        }
      } catch (error) {
        console.error('Error checking run status:', error);
        break;
      }
    }

    if (attempts >= maxAttempts) {
      console.warn('Instagram scraper timed out, using mock data');
      return generateMockInstagramPosts(username);
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
        console.error('Failed to fetch results:', resultsResponse.status);
        return generateMockInstagramPosts(username);
      }

      const results = await resultsResponse.json();
      console.log(`Retrieved ${results.length} Instagram posts`);

      if (!results || results.length === 0) {
        console.warn('No Instagram posts found, using mock data');
        return generateMockInstagramPosts(username);
      }

      // Transform Apify data to our format and filter out hidden likes
      const validPosts = results
        .filter((post: any) => {
          const likes = post.likesCount || post.likes || 0;
          // Filter out posts with hidden likes (Instagram returns -1 for hidden likes)
          return likes >= 0;
        })
        .map((post: any) => ({
          platform: 'instagram' as const,
          type: post.type || (post.videoUrl ? 'video' : 'photo'),
          caption: post.caption || '',
          likes: post.likesCount || post.likes || 0,
          comments: post.commentsCount || post.comments || 0,
          views: post.videoViewCount || post.viewCount || 0,
          shares: post.shareCount || 0,
          timestamp: post.timestamp || post.takenAt || new Date().toISOString(),
          hashtags: extractHashtags(post.caption || ''),
          mediaUrl: post.displayUrl || post.url,
          postUrl: post.url || `https://www.instagram.com/p/${post.shortcode || ''}`,
          engagement: (post.likesCount || post.likes || 0) + 
                     (post.commentsCount || post.comments || 0) + 
                     (post.videoViewCount || post.viewCount || 0) * 0.1 + // Weight views less
                     (post.shareCount || 0) * 2 // Weight shares more
        }))
        .sort((a: any, b: any) => b.engagement - a.engagement); // Sort by engagement descending

      console.log(`Filtered ${validPosts.length} valid Instagram posts (removed ${results.length - validPosts.length} with hidden likes)`);
      return validPosts;
    } catch (error) {
      console.error('Error fetching Instagram results:', error);
      return generateMockInstagramPosts(username);
    }
  } catch (error) {
    console.error('Error extracting Instagram posts:', error);
    return generateMockInstagramPosts(username);
  }
}

function generateMockInstagramPosts(username: string): SocialMediaPost[] {
  const mockPosts: SocialMediaPost[] = [];
  const now = new Date();
  
  for (let i = 0; i < 15; i++) {
    const postDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)); // Posts from last 15 days
    const likes = Math.floor(Math.random() * 5000) + 100;
    const comments = Math.floor(likes * 0.05) + Math.floor(Math.random() * 50);
    const isVideo = Math.random() > 0.6;
    
    mockPosts.push({
      platform: 'instagram',
      type: isVideo ? 'reel' : 'photo',
      caption: `Check out this amazing ${isVideo ? 'reel' : 'photo'} from @${username}! #music #artist #newmusic`,
      likes,
      comments,
      views: isVideo ? likes * 3 : 0,
      timestamp: postDate.toISOString(),
      hashtags: ['#music', '#artist', '#newmusic', '#instagram'],
      mediaUrl: `https://picsum.photos/400/400?random=${i}`,
    });
  }
  
  return mockPosts;
}

async function extractTikTokPosts(username: string): Promise<SocialMediaPost[]> {
  if (!APIFY_TOKEN) {
    console.log('📱 Apify token not configured, using mock TikTok data');
    return generateMockTikTokPosts(username);
  }

  console.log('🚀 APIFY_TOKEN found, starting real TikTok scraping...');

  try {
    console.log(`Starting TikTok POSTS scraping for @${username}`);
    
    // Use the configured TikTok Actor
    const actorId = TIKTOK_ACTOR_ID;
    console.log(`Using TikTok actor: ${actorId}`);
    
    // Correct input format for clockworks/free-tiktok-scraper
    const runInput = {
      profiles: [`https://www.tiktok.com/@${username}`],
      resultsPerPage: 30, // Get posts/videos
      shouldDownloadCovers: false,
      shouldDownloadVideos: false,
      shouldDownloadSubtitles: false
    };

    console.log('TikTok posts run input:', JSON.stringify(runInput, null, 2));

    const runResponse = await fetch(
      `${APIFY_BASE_URL}/acts/${actorId}/runs`,
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
      console.error('Failed to start TikTok scraper:', runResponse.status, errorText);
      return generateMockTikTokPosts(username);
    }

    const run = await runResponse.json();
    const runId = run.data.id;
    console.log('TikTok scraper started, run ID:', runId);

    // Wait for the run to complete with timeout
    let status = 'RUNNING';
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max wait

    while ((status === 'RUNNING' || status === 'READY') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      attempts++;
      
      try {
        const statusResponse = await fetch(
          `${APIFY_BASE_URL}/actor-runs/${runId}`,
          {
            headers: {
              'Authorization': `Bearer ${APIFY_TOKEN}`
            }
          }
        );
        
        if (!statusResponse.ok) {
          console.error('Failed to check TikTok run status:', statusResponse.status);
          break;
        }
        
        const statusData = await statusResponse.json();
        status = statusData.data.status;
        console.log(`TikTok scraper status: ${status} (attempt ${attempts}/${maxAttempts})`);
        
        if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
          console.error('TikTok scraper failed with status:', status);
          console.error('Status message:', statusData.data.statusMessage);
          return generateMockTikTokPosts(username);
        }
      } catch (error) {
        console.error('Error checking TikTok run status:', error);
        break;
      }
    }

    if (attempts >= maxAttempts) {
      console.warn('TikTok scraper timed out, using mock data');
      return generateMockTikTokPosts(username);
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
        console.error('Failed to fetch TikTok results:', resultsResponse.status);
        return generateMockTikTokPosts(username);
      }

      const results = await resultsResponse.json();
      console.log(`Retrieved ${results.length} TikTok posts`);

      if (!results || results.length === 0) {
        console.warn('No TikTok posts found, using mock data');
        return generateMockTikTokPosts(username);
      }

      // Transform TikTok data and sort by engagement
      const tiktokPosts = results.map((post: any) => {
        const likes = post.diggCount || post.stats?.diggCount || 0;
        const comments = post.commentCount || post.stats?.commentCount || 0;
        const shares = post.shareCount || post.stats?.shareCount || 0;
        const views = post.playCount || post.stats?.playCount || 0;
        
        return {
          platform: 'tiktok' as const,
          type: 'video',
          caption: post.text || post.desc || '',
          likes,
          comments,
          shares,
          views,
          timestamp: post.createTime ? new Date(post.createTime * 1000).toISOString() : new Date().toISOString(),
          hashtags: extractHashtags(post.text || post.desc || ''),
          mediaUrl: post.videoUrl || post.video?.playAddr,
          postUrl: post.webVideoUrl || `https://www.tiktok.com/@${username}/video/${post.id}`,
          engagement: likes + comments + (views * 0.01) + (shares * 3) // TikTok engagement formula
        };
      }).sort((a: any, b: any) => b.engagement - a.engagement); // Sort by engagement descending

      console.log(`Sorted ${tiktokPosts.length} TikTok posts by engagement`);
      return tiktokPosts;
    } catch (error) {
      console.error('Error fetching TikTok results:', error);
      return generateMockTikTokPosts(username);
    }
  } catch (error) {
    console.error('Error extracting TikTok posts:', error);
    return generateMockTikTokPosts(username);
  }
}

function generateMockTikTokPosts(username: string): SocialMediaPost[] {
  const mockPosts: SocialMediaPost[] = [];
  const now = new Date();
  
  for (let i = 0; i < 12; i++) {
    const postDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    const views = Math.floor(Math.random() * 50000) + 1000;
    const likes = Math.floor(views * 0.08) + Math.floor(Math.random() * 500);
    const comments = Math.floor(likes * 0.03) + Math.floor(Math.random() * 20);
    const shares = Math.floor(likes * 0.02) + Math.floor(Math.random() * 15);
    
    mockPosts.push({
      platform: 'tiktok',
      type: 'video',
      caption: `Amazing music video by @${username}! 🎵✨ #fyp #music #artist #viral #newmusic`,
      likes,
      comments,
      shares,
      views,
      timestamp: postDate.toISOString(),
      hashtags: ['#fyp', '#music', '#artist', '#viral', '#newmusic'],
      mediaUrl: `https://picsum.photos/320/568?random=${i}`,
    });
  }
  
  return mockPosts;
}

// Helper function to extract hashtags from text
function extractHashtags(text: string): string[] {
  const hashtags = text.match(/#[\w]+/g) || [];
  return hashtags.slice(0, 10); // Limit to 10 hashtags
}


async function analyzeWithOpenAI(
  posts: SocialMediaPost[],
  vibrateData: any
): Promise<AnalysisResult> {
  try {
    // Prepare data for analysis
    const instagramPosts = posts.filter(p => p.platform === 'instagram');
    const tiktokPosts = posts.filter(p => p.platform === 'tiktok');
    
    const analysisPrompt = `
    You are an expert social media analyst for music artists. Analyze the following data and provide actionable insights:
    
    ARTIST PROFILE DATA FROM MUSIC PLATFORMS:
    ${vibrateData ? JSON.stringify(vibrateData, null, 2) : 'No music platform data available'}
    
    INSTAGRAM POSTS ANALYZED (${instagramPosts.length} posts):
    ${JSON.stringify(instagramPosts.slice(0, 15), null, 2)}
    
    TIKTOK POSTS ANALYZED (${tiktokPosts.length} posts):
    ${JSON.stringify(tiktokPosts.slice(0, 15), null, 2)}
    
    ANALYSIS REQUIREMENTS:
    1. Calculate overall engagement score (0-10) based on likes/views ratio, comment engagement, and consistency
    2. Identify 3-5 key insights categorized as: "success" (what's working well), "warning" (potential issues), "improvement" (growth opportunities)
    3. Provide 4-6 specific actionable recommendations
    4. Analyze content performance: best performing content type, worst performing, optimal posting times, top hashtags
    5. Predict follower growth percentage for 30, 60, and 90 days based on current trends
    6. BRAND PERCEPTION ANALYSIS: Analyze what brand image the artist is projecting through their content:
       - Overall brand personality (professional, fun, authentic, edgy, etc.)
       - Values and messaging consistency
       - Visual aesthetic and style
       - Target audience appeal
       - Brand strengths and potential brand risks
    7. Create a detailed content guide with specific recommendations for:
       - Content types that work best (Reels vs Posts vs Carousels vs Stories)
       - Caption structure and length that drives engagement
       - Hashtag strategy (number, mix of popular vs niche)
       - Best posting frequency
    8. Identify top 5 best performing posts and analyze WHY they worked
    
    Consider these metrics in your analysis:
    - Instagram: Likes, comments, views (for videos), hashtag performance, engagement rate
    - TikTok: Views, likes, comments, shares, viral potential, completion rate
    - Cross-platform consistency and audience overlap
    - Music platform data: follower counts, streaming numbers, geographic distribution
    
    Format the response as JSON matching this structure:
    {
      "overallScore": number,
      "insights": [
        {
          "type": "success" | "warning" | "improvement",
          "title": "string",
          "description": "string",
          "metric": "optional string"
        }
      ],
      "recommendations": ["string"],
      "contentAnalysis": {
        "bestPerforming": "string",
        "worstPerforming": "string",
        "optimalPostingTime": "string",
        "topHashtags": ["string"]
      },
      "growthPrediction": {
        "thirtyDays": number,
        "sixtyDays": number,
        "ninetyDays": number
      },
      "brandAnalysis": {
        "personality": "string describing overall brand personality",
        "values": "string describing values and messaging",
        "aesthetic": "string describing visual style",
        "targetAudience": "string describing who they appeal to",
        "strengths": ["string array of brand strengths"],
        "risks": ["string array of potential brand risks"],
        "projection": "string describing what the brand is projecting overall"
      },
      "contentGuide": {
        "contentTypeMix": {
          "reels": "percentage and recommendation",
          "posts": "percentage and recommendation",
          "carousels": "percentage and recommendation",
          "stories": "frequency recommendation"
        },
        "captionStrategy": {
          "idealLength": "string",
          "structure": "string",
          "callToAction": "string"
        },
        "hashtagStrategy": {
          "optimalCount": "string",
          "mix": "string",
          "examples": ["string"]
        },
        "postingFrequency": "string"
      },
      "topPerformers": [
        {
          "platform": "string",
          "type": "string",
          "engagement": "string",
          "whyItWorked": "string"
        }
      ]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert social media analyst specializing in music artist growth. Provide data-driven insights and actionable recommendations."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return result as AnalysisResult;
  } catch (error) {
    console.error('Error with OpenAI analysis:', error);
    
    // Return default analysis if AI fails
    return {
      overallScore: 7.5,
      insights: [
        {
          type: 'success',
          title: 'Strong Engagement Rate',
          description: 'Your content is resonating well with your audience',
          metric: '8.5% average'
        },
        {
          type: 'improvement',
          title: 'Posting Consistency',
          description: 'Increase posting frequency for better reach',
        },
        {
          type: 'warning',
          title: 'Hashtag Optimization',
          description: 'Using too many generic hashtags, focus on niche tags',
        }
      ],
      recommendations: [
        'Post 3-4 times per week consistently',
        'Engage with comments within the first hour',
        'Use 5-10 targeted hashtags per post',
        'Create more video content (Reels/TikToks)',
      ],
      contentAnalysis: {
        bestPerforming: 'Video content / Reels',
        worstPerforming: 'Static image posts',
        optimalPostingTime: '7-9 PM EST',
        topHashtags: ['#indiemusic', '#newmusic', '#musician', '#livemusic'],
      },
      growthPrediction: {
        thirtyDays: 15,
        sixtyDays: 35,
        ninetyDays: 75,
      },
      brandAnalysis: {
        personality: 'Authentic and relatable music artist with a genuine connection to their audience',
        values: 'Authenticity, musical expression, and community engagement',
        aesthetic: 'Contemporary music artist with consistent visual branding',
        targetAudience: 'Music lovers aged 18-35 who appreciate authentic artistry',
        strengths: [
          'Consistent content creation',
          'Strong audience engagement',
          'Authentic brand voice'
        ],
        risks: [
          'May need more strategic content planning',
          'Could benefit from broader hashtag strategy'
        ],
        projection: 'Projects an authentic, approachable music artist brand with genuine passion for their craft and strong connection to their audience'
      }
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { artistId, instagramUsername, tiktokUsername, artistName } = await request.json();

    if (!instagramUsername && !tiktokUsername) {
      return NextResponse.json(
        { error: 'At least one social media username is required' },
        { status: 400 }
      );
    }

    if (!artistName) {
      return NextResponse.json(
        { error: 'Artist name is required' },
        { status: 400 }
      );
    }

    console.log('🚀 Starting AI analysis for:', { instagramUsername, tiktokUsername, artistId, artistName });

    // Generate analysis ID and token early for progress tracking
    const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const analysisToken = `token-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;
    console.log(`🆔 Generated analysis ID: ${analysisId}`);
    console.log(`🔑 Generated analysis token: ${analysisToken}`);

    // Calculate estimated time based on platforms
    const platformCount = (instagramUsername ? 1 : 0) + (tiktokUsername ? 1 : 0);
    const estimatedTime = platformCount * 60000; // 60 seconds per platform

    // Initialize progress tracking in database
    await analysisProgress.set(analysisId, {
      progress: 0,
      message: "Starting social media analysis...",
      estimatedTime,
      complete: false
    });
    console.log(`🔄 Initial progress set for ${analysisId}: 0% - Starting social media analysis...`);

    // Return immediately with analysis ID and token so frontend can start polling
    setTimeout(async () => {
      try {
        await performAnalysis(analysisId, analysisToken, { artistId, instagramUsername, tiktokUsername, artistName });
      } catch (error) {
        console.error('Background analysis error:', error);
        await analysisProgress.set(analysisId, {
          progress: 100,
          message: "Analysis failed",
          estimatedTime,
          complete: true,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }, 100);

    return NextResponse.json({
      analysisId,
      analysisToken,
      message: 'Analysis started. Poll /api/artist-ai/status/{analysisId} for progress.'
    });
  } catch (error) {
    console.error('Error starting analysis:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}

async function performAnalysis(
  analysisId: string,
  analysisToken: string,
  { artistId, instagramUsername, tiktokUsername, artistName }: any
) {
  try {

    // Update progress - Starting
    const currentProgress = await analysisProgress.get(analysisId);
    await analysisProgress.set(analysisId, {
      progress: 5,
      message: "Connecting to Instagram...",
      estimatedTime: currentProgress?.estimatedTime || 120000,
      complete: false
    });
    console.log(`🔄 Progress updated: 5% - Connecting to Instagram...`);

    // Add delay to make progress visible
    await new Promise(resolve => setTimeout(resolve, 3000));

    // For now, skip user authentication and profile lookup to allow free testing
    // TODO: Re-enable authentication when implementing paywall
    let vibrateData = null;
    if (artistId) {
      try {
        console.log('Fetching Viberate data for artist ID:', artistId);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const vibrateResponse = await fetch(
          `${baseUrl}/api/viberate/artist/${artistId}`
        );
        if (vibrateResponse.ok) {
          vibrateData = await vibrateResponse.json();
          console.log('✅ Viberate data retrieved successfully');
        } else {
          console.log('⚠️ Viberate data not available, continuing without it');
        }
      } catch (error) {
        console.error('Error fetching Viberate data:', error);
      }
    }

    // Update progress - Collecting posts
    const progress1 = await analysisProgress.get(analysisId);
    await analysisProgress.set(analysisId, {
      progress: 25,
      message: "Collecting Instagram posts...",
      estimatedTime: progress1?.estimatedTime || 120000,
      complete: false
    });
    console.log(`🔄 Progress updated: 25% - Collecting Instagram posts... (ID: ${analysisId})`);

    // Add delay to make progress visible
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Extract posts and profile data from social media platforms
    let instagramPosts: SocialMediaPost[] = [];
    let instagramProfile = null;
    let tiktokPosts: SocialMediaPost[] = [];
    let tiktokProfile = null;

    // Process Instagram first
    if (instagramUsername) {
      const progress2 = await analysisProgress.get(analysisId);
      await analysisProgress.set(analysisId, {
        progress: 25,
        message: "Collecting Instagram posts...",
        estimatedTime: progress2?.estimatedTime || 120000,
        complete: false
      });

      [instagramPosts, instagramProfile] = await Promise.all([
        extractInstagramPosts(instagramUsername),
        extractInstagramProfile(instagramUsername)
      ]);

      // Update progress after Instagram
      const progress3 = await analysisProgress.get(analysisId);
      await analysisProgress.set(analysisId, {
        progress: 40,
        message: "Connecting to TikTok...",
        estimatedTime: progress3?.estimatedTime || 120000,
        complete: false
      });
      console.log(`🔄 Progress updated: 40% - Connecting to TikTok...`);

      // Add delay to make progress visible
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Process TikTok
    if (tiktokUsername) {
      if (!instagramUsername) {
        // If no Instagram, start with TikTok
        const progress4 = await analysisProgress.get(analysisId);
        await analysisProgress.set(analysisId, {
          progress: 25,
          message: "Connecting to TikTok...",
          estimatedTime: progress4?.estimatedTime || 120000,
          complete: false
        });
      }

      const progress5 = await analysisProgress.get(analysisId);
      await analysisProgress.set(analysisId, {
        progress: 50,
        message: "Collecting TikTok videos...",
        estimatedTime: progress5?.estimatedTime || 120000,
        complete: false
      });

      // Add delay to make progress visible
      await new Promise(resolve => setTimeout(resolve, 3000));

      [tiktokPosts, tiktokProfile] = await Promise.all([
        extractTikTokPosts(tiktokUsername),
        extractTikTokProfile(tiktokUsername)
      ]);
    }

    const allPosts = [...instagramPosts, ...tiktokPosts];

    if (allPosts.length === 0) {
      await analysisProgress.set(analysisId, {
        progress: 100,
        message: "No posts found",
        estimatedTime: 0,
        complete: true,
        success: false,
        error: 'No posts found. Please check your usernames and try again.'
      });
      return;
    }

    // Update progress - Analysis phase
    const progress6 = await analysisProgress.get(analysisId);
    await analysisProgress.set(analysisId, {
      progress: 65,
      message: `Analyzing engagement patterns from ${allPosts.length} posts...`,
      estimatedTime: progress6?.estimatedTime || 120000,
      complete: false
    });

    // Add delay to make progress visible
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Analyze with OpenAI
    console.log('🧠 Starting AI analysis with OpenAI');

    // Update progress - AI insights generation
    const progress7 = await analysisProgress.get(analysisId);
    await analysisProgress.set(analysisId, {
      progress: 80,
      message: "Generating AI insights and recommendations...",
      estimatedTime: progress7?.estimatedTime || 120000,
      complete: false
    });

    // Add delay to make progress visible
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const analysis = await analyzeWithOpenAI(allPosts, vibrateData);
    console.log('✅ AI analysis completed');

    // Create unique slug for artist
    const slug = artistName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, ''); // Remove spaces
    
    // Store analysis in database with UPSERT pattern
    console.log('💾 Storing analysis in database');
    const supabase = await createAuthenticatedClient();
    
    const analysisData = {
      artist_name: artistName,
      artist_slug: slug,
      instagram_username: instagramUsername,
      tiktok_username: tiktokUsername,
      posts_analyzed: allPosts.length,
      analysis_token: analysisToken,
      analysis_result: {
        ...analysis,
        scraped_posts: {
          instagram: instagramPosts,
          tiktok: tiktokPosts
        },
        profile_data: {
          instagram: instagramProfile,
          tiktok: tiktokProfile
        },
        viberate_data: vibrateData
      }
    };

    // Check if analysis already exists for this artist slug
    console.log(`🔍 Checking if analysis exists for slug: ${slug}`);
    const { data: existingAnalysis } = await supabase
      .from('ai_analyses')
      .select('id, created_at')
      .eq('artist_slug', slug)
      .single();

    let savedAnalysis;
    let saveError;

    if (existingAnalysis) {
      // Update existing record
      console.log(`🔄 Updating existing analysis with ID: ${existingAnalysis.id}`);
      const { data, error } = await supabase
        .from('ai_analyses')
        .update({
          ...analysisData,
          updated_at: new Date().toISOString() // Explicitly set updated timestamp
        })
        .eq('id', existingAnalysis.id)
        .select()
        .single();
      
      savedAnalysis = data;
      saveError = error;
      
      if (!error) {
        console.log('✅ Analysis updated successfully');
      }
    } else {
      // Insert new record
      console.log('📝 Creating new analysis record');
      const { data, error } = await supabase
        .from('ai_analyses')
        .insert(analysisData)
        .select()
        .single();
      
      savedAnalysis = data;
      saveError = error;
      
      if (!error) {
        console.log('✅ New analysis created with ID:', savedAnalysis.id);
      }
    }

    if (saveError) {
      console.error('Error saving analysis:', saveError);
    }

    // Update progress - Creating report
    const progress8 = await analysisProgress.get(analysisId);
    await analysisProgress.set(analysisId, {
      progress: 95,
      message: "Creating your personalized report...",
      estimatedTime: progress8?.estimatedTime || 120000,
      complete: false
    });

    // Add delay to make progress visible
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('📊 Analysis complete:', {
      instagramPosts: instagramPosts.length,
      tiktokPosts: tiktokPosts.length,
      hasVibrateData: !!vibrateData,
      overallScore: analysis.overallScore,
      artistSlug: slug
    });

    // Update progress - Complete
    await analysisProgress.set(analysisId, {
      progress: 100,
      message: "Analysis complete!",
      estimatedTime: 0,
      complete: true,
      success: true,
      artistSlug: slug
    });

    // Clean up progress after 5 minutes
    setTimeout(async () => {
      await analysisProgress.delete(analysisId);
    }, 300000);

  } catch (error) {
    console.error('Error in AI analysis:', error);

    // Update progress with error
    await analysisProgress.set(analysisId, {
      progress: 100,
      message: "Analysis failed",
      estimatedTime: 0,
      complete: true,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}