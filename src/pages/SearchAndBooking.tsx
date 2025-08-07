import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookingDialog } from "@/components/booking/BookingDialog";
// Removed date selection feature - no input needed here
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { usePharmacySearch, type Pharmacy } from "@/hooks/usePharmacySearch";
import { generateStableDisplayData, type PharmacyDisplayData } from "@/lib/pharmacyDataUtils";
import { useToast } from "@/hooks/use-toast";
import GoogleMap, { type Marker } from "@/components/maps/GoogleMap";
import AddressAutocomplete from "@/components/maps/AddressAutocomplete";
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
  const [selectedService, setSelectedService] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [medmeOnly, setMedmeOnly] = useState<boolean>(false);
  const [selectedRadius, setSelectedRadius] = useState<number>(25);
  const [userLocationCoords, setUserLocationCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [isUsingPreciseCoords, setIsUsingPreciseCoords] = useState<boolean>(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  // Default to showing all of Canada
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({ lat: 56.1304, lng: -106.3468 });
  const [mapZoom, setMapZoom] = useState<number>(4);
  const [showSearchThisArea, setShowSearchThisArea] = useState<boolean>(false);
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(null);
  const { pharmacies, loading, searchPharmacies, getAllPharmacies, getNearbyPharmacies, calculateDistance } = usePharmacySearch();


  const handleBookNow = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setBookingDialogOpen(true);
  };

  // Convert pharmacies to map markers
  const createMarkersFromPharmacies = (): Marker[] => {
    return pharmacies
      .filter(pharmacy => pharmacy.latitude && pharmacy.longitude)
      .map(pharmacy => ({
        id: pharmacy.id,
        position: {
          lat: pharmacy.latitude!,
          lng: pharmacy.longitude!
        },
        title: pharmacy.name,
        content: `${pharmacy.name}\n${pharmacy.address}`
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



  // Handle map bounds change for "Search This Area" functionality
  const handleMapBoundsChange = (map: google.maps.Map) => {
    const bounds = map.getBounds();
    if (bounds) {
      setMapBounds(bounds);
      setShowSearchThisArea(true);
    }
  };

  // Handle "Search This Area" button click
  const handleSearchThisArea = () => {
    if (!mapBounds) return;
    
    const center = mapBounds.getCenter();
    if (center) {
      const lat = center.lat();
      const lng = center.lng();
      const coords = { lat, lng };
      
      // Calculate radius based on bounds (approximate)
      const ne = mapBounds.getNorthEast();
      const sw = mapBounds.getSouthWest();
      const radius = calculateDistance(
        ne.lat(), ne.lng(),
        sw.lat(), sw.lng()
      ) / 2; // Rough estimate
      
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
    }
  };

  // Handle place selection from autocomplete
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    console.log('🎯 Place selected from autocomplete:', place);
    
    if (!place.geometry || !place.geometry.location) {
      console.warn('❌ No geometry data for selected place');
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const coords = { lat, lng };
    
    console.log('📍 Autocomplete: Updating map center to:', coords);
    
    // Mark that we're using precise coordinates from Google Places
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
      description: `Searching for pharmacies within ${selectedRadius}km of ${place.formatted_address || place.name}`,
    });
  };

  // Handle URL parameters for service filter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    if (serviceParam) {
      setSelectedService(serviceParam);
    }
  }, []);

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
        searchPharmacies({ location, medmeOnly, radiusKm: selectedRadius });
      } else {
        // Show all pharmacies when no location is specified
        searchPharmacies({ medmeOnly });
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

  // Handle geocoding typed address using Google's Geocoding API
  const handleGeocodeTypedAddress = async () => {
    if (!location.trim()) {
      toast({
        variant: "destructive",
        title: "No address entered",
        description: "Please enter an address to search for.",
      });
      return;
    }

    if (!window.google || !window.google.maps) {
      toast({
        variant: "destructive",
        title: "Google Maps not loaded",
        description: "Please wait for Google Maps to load and try again.",
      });
      return;
    }

    try {
      console.log(`🌍 Geocoding typed address: "${location}"`);
      
      const geocoder = new window.google.maps.Geocoder();
      
      // Bias geocoding to user's precise location if available
      let bounds: google.maps.LatLngBounds | undefined = undefined;
      if (userLocationCoords) {
        const latRadius = selectedRadius / 111;
        const lngRadius = selectedRadius / (111 * Math.cos((userLocationCoords.lat * Math.PI) / 180));
        const ne = new window.google.maps.LatLng(userLocationCoords.lat + latRadius, userLocationCoords.lng + lngRadius);
        const sw = new window.google.maps.LatLng(userLocationCoords.lat - latRadius, userLocationCoords.lng - lngRadius);
        bounds = new window.google.maps.LatLngBounds(sw, ne);
      }

      const response = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
        geocoder.geocode(
          { 
            address: location,
            componentRestrictions: { country: 'CA' }, // Restrict to Canada
            region: 'CA', // Prefer Canadian results
            bounds
          },
          (results, status) => {
            if (status === 'OK' && results) {
              resolve({ results } as google.maps.GeocoderResponse);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          }
        );
      });

      if (response.results && response.results.length > 0) {
        console.log(`📊 Found ${response.results.length} geocoding results`);
        
        // Filter and rank results by specificity (avoid broad results like "Canada")
        const filteredResults = response.results.filter(result => {
          const types = result.types || [];
          console.log(`🔍 Result: ${result.formatted_address} (Types: ${types.join(', ')})`);
          
          // Reject results that are too broad
          const isTooBroad = types.includes('country') || 
                           types.includes('administrative_area_level_1') ||
                           (result.formatted_address.toLowerCase().trim() === 'canada');
          
          if (isTooBroad) {
            console.log(`🚫 Rejecting broad result: ${result.formatted_address}`);
            return false;
          }
          
          return true;
        });

        // Sort remaining results by specificity preference
        const sortedResults = filteredResults.sort((a, b) => {
          const aTypes = a.types || [];
          const bTypes = b.types || [];
          
          // Prefer street addresses, then establishments, then localities
          const getSpecificityScore = (types: string[]) => {
            if (types.includes('street_address')) return 100;
            if (types.includes('premise')) return 90;
            if (types.includes('establishment')) return 80;
            if (types.includes('subpremise')) return 70;
            if (types.includes('route')) return 60;
            if (types.includes('intersection')) return 50;
            if (types.includes('locality')) return 40;
            if (types.includes('sublocality')) return 30;
            return 0;
          };
          
          return getSpecificityScore(bTypes) - getSpecificityScore(aTypes);
        });

        if (sortedResults.length === 0) {
          throw new Error('Only broad location results found. Please enter a more specific address.');
        }

        const bestResult = sortedResults[0];
        const location_data = bestResult.geometry.location;
        const lat = location_data.lat();
        const lng = location_data.lng();
        const coords = { lat, lng };

        console.log(`✅ Selected best result: ${bestResult.formatted_address}`);
        console.log(`📍 Coordinates: ${lat}, ${lng}`);
        console.log(`🏷️ Types: ${bestResult.types?.join(', ')}`);

        // Update location with the formatted address from Google
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
      } else {
        throw new Error('No results found');
      }
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
                      placeholder="Address, city, or postal code"
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
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="All services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor-ailments">Minor ailments</SelectItem>
                      <SelectItem value="flu-shots">Flu shots</SelectItem>
                      <SelectItem value="medscheck">MedsCheck</SelectItem>
                      <SelectItem value="naloxone">Naloxone Kits</SelectItem>
                      <SelectItem value="birth-control">Birth Control</SelectItem>
                      <SelectItem value="travel-vaccines">Travel Vaccines</SelectItem>
                      <SelectItem value="diabetes">Diabetes</SelectItem>
                      <SelectItem value="mental-health">Mental Health</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="pediatric-vax">Pediatric Vax</SelectItem>
                      <SelectItem value="open-now">Open Now</SelectItem>
                    </SelectContent>
                  </Select>
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
                    `${pharmacies.length} pharmacies ${location.trim() ? `near ${location}` : 'available'}`
                  )}
                </h3>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading pharmacies...</p>
                </div>
              ) : pharmacies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Ready to find pharmacies</p>
                  <p className="text-sm">Enter a location above or use current location to get started</p>
                  <div className="mt-4 flex gap-2 justify-center">
                    <Button 
                      variant="medical-outline" 
                      size="sm"
                      onClick={handleUseCurrentLocation}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Use my location
                    </Button>
                    <Button 
                      variant="medical" 
                      size="sm"
                      onClick={handleGeocodeTypedAddress}
                      disabled={!location.trim()}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search address
                    </Button>
                  </div>
                </div>
              ) : (
                pharmacies.map((pharmacy, index) => {
                  const displayInfo = getPharmacyDisplayInfo(pharmacy, index);
                  return (
                    <Card 
                      key={pharmacy.id} 
                      id={`pharmacy-${pharmacy.id}`}
                      className="p-4 hover:shadow-card transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        setSelectedPharmacy(pharmacy);
                        if (pharmacy.latitude && pharmacy.longitude) {
                          setMapCenter({ lat: pharmacy.latitude, lng: pharmacy.longitude });
                          setMapZoom(16);
                        }
                      }}
                    >
                       <div className="space-y-3">
                         <div className="flex justify-between items-start">
                           <div className="flex-1">
                             <div className="flex items-center gap-2">
                               <h4 className="font-semibold text-foreground text-sm">
                                 {pharmacy.name}
                               </h4>
                               {pharmacy.type === 'medme' && (
                                 <img 
                                   src={medmeLogo} 
                                   alt="MedMe Partner" 
                                   className="h-4 w-4"
                                 />
                               )}
                             </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {pharmacy.address}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-muted-foreground">
                                  {displayInfo.rating} ({displayInfo.reviews})
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                • {calculateDistanceFromUser(pharmacy) || displayInfo.distance}
                              </span>
                            </div>
                            
                            {/* Hours and status */}
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant={displayInfo.hours.isOpen ? "default" : "secondary"}
                                className="text-xs bg-green-100 text-green-800"
                              >
                                {displayInfo.hours.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {displayInfo.hours.hours} • {displayInfo.hours.nextChange}
                              </span>
                            </div>
                          </div>
                          
                          <Badge 
                            variant={displayInfo.isAvailable ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {displayInfo.isAvailable ? "Available" : "Busy"}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {displayInfo.services.map((service) => (
                            <Badge key={service} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGetDirections(pharmacy);
                              }}
                              className="text-xs"
                            >
                              <Navigation className="h-3 w-3 mr-1" />
                              Directions
                            </Button>
                            
                            {displayInfo.type === "medme" ? (
                              <Button 
                                size="sm" 
                                variant="medical"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBookNow(pharmacy);
                                }}
                              >
                                Book Now
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="medical-outline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Phone className="h-3 w-3 mr-1" />
                                {pharmacy.phone ? 'Call' : 'Contact'}
                              </Button>
                            )}
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Next: {displayInfo.nextAvailable}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Map or Calendar */}
        <div className="w-1/2 h-screen sticky top-0 relative overflow-hidden">
          {/* Map - Always present */}
          <GoogleMap
            center={mapCenter}
            zoom={mapZoom}
            markers={createMarkersFromPharmacies()}
            onMarkerClick={handleMarkerClick}
            userLocation={userLocationCoords}
            shouldFitBounds={pharmacies.length > 0}
            fitRadiusKm={userLocationCoords ? selectedRadius : undefined}
            onMapLoad={(map) => {
              // Listen for bounds changes with debounce to enable "Search This Area" without spamming state
              let boundsChangedTimer: number | undefined;
              map.addListener('bounds_changed', () => {
                if (boundsChangedTimer) {
                  window.clearTimeout(boundsChangedTimer);
                }
                boundsChangedTimer = window.setTimeout(() => {
                  handleMapBoundsChange(map);
                }, 300);
              });
            }}
            className="h-full w-full"
          />
          
          {/* Search This Area button overlay */}
          {showSearchThisArea && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
              <Button 
                onClick={handleSearchThisArea}
                variant="default"
                size="sm"
                className="bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 shadow-lg"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Search this area
              </Button>
            </div>
          )}
          
          {/* Date/time overlay removed */}
        </div>
      </div>

      <BookingDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        pharmacy={selectedPharmacy}
        preselectedService={selectedService}
      />
    </div>
  );
};

export default SearchAndBooking;