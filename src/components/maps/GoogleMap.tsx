// Legacy GoogleMap component - now redirects to MapboxMap for compatibility
import MapboxMap from '@/components/maps/MapboxMap';
import type { MapboxMapProps } from '@/components/maps/MapboxMap';
import type { MapMarker } from '@/types/map';

// Export the new Mapbox component as GoogleMap for compatibility
export default MapboxMap;
export type { MapboxMapProps as GoogleMapProps };
export type { MapMarker as Marker };