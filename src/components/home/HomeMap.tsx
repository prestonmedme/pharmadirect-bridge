import React, { useEffect, useState, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { GOOGLE_MAPS_CONFIG } from '@/lib/config';
import { Loader2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePharmacySearch } from '@/hooks/usePharmacySearch';

// Toronto coordinates for the home map center
const TORONTO_CENTER = { lat: 43.6532, lng: -79.3832 };
const HOME_MAP_ZOOM = 11;

interface HomeMapProps {
  className?: string;
}

interface MapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  onMapLoad?: (map: google.maps.Map) => void;
  className?: string;
  onClick?: () => void;
}

// Simple map component for homepage
const Map: React.FC<MapProps> = ({ center, zoom, onMapLoad, className, onClick }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
        gestureHandling: 'none', // Disable interactions for homepage preview
        disableDoubleClickZoom: true,
        scrollwheel: false,
        draggable: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
      
      setMap(newMap);
      onMapLoad?.(newMap);
      
      // Add click listener to the entire map div
      if (onClick) {
        newMap.addListener('click', onClick);
      }
    }
  }, [ref, map, center, zoom, onMapLoad, onClick]);

  return (
    <div 
      ref={ref} 
      className={`${className} cursor-pointer hover:opacity-90 transition-opacity`}
      style={{ borderRadius: '16px', overflow: 'hidden' }}
    />
  );
};

// Loading component
const MapLoadingComponent: React.FC = () => (
  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-2xl">
    <div className="text-center text-muted-foreground">
      <Loader2 className="h-6 w-6 mx-auto mb-2 text-primary animate-spin" />
      <p className="text-xs">Loading map...</p>
    </div>
  </div>
);

// Error component
const MapErrorComponent: React.FC<{ status: Status }> = ({ status }) => (
  <div className="h-full w-full flex items-center justify-center bg-red-50 rounded-2xl border border-red-200">
    <div className="text-center text-red-600">
      <MapPin className="h-6 w-6 mx-auto mb-2" />
      <p className="text-xs font-medium">Map unavailable</p>
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

// Main HomeMap component
const HomeMap: React.FC<HomeMapProps> = ({ className = "h-full w-full" }) => {
  const navigate = useNavigate();
  const { getNearbyPharmacies } = usePharmacySearch();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  const handleMapLoad = useCallback((loadedMap: google.maps.Map) => {
    setMap(loadedMap);
  }, []);

  const handleMapClick = () => {
    console.log('🗺️ HomeMap clicked - navigating to search page');
    navigate('/search');
  };

  // Load Toronto area pharmacies when map loads
  useEffect(() => {
    if (map) {
      console.log('🗺️ Loading Toronto area pharmacies for home map');
      
      // Load pharmacies around Toronto with a 25km radius
      getNearbyPharmacies(TORONTO_CENTER.lat, TORONTO_CENTER.lng, 25);
    }
  }, [map, getNearbyPharmacies]);

  // Add pharmacy markers when pharmacies are loaded
  useEffect(() => {
    if (!map || !window.google) return;

    // For this demo, we'll add some sample pharmacy markers around Toronto
    // In a real implementation, you'd get this from the usePharmacySearch hook
    const samplePharmacies = [
      { lat: 43.6532, lng: -79.3832, name: "Downtown Pharmacy" },
      { lat: 43.7001, lng: -79.4163, name: "North York Pharmacy" },
      { lat: 43.6426, lng: -79.3871, name: "Financial District Pharmacy" },
      { lat: 43.6426, lng: -79.3871, name: "Entertainment District Pharmacy" },
      { lat: 43.6081, lng: -79.5181, name: "Etobicoke Pharmacy" },
      { lat: 43.7731, lng: -79.2578, name: "Markham Pharmacy" },
      { lat: 43.5890, lng: -79.6441, name: "Mississauga Pharmacy" },
      { lat: 43.2557, lng: -79.8711, name: "Hamilton Pharmacy" }
    ];

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Add new markers
    const newMarkers = samplePharmacies.map(pharmacy => {
      const marker = new window.google.maps.Marker({
        position: { lat: pharmacy.lat, lng: pharmacy.lng },
        map,
        title: pharmacy.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="16" height="22" viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 0C3.582 0 0 3.582 0 8c0 6 8 14 8 14s8-8 8-14c0-4.418-3.582-8-8-8z" fill="#2563eb"/>
              <circle cx="8" cy="8" r="4" fill="white"/>
              <circle cx="8" cy="8" r="2" fill="#2563eb"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(16, 22),
          anchor: new window.google.maps.Point(8, 22)
        }
      });

      return marker;
    });

    setMarkers(newMarkers);

    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [map, markers]);

  return (
    <div className={`relative ${className} group`}>
      <Wrapper
        apiKey={GOOGLE_MAPS_CONFIG.apiKey}
        libraries={GOOGLE_MAPS_CONFIG.libraries as any}
        render={render}
      >
        <Map
          center={TORONTO_CENTER}
          zoom={HOME_MAP_ZOOM}
          onMapLoad={handleMapLoad}
          onClick={handleMapClick}
          className="h-full w-full rounded-2xl"
        />
      </Wrapper>
      
      {/* Overlay text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-white/20 group-hover:bg-white/95 transition-colors">
          <div className="text-center space-y-1">
            <h3 className="text-sm font-semibold text-primary">Your Health Journey</h3>
            <p className="text-xs text-muted-foreground">Click to explore pharmacies</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeMap;