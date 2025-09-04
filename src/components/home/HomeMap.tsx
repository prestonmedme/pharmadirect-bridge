import React, { useEffect, useState, useCallback } from 'react';
import MapboxMap from '@/components/maps/MapboxMap';
import { MapMarker } from '@/types/map';
import { Loader2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePharmacySearch } from '@/hooks/usePharmacySearch';

// Toronto coordinates for the home map center
const TORONTO_CENTER = { lat: 43.6532, lng: -79.3832 };
const HOME_MAP_ZOOM = 11;

// Sample pharmacy locations around Toronto
const samplePharmacies: MapMarker[] = [
  {
    id: 'pharmacy-1',
    position: { lat: 43.6532, lng: -79.3832 },
    title: 'Downtown Pharmacy',
    content: 'Downtown Pharmacy<br>123 King St',
    type: 'pharmacy'
  },
  {
    id: 'pharmacy-2',
    position: { lat: 43.7001, lng: -79.4163 },
    title: 'North York Pharmacy',
    content: 'North York Pharmacy<br>456 Yonge St',
    type: 'pharmacy'
  },
  {
    id: 'pharmacy-3',
    position: { lat: 43.6426, lng: -79.3871 },
    title: 'Financial District Pharmacy',
    content: 'Financial District Pharmacy<br>789 Bay St',
    type: 'pharmacy'
  },
  {
    id: 'pharmacy-4',
    position: { lat: 43.6081, lng: -79.5181 },
    title: 'Etobicoke Pharmacy',
    content: 'Etobicoke Pharmacy<br>321 Queensway',
    type: 'pharmacy'
  },
  {
    id: 'pharmacy-5',
    position: { lat: 43.7731, lng: -79.2578 },
    title: 'Markham Pharmacy',
    content: 'Markham Pharmacy<br>654 Highway 7',
    type: 'pharmacy'
  }
];

interface HomeMapProps {
  className?: string;
}

// Main HomeMap component
const HomeMap: React.FC<HomeMapProps> = ({ className = "h-full w-full" }) => {
  const navigate = useNavigate();
  const { getNearbyPharmacies } = usePharmacySearch();

  const handleMapClick = () => {
    console.log('🗺️ HomeMap clicked - navigating to search page');
    navigate('/search');
  };

  const handleMarkerClick = (markerId: string) => {
    console.log('Pharmacy marker clicked:', markerId);
    // Could show pharmacy details or navigate to booking
  };

  return (
    <div className={`relative ${className} group`}>
      <MapboxMap
        center={TORONTO_CENTER}
        zoom={HOME_MAP_ZOOM}
        markers={samplePharmacies}
        onMarkerClick={handleMarkerClick}
        onClick={handleMapClick}
        className="h-full w-full rounded-2xl"
      />
      
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