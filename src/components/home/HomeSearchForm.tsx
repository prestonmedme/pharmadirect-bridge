import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MapboxAddressAutocomplete from "@/components/maps/MapboxAddressAutocomplete";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Available pharmacy services
const PHARMACY_SERVICES = [
  { id: "vaccination", label: "Vaccination", color: "bg-purple-100 text-purple-700" },
  { id: "prescription", label: "Prescription", color: "bg-blue-100 text-blue-700" },
  { id: "consultation", label: "Consultation", color: "bg-green-100 text-green-700" },
  { id: "health-screening", label: "Health Screening", color: "bg-orange-100 text-orange-700" },
  { id: "medication-review", label: "Medication Review", color: "bg-red-100 text-red-700" },
  { id: "diabetes-care", label: "Diabetes Care", color: "bg-indigo-100 text-indigo-700" },
  { id: "blood-pressure", label: "Blood Pressure", color: "bg-pink-100 text-pink-700" },
  { id: "travel-health", label: "Travel Health", color: "bg-teal-100 text-teal-700" },
  { id: "other", label: "Other", color: "bg-gray-100 text-gray-700" }
];

const HomeSearchForm = () => {
  const [selectedService, setSelectedService] = useState<string>("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    if (address) {
      searchParams.set("address", address);
    }
    
    if (selectedService) {
      searchParams.set("service", selectedService);
    }

    navigate(`/search?${searchParams.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Search inputs */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Service/Symptom Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="pl-10 h-12 text-base border-border/50">
                    <SelectValue placeholder="Search by symptom, specialty or clinic name" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white border border-border shadow-lg">
                    {PHARMACY_SERVICES.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address Input */}
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <MapboxAddressAutocomplete
                  value={address}
                  onChange={setAddress}
                  placeholder="Enter your address"
                  className="pl-10 h-12 text-base border-border/50"
                  onPlaceSelect={(result) => {
                    setAddress(result.formatted_address);
                  }}
                />
              </div>
            </div>

            {/* Search Button */}
            <Button 
              onClick={handleSearch}
              size="lg" 
              className="h-12 px-8 bg-primary hover:bg-primary-light text-white font-semibold"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Service category pills */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {PHARMACY_SERVICES.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id === selectedService ? "" : service.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                  selectedService === service.id
                    ? "bg-primary text-white shadow-md"
                    : service.color
                }`}
              >
                {service.label}
              </button>
            ))}
          </div>
        </div>

        {/* Find care by specialty section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Find care by specialty
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Access a wide variety of healthcare services and pharmacy specialties across your area.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HomeSearchForm;