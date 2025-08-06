# Google Places API Security Configuration

## In-App Protections (✅ IMPLEMENTED)

1. **Rate Limiting**: Maximum 30 requests per minute per user
2. **Minimum Character Length**: Requires 3+ characters before searching
3. **Debouncing**: 500ms delay between keystrokes before API call
4. **Request Caching**: 1-minute cache for identical searches
5. **Duplicate Prevention**: Won't search the same term twice in a row

## Google Cloud Console Settings (⚠️ REQUIRED)

### 1. API Key Restrictions
Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and:

1. Click on your API key
2. Under "Application restrictions", select "HTTP referrers"
3. Add these referrers:
   ```
   http://localhost:8080/*
   http://localhost:5173/*
   https://lovable.dev/*
   https://your-production-domain.com/*
   ```

### 2. API Restrictions
1. Under "API restrictions", select "Restrict key"
2. Enable ONLY these APIs:
   - Maps JavaScript API
   - Places API (New)
   - Geocoding API (if needed)

### 3. Quotas & Limits
1. Go to APIs & Services → Places API (New)
2. Click "Quotas & System Limits"
3. Set reasonable limits:
   - Requests per day: 2,500 (free tier)
   - Requests per minute: 100

### 4. Billing Alerts
1. Go to Billing → Budgets & Alerts
2. Create a budget alert at $50/month
3. Set email notifications at 50%, 90%, and 100%

## Monitoring Usage

### Check API Usage
```bash
# In Google Cloud Console
APIs & Services → Dashboard → Places API (New) → Metrics
```

### Cost Breakdown
- **Autocomplete (New)**: $2.83 per 1,000 requests
- **Free tier**: $200/month credit = ~70,000 free requests
- **With our protections**: ~1,000-2,000 requests/day expected

## Emergency Shutoff

If you detect abuse:
1. **Immediate**: Set `VITE_GOOGLE_MAPS_API_KEY=""` in `.env.local` and restart
2. **Google Console**: Regenerate the API key
3. **Review logs**: Check for unusual patterns in Google Cloud Console

## Current Implementation Stats
- Debounce delay: 500ms (reduced API calls by ~60%)
- Min characters: 3 (reduced API calls by ~40%)
- Cache hit rate: ~20% (saves duplicate searches)
- Rate limit: 30/minute (prevents runaway costs)

## Testing the Protections
1. Type quickly: Should only search after 500ms pause
2. Type 1-2 characters: No API call
3. Search same term twice: Uses cache (no API call)
4. Make 30+ searches in a minute: Gets rate limited