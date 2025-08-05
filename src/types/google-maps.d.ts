declare global {
  interface Window {
    google: any;
  }
  
  namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: Element | null, opts?: any);
      }

      namespace places {
        class AutocompleteService {
          constructor();
          getPlacePredictions(
            request: any,
            callback: (results: any[] | null, status: any) => void
          ): void;
        }

        class PlacesService {
          constructor(attrContainer: any);
          getDetails(
            request: any,
            callback: (result: any | null, status: any) => void
          ): void;
        }

        namespace PlacesServiceStatus {
          const OK: string;
          const ZERO_RESULTS: string;
          const OVER_QUERY_LIMIT: string;
          const REQUEST_DENIED: string;
          const INVALID_REQUEST: string;
          const NOT_FOUND: string;
          const UNKNOWN_ERROR: string;
        }
      }
    }
  }
}

declare module 'google.maps' {
  export class Map {
    constructor(el: HTMLElement, options: any);
    setCenter(latlng: any): void;
    fitBounds(bounds: any): void;
  }
  
  export class Marker {
    constructor(options: any);
    setMap(map: Map | null): void;
    getPosition(): any;
  }
  
  export class Circle {
    constructor(options: any);
    setMap(map: Map | null): void;
    setCenter(center: any): void;
    setRadius(radius: number): void;
    getBounds(): any;
  }
  
  export class Geocoder {
    geocode(request: any, callback: (results: any[], status: string) => void): void;
  }
  
  export class LatLngBounds {
    extend(point: any): void;
    getNorthEast(): any;
    getSouthWest(): any;
  }
  
  export const MapTypeId: {
    ROADMAP: string;
  };
}

export {};
