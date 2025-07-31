import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { usePharmacySearch, type Pharmacy } from "@/hooks/usePharmacySearch";
import { useToast } from "@/hooks/use-toast";
import GoogleMap, { type Marker } from "@/components/maps/GoogleMap";
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Filter, 
  Clock, 
  Phone,
  ChevronLeft,
  Star,
  Navigation,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import medmeLogo from '@/assets/medme-logo.svg';

const SearchAndBooking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [medmeOnly, setMedmeOnly] = useState<boolean>(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({ lat: 37.7749, lng: -122.4194 }); // Default to SF
  const [mapZoom, setMapZoom] = useState<number>(12);
  const { pharmacies, loading, searchPharmacies, getAllPharmacies, getNearbyPharmacies } = usePharmacySearch();


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

  // Handle URL parameters for service filter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    if (serviceParam) {
      setSelectedService(serviceParam);
    }
  }, []);

  // Handle search when location and filters change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (location.trim()) {
        searchPharmacies({ location, medmeOnly });
      }
      // Remove getAllPharmacies() call when location is empty
      // Pharmacies should only show after search is performed
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [location, medmeOnly]);

  // Handle current location with improved radius
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          // Update map center to user's location
          setMapCenter({ lat: latitude, lng: longitude });
          setMapZoom(14);
           // Use the enhanced nearby search with 25km radius
           getNearbyPharmacies(latitude, longitude, 25);
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

  // Generate mock availability and services for display (enhanced with distance)
  const getPharmacyDisplayInfo = (pharmacy: Pharmacy, index: number) => {
    const mockServices = [
      ["Minor ailments", "Flu shots", "Travel Vaccines"],
      ["MedsCheck", "Birth Control", "Diabetes"],
      ["Mental Health", "Naloxone Kits", "Pediatric Vax"],
      ["Prescription refills", "Blood pressure checks"],
      ["Vaccinations", "Health screenings", "Consultations"]
    ];
    
    // Check if pharmacy has a distance property (from search results)
    const hasDistance = 'distance' in pharmacy;
    const distance = hasDistance 
      ? `${(pharmacy as any).distance.toFixed(1)} km` 
      : `${(Math.random() * 5 + 0.5).toFixed(1)} km`;
    
    return {
      ...pharmacy,
      distance,
      rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
      reviews: Math.floor(Math.random() * 200 + 50),
      isAvailable: Math.random() > 0.3,
       services: mockServices[index % mockServices.length],
       nextAvailable: Math.random() > 0.5 ? "Today" : "Tomorrow",
       type: pharmacy.type || (Math.random() > 0.3 ? "medme" : "external")
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
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Address or zip code"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    variant="medical-outline" 
                    size="sm" 
                    className="mt-2 w-full"
                    onClick={handleUseCurrentLocation}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Use current location
                  </Button>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Select Date
                  </label>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                    onClick={() => setCalendarOpen(!calendarOpen)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Today, Jul 31"}
                  </Button>
                </div>

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
              </div>
            </Card>

            {/* Pharmacy List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching...
                    </div>
                  ) : (
                    `${pharmacies.length} pharmacies found`
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
                  <p className="text-lg">No pharmacies found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
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
                                • {displayInfo.distance}
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
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Next: {displayInfo.nextAvailable}
                          </div>
                          
                          {displayInfo.type === "medme" ? (
                            <Button 
                              size="sm" 
                              variant="medical"
                              onClick={() => handleBookNow(pharmacy)}
                            >
                              Book Now
                            </Button>
                          ) : (
                            <Button size="sm" variant="medical-outline">
                              <Phone className="h-3 w-3 mr-1" />
                              {pharmacy.phone ? 'Call' : 'Contact'}
                            </Button>
                          )}
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
            className="h-full w-full"
          />
          
          {/* Calendar Overlay - Slides in from right */}
          <div 
            className="absolute inset-0 h-full bg-gray-50 flex flex-col transition-transform duration-300 ease-out"
            style={{ 
              transform: calendarOpen ? 'translateX(0%)' : 'translateX(100%)',
              pointerEvents: calendarOpen ? 'auto' : 'none'
            }}
          >
            <div className="p-6 bg-white border-b flex-shrink-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-primary">Select Date & Time</h3>
                <button 
                  onClick={() => setCalendarOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-xl"
                >
                  ✕
                </button>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                className="pointer-events-auto mx-auto"
              />
            </div>
            
            <div className="flex-1 p-6 bg-gray-50 space-y-2">
              <h4 className="text-lg font-medium text-foreground">Preferred Time</h4>
              
              {[
                { label: "Morning", value: "morning", time: "Before 12pm" },
                { label: "Afternoon", value: "afternoon", time: "12pm - 5pm" },
                { label: "Evening", value: "evening", time: "After 5pm" }
              ].map((slot) => (
                <div key={slot.value} className="flex items-center justify-between py-4 px-4 bg-white rounded-lg border">
                  <div className="flex items-center space-x-4">
                    <Checkbox 
                      id={slot.value}
                      checked={selectedTimeSlots.includes(slot.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTimeSlots(prev => [...prev, slot.value]);
                        } else {
                          setSelectedTimeSlots(prev => prev.filter(s => s !== slot.value));
                        }
                      }}
                    />
                    <label 
                      htmlFor={slot.value} 
                      className="text-lg font-medium text-foreground cursor-pointer"
                    >
                      {slot.label}
                    </label>
                  </div>
                  <span className="text-sm text-muted-foreground">{slot.time}</span>
                </div>
              ))}
              
              <div className="pt-4">
                <Button 
                  className="w-full py-3 text-lg" 
                  variant="medical"
                  onClick={() => setCalendarOpen(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
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