# 🚀 Apify Integration for Social Media Scraping

This document explains how the AI funnel uses Apify to scrape Instagram and TikTok data for comprehensive social media analysis.

## 📊 What Data We Extract

### **Instagram Data (via `apify/instagram-profile-scraper`)**
- **Post Metrics**: Likes, comments, views (for videos)
- **Content Types**: Photos, videos, reels, stories
- **Post Metadata**: Captions, hashtags, timestamps
- **Media URLs**: Image/video URLs for content analysis
- **Engagement Patterns**: Like-to-view ratios, comment engagement

**Sample Instagram Post Data:**
```json
{
  "platform": "instagram",
  "type": "reel",
  "caption": "New music video out now! 🎵 #newmusic #artist #viral",
  "likes": 1250,
  "comments": 45,
  "views": 8900,
  "timestamp": "2025-01-14T10:30:00.000Z",
  "hashtags": ["#newmusic", "#artist", "#viral"],
  "mediaUrl": "https://instagram.com/p/xyz/media"
}
```

### **TikTok Data (via `clockworks/free-tiktok-scraper`)**
- **Video Metrics**: Views, likes, comments, shares
- **Content Analysis**: Video descriptions, hashtags, audio tracks
- **Viral Indicators**: Share counts, view velocity
- **Engagement Rates**: Like/view ratios, comment/view ratios
- **Trend Analysis**: Hashtag performance, content themes

**Sample TikTok Post Data:**
```json
{
  "platform": "tiktok",
  "type": "video",
  "caption": "Behind the scenes of my latest track 🎶 #fyp #music #bts",
  "likes": 850,
  "comments": 32,
  "shares": 28,
  "views": 12500,
  "timestamp": "2025-01-14T15:45:00.000Z",
  "hashtags": ["#fyp", "#music", "#bts"],
  "mediaUrl": "https://tiktok.com/@user/video/123456"
}
```

### **Viberate Music Platform Data**
- **Artist Profile**: Name, bio, genre, country, verification status
- **Streaming Metrics**: Monthly listeners, track plays, playlist adds
- **Fanbase Analytics**: Follower growth, demographic breakdown
- **Geographic Data**: Fan distribution by country/city
- **Platform Performance**: Spotify, Apple Music, YouTube Music stats
- **Track Analytics**: Individual song performance metrics

## 🔧 Technical Implementation

### **Environment Variables Required**
```bash
# Apify Configuration
APIFY_TOKEN=your_apify_token_here

# Apify Actor Selection (Optional - defaults provided)
INSTAGRAM_ACTOR_ID=apify/instagram-profile-scraper
TIKTOK_ACTOR_ID=clockworks/free-tiktok-scraper

# OpenAI for Analysis
OPENAI_API_KEY=your_openai_key_here

# Viberate Integration
VIBERATE_API_KEY=your_viberate_key_here
```

### **Apify Actor Selection Strategy**

The app uses **configurable actor IDs** with sensible defaults:

#### **How Actors Are Selected:**
1. **Environment Variable Check**: Looks for `INSTAGRAM_ACTOR_ID` and `TIKTOK_ACTOR_ID`
2. **Default Fallback**: Uses proven actors if no custom ones specified
3. **Runtime Logging**: Logs which actor is being used for debugging

#### **Default Actors Used:**

1. **Instagram Scraper** (`apify/instagram-scraper`)
   - **Official Apify Actor**: Maintained by Apify team  
   - **Proven Reliability**: Battle-tested and well-documented
   - **Features**: Extracts up to 30 recent posts per user
   - **Data**: Likes, comments, views, hashtags, timestamps
   - **Rate Limits**: Respects Instagram's API limits
   - **Input Format**: `{ "usernames": ["username"], "resultsLimit": 30, "resultsType": "posts" }`

2. **TikTok Scraper** (`clockworks/free-tiktok-scraper`)
   - **Community Actor**: Created by Clockworks team
   - **Free Tier Available**: Basic usage included
   - **Features**: Scrapes up to 30 recent videos per profile
   - **Data**: Views, likes, comments, shares, video metadata
   - **Reliability**: Uses proxy rotation for stability
   - **Input Format**: `{ "profiles": ["@username"], "resultsPerPage": 30, "proxyCountryCode": "US" }`

#### **Alternative Actors You Can Use:**

**Instagram Options:**
- `apify/instagram-scraper` - More comprehensive but paid
- `drobnikj/crawler-google-places` - For location-based content

**TikTok Options:**
- `clockworks/tiktok-scraper` - Premium version with more features
- `useful-tools/tiktok-scraper` - Alternative community option

#### **How to Change Actors:**

1. **Find Alternative Actor**: Browse [Apify Store](https://apify.com/store) for social media scrapers
2. **Check Compatibility**: Ensure output format matches expected data structure  
3. **Update Environment**: Add actor ID to your `.env.local`:
   ```bash
   INSTAGRAM_ACTOR_ID=your/chosen-instagram-actor
   TIKTOK_ACTOR_ID=your/chosen-tiktok-actor
   ```
4. **Test Data Format**: Verify the actor returns compatible JSON structure
5. **Update Data Mapping**: Modify data transformation if needed

#### **Actor Selection Logic:**
```typescript
// Default actors with environment override capability
const INSTAGRAM_ACTOR_ID = process.env.INSTAGRAM_ACTOR_ID || 'apify/instagram-scraper';
const TIKTOK_ACTOR_ID = process.env.TIKTOK_ACTOR_ID || 'clockworks/free-tiktok-scraper';
```

#### **CRITICAL: Authentication & API Endpoints**

**✅ CORRECT IMPLEMENTATION:**
```typescript
// Use Bearer token authentication (NOT query parameters)
const runResponse = await fetch(
  `${APIFY_BASE_URL}/acts/${actorId}/runs`,
  {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${APIFY_TOKEN}`  // ✅ CORRECT
    },
    body: JSON.stringify(runInput),
  }
);

// Check status using correct endpoint
const statusResponse = await fetch(
  `${APIFY_BASE_URL}/actor-runs/${runId}`,  // ✅ CORRECT
  {
    headers: {
      'Authorization': `Bearer ${APIFY_TOKEN}`
    }
  }
);

// Get results using correct endpoint
const resultsResponse = await fetch(
  `${APIFY_BASE_URL}/datasets/${datasetId}/items`,  // ✅ CORRECT
  {
    headers: {
      'Authorization': `Bearer ${APIFY_TOKEN}`
    }
  }
);
```

**❌ WRONG IMPLEMENTATION (Previous Code):**
```typescript
// Wrong: Using query parameters instead of headers
fetch(`${APIFY_BASE_URL}/acts/${actorId}/runs?token=${APIFY_TOKEN}`)

// Wrong: Using old endpoint format
fetch(`${APIFY_BASE_URL}/acts/${actorId}/runs/${runId}?token=${APIFY_TOKEN}`)
```

### **Data Flow**
```mermaid
graph TD
    A[User enters social handles] --> B[Start Apify scrapers]
    B --> C[Instagram Profile Scraper]
    B --> D[TikTok Profile Scraper]
    C --> E[Extract post metrics]
    D --> F[Extract video metrics]
    E --> G[Combine with Viberate data]
    F --> G
    G --> H[OpenAI Analysis]
    H --> I[Generate insights & recommendations]
    I --> J[Store in database]
    J --> K[Display results to user]
```

## 📈 Analysis Features

### **Engagement Scoring**
- **Instagram**: Likes + Comments per post / Follower count
- **TikTok**: (Views + Likes + Shares) / Average for account
- **Cross-platform**: Consistency across platforms
- **Trending**: Hashtag performance and viral potential

### **Content Performance Analysis**
- **Best Performing**: Content types with highest engagement
- **Worst Performing**: Content types needing improvement
- **Optimal Timing**: Best posting times based on engagement patterns
- **Hashtag Strategy**: Most effective hashtags for reach

### **Growth Predictions**
Using machine learning analysis of:
- Historical posting frequency
- Engagement trend patterns
- Follower growth velocity
- Content type performance
- Cross-platform synergies

## 🛡️ Error Handling & Fallbacks

### **Robust Error Management**
- **API Failures**: Graceful fallback to mock data
- **Rate Limiting**: Automatic retry with exponential backoff
- **Timeout Handling**: 2-minute maximum wait per platform
- **Data Validation**: Clean and validate all scraped data

### **Mock Data Generation**
When Apify is unavailable:
- Generates realistic engagement metrics
- Creates proper hashtag distributions
- Maintains consistent data structure
- Ensures analysis can still provide value

## 🚨 Rate Limits & Costs

### **Apify Usage Limits**
- **Instagram**: ~1,000 requests/month on free tier
- **TikTok**: ~500 requests/month on free tier
- **Concurrent Runs**: Max 2 simultaneous scrapers

### **Cost Optimization**
- Only scrape when analysis is requested
- Cache results for 24 hours to avoid duplicate scraping
- Use efficient actor configurations
- Implement smart retry logic to avoid wasted runs

## 📋 Data Privacy & Compliance

### **Privacy Measures**
- Only scrape publicly available content
- No personal data collection
- Respect platform terms of service
- Automatic data cleanup after analysis

### **GDPR Compliance**
- User consent for data processing
- Right to deletion implementation
- Data minimization practices
- Transparent data usage policies

## 🔮 Future Enhancements

### **Planned Features**
- **YouTube Integration**: Add YouTube channel analysis
- **Historical Tracking**: Store data for trend analysis over time
- **Competitor Analysis**: Compare against similar artists
- **Content Recommendations**: AI-suggested content strategies
- **Automated Reporting**: Weekly/monthly insight emails

### **Advanced Analytics**
- **Sentiment Analysis**: Analyze comment sentiment
- **Visual Recognition**: Content type classification using AI
- **Trend Prediction**: Predict viral content opportunities
- **Audience Insights**: Deep demographic analysis

---

## 🛠️ Setup Instructions

1. **Get Apify Token**: Sign up at [apify.com](https://apify.com) and get your API token
2. **Add Environment Variables**: Set `APIFY_TOKEN` in your environment
3. **Test Integration**: Use the mock data mode first to test the flow
4. **Go Live**: Enable real scraping with your Apify token

The system automatically falls back to mock data if Apify is unavailable, ensuring the user experience remains smooth!