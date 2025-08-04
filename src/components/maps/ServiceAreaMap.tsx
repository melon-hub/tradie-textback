import React, { useEffect, useRef } from 'react';

interface ServiceAreaMapProps {
  centerAddress: string;
  radiusKm: number;
  className?: string;
}

export default function ServiceAreaMap({ 
  centerAddress, 
  radiusKm, 
  className = '' 
}: ServiceAreaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);

  // Load Google Maps script
  useEffect(() => {
    // Check if Google Maps API key is available
    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!googleMapsApiKey || googleMapsApiKey === 'your-google-maps-api-key-here') {
      console.warn('Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
      return;
    }

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        console.error('Failed to load Google Maps script. Please check your API key and network connection.');
      };
      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google || !window.google.maps) return;

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: -33.8688, lng: 151.2093 }, // Default to Sydney
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      });

      mapInstanceRef.current = map;

      // Geocode the address to get coordinates
      geocodeAddress(centerAddress, map);
    };

    const geocodeAddress = (address: string, map: any) => {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          
          // Center the map on the location
          map.setCenter(location);
          
          // Remove existing marker if any
          if (markerRef.current) {
            markerRef.current.setMap(null);
          }
          
          // Add marker
          markerRef.current = new window.google.maps.Marker({
            position: location,
            map: map,
            title: centerAddress,
          });
          
          // Remove existing circle if any
          if (circleRef.current) {
            circleRef.current.setMap(null);
          }
          
          // Add circle for service area
          circleRef.current = new window.google.maps.Circle({
            strokeColor: '#4F46E5',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#4F46E5',
            fillOpacity: 0.2,
            map: map,
            center: location,
            radius: radiusKm * 1000, // Convert km to meters
          });
          
          // Fit map to show the circle
          const bounds = new window.google.maps.LatLngBounds();
          const circleBounds = circleRef.current.getBounds();
          bounds.extend(circleBounds.getNorthEast());
          bounds.extend(circleBounds.getSouthWest());
          map.fitBounds(bounds);
        } else {
          console.error('Geocode was not successful for the following reason: ' + status);
        }
      });
    };

    loadGoogleMaps();
  }, [centerAddress, radiusKm]);

  // Update circle when radius changes
  useEffect(() => {
    if (circleRef.current && markerRef.current) {
      const center = markerRef.current.getPosition();
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radiusKm * 1000); // Convert km to meters
      
      // Update map bounds
      if (mapInstanceRef.current) {
        const bounds = new window.google.maps.LatLngBounds();
        const circleBounds = circleRef.current.getBounds();
        bounds.extend(circleBounds.getNorthEast());
        bounds.extend(circleBounds.getSouthWest());
        mapInstanceRef.current.fitBounds(bounds);
      }
    }
  }, [radiusKm]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-64 rounded-lg border ${className}`}
    />
  );
}
