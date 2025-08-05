# Google Places Autocomplete Setup

## Overview
The application now includes Google Places Autocomplete for location fields, providing intelligent address suggestions for Australian locations.

## Features
- **Smart address completion**: As users type, see relevant Australian address suggestions
- **Accurate location data**: Google Places provides formatted addresses with proper structure
- **Mobile optimized**: Touch-friendly interface with proper spacing
- **Fallback support**: Works without API key (shows warning but allows manual entry)
- **Australia-focused**: Restricted to Australian addresses only

## Setup Instructions

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the "Places API" for your project
4. Create an API key in Credentials section
5. Restrict the API key to your domains for security

### 2. Configure Environment Variables
Add to your `.env.local` file:
```bash
VITE_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
```

### 3. API Restrictions (Recommended)
In Google Cloud Console, restrict your API key:
- **Application restrictions**: HTTP referrers
- **Allowed referrers**: 
  - `localhost:8080/*` (for development)
  - `your-domain.com/*` (for production)
- **API restrictions**: Places API only

## Implementation Details

### Components
- **`GooglePlacesAutocomplete.tsx`**: Main autocomplete component
- Used in:
  - `JobCard.tsx`: Location editing in job details
  - `Intake.tsx`: Address/suburb field in job creation

### Features
- 300ms debounced API calls to reduce quota usage
- Australian address filtering (`componentRestrictions: { country: 'au' }`)
- Loading states with spinner
- Keyboard navigation (Escape to close)
- Click outside to close dropdown
- Formatted address selection with place details

### Error Handling
- Graceful fallback when API key missing
- Network error handling
- Invalid response handling
- Quota exceeded handling

## Cost Considerations
- **Autocomplete Requests**: Charged per request
- **Place Details**: Additional charge when user selects suggestion
- **Daily quotas**: Set appropriate limits in Google Cloud Console
- **Monitoring**: Use Google Cloud Console to track usage

## Testing
1. Without API key: Should show warning but allow manual entry
2. With API key: Should show Australian address suggestions
3. Network issues: Should handle gracefully
4. Mobile: Should work with touch interface

## Troubleshooting

### No suggestions appearing
- Check API key is correct in `.env.local`
- Verify Places API is enabled in Google Cloud Console
- Check browser console for error messages
- Confirm API key restrictions allow your domain

### "This API project is not authorized" error
- API key restrictions are too strict
- Add your domain/localhost to allowed referrers
- Check API key has Places API enabled

### Quota exceeded
- Check usage in Google Cloud Console
- Consider increasing quotas or implementing caching
- Add daily/monthly limits to prevent unexpected charges

## Security Notes
- Never commit API keys to version control
- Use domain restrictions on API keys
- Monitor usage regularly
- Set appropriate quotas and billing alerts
- The API key is exposed in client-side code (normal for this use case)