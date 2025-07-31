import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { GOOGLE_MAPS_CONFIG } from '@/lib/config';
import { Loader2 } from 'lucide-react';

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
}

interface GoogleMapProps extends MapProps {
  markers?: Marker[];
  onMarkerClick?: (markerId: string) => void;
}

// Map component that renders the actual Google Map
const Map: React.FC<MapProps> = ({ center, zoom, onMapLoad, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (ref.current && !map) {
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
    }
  }, [ref, map, center, zoom, onMapLoad]);

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
  className = "h-full w-full" 
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);

  const handleMapLoad = useCallback((loadedMap: google.maps.Map) => {
    setMap(loadedMap);
  }, []);

  // Add markers to map
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing markers
    mapMarkers.forEach(marker => marker.setMap(null));

    // Add new markers
    const newMarkers = markers.map(markerData => {
      const marker = new window.google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="#2563eb"/>
              <circle cx="12" cy="12" r="6" fill="white"/>
              <circle cx="12" cy="12" r="3" fill="#2563eb"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 32),
          anchor: new window.google.maps.Point(12, 32)
        }
      });

      if (onMarkerClick) {
        marker.addListener('click', () => onMarkerClick(markerData.id));
      }

      return marker;
    });

    setMapMarkers(newMarkers);

    // Fit bounds to show all markers if there are any
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition()!);
      });
      map.fitBounds(bounds);
      
      // Don't zoom in too much for single markers
      if (newMarkers.length === 1) {
        map.setZoom(Math.min(map.getZoom()!, 15));
      }
    }

    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [map, markers, onMarkerClick]);

  return (
    <Wrapper
      apiKey={GOOGLE_MAPS_CONFIG.apiKey}
      libraries={GOOGLE_MAPS_CONFIG.libraries}
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