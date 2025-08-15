import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { PharmacyCard } from "@/types/pharmacy";
import { PharmacyResultCard } from "./PharmacyResultCard";

interface PharmacyResultsListProps {
  pharmacies: PharmacyCard[];
  loading: boolean;
  onPharmacySelect: (pharmacy: PharmacyCard) => void;
  onBookAppointment?: (pharmacy: PharmacyCard) => void;
  calculateDistance?: (pharmacy: PharmacyCard, userLocation?: google.maps.LatLngLiteral) => string;
  userLocation?: google.maps.LatLngLiteral;
}

export const PharmacyResultsList: React.FC<PharmacyResultsListProps> = ({
  pharmacies,
  loading,
  onPharmacySelect,
  onBookAppointment,
  calculateDistance,
  userLocation
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading pharmacies...</span>
      </div>
    );
  }

  if (pharmacies.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No pharmacies found in this area.</p>
        <p className="text-sm text-muted-foreground mt-1">Try expanding your search radius or adjusting filters.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-1">
        {pharmacies.map((pharmacy) => {
          const distance = calculateDistance && userLocation 
            ? calculateDistance(pharmacy, userLocation)
            : undefined;

          return (
            <PharmacyResultCard
              key={pharmacy.id}
              pharmacy={pharmacy}
              onSelect={onPharmacySelect}
              onBookAppointment={onBookAppointment}
              distance={distance}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
};