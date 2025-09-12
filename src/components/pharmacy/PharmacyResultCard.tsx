import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Star, 
  Clock, 
  Phone,
  Calendar,
  ExternalLink
} from "lucide-react";
import { PharmacyCard } from "@/types/pharmacy";
import { AnalyticsService } from "@/lib/analytics";

interface PharmacyResultCardProps {
  pharmacy: PharmacyCard;
  onSelect: (pharmacy: PharmacyCard) => void;
  onBookAppointment?: (pharmacy: PharmacyCard) => void;
  distance?: string;
}

export const PharmacyResultCard: React.FC<PharmacyResultCardProps> = ({
  pharmacy,
  onSelect,
  onBookAppointment,
  distance
}) => {
  const handleCardClick = () => {
    // Track pharmacy view
    AnalyticsService.trackPharmacyView(
      pharmacy.id, 
      pharmacy.source === 'medme',
      'search_results'
    );
    onSelect(pharmacy);
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Track booking start
    AnalyticsService.trackBookingStep(
      'book_start', 
      pharmacy.id, 
      'general',
      pharmacy.source === 'medme'
    );
    onBookAppointment?.(pharmacy);
  };

  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Track call click
    AnalyticsService.trackPharmacyClick(
      'call', 
      pharmacy.id, 
      pharmacy.source === 'medme',
      'search_results'
    );
    if (pharmacy.phone) {
      window.location.href = `tel:${pharmacy.phone}`;
    }
  };

  return (
    <Card 
      id={`pharmacy-${pharmacy.id}`}
      className="cursor-pointer hover:shadow-md transition-all duration-300 border-l-4 border-l-transparent hover:border-l-[hsl(var(--medme-lime))]"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{pharmacy.name}</h3>
              {pharmacy.source === 'medme' && (
                <div className="flex items-center gap-1">
                  {pharmacy.logoUrl && (
                    <img 
                      src={pharmacy.logoUrl} 
                      alt="MedMe" 
                      className="h-5 w-5 rounded object-contain"
                    />
                  )}
                  <Badge variant="default" className="text-xs">
                    MedMe
                  </Badge>
                </div>
              )}
              {pharmacy.openNow !== undefined && (
                <Badge 
                  variant={pharmacy.openNow ? "default" : "secondary"} 
                  className={`text-xs ${pharmacy.openNow ? 'bg-[hsl(var(--medme-navy))] text-white' : ''}`}
                >
                  {pharmacy.openNow ? "Open" : "Closed"}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <MapPin className="h-3 w-3" />
              <span>{pharmacy.address.line1}, {pharmacy.address.city}</span>
              {distance && (
                <>
                  <span className="mx-1">•</span>
                  <span>{distance}</span>
                </>
              )}
            </div>

            {pharmacy.rating?.value && (
              <div className="flex items-center gap-1 text-sm mb-2">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{pharmacy.rating.value}</span>
                <span className="text-muted-foreground">
                  ({pharmacy.rating.count} reviews)
                </span>
              </div>
            )}

            {/* Attributes/Features */}
            {pharmacy.attributes && pharmacy.attributes.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {pharmacy.attributes.slice(0, 3).map((attr) => (
                  <Badge key={attr} variant="outline" className="text-xs">
                    {attr}
                  </Badge>
                ))}
                {pharmacy.attributes.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{pharmacy.attributes.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Next available slot for MedMe locations */}
            {pharmacy.medmeConnected && pharmacy.nextSlots && pharmacy.nextSlots.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <Clock className="h-3 w-3" />
                <span>Next: {new Date(pharmacy.nextSlots[0]).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 ml-4">
            {pharmacy.medmeConnected && (
              <Button 
                size="sm" 
                onClick={handleBookClick}
                className="whitespace-nowrap bg-transparent border-2 border-[hsl(var(--medme-lime))] text-[hsl(var(--medme-lime))] hover:bg-[hsl(var(--medme-lime))] hover:text-white"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Book
              </Button>
            )}
            
            {pharmacy.phone && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCallClick}
                className="whitespace-nowrap border-2 border-[hsl(var(--medme-lime))] text-[hsl(var(--medme-lime))] hover:bg-[hsl(var(--medme-lime))] hover:text-white"
              >
                <Phone className="h-3 w-3 mr-1" />
                Call
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};