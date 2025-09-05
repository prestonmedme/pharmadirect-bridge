import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookingDialog } from "@/components/booking/BookingDialog";
// Removed date selection feature - no input needed here
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BubbleFilterSelect } from "@/components/filters/BubbleFilterSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { usePharmacySearch, type Pharmacy } from "@/hooks/usePharmacySearch";
import { generateStableDisplayData, type PharmacyDisplayData } from "@/lib/pharmacyDataUtils";
import { useToast } from "@/hooks/use-toast";
import { MapSection } from "@/components/maps/MapSection";
import AddressAutocomplete from "@/components/maps/AddressAutocomplete";
import { MapPosition, MapMarker } from "@/types/map";
import { PharmacyCard } from "@/types/pharmacy";
import { adaptPharmacyToCard } from "@/hooks/usePharmacyAdapter";
import { PharmacyProfileDrawer } from "@/components/pharmacy/PharmacyProfileDrawer";
import { PharmacyResultsList } from "@/components/pharmacy/PharmacyResultsList";
import { supabase } from "@/integrations/supabase/client";
import { 
  MapPin, 
  Filter, 
  Clock, 
  Phone,
  ChevronLeft,
  Star,
  Navigation,
  Loader2,
  Search
} from "lucide-react";
import medmeLogo from '@/assets/medme-logo.svg';

const SearchAndBooking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Service options for the bubble filter
  const serviceOptions = [
    { value: "minor-ailments", label: "Minor ailments" },
    { value: "flu-shots", label: "Flu shots" },
    { value: "medscheck", label: "MedsCheck" },
    { value: "naloxone", label: "Naloxone Kits" },
    { value: "birth-control", label: "Birth Control" },
    { value: "travel-vaccines", label: "Travel Vaccines" },
    { value: "diabetes", label: "Diabetes" },
    { value: "mental-health", label: "Mental Health" },
    { value: "delivery", label: "Delivery" },
    { value: "pediatric-vax", label: "Pediatric Vax" },
    { value: "open-now", label: "Open Now" },
  ];
  const [selectedService, setSelectedService] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [medmeOnly, setMedmeOnly] = useState<boolean>(false);
  const [selectedRadius, setSelectedRadius] = useState<number>(25);
  const [userLocationCoords, setUserLocationCoords] = useState<MapPosition | null>(null);
  const [isUsingPreciseCoords, setIsUsingPreciseCoords] = useState<boolean>(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [selectedPharmacyCard, setSelectedPharmacyCard] = useState<PharmacyCard | null>(null);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
   // Default to showing California center
   const [mapCenter, setMapCenter] = useState<MapPosition>({ lat: 36.7783, lng: -119.4179 });
  const [mapZoom, setMapZoom] = useState<number>(4);
  const [showSearchThisArea, setShowSearchThisArea] = useState<boolean>(false);
  const { pharmacies, loading, searchPharmacies, getAllPharmacies, getNearbyPharmacies, calculateDistance } = usePharmacySearch();

  // Convert pharmacies to PharmacyCard format
  const pharmacyCards: PharmacyCard[] = pharmacies.map(adaptPharmacyToCard);


  const handleBookNow = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setBookingDialogOpen(true);
  };

  // Handle pharmacy selection from map or list
  const handlePharmacySelect = (pharmacyCard: PharmacyCard) => {
    setSelectedPharmacyCard(pharmacyCard);
    setProfileDrawerOpen(true);
    
    // Also scroll to the pharmacy in the list for visual feedback
    const pharmacyElement = document.getElementById(`pharmacy-${pharmacyCard.id}`);
    if (pharmacyElement) {
      pharmacyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Handle booking from PharmacyCard
  const handleBookAppointment = (pharmacyCard: PharmacyCard) => {
    // Convert back to Pharmacy for existing booking dialog
    const originalPharmacy = pharmacies.find(p => p.id === pharmacyCard.id);
    if (originalPharmacy) {
      handleBookNow(originalPharmacy);
    }
  };

  // Calculate distance for pharmacy cards
  const calculatePharmacyDistance = (pharmacyCard: PharmacyCard, userLoc?: MapPosition): string => {
    if (!userLoc) return '';
    const distance = calculateDistance(
      userLoc.lat, 
      userLoc.lng, 
      pharmacyCard.location.lat, 
      pharmacyCard.location.lng
    );
    return `${distance.toFixed(1)} km`;
  };

  // Convert pharmacies to map markers
  const createMarkersFromPharmacies = (): MapMarker[] => {
    return pharmacies
      .filter(pharmacy => pharmacy.latitude && pharmacy.longitude)
      .map(pharmacy => ({
        id: pharmacy.id,
        position: {
          lat: pharmacy.latitude!,
          lng: pharmacy.longitude!
        },
        title: pharmacy.name,
        content: `${pharmacy.name}\n${pharmacy.address}`,
        type: 'pharmacy' // Add required type property
      }));
  };

  // Handle marker click on map
  const handleMarkerClick = (markerId: string) => {
    const pharmacy = pharmacies.find(p => p.id === markerId);
    if (pharmacy) {
      setSelectedPharmacy(pharmacy);
      // Optionally scroll to the pharmacy in the list
      const pharmacyElement = document.getElementById(`pharmacy-${markerId}`);
      if (pharmacyElement) {
        pharmacyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Handle "Get Directions" functionality
  const handleGetDirections = (pharmacy: Pharmacy) => {
    const destination = encodeURIComponent(pharmacy.address);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(googleMapsUrl, '_blank');
  };

  // Calculate distance from current user location
  const calculateDistanceFromUser = (pharmacy: Pharmacy): string | null => {
    if (!pharmacy.latitude || !pharmacy.longitude) return null;
    
    // Check if we have user's current location from the location state
    const coordsMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordsMatch) {
      const userLat = parseFloat(coordsMatch[1]);
      const userLng = parseFloat(coordsMatch[2]);
      
      // Use the existing calculateDistance function from usePharmacySearch
      const distance = calculateDistance(userLat, userLng, pharmacy.latitude, pharmacy.longitude);
      return `${distance.toFixed(1)} km away`;
    }
    
    return null;
  };



  // Handle "Search This Area" button click
  const handleSearchThisArea = () => {
    if (!mapCenter) return;
    
    const lat = mapCenter.lat;
    const lng = mapCenter.lng;
    const coords = { lat, lng };
    
    // Update location display and coordinates
    setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    setIsUsingPreciseCoords(true);
    setUserLocationCoords(coords);
    
    // Search in this area using selected radius
    getNearbyPharmacies(lat, lng, Math.max(selectedRadius, 5)); // Use selected radius with minimum 5km
    setShowSearchThisArea(false);
    
    toast({
      title: "Searching this area",
      description: `Finding pharmacies within ${selectedRadius}km of this area`,
    });
  };

  // Handle place selection from autocomplete
  const handlePlaceSelect = (result: any) => {
    console.log('🎯 Place selected from autocomplete:', result);
    
    if (!result.position) {
      console.warn('❌ No position data for selected place');
      return;
    }

    const lat = result.position.lat;
    const lng = result.position.lng;
    const coords = { lat, lng };
    
    console.log('📍 Autocomplete: Updating map center to:', coords);
    
    // Mark that we're using precise coordinates from Mapbox
    setIsUsingPreciseCoords(true);
    
    // Update location coordinates and map center
    setUserLocationCoords(coords);
    setMapCenter(coords);
    setMapZoom(15); // Good zoom level for autocomplete selections
    
    // Search for nearby pharmacies using selected radius
    console.log(`🔍 Autocomplete: Searching for pharmacies within ${selectedRadius}km of selected location`);
    getNearbyPharmacies(lat, lng, selectedRadius).then(() => {
      // After pharmacies load, ensure map centers and fits area for better UX
      setMapCenter(coords);
      setMapZoom(12);
    });
    
    toast({
      title: "Location selected!",
      description: `Searching for pharmacies within ${selectedRadius}km of ${result.formatted_address}`,
    });
  };

  // Handle URL parameters for service filter and address
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    const addressParam = urlParams.get('address');
    
    if (serviceParam) {
      setSelectedService(serviceParam);
    }
    
    if (addressParam) {
      const decodedAddress = decodeURIComponent(addressParam);
      setLocation(decodedAddress);
      setIsUsingPreciseCoords(true);
      
      // Trigger search with the provided address and service
      console.log('🔍 URL parameter search:', { address: decodedAddress, service: serviceParam });
      searchPharmacies({ 
        location: decodedAddress, 
        service: serviceParam || undefined,
        medmeOnly, 
        radiusKm: selectedRadius 
      });
    }
  }, [selectedService, medmeOnly, selectedRadius]);

  // Handle search when location and filters change with debouncing
  // Only for manual input - not when using precise coordinates from autocomplete
  useEffect(() => {
    // Don't trigger internal geocoding if we're using precise coordinates
    if (isUsingPreciseCoords) {
      console.log('⏭️ Skipping debounced search - using precise coordinates from autocomplete');
      return;
    }

    // Don't trigger search if we already have user coordinates (avoid duplicate searches)
    if (userLocationCoords) {
      console.log('⏭️ Skipping debounced search - already have user coordinates');
      return;
    }

    const timeoutId = setTimeout(() => {
      console.log('⏱️ Debounced search triggered for manual input');
      if (location.trim()) {
        console.log(`🔍 Manual search: Searching for "${location}"`);
        searchPharmacies({ location, service: selectedService || undefined, medmeOnly, radiusKm: selectedRadius });
      } else {
        // Show all pharmacies when no location is specified
        searchPharmacies({ service: selectedService || undefined, medmeOnly });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [location, medmeOnly, selectedRadius, isUsingPreciseCoords, userLocationCoords]);

  // Reset precise coords flag when user starts typing manually
  const handleLocationInputChange = (newLocation: string) => {
    // If the location is being changed and we were using precise coords,
    // reset the flag so manual search can work
    if (isUsingPreciseCoords && newLocation !== location) {
      console.log('📝 User started typing manually - resetting precise coords flag');
      setIsUsingPreciseCoords(false);
      setUserLocationCoords(null); // Clear old precise coordinates
    }
    setLocation(newLocation);
  };

  // Handle re-search when radius changes and we have user coordinates
  const prevRadiusRef = useRef<number | null>(null);
  useEffect(() => {
    // Only trigger if we have coords AND radius actually changed (not initial set)
    if (userLocationCoords && prevRadiusRef.current !== null && prevRadiusRef.current !== selectedRadius) {
      console.log(`🔄 Radius changed from ${prevRadiusRef.current}km to ${selectedRadius}km - re-searching`);
      getNearbyPharmacies(userLocationCoords.lat, userLocationCoords.lng, selectedRadius);
    }
    prevRadiusRef.current = selectedRadius;
  }, [selectedRadius, userLocationCoords, getNearbyPharmacies]); // Include getNearbyPharmacies to avoid stale closure

  // Don't load ALL pharmacies on initial page load for performance
  // Instead, wait for user to select a location or use current location
  // This prevents slow initial loading of hundreds of pharmacies

  // Try to get user's location on initial load for better default experience
  const hasAttemptedLocationRef = useRef(false);
  useEffect(() => {
    // Only attempt location detection once
    if (hasAttemptedLocationRef.current || userLocationCoords) {
      return;
    }
    
    hasAttemptedLocationRef.current = true;
    
    if (navigator.geolocation) {
      console.log('🌍 Attempting to get user location on initial load...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coords = { lat: latitude, lng: longitude };
          
          console.log('🌍 Got user location on load:', coords);
          
          setMapCenter(coords);
          setMapZoom(13);
          setIsUsingPreciseCoords(true);
          setUserLocationCoords(coords);
          console.log('📍 Updated map to user location');
          
          // Also load nearby pharmacies automatically with default radius
          console.log('🔍 Auto-loading nearby pharmacies for detected user location');
          getNearbyPharmacies(latitude, longitude, selectedRadius).then(() => {
            setMapCenter(coords);
            setMapZoom(12);
          });
        },
        (error) => {
          console.log('📍 Could not get user location on load, using default:', error.message);
          // Don't show error toast on initial load, just use default location
        },
        { timeout: 5000, enableHighAccuracy: false } // Quick, low-accuracy check
      );
    }
  }, []); // Run once on mount

  // Handle current location with improved radius
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coords = { lat: latitude, lng: longitude };
          
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setIsUsingPreciseCoords(true);
          setUserLocationCoords(coords);
          setMapCenter(coords);
          setMapZoom(14);
          
          // Use the enhanced nearby search with selected radius
          getNearbyPharmacies(latitude, longitude, selectedRadius);
          
          toast({
            title: "Location updated",
            description: `Using your current location. Searching within ${selectedRadius}km radius.`,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            variant: "destructive",
            title: "Location access denied",
            description: "Please enable location access or enter an address manually.",
          });
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "Location not supported",
        description: "Your browser doesn't support geolocation. Please enter an address manually.",
      });
    }
  };

  // Handle geocoding typed address using Mapbox Geocoding API
  const handleGeocodeTypedAddress = async () => {
    if (!location.trim()) {
      toast({
        variant: "destructive",
        title: "No address entered",
        description: "Please enter an address to search for.",
      });
      return;
    }

    try {
      console.log(`🌍 Geocoding typed address: "${location}"`);
      
      // Prepare geocoding parameters
      const geocodeParams = {
        query: location,
        country: 'us',
        center: userLocationCoords ? userLocationCoords : undefined,
        radiusKm: userLocationCoords ? selectedRadius : undefined
      };

      // Call Mapbox geocoding via Supabase edge function
      const { data, error } = await supabase.functions.invoke('mapbox-geocode', {
        body: geocodeParams
      });

      if (error) {
        throw new Error(`Geocoding service error: ${error.message}`);
      }

      if (!data?.results || data.results.length === 0) {
        throw new Error('No results found');
      }

      console.log(`📊 Found ${data.results.length} geocoding results`);
      
      // Filter and rank results by specificity (avoid broad results)
      const filteredResults = data.results.filter((result: any) => {
        const placeType = result.place_type || 'address';
        const address = result.formatted_address || '';
        
        console.log(`🔍 Result: ${address} (Type: ${placeType})`);
        
        // Reject results that are too broad
        const isTooBroad = placeType === 'country' || 
                          placeType === 'region' ||
                          address.toLowerCase().trim() === 'united states';
        
        if (isTooBroad) {
          console.log(`🚫 Rejecting broad result: ${address}`);
          return false;
        }
        
        return true;
      });

      // Sort remaining results by specificity preference
      const sortedResults = filteredResults.sort((a: any, b: any) => {
        const aType = a.place_type || 'address';
        const bType = b.place_type || 'address';
        
        // Prefer specific addresses, then POIs, then localities
        const getSpecificityScore = (type: string) => {
          if (type === 'address') return 100;
          if (type === 'poi') return 90;
          if (type === 'place') return 80;
          if (type === 'locality') return 40;
          if (type === 'district') return 30;
          if (type === 'region') return 20;
          return 0;
        };
        
        return getSpecificityScore(bType) - getSpecificityScore(aType);
      });

      if (sortedResults.length === 0) {
        throw new Error('Only broad location results found. Please enter a more specific address.');
      }

      const bestResult = sortedResults[0];
      const lat = bestResult.position.lat;
      const lng = bestResult.position.lng;
      const coords = { lat, lng };

      console.log(`✅ Selected best result: ${bestResult.formatted_address}`);
      console.log(`📍 Coordinates: ${lat}, ${lng}`);
      console.log(`🏷️ Type: ${bestResult.place_type}`);

      // Update location with the formatted address from Mapbox
      setLocation(bestResult.formatted_address);
      setIsUsingPreciseCoords(true);
      setUserLocationCoords(coords);
      setMapCenter(coords);
      setMapZoom(16); // Zoom in more for specific addresses

      // Search for nearby pharmacies
      getNearbyPharmacies(lat, lng, selectedRadius).then(() => {
        setMapCenter(coords);
        setMapZoom(12);
      });

      toast({
        title: "Address found!",
        description: `Searching for pharmacies within ${selectedRadius}km of ${bestResult.formatted_address}`,
      });
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      toast({
        variant: "destructive",
        title: "Address not found",
        description: error instanceof Error 
          ? error.message 
          : `Could not find location "${location}". Please check the address and try again.`,
      });
    }
  };

  // Get stable display info for pharmacy - uses pre-computed data to avoid cycling
  const getPharmacyDisplayInfo = (pharmacy: Pharmacy, index: number): PharmacyDisplayData & { 
    distance: string; 
    type: string;
  } => {
    // Use pre-computed display data if available, otherwise generate stable data
    const displayData = pharmacy.displayData || generateStableDisplayData(pharmacy.id, pharmacy.name, index);
    
    // Calculate distance display
    const distance = pharmacy.distance 
      ? `${pharmacy.distance.toFixed(1)} km` 
      : calculateDistanceFromUser(pharmacy) || displayData.distance || `${(Math.random() * 5 + 0.5).toFixed(1)} km`;
    
    return {
      ...displayData,
      distance,
      type: pharmacy.type || "regular"
    };
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Header */}
      <div className="bg-white border-b shadow-sm flex-shrink-0">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-primary">Pharmacy Services</h1>
              <p className="text-sm text-muted-foreground">Find appointments and services</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Column - Filters and Results - Scrollable */}
        <div className="w-1/2 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Location and Date */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-primary mb-4">
                Choose a location near you
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                    <AddressAutocomplete
                      value={location}
                      onChange={handleLocationInputChange}
                      onPlaceSelect={handlePlaceSelect}
                      placeholder="Address, city, or ZIP code"
                      className="pl-10"
                      center={isUsingPreciseCoords && userLocationCoords ? userLocationCoords : undefined}
                      radiusKm={isUsingPreciseCoords && userLocationCoords ? selectedRadius : undefined}
                    />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button 
                      variant="medical-outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={handleUseCurrentLocation}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Use current location
                    </Button>
                    <Button 
                      variant="medical" 
                      size="sm" 
                      className="flex-1"
                      onClick={handleGeocodeTypedAddress}
                      disabled={!location.trim()}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search address
                    </Button>
                  </div>
                </div>

                {/* Date selection removed */}

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Service Type
                  </label>
                  <BubbleFilterSelect
                    value={selectedService}
                    onValueChange={setSelectedService}
                    options={serviceOptions}
                    placeholder="All services"
                  />
                </div>

                {/* MedMe Filter */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="medme-filter" 
                    checked={medmeOnly}
                    onCheckedChange={(checked) => setMedmeOnly(checked === true)}
                  />
                  <label 
                    htmlFor="medme-filter" 
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    MedMe pharmacies only
                  </label>
                </div>

                {/* Radius Filter */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Search Radius
                  </label>
                  <Select 
                    value={selectedRadius.toString()} 
                    onValueChange={(value) => {
                      const radius = parseInt(value);
                      setSelectedRadius(radius);
                      
                      // Show feedback to user - the useEffect will handle the actual search
                      if (userLocationCoords) {
                        toast({
                          title: "Radius updated",
                          description: `Searching within ${radius}km radius`,
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select radius" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                      <SelectItem value="25">25 km</SelectItem>
                      <SelectItem value="50">50 km</SelectItem>
                      <SelectItem value="100">100 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Pharmacy List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching for pharmacies...
                    </div>
                  ) : (
                    `${pharmacyCards.length} pharmacies ${location.trim() ? `near ${location}` : 'available'}`
                  )}
                </h3>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              <PharmacyResultsList
                pharmacies={pharmacyCards}
                loading={loading}
                onPharmacySelect={handlePharmacySelect}
                onBookAppointment={handleBookAppointment}
                calculateDistance={calculatePharmacyDistance}
                userLocation={userLocationCoords}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Map */}
        <div className="w-1/2 h-screen sticky top-0 relative overflow-hidden">
          <MapSection
            pharmacies={pharmacyCards}
            onPharmacySelect={handlePharmacySelect}
            center={mapCenter}
            zoom={mapZoom}
            userLocation={userLocationCoords}
            showSearchThisArea={showSearchThisArea}
            onSearchThisArea={handleSearchThisArea}
          />
        </div>
      </div>

      <BookingDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        pharmacy={selectedPharmacy}
        preselectedService={selectedService}
      />

      <PharmacyProfileDrawer
        pharmacy={selectedPharmacyCard}
        open={profileDrawerOpen}
        onOpenChange={setProfileDrawerOpen}
        onBookAppointment={handleBookAppointment}
      />
    </div>
  );
};

export default SearchAndBooking;