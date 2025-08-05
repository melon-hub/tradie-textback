import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const GooglePlacesAutocomplete = ({
  value,
  onChange,
  placeholder = "Enter address or suburb",
  className,
  disabled = false
}: GooglePlacesAutocompleteProps) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Initialize Google Places API (New API only)
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  useEffect(() => {
    // Load Google Maps API if not already loaded
    const loadGoogleMaps = async () => {
      // Check if API key is available
      if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
        setError('Google Maps API key not configured');
        return;
      }

      try {
        if (typeof google !== 'undefined' && google.maps && google.maps.places) {
          setIsApiLoaded(true);
          setError('');
          return;
        }

        // Check if script is already loading
        if (document.querySelector('script[src*="maps.googleapis.com"]')) {
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          try {
            if (google?.maps?.places) {
              setIsApiLoaded(true);
              setError('');
            } else {
              setError('Google Places API not available');
            }
          } catch (err) {
            console.error('Error initializing Google Places:', err);
            setError('Failed to initialize Google Places');
          }
        };
        
        script.onerror = () => {
          setError('Failed to load Google Maps API');
        };
        
        document.head.appendChild(script);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Error loading Google Maps');
      }
    };

    loadGoogleMaps();
  }, []);

  // Close predictions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowPredictions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPredictions = async (input: string) => {
    if (!input.trim() || !isApiLoaded) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Use only the new Places API
      if (google?.maps?.places?.AutocompleteSuggestion) {
        const request = {
          input,
          includedRegionCodes: ['au'],
          includedPrimaryTypes: ['street_address', 'route', 'sublocality', 'locality'],
        };

        const { suggestions } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        
        if (suggestions && suggestions.length > 0) {
          const convertedPredictions = suggestions.map((suggestion: any) => ({
            place_id: suggestion.placePrediction?.placeId || '',
            description: suggestion.placePrediction?.text?.text || '',
            structured_formatting: {
              main_text: suggestion.placePrediction?.structuredFormat?.mainText?.text || '',
              secondary_text: suggestion.placePrediction?.structuredFormat?.secondaryText?.text || '',
            },
          }));
          
          setPredictions(convertedPredictions);
          setShowPredictions(true);
          setError('');
        } else {
          setPredictions([]);
          setShowPredictions(false);
        }
      } else {
        setError('New Places API not available');
        setPredictions([]);
        setShowPredictions(false);
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching predictions:', error);
      setLoading(false);
      setPredictions([]);
      setError('Network error occurred');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the API call
    timeoutRef.current = setTimeout(() => {
      fetchPredictions(newValue);
    }, 300);
  };

  const handlePredictionSelect = (prediction: Prediction) => {
    setShowPredictions(false);
    // Use the prediction description directly to avoid deprecated PlacesService
    onChange(prediction.description);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowPredictions(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value && fetchPredictions(value)}
          placeholder={placeholder}
          className={cn("pl-9", className)}
          disabled={disabled}
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <MapPin className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Predictions Dropdown */}
      {showPredictions && predictions.length > 0 && (
        <div className="absolute z-50 w-[160%] sm:w-[200%] lg:w-[250%] mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {predictions.map((prediction, index) => (
            <button
              key={prediction.place_id || index}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
              onClick={() => handlePredictionSelect(prediction)}
            >
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  {/* Show full description on mobile/tablet, structured on desktop */}
                  <div className="block sm:hidden">
                    <div className="font-medium text-sm text-gray-900 whitespace-normal break-words">
                      {prediction.description}
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {prediction.structured_formatting?.main_text || prediction.description}
                    </div>
                    {prediction.structured_formatting?.secondary_text && (
                      <div className="text-xs text-gray-500 truncate">
                        {prediction.structured_formatting.secondary_text}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error Messages */}
      {error && (
        <div className="absolute z-50 w-full mt-1 bg-red-50 border border-red-200 rounded-md p-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GooglePlacesAutocomplete;