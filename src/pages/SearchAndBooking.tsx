import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Filter, 
  Clock, 
  Phone,
  ChevronLeft,
  Star,
  Navigation
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const SearchAndBooking = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  // Mock pharmacy data
  const pharmacies = [
    {
      id: 1,
      name: "Costco Pharmacy - San Francisco",
      address: "450 10TH ST, SAN FRANCISCO, CA",
      distance: "0.8 km",
      rating: 4.5,
      reviews: 127,
      isAvailable: false,
      services: ["COVID-19", "Flu", "Travel vaccines"],
      nextAvailable: "Tomorrow, Jul 30",
      type: "external"
    },
    {
      id: 2,
      name: "Safeway Pharmacy 1507",
      address: "2020 Market St, San Francisco, CA",
      distance: "1.2 km",
      rating: 4.3,
      reviews: 89,
      isAvailable: true,
      services: ["COVID-19", "RSV", "Pneumococcal"],
      nextAvailable: "Today",
      type: "medme"
    },
    {
      id: 3,
      name: "Walgreens #9847",
      address: "135 Powell St, San Francisco, CA",
      distance: "1.5 km", 
      rating: 4.1,
      reviews: 203,
      isAvailable: true,
      services: ["COVID-19", "Flu", "Shingles"],
      nextAvailable: "Today",
      type: "medme"
    }
  ];

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
              <h1 className="text-xl font-semibold text-primary">COVID-19</h1>
              <p className="text-sm text-muted-foreground">Find vaccination appointments</p>
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
                  <Button variant="medical-outline" size="sm" className="mt-2 w-full">
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
                      <SelectItem value="covid">COVID-19</SelectItem>
                      <SelectItem value="flu">Flu</SelectItem>
                      <SelectItem value="rsv">RSV</SelectItem>
                      <SelectItem value="pneumococcal">Pneumococcal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Pharmacy List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {pharmacies.length} pharmacies found
                </h3>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              {pharmacies.map((pharmacy) => (
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
                              {pharmacy.rating} ({pharmacy.reviews})
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            • {pharmacy.distance}
                          </span>
                        </div>
                      </div>
                      
                      <Badge 
                        variant={pharmacy.isAvailable ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {pharmacy.isAvailable ? "Available" : "Busy"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {pharmacy.services.map((service) => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Next: {pharmacy.nextAvailable}
                      </div>
                      
                      {pharmacy.type === "medme" ? (
                        <Button size="sm" variant="medical">
                          Book Now
                        </Button>
                      ) : (
                        <Button size="sm" variant="medical-outline">
                          <Phone className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
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