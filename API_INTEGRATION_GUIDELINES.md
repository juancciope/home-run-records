# 🚨 CRITICAL API INTEGRATION GUIDELINES

## ❌ **NEVER BREAK WORKING APIS - PERMANENT RULES**

### **🔴 RULE 1: RESEARCH BEFORE CHANGING**
- **Always check existing API calls in the app before modifying**
- Look for successful patterns in the codebase
- Test changes on NEW endpoints, not existing ones
- If an API endpoint works, understand WHY before changing

### **🔴 RULE 2: VIBERATE API INTEGRATION CHECKLIST**

#### **✅ CORRECT Viberate Usage Pattern:**
```typescript
// Environment Variables Required
const VIBERATE_API_KEY = process.env.VIBERATE_API_KEY;
const VIBERATE_BASE_URL = 'https://data.viberate.com/api/v1';

// CORRECT API Call Pattern
const response = await fetch(`${VIBERATE_BASE_URL}/artist/${uuid}`, {
  headers: {
    'Access-Key': VIBERATE_API_KEY,  // NOTE: 'Access-Key' NOT 'Authorization'
    'Accept': 'application/json',
  }
});
```

#### **❌ COMMON VIBERATE MISTAKES TO AVOID:**
- Using `Authorization: Bearer ${token}` (WRONG - use `Access-Key`)
- Using `undefined/api/...` URLs (missing `NEXT_PUBLIC_APP_URL`)
- Changing working endpoint patterns without testing
- Using different base URLs than what's working

#### **🔧 VIBERATE URL CONSTRUCTION:**
```typescript
// For internal API calls within the app
const vibrateResponse = await fetch(
  `${process.env.NEXT_PUBLIC_APP_URL}/api/viberate/artist/${artistId}`
);

// For direct Viberate API calls  
const response = await fetch(
  `${VIBERATE_BASE_URL}/artist/${uuid}`,
  { headers: { 'Access-Key': VIBERATE_API_KEY } }
);
```

### **🔴 RULE 3: APIFY ACTOR VERIFICATION CHECKLIST**

#### **✅ BEFORE USING ANY APIFY ACTOR:**
1. **Verify actor exists**: Check on [Apify Store](https://apify.com/store)
2. **Read documentation**: Check input schema and examples
3. **Use exact actor IDs**: Don't assume or guess actor names
4. **Test input format**: Match documentation exactly

#### **📋 CURRENT VERIFIED ACTORS:**
```typescript
// Instagram Post Scraper (apify/instagram-post-scraper)
const instagramInput = {
  username: [username],      // Array of usernames
  resultsLimit: 30,          // Number of posts to fetch
};

// TikTok Scraper (clockworks/tiktok-scraper)  
const tiktokInput = {
  profiles: [`https://www.tiktok.com/@${username}`],  // Full URLs required
  resultsPerPage: 30,        // Number of results per page
  shouldDownloadVideos: false,
  shouldDownloadCovers: false,
};
```

### **🔴 RULE 4: ENVIRONMENT VARIABLE REQUIREMENTS**

#### **✅ REQUIRED ENVIRONMENT VARIABLES:**
```bash
# Apify Configuration
APIFY_TOKEN=your_apify_token_here

# Viberate API
VIBERATE_API_KEY=your_viberate_key_here

# App URL (CRITICAL - prevents undefined URLs)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or production URL

# OpenAI
OPENAI_API_KEY=your_openai_key_here

# Optional Actor Overrides
INSTAGRAM_ACTOR_ID=apify/instagram-post-scraper
TIKTOK_ACTOR_ID=clockworks/tiktok-scraper
```

#### **❌ COMMON ENVIRONMENT MISTAKES:**
- Missing `NEXT_PUBLIC_APP_URL` (causes "undefined/api/..." errors)
- Wrong variable names (check existing .env files)
- Missing required tokens

### **🔴 RULE 5: ERROR HANDLING PATTERNS**

#### **✅ PROPER ERROR HANDLING:**
```typescript
try {
  const response = await fetch(apiUrl, config);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API call failed:', response.status, errorText);
    return fallbackData; // Always provide fallback
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('API error:', error);
  return fallbackData; // Never break the user experience
}
```

### **🔴 RULE 6: APIFY API CALL STRUCTURE**

#### **✅ CORRECT Apify API Pattern:**
```typescript
// 1. Start the actor
const runResponse = await fetch(
  `${APIFY_BASE_URL}/acts/${actorId}/runs?token=${APIFY_TOKEN}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(runInput),
  }
);

// 2. Wait for completion
const run = await runResponse.json();
const runId = run.data.id;

// 3. Poll for status
let status = 'RUNNING';
while (status === 'RUNNING' || status === 'READY') {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const statusResponse = await fetch(
    `${APIFY_BASE_URL}/acts/${actorId}/runs/${runId}?token=${APIFY_TOKEN}`
  );
  const statusData = await statusResponse.json();
  status = statusData.data.status;
}

// 4. Get results
const resultsResponse = await fetch(
  `${APIFY_BASE_URL}/datasets/${run.data.defaultDatasetId}/items?token=${APIFY_TOKEN}`
);
const results = await resultsResponse.json();
```

## 🔍 **DEBUGGING CHECKLIST**

### **When APIs Fail, Check:**
1. ✅ Environment variables are set correctly
2. ✅ API endpoints match working patterns in codebase
3. ✅ Headers match documentation exactly
4. ✅ Input parameters match actor documentation
5. ✅ URLs are properly constructed (no "undefined")
6. ✅ Error handling provides fallbacks

### **Logging Best Practices:**
```typescript
console.log('🚀 Starting API call to:', apiUrl);
console.log('📤 Request payload:', payload);
console.log('✅ Response status:', response.status);
console.log('📥 Response data:', data);
console.error('❌ API error:', error);
```

## 📚 **REFERENCE LINKS**

- [Apify API Documentation](https://docs.apify.com/api/v2)
- [Viberate API Documentation](https://developers.viberate.com/)
- [Instagram Post Scraper](https://apify.com/apify/instagram-post-scraper)
- [TikTok Scraper](https://apify.com/clockworks/tiktok-scraper)

## 🎯 **QUICK REFERENCE**

### **Working Viberate Pattern:**
```typescript
const response = await fetch(`${VIBERATE_BASE_URL}/artist/${uuid}`, {
  headers: { 'Access-Key': VIBERATE_API_KEY }
});
```

### **Working Apify Instagram Pattern:**
```typescript
const runInput = {
  username: [username],
  resultsLimit: 30,
};
```

### **Working Apify TikTok Pattern:**
```typescript
const runInput = {
  profiles: [`https://www.tiktok.com/@${username}`],
  resultsPerPage: 30,
};
```

---

## ⚠️ **FINAL WARNING**

**NEVER modify working API integrations without:**
1. Understanding the current working pattern
2. Testing changes thoroughly
3. Providing proper fallbacks
4. Checking all environment variables

**Breaking working integrations wastes time and frustrates users. Always research first.**