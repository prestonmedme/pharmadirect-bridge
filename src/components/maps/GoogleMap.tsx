import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { GOOGLE_MAPS_CONFIG } from '@/lib/config';
import { Loader2 } from 'lucide-react';
import { MarkerClusterer } from '@googlemaps/markerclusterer';

interface MapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  onMapLoad?: (map: google.maps.Map) => void;
  className?: string;
}

interface Marker {
  id: string;
  position: google.maps.LatLngLiteral;
  title: string;
  content?: string;
  type?: 'pharmacy' | 'location';
}

interface GoogleMapProps extends MapProps {
  markers?: Marker[];
  onMarkerClick?: (markerId: string) => void;
  userLocation?: google.maps.LatLngLiteral;
  shouldFitBounds?: boolean;
  fitRadiusKm?: number; // When provided with userLocation, ensure this radius fits in view
}

// Map component that renders the actual Google Map
const Map: React.FC<MapProps> = ({ center, zoom, onMapLoad, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [googleReady, setGoogleReady] = useState<boolean>(false);

  // Poll for Google Maps readiness to avoid accessing window.google before it's available
  useEffect(() => {
    if (googleReady) return;
    let intervalId: number | undefined;
    const check = () => {
      if ((window as any).google?.maps) {
        setGoogleReady(true);
        if (intervalId) window.clearInterval(intervalId);
      }
    };
    check();
    if (!googleReady) {
      intervalId = window.setInterval(check, 100);
    }
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [googleReady]);

  useEffect(() => {
    if (!ref.current || map || !googleReady) return;

    const newMap = new window.google.maps.Map(ref.current, {
      center,
      zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });
    
    setMap(newMap);
    onMapLoad?.(newMap);
  }, [googleReady, ref, map, center, zoom, onMapLoad]);

  // Update map center and zoom when props change
  useEffect(() => {
    if (map) {
      map.setCenter(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

  return <div ref={ref} className={className} />;
};

// Loading component
const MapLoadingComponent: React.FC = () => (
  <div className="h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-lg">
    <div className="text-center text-muted-foreground">
      <Loader2 className="h-8 w-8 mx-auto mb-4 text-primary animate-spin" />
      <p className="text-sm">Loading map...</p>
    </div>
  </div>
);

// Error component
const MapErrorComponent: React.FC<{ status: Status }> = ({ status }) => (
  <div className="h-full flex items-center justify-center bg-red-50 rounded-lg">
    <div className="text-center text-red-600">
      <p className="text-sm font-medium">Error loading map</p>
      <p className="text-xs mt-1">Status: {status}</p>
    </div>
  </div>
);

// Render function for the map wrapper
const render = (status: Status): React.ReactElement => {
  switch (status) {
    case Status.LOADING:
      return <MapLoadingComponent />;
    case Status.FAILURE:
      return <MapErrorComponent status={status} />;
    case Status.SUCCESS:
      return <></>;
    default:
      return <MapLoadingComponent />;
  }
};

// Main GoogleMap component
const GoogleMap: React.FC<GoogleMapProps> = ({ 
  center, 
  zoom, 
  markers = [], 
  onMarkerClick,
  className = "h-full w-full",
  userLocation,
  shouldFitBounds = true,
  fitRadiusKm
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);
  const [userLocationMarker, setUserLocationMarker] = useState<google.maps.Marker | null>(null);
  const markerClusterRef = useRef<MarkerClusterer | null>(null);

  const handleMapLoad = useCallback((loadedMap: google.maps.Map) => {
    setMap(loadedMap);
  }, []);

  // Add markers to map (with clustering)
  useEffect(() => {
    if (!map || !(window as any).google?.maps) return;

    // Clear existing markers
    mapMarkers.forEach(marker => marker.setMap(null));
    if (markerClusterRef.current) {
      try {
        markerClusterRef.current.clearMarkers();
      } catch (e) {
        // no-op
      }
      markerClusterRef.current = null;
    }

    // Add pharmacy markers
    const pharmacyMarkers = markers.map(markerData => {
      const isLocationMarker = markerData.type === 'location';
      const marker = new window.google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
            isLocationMarker
              ? `<svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="#dc2626"/>
                  <circle cx="12" cy="12" r="6" fill="white"/>
                  <circle cx="12" cy="12" r="3" fill="#dc2626"/>
                </svg>`
              : `<svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="#2563eb"/>
                  <circle cx="12" cy="12" r="6" fill="white"/>
                  <circle cx="12" cy="12" r="3" fill="#2563eb"/>
                </svg>`
          ),
          scaledSize: new window.google.maps.Size(24, 32),
          anchor: new window.google.maps.Point(12, 32)
        }
      });

      if (onMarkerClick && !isLocationMarker) {
        marker.addListener('click', () => onMarkerClick(markerData.id));
      }

      return marker;
    });

    // Create clusterer for the markers for performance on large sets
    try {
      markerClusterRef.current = new MarkerClusterer({ map, markers: pharmacyMarkers });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('MarkerClusterer failed to initialize, rendering plain markers:', e);
    }

    setMapMarkers(pharmacyMarkers);
  }, [map, markers, onMarkerClick, shouldFitBounds]);

  // Handle user location marker separately to prevent flickering
  useEffect(() => {
    if (!map || !(window as any).google?.maps) return;

    // Remove existing user location marker
    if (userLocationMarker) {
      userLocationMarker.setMap(null);
      setUserLocationMarker(null);
    }

    // Add new user location marker if provided
    if (userLocation) {
      const locationMarker = new window.google.maps.Marker({
        position: userLocation,
        map,
        title: 'Selected Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="#dc2626"/>
              <circle cx="12" cy="12" r="6" fill="white"/>
              <circle cx="12" cy="12" r="3" fill="#dc2626"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 32),
          anchor: new window.google.maps.Point(12, 32)
        }
      });
      setUserLocationMarker(locationMarker);
    }

    return () => {
      if (userLocationMarker) {
        userLocationMarker.setMap(null);
      }
    };
  }, [map, userLocation]);

  // Handle bounds fitting separately
  useEffect(() => {
    if (!map || !shouldFitBounds || !(window as any).google?.maps) return;

    const onlyPharmacyMarkers = markers.filter(m => m.type !== 'location');
    if (onlyPharmacyMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      onlyPharmacyMarkers.forEach(markerData => {
        bounds.extend(markerData.position);
      });
      
      // Include user location in bounds if available
      if (userLocation) {
        bounds.extend(userLocation);
      }

      // If a radius is provided, expand bounds to include the full radius around user location
      // This ensures the map shows the entire search area even if markers are clustered on one side
      if (userLocation && typeof fitRadiusKm === 'number' && fitRadiusKm > 0) {
        const latRadius = fitRadiusKm / 111; // ~111km per degree latitude
        const lngRadius = fitRadiusKm / (111 * Math.cos((userLocation.lat * Math.PI) / 180));
        const ne = new window.google.maps.LatLng(userLocation.lat + latRadius, userLocation.lng + lngRadius);
        const sw = new window.google.maps.LatLng(userLocation.lat - latRadius, userLocation.lng - lngRadius);
        bounds.extend(ne);
        bounds.extend(sw);
      }
      
      map.fitBounds(bounds);
      
      // Don't zoom in too much for single markers
      if (onlyPharmacyMarkers.length === 1) {
        setTimeout(() => {
          if (map.getZoom()! > 15) {
            map.setZoom(15);
          }
        }, 100);
      }
    }
  }, [map, markers, userLocation, shouldFitBounds, fitRadiusKm]);

  // For initial California-wide view, ensure we do not auto-fit on first load unless markers exist
  useEffect(() => {
    if (!map || !(window as any).google?.maps) return;
    if (!markers || markers.length === 0) {
      // Keep provided center/zoom
      return;
    }
  }, [map, markers]);

  return (
    <Wrapper
      apiKey={GOOGLE_MAPS_CONFIG.apiKey}
      libraries={GOOGLE_MAPS_CONFIG.libraries as any}
      render={render}
    >
      <Map
        center={center}
        zoom={zoom}
        onMapLoad={handleMapLoad}
        className={className}
      />
    </Wrapper>
  );
};

export default GoogleMap;
export type { GoogleMapProps, Marker };