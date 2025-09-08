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
  Search,
  X
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
    { value: "medication-review", label: "Medication Review" },
    { value: "naloxone", label: "Naloxone Kits" },
    { value: "birth-control", label: "Birth Control" },
    { value: "travel-vaccines", label: "Travel Vaccines" },
    { value: "diabetes", label: "Diabetes" },
    { value: "diabetes-care", label: "Diabetes Care" },
    { value: "mental-health", label: "Mental Health" },
    { value: "delivery", label: "Delivery" },
    { value: "pediatric-vax", label: "Pediatric Vax" },
    { value: "open-now", label: "Open Now" },
  ];
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
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
      setSelectedServices([serviceParam]);
    }
    
    if (addressParam) {
      const decodedAddress = decodeURIComponent(addressParam);
      console.log('🔍 URL parameter search with address:', { address: decodedAddress, service: serviceParam });
      
      // Set the location first
      setLocation(decodedAddress);
      
      // Then immediately geocode the address from URL params
      setTimeout(() => {
        handleGeocodeTypedAddress(decodedAddress);
      }, 100); // Small delay to ensure state is set
    }
  }, []); // Remove dependencies to prevent infinite loop

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
        searchPharmacies({ 
          location, 
          service: selectedServices.length > 0 ? selectedServices : undefined, 
          medmeOnly, 
          radiusKm: selectedRadius 
        });
      } else {
        // Show all pharmacies when no location is specified
        searchPharmacies({ 
          service: selectedServices.length > 0 ? selectedServices : undefined, 
          medmeOnly 
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [location, isUsingPreciseCoords, userLocationCoords]); // Remove dependencies that cause infinite loops

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
  const handleGeocodeTypedAddress = async (addressOverride?: string) => {
    const searchAddress = addressOverride || location;
    
    if (!searchAddress.trim()) {
      toast({
        variant: "destructive",
        title: "No address entered",
        description: "Please enter an address to search for.",
      });
      return;
    }

    try {
      console.log(`🌍 Geocoding address: "${searchAddress}"`);
      
      // Prepare geocoding parameters - don't use proximity unless we have valid coordinates
      const geocodeParams: any = {
        query: searchAddress,
        country: 'us'
      };

      // Only add proximity if we have valid user coordinates that make sense
      // (i.e., not default/fallback coordinates from a different location)
      if (userLocationCoords && 
          userLocationCoords.lat >= 24 && userLocationCoords.lat <= 49 && // US latitude range
          userLocationCoords.lng >= -125 && userLocationCoords.lng <= -66) { // US longitude range
        geocodeParams.center = userLocationCoords;
        geocodeParams.radiusKm = selectedRadius;
        console.log('🎯 Using proximity bias:', userLocationCoords);
      } else {
        console.log('🌍 No proximity bias - searching globally');
      }

      // Call Mapbox geocoding via Supabase edge function
      const { data, error } = await supabase.functions.invoke('mapbox-geocode', {
        body: geocodeParams
      });

      if (error) {
        throw new Error(`Geocoding service error: ${error.message}`);
      }

      console.log('🔍 Geocoding response:', data);

      if (!data?.results || data.results.length === 0) {
        throw new Error('No geocoding results returned from service');
      }

      console.log(`📊 Found ${data.results.length} geocoding results`);
      
      // Enhanced filtering and ranking for better city vs address detection
      const filteredResults = data.results.filter((result: any) => {
        const placeType = result.place_type || 'address';
        const address = result.formatted_address || '';
        
        console.log(`🔍 Result: ${address} (Type: ${placeType}, Relevance: ${result.relevance})`);
        
        // Reject results that are too broad
        const isTooBroad = placeType === 'country' || 
                          address.toLowerCase().trim() === 'united states';
        
        if (isTooBroad) {
          console.log(`🚫 Rejecting broad result: ${address}`);
          return false;
        }
        
        return true;
      });

      console.log(`📋 Filtered to ${filteredResults.length} specific results`);

      // Detect if this is likely a city search vs specific address search
      const isCitySearch = (query: string): boolean => {
        const cleanQuery = query.toLowerCase().trim();
        // City search indicators: no numbers, no street indicators, common city patterns
        const hasNumbers = /\d/.test(cleanQuery);
        const hasStreetWords = /\b(street|st|avenue|ave|road|rd|drive|dr|lane|ln|blvd|boulevard|way|place|pl|court|ct|circle|cir)\b/.test(cleanQuery);
        const isSimpleCityPattern = /^[a-z\s]+,?\s*(ca|california|ny|new york|tx|texas|fl|florida)?$/i.test(cleanQuery);
        
        return !hasNumbers && !hasStreetWords && (isSimpleCityPattern || cleanQuery.split(' ').length <= 3);
      };

      const isSearchingForCity = isCitySearch(searchAddress);
      console.log(`🏙️ Detected ${isSearchingForCity ? 'CITY' : 'ADDRESS'} search for: "${searchAddress}"`);

      // Enhanced sorting with city search logic
      const sortedResults = filteredResults.sort((a: any, b: any) => {
        const aType = a.place_type || 'address';
        const bType = b.place_type || 'address';
        const aRelevance = a.relevance || 0;
        const bRelevance = b.relevance || 0;
        
        // For city searches, prioritize localities and places over addresses
        const getSpecificityScore = (type: string, isCity: boolean) => {
          if (isCity) {
            // For city searches, prioritize cities and places
            if (type === 'place') return 100;      // Cities, towns
            if (type === 'locality') return 95;    // Local areas within cities
            if (type === 'poi') return 90;         // Points of interest
            if (type === 'district') return 85;    // Districts/neighborhoods
            if (type === 'address') return 30;     // Street addresses (lower priority)
            if (type === 'region') return 20;      // States/regions
            return 0;
          } else {
            // For address searches, prioritize specific addresses
            if (type === 'address') return 100;
            if (type === 'poi') return 90;
            if (type === 'place') return 80;
            if (type === 'locality') return 70;
            if (type === 'district') return 60;
            if (type === 'region') return 20;
            return 0;
          }
        };
        
        const aScore = getSpecificityScore(aType, isSearchingForCity);
        const bScore = getSpecificityScore(bType, isSearchingForCity);
        
        // Primary sort by specificity score
        if (bScore !== aScore) {
          return bScore - aScore;
        }
        
        // Secondary sort by relevance score from Mapbox
        return bRelevance - aRelevance;
      });

      // Additional validation for city searches
      if (isSearchingForCity && sortedResults.length > 0) {
        const bestResult = sortedResults[0];
        const resultType = bestResult.place_type || 'address';
        
        // If we're searching for a city but got a street address, try to find a better match
        if (resultType === 'address') {
          const cityResults = sortedResults.filter(r => ['place', 'locality'].includes(r.place_type));
          if (cityResults.length > 0) {
            console.log(`🔄 City search detected address result, switching to city result`);
            // Move the best city result to the front
            const bestCityResult = cityResults[0];
            const index = sortedResults.indexOf(bestCityResult);
            if (index > 0) {
              sortedResults.splice(index, 1);
              sortedResults.unshift(bestCityResult);
            }
          }
        }
      }

      if (sortedResults.length === 0) {
        console.log('❌ All results were filtered out as too broad');
        // Fallback to using the first original result if all were filtered
        const fallbackResult = data.results[0];
        console.log('🔄 Using fallback result:', fallbackResult.formatted_address);
        
        const lat = fallbackResult.position.lat;
        const lng = fallbackResult.position.lng;
        const coords = { lat, lng };

        setLocation(fallbackResult.formatted_address);
        setIsUsingPreciseCoords(true);
        setUserLocationCoords(coords);
        setMapCenter(coords);
        setMapZoom(14);

        getNearbyPharmacies(lat, lng, selectedRadius).then(() => {
          setMapCenter(coords);
          setMapZoom(12);
        });

        toast({
          title: "Address found!",
          description: `Using: ${fallbackResult.formatted_address}`,
        });
        return;
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
      <div className="border-b shadow-sm flex-shrink-0" style={{ backgroundColor: '#063f55' }}>
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-white">Pharmacy Services</h1>
              <p className="text-sm text-gray-200">Find appointments and services</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Column - Filters and Results - Scrollable */}
        <div className="w-1/2 overflow-y-auto bg-white">
          <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Main Search Form - Styled like Home Page */}
            <div className="bg-white rounded-2xl border border-border shadow-card p-6 mb-6">
              <h2 className="text-xl font-semibold text-primary mb-4">
                Choose a location near you
              </h2>
              
              {/* Primary Search Row */}
              <div className="space-y-4 mb-4">
                {/* Service Type */}
                <div className="w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                    <BubbleFilterSelect
                      value={selectedServices}
                      onValueChange={setSelectedServices}
                      options={serviceOptions}
                      placeholder="Search by symptom or service"
                      className="pl-10 h-12 text-base border-border/50"
                    />
                  </div>
                </div>

                {/* Address Input */}
                <div className="w-full">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                    <AddressAutocomplete
                      value={location}
                      onChange={handleLocationInputChange}
                      onPlaceSelect={handlePlaceSelect}
                      placeholder="Enter your address"
                      className="pl-10 h-12 text-base border-border/50 w-full"
                      center={isUsingPreciseCoords && userLocationCoords ? userLocationCoords : undefined}
                      radiusKm={isUsingPreciseCoords && userLocationCoords ? selectedRadius : undefined}
                    />
                  </div>
                </div>

                {/* Search Button */}
                <Button 
                  onClick={() => handleGeocodeTypedAddress()}
                  disabled={!location.trim()}
                  size="lg" 
                  className="h-12 px-8 font-semibold border-2 border-[#c3c430] hover:border-[#c3c430]/80 w-full"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Action Buttons Row */}
              <div className="flex gap-2 mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 border-2 border-[#c3c430] text-[#c3c430] hover:bg-[#c3c430] hover:text-white"
                  onClick={handleUseCurrentLocation}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Use current location
                </Button>
              </div>

              {/* Advanced Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Search Radius
                  </label>
                  <Select 
                    value={selectedRadius.toString()} 
                    onValueChange={(value) => {
                      const radius = parseInt(value);
                      setSelectedRadius(radius);
                      
                      if (userLocationCoords) {
                        toast({
                          title: "Radius updated",
                          description: `Searching within ${radius}km radius`,
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="h-10">
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

              {/* Selected Services Display */}
              {selectedServices.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedServices.map(service => {
                      const option = serviceOptions.find(opt => opt.value === service);
                      return (
                        <Badge
                          key={service}
                          variant="secondary"
                          className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border-primary/20"
                        >
                          {option?.label || service}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:bg-destructive/20 rounded-full" 
                            onClick={() => setSelectedServices(selectedServices.filter(s => s !== service))}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

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
        preselectedService={selectedServices.length > 0 ? selectedServices[0] : undefined}
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