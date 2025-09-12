import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MapSection } from '@/components/maps/MapSection';
import { PharmacyResultsList } from '@/components/pharmacy/PharmacyResultsList';
import { BubbleFilterSelect } from '@/components/filters/BubbleFilterSelect';
import AddressAutocomplete from '@/components/maps/AddressAutocomplete';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Filter, Search, ChevronUp } from 'lucide-react';
import { MapPosition } from '@/types/map';
import { PharmacyCard } from '@/types/pharmacy';
import { cn } from '@/lib/utils';

interface MobileSearchLayoutProps {
  // Map props
  pharmacyCards: PharmacyCard[];
  onPharmacySelect: (pharmacy: PharmacyCard) => void;
  mapCenter: MapPosition;
  mapZoom: number;
  userLocation?: MapPosition;
  showSearchThisArea?: boolean;
  onSearchThisArea?: () => void;
  
  // Search and filter props
  location: string;
  onLocationChange: (location: string) => void;
  onPlaceSelect: (result: any) => void;
  onUseCurrentLocation: () => void;
  
  // Service filter props
  serviceOptions: Array<{ value: string; label: string }>;
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
  
  // Results props
  loading: boolean;
  onBookAppointment: (pharmacy: PharmacyCard) => void;
  calculatePharmacyDistance: (pharmacy: PharmacyCard, userLoc?: MapPosition) => string;
}

export const MobileSearchLayout: React.FC<MobileSearchLayoutProps> = ({
  pharmacyCards,
  onPharmacySelect,
  mapCenter,
  mapZoom,
  userLocation,
  showSearchThisArea,
  onSearchThisArea,
  location,
  onLocationChange,
  onPlaceSelect,
  onUseCurrentLocation,
  serviceOptions,
  selectedServices,
  onServicesChange,
  loading,
  onBookAppointment,
  calculatePharmacyDistance,
}) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="relative h-screen w-full">
      {/* Full-screen map background */}
      <div className="absolute inset-0">
        <MapSection
          pharmacies={pharmacyCards}
          onPharmacySelect={onPharmacySelect}
          center={mapCenter}
          zoom={mapZoom}
          userLocation={userLocation}
          showSearchThisArea={showSearchThisArea}
          onSearchThisArea={onSearchThisArea}
        />
      </div>

      {/* Top navigation bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          (isSearchExpanded || isFilterExpanded) ? "flex-col space-y-4" : "flex items-center gap-3"
        )}>
          {/* Filter button and expanded filter */}
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            isSearchExpanded ? "opacity-0 pointer-events-none absolute" : "opacity-100",
            isFilterExpanded ? "w-full" : ""
          )}>
            {!isFilterExpanded ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterExpanded(true)}
                className="bg-white/90 backdrop-blur-sm border-2 border-[hsl(var(--medme-navy))] shadow-md hover:bg-white/95 text-[hsl(var(--medme-navy))] w-10 h-10 p-0"
              >
                <Filter className="h-4 w-4" />
              </Button>
            ) : (
              <div className="bg-white/95 backdrop-blur-sm border-2 border-[hsl(var(--medme-navy))] rounded-lg shadow-md p-4 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[hsl(var(--medme-navy))]">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFilterExpanded(false)}
                    className="text-[hsl(var(--medme-navy))]"
                  >
                    ✕
                  </Button>
                </div>
                <BubbleFilterSelect
                  options={serviceOptions}
                  value={selectedServices}
                  onValueChange={onServicesChange}
                  placeholder="Select services..."
                />
              </div>
            )}
          </div>

          {/* Search bar - expands when clicked */}
          <div className={cn(
            "transition-all duration-300 ease-in-out flex-1 min-w-0",
            isFilterExpanded ? "opacity-0 pointer-events-none absolute" : "opacity-100",
            isSearchExpanded ? "w-full" : ""
          )}>
            {!isSearchExpanded ? (
              <Button
                variant="outline"
                onClick={() => setIsSearchExpanded(true)}
                className="w-full bg-white/90 backdrop-blur-sm border-2 border-[hsl(var(--medme-navy))] shadow-md hover:bg-white/95 justify-start px-4 py-2 h-10 text-[hsl(var(--medme-navy))] max-w-full"
              >
                <Search className="h-4 w-4 mr-2 text-[hsl(var(--medme-navy))] flex-shrink-0" />
                <span className="truncate text-sm">
                  {location || "Search location..."}
                </span>
              </Button>
            ) : (
              <div className="bg-white/95 backdrop-blur-sm border-2 border-[hsl(var(--medme-navy))] rounded-lg shadow-md p-4 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[hsl(var(--medme-navy))]">Search Location</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchExpanded(false)}
                    className="text-[hsl(var(--medme-navy))]"
                  >
                    ✕
                  </Button>
                </div>
                <AddressAutocomplete
                  value={location}
                  onChange={onLocationChange}
                  onPlaceSelect={(result) => {
                    onPlaceSelect(result);
                    setIsSearchExpanded(false);
                  }}
                  placeholder="Enter address or location..."
                  className="w-full"
                  center={userLocation}
                  radiusKm={25}
                />
                <Button
                  onClick={() => {
                    onUseCurrentLocation();
                    setIsSearchExpanded(false);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Use Current Location
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom results drawer */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <div className="bg-white border-2 border-[hsl(var(--medme-navy))] rounded-t-xl shadow-lg p-4 cursor-pointer">
              <div className="flex items-center justify-center mb-2">
                <div className="w-12 h-1 bg-gray-300 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-[hsl(var(--medme-navy))]">
                    {loading ? "Searching..." : `${pharmacyCards.length} pharmacies`}
                  </h3>
                  <p className="text-sm text-[hsl(var(--medme-navy))]/70">
                    {pharmacyCards.length > 0 && (
                      `Showing ${Math.min(pharmacyCards.length, 12)} results`
                    )}
                  </p>
                </div>
                <ChevronUp className="h-5 w-5 text-[hsl(var(--medme-navy))]/60" />
              </div>
            </div>
          </DrawerTrigger>
          <DrawerContent className="max-h-[70vh] bg-white border-2 border-[hsl(var(--medme-navy))]">
            <DrawerHeader>
              <DrawerTitle className="text-[hsl(var(--medme-navy))]">
                {loading ? "Searching..." : `${pharmacyCards.length} pharmacies found`}
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 overflow-y-auto">
              <PharmacyResultsList
                pharmacies={pharmacyCards}
                onPharmacySelect={onPharmacySelect}
                onBookAppointment={onBookAppointment}
                calculateDistance={calculatePharmacyDistance}
                userLocation={userLocation}
                loading={loading}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};