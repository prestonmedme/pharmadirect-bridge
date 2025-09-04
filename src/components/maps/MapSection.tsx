import React from "react";
import MapboxMap from '@/components/maps/MapboxMap';
import { MapMarker, MapPosition } from '@/types/map';
import { Button } from "@/components/ui/button";
import { PharmacyCard } from "@/types/pharmacy";

interface MapSectionProps {
  pharmacies: PharmacyCard[];
  onPharmacySelect: (pharmacy: PharmacyCard) => void;
  center: MapPosition;
  zoom: number;
  userLocation?: MapPosition;
  showSearchThisArea?: boolean;
  onSearchThisArea?: () => void;
}

export const MapSection: React.FC<MapSectionProps> = ({
  pharmacies,
  onPharmacySelect,
  center,
  zoom,
  userLocation,
  showSearchThisArea,
  onSearchThisArea,
}) => {
  // Convert PharmacyCard to map markers
  const createMarkersFromPharmacies = (): MapMarker[] => {
    return pharmacies
      .filter(pharmacy => pharmacy.location.lat && pharmacy.location.lng)
      .map(pharmacy => ({
        id: pharmacy.id,
        position: {
          lat: pharmacy.location.lat,
          lng: pharmacy.location.lng
        },
        title: pharmacy.name,
        content: `${pharmacy.name}\n${pharmacy.address.line1}`,
        type: 'pharmacy'
      }));
  };

  // Handle marker click
  const handleMarkerClick = (markerId: string) => {
    const pharmacy = pharmacies.find(p => p.id === markerId);
    if (pharmacy) {
      onPharmacySelect(pharmacy);
    }
  };

  return (
    <div className="relative h-full">
      <MapboxMap
        center={center}
        zoom={zoom}
        markers={createMarkersFromPharmacies()}
        onMarkerClick={handleMarkerClick}
        userLocation={userLocation}
        className="h-full w-full"
      />
      
      {showSearchThisArea && onSearchThisArea && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Button onClick={onSearchThisArea} className="shadow-lg">
            Search This Area
          </Button>
        </div>
      )}
    </div>
  );
};