# Google Maps Integration Guide

<!-- Created: 2025-08-05 - Google Places Autocomplete implementation -->

## Overview

The TradieText application uses Google Places Autocomplete API to help users enter accurate Australian addresses. This improves data quality and user experience by providing address suggestions as users type.

## Features

- Address autocomplete for job locations
- Australia-specific results filtering
- Mobile-responsive dropdown interface
- Fallback to legacy API for compatibility
- TypeScript type definitions

## Implementation

### Component: `GooglePlacesAutocomplete.tsx`

Located at: `src/components/GooglePlacesAutocomplete.tsx`

Key features:
- Uses new Google Places API (AutocompleteSuggestion)
- Falls back to legacy AutocompleteService if needed
- Filters results to Australian addresses only
- Debounced input for performance
- Accessible keyboard navigation

### Usage

The component is integrated in two main locations:

1. **Intake Form** (`src/pages/Intake.tsx`)
   - Used for initial job submission
   - Replaces text input for address field

2. **Job Card Edit** (`src/pages/JobCard.tsx`)
   - Used when editing job location
   - Available for clients updating their job details

### Configuration

1. **API Key Setup**
   ```bash
   # In .env.local
   VITE_GOOGLE_MAPS_API_KEY=your-api-key-here
   ```

2. **Google Cloud Console**
   - Enable "Places API"
   - Set application restrictions to "Websites"
   - Add authorized domains

3. **TypeScript Types**
   - Custom types in `src/types/google-maps.d.ts`
   - Extends Window interface for Google Maps

## API Costs

Google Places Autocomplete pricing (as of 2025):
- **Free tier**: First 28,500 requests/month
- **Paid tier**: $2.83 per 1,000 requests

For a small business, the free tier is typically sufficient.

## Security Considerations

### Bot Protection
1. **API Key Restrictions**
   - Restrict to specific domains
   - Enable only required APIs
   - Monitor usage in Google Cloud Console

2. **Rate Limiting**
   - Component includes debouncing (300ms)
   - Consider backend rate limiting for production

3. **Cost Protection**
   - Set up billing alerts
   - Use quotas in Google Cloud Console
   - Monitor daily usage

### Implementation Notes

1. **Deprecation Handling**
   - New API: `AutocompleteSuggestion.fetchAutocompleteSuggestions`
   - Old API: `AutocompleteService` (deprecated but functional)
   - Component handles both gracefully

2. **Postcode Display**
   - Some addresses may not include postcodes
   - This is Google's data limitation
   - Users can manually add if needed

3. **Mobile Optimization**
   - Dropdown width increases on smaller screens
   - Touch-friendly result items
   - Proper z-index for overlay

## Troubleshooting

### "Google Places API not available"
- Check API key is set in environment
- Verify Places API is enabled in Google Cloud
- Check browser console for specific errors

### Deprecation Warnings
- Normal when using legacy fallback
- Does not affect functionality
- Will be resolved as Google updates their APIs

### No Results Showing
- Verify Australia region filtering isn't too restrictive
- Check network tab for API responses
- Ensure API key has proper permissions

## Future Enhancements

1. **Address Validation**
   - Verify complete address with postcode
   - Integrate with Australia Post API

2. **Location Services**
   - Add "Use Current Location" option
   - Calculate distances for job routing

3. **Caching**
   - Cache frequent searches
   - Reduce API calls for common addresses

## Related Documentation

- [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service)
- [Billing & Pricing](https://developers.google.com/maps/billing-and-pricing/pricing)
- [Security Best Practices](https://developers.google.com/maps/api-security-best-practices)