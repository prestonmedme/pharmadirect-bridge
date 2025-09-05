import React, { useEffect, useState, useCallback } from 'react';
import MapboxMap from '@/components/maps/MapboxMap';
import { MapMarker } from '@/types/map';
import { Loader2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePharmacySearch } from '@/hooks/usePharmacySearch';

// San Francisco coordinates for the home map center
const SAN_FRANCISCO_CENTER = { lat: 37.7749, lng: -122.4194 };
const HOME_MAP_ZOOM = 11;

// Sample pharmacy locations around San Francisco
const samplePharmacies: MapMarker[] = [
  {
    id: 'pharmacy-1',
    position: { lat: 37.7749, lng: -122.4194 },
    title: 'Downtown SF Pharmacy',
    content: 'Downtown SF Pharmacy<br>123 Market St',
    type: 'pharmacy'
  },
  {
    id: 'pharmacy-2',
    position: { lat: 37.7849, lng: -122.4094 },
    title: 'Mission District Pharmacy',
    content: 'Mission District Pharmacy<br>456 Mission St',
    type: 'pharmacy'
  },
  {
    id: 'pharmacy-3',
    position: { lat: 37.7649, lng: -122.4294 },
    title: 'SOMA Pharmacy',
    content: 'SOMA Pharmacy<br>789 Folsom St',
    type: 'pharmacy'
  },
  {
    id: 'pharmacy-4',
    position: { lat: 37.7549, lng: -122.4094 },
    title: 'Potrero Hill Pharmacy',
    content: 'Potrero Hill Pharmacy<br>321 Potrero Ave',
    type: 'pharmacy'
  },
  {
    id: 'pharmacy-5',
    position: { lat: 37.7949, lng: -122.4094 },
    title: 'Nob Hill Pharmacy',
    content: 'Nob Hill Pharmacy<br>654 California St',
    type: 'pharmacy'
  }
];

interface HomeMapProps {
  className?: string;
}

// Main HomeMap component
const HomeMap: React.FC<HomeMapProps> = ({ className = "h-full w-full" }) => {
  const navigate = useNavigate();

  const handleMapClick = () => {
    console.log('🗺️ HomeMap clicked - navigating to search page');
    navigate('/search');
  };

  return (
    <div className={`relative ${className} group cursor-pointer`} onClick={handleMapClick}>
      <MapboxMap
        center={SAN_FRANCISCO_CENTER}
        zoom={HOME_MAP_ZOOM}
        markers={samplePharmacies}
        onMarkerClick={() => {}} // Disable marker interactions
        className="h-full w-full rounded-2xl pointer-events-none"
      />
      
      {/* Overlay to capture clicks and make map non-interactive */}
      <div className="absolute inset-0 z-10 cursor-pointer" />
      
      {/* Overlay text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
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