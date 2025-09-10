import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, ChevronDown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MapboxAddressAutocomplete from "@/components/maps/MapboxAddressAutocomplete";
import { BubbleFilterSelect } from "@/components/filters/BubbleFilterSelect";

// Available pharmacy services
const PHARMACY_SERVICES = [
  { value: "vaccination", label: "Vaccination" },
  { value: "prescription", label: "Prescription" },
  { value: "consultation", label: "Consultation" },
  { value: "health-screening", label: "Health Screening" },
  { value: "medication-review", label: "Medication Review" },
  { value: "diabetes-care", label: "Diabetes Care" },
  { value: "blood-pressure", label: "Blood Pressure" },
  { value: "travel-health", label: "Travel Health" },
  { value: "other", label: "Other" }
];

const HomeSearchForm = () => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    if (address) {
      searchParams.set("address", address);
    }
    
    if (selectedServices.length > 0) {
      searchParams.set("service", selectedServices[0]); // For now, use first selected service
    }

    navigate(`/search?${searchParams.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="py-8 bg-background">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Search inputs */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Service/Symptom Search */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 min-h-[60px] p-2">
                <BubbleFilterSelect
                  value={selectedServices}
                  onValueChange={setSelectedServices}
                  options={PHARMACY_SERVICES}
                  placeholder="Search by symptom, specialty or clinic name"
                  className="min-w-[280px]"
                />
                {/* Selected service bubbles */}
                {selectedServices.map((serviceValue) => {
                  const service = PHARMACY_SERVICES.find(s => s.value === serviceValue);
                  if (!service) return null;
                  return (
                    <div
                      key={service.value}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-[#063f55] text-white border-2 border-[#063f55] rounded-full text-sm font-medium hover:shadow-md transition-all"
                    >
                      {service.label}
                      <span className="text-xs ml-1">✓</span>
                      <button
                        onClick={() => setSelectedServices(selectedServices.filter(s => s !== service.value))}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
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
              className="h-12 px-8 font-semibold bg-[hsl(var(--nav-button))] hover:bg-[hsl(var(--nav-button))]/80 text-white"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Service category pills */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {PHARMACY_SERVICES.map((service, index) => {
              const isSelected = selectedServices.includes(service.value);
              const isEvenIndex = index % 2 === 0;
              const bgColor = isEvenIndex ? "bg-[#063f55]" : "bg-[hsl(var(--nav-button))]";
              const hoverBgColor = isEvenIndex ? "hover:bg-[#063f55]/80" : "hover:bg-[hsl(var(--nav-button))]/80";
              
              return (
                <button
                  key={service.value}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedServices(selectedServices.filter(s => s !== service.value));
                    } else {
                      setSelectedServices([...selectedServices, service.value]);
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 text-white ${
                    isSelected
                      ? `${bgColor} shadow-md`
                      : `${bgColor} ${hoverBgColor}`
                  }`}
                >
                  {service.label}
                </button>
              );
            })}
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