import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePharmacySearch, type Pharmacy } from "@/hooks/usePharmacySearch";
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

const SearchAndBooking = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const { pharmacies, loading, searchPharmacies, getAllPharmacies } = usePharmacySearch();

  // Handle URL parameters for service filter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    if (serviceParam) {
      setSelectedService(serviceParam);
    }
  }, []);

  // Handle search when location changes
  useEffect(() => {
    if (location.trim()) {
      searchPharmacies({ location });
    } else {
      getAllPharmacies();
    }
  }, [location]);

  // Handle current location
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          // You could also use getNearbyPharmacies here instead
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Generate mock availability and services for display
  const getPharmacyDisplayInfo = (pharmacy: Pharmacy, index: number) => {
    const mockServices = [
      ["Minor ailments", "Flu shots", "Travel Vaccines"],
      ["MedsCheck", "Birth Control", "Diabetes"],
      ["Mental Health", "Naloxone Kits", "Pediatric Vax"],
      ["Prescription refills", "Blood pressure checks"],
      ["Vaccinations", "Health screenings", "Consultations"]
    ];
    
    return {
      ...pharmacy,
      distance: `${(Math.random() * 5 + 0.5).toFixed(1)} km`,
      rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
      reviews: Math.floor(Math.random() * 200 + 50),
      isAvailable: Math.random() > 0.3,
      services: mockServices[index % mockServices.length],
      nextAvailable: Math.random() > 0.5 ? "Today" : "Tomorrow",
      type: Math.random() > 0.3 ? "medme" : "external"
    };
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
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

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Column - Filters and Results */}
          <div className="lg:col-span-2 space-y-6">
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Today, Jul 29"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
                    <Card key={pharmacy.id} className="p-4 hover:shadow-card transition-all duration-300">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground text-sm">
                              {pharmacy.name}
                            </h4>
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
                            <Button size="sm" variant="medical">
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

          {/* Right Column - Map */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] lg:h-[800px]">
              <div className="h-full bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                  <p className="text-lg font-medium">Interactive Map</p>
                  <p className="text-sm">Google Maps integration would be displayed here</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAndBooking;