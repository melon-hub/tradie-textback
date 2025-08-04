declare global {
  interface Window {
    google: any;
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
