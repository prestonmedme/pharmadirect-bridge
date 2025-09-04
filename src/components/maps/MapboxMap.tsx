import React, { useEffect, useRef, useState } from 'react';
import { MapProvider, MapMarker, MapClusterMarker } from '@/types/map';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { MAPBOX_CONFIG } from '@/lib/config';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Supercluster from 'supercluster';

// Import Mapbox CSS
import 'mapbox-gl/dist/mapbox-gl.css';

// Lazy load mapbox-gl to avoid SSR issues
let mapboxgl: typeof import('mapbox-gl') | null = null;

interface MapboxMapProps extends MapProvider {}

const MapLoadingComponent: React.FC = () => (
  <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
      <p className="text-sm text-gray-600">Loading map...</p>
    </div>
  </div>
);

const MapErrorComponent: React.FC<{ error: string }> = ({ error }) => (
  <div className="h-full w-full flex items-center justify-center">
    <Alert className="max-w-md">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  </div>
);

export const MapboxMap: React.FC<MapboxMapProps> = ({
  center,
  zoom,
  markers = [],
  onMarkerClick,
  userLocation,
  shouldFitBounds = false,
  fitRadiusKm,
  className = "h-full w-full",
  onClick
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<import('mapbox-gl').Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxLoaded, setMapboxLoaded] = useState(false);
  const markersRef = useRef<{ [key: string]: import('mapbox-gl').Marker }>({});
  const clusterMarkersRef = useRef<{ [key: string]: import('mapbox-gl').Marker }>({});
  const userMarkerRef = useRef<import('mapbox-gl').Marker | null>(null);
  
  const { token, loading: tokenLoading, error: tokenError } = useMapboxToken();

  // Load Mapbox GL dynamically
  useEffect(() => {
    const loadMapbox = async () => {
      if (!mapboxgl) {
        try {
          mapboxgl = await import('mapbox-gl');
          setMapboxLoaded(true);
        } catch (error) {
          console.error('Failed to load Mapbox GL:', error);
        }
      } else {
        setMapboxLoaded(true);
      }
    };

    loadMapbox();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapboxLoaded || !token || !mapContainer.current || map.current) return;

    try {
        if (mapboxgl) {
          // Set the access token on the global mapboxgl object
          (mapboxgl as any).accessToken = token;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: MAPBOX_CONFIG.style,
          center: [center.lng, center.lat],
          zoom: zoom,
          attributionControl: true
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add click handler
        if (onClick) {
          map.current.on('click', (e) => {
            onClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
          });
        }

        map.current.on('load', () => {
          console.log('Mapbox map loaded successfully');
          setMapLoaded(true);
        });

        map.current.on('error', (e) => {
          console.error('Mapbox map error:', e.error);
        });
      }
    } catch (error) {
      console.error('Error initializing Mapbox map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, [mapboxLoaded, token, center.lat, center.lng, zoom, onClick]);

  // Handle markers with clustering
  useEffect(() => {
    if (!mapLoaded || !map.current || !mapboxgl) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    Object.values(clusterMarkersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    clusterMarkersRef.current = {};

    if (markers.length === 0) return;

    // Create cluster
    const cluster = new Supercluster({
      radius: 40,
      maxZoom: 16
    });

    // Prepare data for clustering
    const points = markers.map(marker => ({
      type: 'Feature' as const,
      properties: {
        cluster: false,
        markerId: marker.id,
        title: marker.title,
        content: marker.content,
        markerType: marker.type
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [marker.position.lng, marker.position.lat]
      }
    }));

    cluster.load(points);

    // Get clusters for current zoom
    const bounds = map.current.getBounds();
    const zoom = map.current.getZoom();
    const clusters = cluster.getClusters([
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ], Math.floor(zoom));

    clusters.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      
      if (feature.properties.cluster) {
        // Create cluster marker
        const clusterEl = document.createElement('div');
        clusterEl.className = 'cluster-marker';
        clusterEl.innerHTML = `
          <div style="
            background: #3b82f6;
            border: 2px solid #ffffff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
            ${feature.properties.point_count}
          </div>
        `;

        const clusterMarker = new mapboxgl.Marker(clusterEl)
          .setLngLat([lng, lat])
          .addTo(map.current!);

        clusterMarkersRef.current[feature.properties.cluster_id] = clusterMarker;

        // Add click handler for clusters
        clusterEl.addEventListener('click', () => {
          const expansionZoom = Math.min(
            cluster.getClusterExpansionZoom(feature.properties.cluster_id),
            20
          );
          map.current?.easeTo({
            center: [lng, lat],
            zoom: expansionZoom
          });
        });
      } else {
        // Create individual marker
        const markerEl = document.createElement('div');
        const markerType = feature.properties.markerType;
        const color = markerType === 'pharmacy' ? '#ef4444' : '#3b82f6';
        
        markerEl.innerHTML = `
          <div style="
            background: ${color};
            border: 2px solid #ffffff;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            cursor: pointer;
          "></div>
        `;

        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat([lng, lat])
          .addTo(map.current!);

        markersRef.current[feature.properties.markerId] = marker;

        // Add click handler
        if (onMarkerClick) {
          markerEl.addEventListener('click', () => {
            onMarkerClick(feature.properties.markerId);
          });
        }

        // Add popup if content exists
        if (feature.properties.content) {
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<div style="padding: 8px;">${feature.properties.content}</div>`);
          marker.setPopup(popup);
        }
      }
    });

  }, [mapLoaded, markers, onMarkerClick]);

  // Handle user location marker
  useEffect(() => {
    if (!mapLoaded || !map.current || !mapboxgl) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const userEl = document.createElement('div');
      userEl.innerHTML = `
        <div style="
          background: #10b981;
          border: 3px solid #ffffff;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
        "></div>
      `;

      userMarkerRef.current = new mapboxgl.Marker(userEl)
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
    }
  }, [mapLoaded, userLocation]);

  // Fit bounds to include all markers and user location
  useEffect(() => {
    if (!mapLoaded || !map.current || !shouldFitBounds || !mapboxgl) return;

    const allPoints: [number, number][] = [];

    // Add marker positions
    markers.forEach(marker => {
      allPoints.push([marker.position.lng, marker.position.lat]);
    });

    // Add user location
    if (userLocation) {
      allPoints.push([userLocation.lng, userLocation.lat]);
    }

    if (allPoints.length === 0) return;

    if (allPoints.length === 1) {
      // Single point - just center on it
      map.current.easeTo({
        center: allPoints[0],
        zoom: fitRadiusKm ? Math.max(12, 16 - Math.log2(fitRadiusKm)) : 14
      });
    } else {
      // Multiple points - fit bounds
      const bounds = new mapboxgl.LngLatBounds();
      allPoints.forEach(point => {
        bounds.extend(point);
      });

      // Expand bounds by radius if specified
      if (fitRadiusKm && fitRadiusKm > 0) {
        const center = bounds.getCenter();
        const kmToDegrees = fitRadiusKm / 111;
        bounds.extend([center.lng - kmToDegrees, center.lat - kmToDegrees]);
        bounds.extend([center.lng + kmToDegrees, center.lat + kmToDegrees]);
      }

      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  }, [mapLoaded, markers, userLocation, shouldFitBounds, fitRadiusKm]);

  if (tokenLoading || !mapboxLoaded) {
    return <MapLoadingComponent />;
  }

  if (tokenError) {
    return <MapErrorComponent error={tokenError} />;
  }

  return (
    <div className={className}>
      <div ref={mapContainer} className="h-full w-full rounded-lg" />
    </div>
  );
};

export default MapboxMap;
export type { MapboxMapProps };