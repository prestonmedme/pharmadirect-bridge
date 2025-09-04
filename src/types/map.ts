// Generic map interfaces for abstraction between different map providers

export interface MapPosition {
  lat: number;
  lng: number;
}

export interface MapBounds {
  northeast: MapPosition;
  southwest: MapPosition;
}

export interface MapMarker {
  id: string;
  position: MapPosition;
  title: string;
  content?: string;
  type: 'pharmacy' | 'location' | 'user';
}

export interface MapClusterMarker {
  id: string;
  position: MapPosition;
  count: number;
  markers: MapMarker[];
}

export interface MapProvider {
  center: MapPosition;
  zoom: number;
  markers?: MapMarker[];
  onMarkerClick?: (markerId: string) => void;
  userLocation?: MapPosition;
  shouldFitBounds?: boolean;
  fitRadiusKm?: number;
  className?: string;
  onClick?: (position: MapPosition) => void;
}

export interface GeocodeResult {
  formatted_address: string;
  position: MapPosition;
  place_id?: string;
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export interface AddressSearchOptions {
  center?: MapPosition;
  radiusKm?: number;
  country?: string;
  types?: string[];
}